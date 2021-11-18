/* eslint-disable no-invalid-this */
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import * as queryString from 'query-string';

import { AuthService } from '../auth.service';
import { UserService } from '../users/user.service';

@Controller('oauth/facebook')
export class FacebookController {
  private clientBaseUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    this.clientBaseUrl = this.configService.get('app.clientApp.baseUrl');
  }

  @Get()
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // this guard will redirect to facebook oauth
  }

  @Get('callback')
  @UseGuards(AuthGuard('facebook'))
  async googleAuthCallback(@Req() req, @Res() res) {
    return this.processOauthResponse(req, res);
  }

  @Get('th')
  @UseGuards(AuthGuard('facebookTH'))
  async facebookAuthTH() {
    // this guard will redirect to facebook oauth
  }

  @Get('callback/th')
  @UseGuards(AuthGuard('facebookTH'))
  async googleAuthCallbackTH(@Req() req, @Res() res) {
    return this.processOauthResponse(req, res, 'th');
  }

  @Get('jp')
  @UseGuards(AuthGuard('facebookJP'))
  async facebookAuthJP() {
    // this guard will redirect to facebook oauth
  }

  @Get('callback/jp')
  @UseGuards(AuthGuard('facebookJP'))
  async googleAuthCallbackJP(@Req() req, @Res() res) {
    return this.processOauthResponse(req, res, 'jp');
  }

  @Get('kr')
  @UseGuards(AuthGuard('facebookR'))
  async facebookAuthKR() {
    // this guard will redirect to facebook oauth
  }

  @Get('callback/kr')
  @UseGuards(AuthGuard('facebookKR'))
  async googleAuthCallbackKR(@Req() req, @Res() res) {
    return this.processOauthResponse(req, res, 'kr');
  }

  private processOauthResponse = async (req, res, country = '') => {
    if (!req?.user || !req?.user?.email) {
      return res.redirect(`${this.clientBaseUrl}/?facebook=error`);
    }

    const user = await this.userService.upsert({
      username: req?.user?.email || null,
      oauthUser: req?.user,
    });

    const tokenInfo = this.authService.generateTokenInfo(user.id, user.roles);

    switch (country) {
      case 'jp':
        this.clientBaseUrl = this.configService.get('app.clientApp.baseUrlJP');
        break;
      case 'th':
        this.clientBaseUrl = this.configService.get('app.clientApp.baseUrlTH');
        break;
      case 'kr':
        this.clientBaseUrl = this.configService.get('app.clientApp.baseUrlKR');
        break;
      default:
        this.clientBaseUrl = this.configService.get('app.clientApp.baseUrl');
    }

    return res.redirect(
      `${this.clientBaseUrl}/oauth/facebook/callback?${queryString.stringify(
        tokenInfo,
      )}`,
    );
  };
}
