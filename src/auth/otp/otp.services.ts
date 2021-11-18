import { Inject, Injectable, Logger } from '@nestjs/common';
import bcrypt from 'bcrypt';
import dayJS from 'dayjs';
import otpGenerator from 'otp-generator';
import { Sequelize } from 'sequelize';

import {
  OTP_EXPIRATION_MINS,
  OTP_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../../shared/constant/app.constant';
import { IChannel } from './channels/channel.interface';
import { OTP } from './otp.model';

@Injectable()
export class OTPService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(OTP_REPOSITORY)
    private readonly otpRepo: typeof OTP,
    private readonly logger: Logger,
  ) {}

  private create(): string {
    return otpGenerator.generate(6, {
      upperCase: false,
      alphabets: false,
      specialChars: false,
    });
  }

  private createHash(otp: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(otp, salt);
  }

  private verifyOTP(otp: string, otpHash: string): boolean {
    return bcrypt.compareSync(otp, otpHash);
  }

  async send(channel: IChannel, username: string): Promise<boolean> {
    // Remove previous otps which were not used
    await this.delete(username);
    const t = await this.sequelize.transaction();

    try {
      this.logger.log(`Adding OTP for username: ${username}`);
      // Start creating new one
      const otp = this.create();
      const otpHash = this.createHash(otp);

      this.logger.log('OTP hash created successfully!');

      const otpRecord = await this.otpRepo.create(
        {
          username,
          otp_hash: otpHash,
          expires_at: dayJS().add(OTP_EXPIRATION_MINS, 'minute'),
        },
        { transaction: t },
      );

      this.logger.log(`Sending OTP ${otp} to username: ${username}`);

      // Send the OTP to the user using preferred channel
      await channel.send(otp, username);
      this.logger.log(`OTP sent to username: ${username}`);

      await t.commit();
      this.logger.log(`Created OTP for username: ${username} successfully`);

      return !!otpRecord;
    } catch (e) {
      this.logger.error('Error occurred while creating/sending OTP', e.stack);
      await t.rollback();

      throw new Error(e.message);
    }
  }

  async isCorrect(username: string, otp: string): Promise<boolean> {
    this.logger.log(`Checking OTP for username: ${username}!`);
    const result = await this.otpRepo.findOne({
      where: { username },
    });

    if (!result || !this.verifyOTP(otp, result.otp_hash)) {
      return false;
    }

    // Compare dates e.g 8:49pm is after 8:45pm (current)
    return dayJS(result.expires_at).isAfter(dayJS());
  }

  async delete(username: string): Promise<boolean> {
    const rows = await this.otpRepo.destroy({ where: { username } });

    if (rows > 0) {
      this.logger.log(
        `Removed all OTPs for username: ${username} successfully`,
      );
    }

    return rows > 0;
  }
}
