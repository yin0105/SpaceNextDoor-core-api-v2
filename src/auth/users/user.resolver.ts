import { Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Auth, AuthUser, IAuthUser } from '../../auth/auth.decorators';
import {
  UpdateProfilePayload,
  UpdateProfileResp,
  User,
} from '../../graphql.schema';
import { UserService } from './../users/user.service';
import { UserRoles } from './interfaces/user.interface';

@Resolver('user')
export class UserResolver {
  constructor(
    private readonly logger: Logger,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(UserResolver.name);
  }

  @Auth(UserRoles.ADMIN, UserRoles.CUSTOMER, UserRoles.PROVIDER)
  @Mutation('updateProfile')
  async updateProfile(
    @Args('payload') payload: UpdateProfilePayload,
    @AuthUser() user: IAuthUser,
  ): Promise<UpdateProfileResp> {
    return await this.userService.updateProfile(user?.user_id, payload);
  }

  @Auth()
  @Query('profile')
  async profile(@AuthUser() user: IAuthUser): Promise<User> {
    return await this.userService.findOne(user.user_id);
  }
}
