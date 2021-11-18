import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import Crawler from './crawler';
import {
  ISiteLinkByStore,
  ISiteLinkSite,
  ISiteLinkUnit,
  SiteLinkStore,
} from './interfaces';

export class SiteLinkConnector {
  private crawler: Crawler;
  private loginURL: string;
  private unitsURL: string;
  private sitesURL: string;
  private cookie: string;

  // storehub store user
  private user: string;
  private pass: string;
  private code: string;

  // JWD store user
  private userJWDStore: string;
  private passJWDStore: string;
  private codeJWDStore: string;
  private locationCodeJWDStore: string;

  constructor(configService: ConfigService) {
    this.loginURL = configService.get('app.siteLink.loginURL');
    this.unitsURL = configService.get('app.siteLink.unitsURL');
    this.sitesURL = configService.get('app.siteLink.sitesURL');

    //
    this.user = configService.get('app.siteLink.user');
    this.pass = configService.get('app.siteLink.pass');
    this.code = configService.get('app.siteLink.code');

    //
    this.userJWDStore = configService.get('app.siteLink.userJWD');
    this.passJWDStore = configService.get('app.siteLink.passJWD');
    this.codeJWDStore = configService.get('app.siteLink.codeJWD');
    this.locationCodeJWDStore = configService.get(
      'app.siteLink.locationCodeJWD',
    );

    this.crawler = new Crawler(this.loginURL, configService);
  }

  async login(siteLinkStore: ISiteLinkByStore): Promise<void> {
    const page = await this.crawler.crawl();

    if (siteLinkStore.store_name === SiteLinkStore.STOREHUB) {
      await page.type('#Corp_CorpCode', this.code);
      await page.type('#Corp_UserName', this.user);
      await page.type('#Corp_Password', this.pass);
      await page.click(
        '#loginform > div.row.login-container > div:nth-child(2) > form > div > div.panel-footer > input',
      );
    } else if (siteLinkStore.store_name === SiteLinkStore.JWD_STORE_IT) {
      await page.type('#Client_CorpCode', this.codeJWDStore);
      await page.type('#Client_LocationCode', this.locationCodeJWDStore);
      await page.type('#Client_UserName', this.userJWDStore);
      await page.type('#Client_Password', this.passJWDStore);
      await page.click(
        '#loginform > div.row.login-container > div:nth-child(1) > form > div > div.panel-footer > input',
      );
    } else {
      throw new Error('Country not supported');
    }

    this.cookie = await page.getCookieStr();

    await this.crawler.finish();
  }

  async getSites(): Promise<ISiteLinkSite[]> {
    const data = await axios.get(this.sitesURL, {
      headers: {
        Cookie: this.cookie,
      },
    });

    if (data.status !== 200) {
      throw new Error(data.statusText);
    }

    if (!Array.isArray(data.data)) {
      // eslint-disable-next-line no-restricted-syntax
      console.log(data?.status, data?.statusText, data?.data);
      throw new Error('Error while fetching sitelink sites');
    }

    return data.data;
  }

  async getUnitsBySite(siteId: number): Promise<ISiteLinkUnit[]> {
    const data = await axios.get(`${this.unitsURL}?siteId=${siteId}`, {
      headers: {
        Cookie: this.cookie,
      },
    });

    if (data.status !== 200) {
      throw new Error(data.statusText);
    }

    if (!Array.isArray(data.data)) {
      // eslint-disable-next-line no-restricted-syntax
      console.log(data?.status, data?.statusText, data?.data);
      throw new Error('Error while fetching sitelink units');
    }

    return data.data;
  }
}
