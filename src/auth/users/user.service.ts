import { Inject, Injectable, Logger } from '@nestjs/common';
import { isEmail as isValidEmail } from 'class-validator';
import { Op, Sequelize, Transaction } from 'sequelize';

import {
  UpdateProfilePayload,
  UpdateProfileResp,
  User,
} from '../../graphql.schema';
import {
  CUSTOMER_REPOSITORY,
  PROVIDER_REPOSITORY,
  SEQUELIZE_PROVIDER,
  USER_REPOSITORY,
} from '../../shared/constant/app.constant';
import { BadRequestError, NotFoundError } from '../../shared/errors.messages';
import { validateLanguageSync } from '../../shared/validators/language.validator';
import { StripeService } from '../../stripe/stripe.service';
import { CustomerModel } from '../customers/customer.model';
import { IProvider } from '../google/interfaces/user.interface';
import { ProviderModel } from '../providers/provider.model';
import { IUpsertUserPayload } from './interfaces/user-service.interface';
import { IUserEntity, UserRoles } from './interfaces/user.interface';
import { UserModel } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly user: typeof UserModel,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customer: typeof CustomerModel,
    @Inject(PROVIDER_REPOSITORY)
    private readonly provider: typeof ProviderModel,
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    private readonly stripeService: StripeService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(UserService.name);
  }

  getQueryFromUsername(username: string): any {
    const isEmail = isValidEmail(username);

    const query = {};
    query[isEmail ? 'email' : 'phone_number'] = username;

    return query;
  }

  getProviderFromUsername(username: string): 'email' | 'phone' {
    const isEmail = isValidEmail(username);
    return isEmail ? 'email' : 'phone';
  }

  async findOne(id: number): Promise<UserModel> {
    this.logger.debug(`Start finding user with id=${id}`);
    return this.user.findByPk(id, {
      include: [{ model: CustomerModel }, { model: ProviderModel }],
    });
  }

  public async findOrCreateByEmailPhone(
    email: string,
    phone: string,
    args?: {
      name?: string;
      last_name?: string;
      preferred_language?: string;
      t?: Transaction;
    },
  ): Promise<UserModel> {
    this.logger.debug(
      `Start finding user with email: ${email}, phone: ${phone}`,
    );
    email = (email || '').toLowerCase();
    const users = await this.user.findAll({
      where: {
        [Op.or]: [
          { phone_number: { [Op.eq]: phone } },
          { email: { [Op.eq]: email } },
        ],
      },
    });

    if (users.length > 0) {
      // if more than 1 users found, give priority to phone numbers' user
      const phoneUser = users.find((u) => u.phone_number === phone);
      const emailUser = users.find((u) => u.email === email);

      const user = phoneUser ? phoneUser : emailUser;

      // update user name if not already exists
      if (args?.name) {
        user.first_name = args?.name;
        if (args?.last_name) {
          user.last_name = args?.last_name;
        }

        await user.save({ transaction: args?.t });
      }

      return user;
    }

    this.logger.log(`Creating user for email=${email}, phone: ${phone}..`);
    const customer = await this.customer.create({}, { transaction: args?.t });
    const provider = await this.provider.create({}, { transaction: args?.t });

    // Check if input lang is supported
    if (!validateLanguageSync(args?.preferred_language)) {
      throw BadRequestError('Input language is not supported');
    }

    return await this.user.create(
      {
        email,
        phone_number: phone,
        customer_id: customer.id,
        provider_id: provider.id,
        first_name: args?.name,
        preferred_language: args?.preferred_language,
        roles: [UserRoles.CUSTOMER, UserRoles.PROVIDER],
      },
      { transaction: args?.t },
    );
  }

  async findByUsername(username: string): Promise<UserModel> {
    this.logger.debug(`Start finding user with username=${username}`);
    return this.user.findOne({
      where: { ...this.getQueryFromUsername(username) },
    });
  }

  async findByUsernameAndProvider(
    username: string,
    provider: IProvider,
    id: string,
  ): Promise<UserModel> {
    this.logger.debug(
      `Start finding user with username=${username} and ${provider}'s id=${id}`,
    );
    return this.user.findOne({
      where: {
        ...this.getQueryFromUsername(username),
        [`${provider.toString().toLowerCase()}_user_id`]: id,
      },
    });
  }

  // eslint-disable-next-line complexity
  async upsert({
    username,
    oauthUser,
    preferred_language = 'en-US',
  }: IUpsertUserPayload): Promise<IUserEntity> {
    this.logger.log(`Searching for existing user with username=${username}...`);
    let existingUser;
    let providerUserIdField = '';

    if (oauthUser) {
      providerUserIdField = `${oauthUser.provider
        .toString()
        .toLowerCase()}_user_id`;
      existingUser = await this.findByUsernameAndProvider(
        username,
        oauthUser.provider,
        oauthUser.id,
      );
    }

    if (username && !existingUser) {
      existingUser = await this.findByUsername(username);
    }

    const user = {
      ...this.getQueryFromUsername(username),
      [`is_${this.getProviderFromUsername(username)}_verified`]: true,
    };

    if (existingUser) {
      this.logger.log(`Found existing user for username=${username}...`);
      if (oauthUser) {
        if (!existingUser.first_name && oauthUser.first_name) {
          user.first_name = oauthUser.first_name;
        }

        if (!existingUser.last_name && oauthUser.last_name) {
          user.last_name = oauthUser.last_name;
        }

        if (!existingUser.image_url && oauthUser.picture) {
          user.image_url = oauthUser.picture;
        }

        if (!existingUser[providerUserIdField] && oauthUser.id) {
          user[providerUserIdField] = oauthUser.id;
        }
      }
      await this.user.update(user, { where: { id: existingUser.id } });
      return existingUser;
    }

    this.logger.log(`Creating user for username=${username}...`);
    const t = await this.sequelize.transaction();

    try {
      const [customer, provider] = await Promise.all([
        this.customer.create({}, { transaction: t }),
        this.provider.create({}, { transaction: t }),
      ]);

      let oauthUserInfo = {};
      if (oauthUser) {
        oauthUserInfo = {
          [providerUserIdField]: oauthUser.id,
          first_name: oauthUser.first_name,
          last_name: oauthUser.last_name,
          image_url: oauthUser.picture,
        };
      }

      // Check if input lang is supported
      if (!validateLanguageSync(preferred_language)) {
        throw BadRequestError('Input language is not supported');
      }

      const result = await this.user.create(
        {
          ...user,
          provider_id: provider.id,
          customer_id: customer.id,
          roles: [UserRoles.CUSTOMER, UserRoles.PROVIDER],
          preferred_language,
          ...oauthUserInfo,
        },
        { transaction: t },
      );

      await t.commit();

      return result;
    } catch (e) {
      await t.rollback();
      this.logger.error('Error occurred while creating user', e.stack);

      throw new Error(e.message);
    }
  }

  async isEmailVerified(id: number): Promise<boolean> {
    const user = await this.findOne(id);
    return user.is_email_verified;
  }

  async updateProfile(
    userId: number,
    payload: UpdateProfilePayload,
  ): Promise<UpdateProfileResp> {
    this.logger.log(
      `Update user profile for userId=${userId} with payload = ${JSON.stringify(
        payload,
      )}`,
    );

    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const t = await this.sequelize.transaction();

    const promises = [];
    try {
      if (payload?.first_name) {
        user.first_name = payload.first_name;
      }

      if (payload?.last_name) {
        user.last_name = payload.last_name;
      }

      if (payload?.email) {
        user.email = payload.email;
      }

      if (!validateLanguageSync(payload?.preferred_language)) {
        throw BadRequestError('Input language is not supported');
      }
      if (payload?.preferred_language) {
        user.preferred_language = payload.preferred_language;
      }

      user.updated_by = userId;
      promises.push(user.save({ transaction: t }));

      if (payload?.customer_card_token) {
        const stripeCustomer = await this.stripeService.upsertStripeCustomerSource(
          payload?.customer_card_token,
          user.stripe_customer_id,
          user.email,
          user.phone_number,
        );
        await this.updateCustomerCard(user.id, stripeCustomer.id, t);
      }

      if (!!user.provider && payload?.provider_bank) {
        for (const key in payload?.provider_bank) {
          if (payload?.provider_bank[key]) {
            user.provider[key] = payload?.provider_bank[key];
          }
        }
        promises.push(user.provider.save({ transaction: t }));
      }

      await Promise.all(promises);
      await t.commit();

      const result = new UpdateProfileResp();
      result.modified = 1;
      result.edges = [(user as undefined) as User];
      return result;
    } catch (e) {
      await t.rollback();
      this.logger.error('Error occurred while updating user', e?.stack);

      throw new Error(e.message);
    }
  }

  async updateCustomerCard(
    userId: number,
    stripeCustomerId: string,
    t: Transaction,
  ): Promise<boolean> {
    this.logger.log(`updateCustomerCard for userId=${userId}`);

    const user = await this.user.findByPk(userId);
    const card = await this.stripeService.retrieveCard(stripeCustomerId);

    await Promise.all([
      this.user.update(
        {
          stripe_customer_id: stripeCustomerId,
        },
        {
          where: { id: { [Op.eq]: userId } },
          transaction: t,
        },
      ),
      this.customer.update(
        {
          stripe_customer_id: stripeCustomerId,
          card_last_digits: card?.last4,
          card_brand_name: card?.brand,
          card_holder_name: card?.name,
        },
        {
          where: { id: { [Op.eq]: user?.customer_id } },
          transaction: t,
        },
      ),
    ]);

    return true;
  }
}
