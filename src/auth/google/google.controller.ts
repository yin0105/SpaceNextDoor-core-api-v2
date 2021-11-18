/* eslint-disable no-invalid-this */
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import * as queryString from 'query-string';

import { AuthService } from '../auth.service';
import { UserService } from '../users/user.service';

@Controller('oauth/google')
export class GoogleController {
  private clientBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    this.clientBaseUrl = this.configService.get('app.clientApp.baseUrl');
  }

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // this will redirect oauth google
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    return this.processOauthResponse(req, res);
  }

  @Get('th')
  @UseGuards(AuthGuard('googleTH'))
  async googleAuthTH() {
    // this will redirect oauth google
  }

  @Get('callback/th')
  @UseGuards(AuthGuard('googleTH'))
  async googleAuthCallbackTH(@Req() req, @Res() res) {
    return this.processOauthResponse(req, res, 'th');
  }

  @Get('jp')
  @UseGuards(AuthGuard('googleJP'))
  async googleAuthJP() {
    // this will redirect oauth google
  }

  @Get('callback/jp')
  @UseGuards(AuthGuard('googleJP'))
  async googleAuthCallbackJP(@Req() req, @Res() res) {
    return this.processOauthResponse(req, res, 'jp');
  }

  @Get('kr')
  @UseGuards(AuthGuard('googleKR'))
  async googleAuthKR() {
    // this will redirect oauth google
  }

  @Get('callback/kr')
  @UseGuards(AuthGuard('googleKR'))
  async googleAuthCallbackKR(@Req() req, @Res() res) {
    return this.processOauthResponse(req, res, 'kr');
  }

  private processOauthResponse = async (req, res, country = '') => {
    if (!req?.user) {
      return res.redirect(`${this.clientBaseUrl}/?google=error`);
    }

    const user = await this.userService.upsert({
      username: req.user.email,
      oauthUser: req.user,
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
      `${this.clientBaseUrl}/oauth/google/callback?${queryString.stringify(
        tokenInfo,
      )}`,
    );
  };
}
