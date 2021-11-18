import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';

interface IPageOptions {
  type(selector: string, val: any): Promise<IPageOptions>;
  click(selector: string): Promise<IPageOptions>;
  getCookieStr(): Promise<string>;
}

export default class Crawler {
  private url: string = null;
  private browserUrl: string = null;
  private page: Page = null;
  private browser: Browser;

  constructor(url: string, configService: ConfigService) {
    this.url = url;
    this.browserUrl = configService.get('app.siteLink.browserUrl');

    if (!url) {
      throw new TypeError('URL and config service is required');
    }
  }

  async crawl(): Promise<IPageOptions> {
    this.browser = await puppeteer.connect({
      browserWSEndpoint: this.browserUrl,
      slowMo: 20,
    });

    this.page = await this.browser.newPage();
    await this.page.goto(this.url);

    const pageOptions: IPageOptions = {
      type: async (selector, val) => {
        await this.page.type(selector, val);
        return pageOptions;
      },
      click: async (selector) => {
        await this.page.click(selector);
        return pageOptions;
      },
      getCookieStr: async () => {
        const cookies = await this.page.cookies();
        return cookies
          .map((cookie) => [cookie.name, cookie.value].join('='))
          .join('; ');
      },
    };

    return pageOptions;
  }

  async finish(): Promise<void> {
    if (!this.browser) {
      throw new Error('Browser not open or already closed!');
    }

    await this.browser.close();
  }
}
