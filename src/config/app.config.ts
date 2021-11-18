import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  host: process.env.HOST || 'localhost',
  webURL: process.env.WEB_URL,
  clientApp: {
    baseUrl: process.env.CLIENT_BASE_URL,
    baseUrlTH: process.env.CLIENT_BASE_URL_TH,
    baseUrlJP: process.env.CLIENT_BASE_URL_JP,
    baseUrlKR: process.env.CLIENT_BASE_URL_KR,
  },
  db: {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || 'snd_api',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || 7,
  },
  twilio: {
    accountId: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    senderPhone: process.env.TWILIO_SENDER_PHONE,
  },
  mail: {
    apiKey: process.env.SENDGRID_API_KEY,
  },
  s3: {
    accessKey: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION,
    bucketName: process.env.AWS_S3_BUCKET_NAME,
    bucketUrl: process.env.AWS_S3_BUCKET_URL,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
  defaultResizeWidth: process.env.DEFAULT_RESIZE_WIDTH,
  defaultCommission: process.env.DEFAULT_COMMISSION,
  supportMimeType: process.env.SUPPORT_MIME_TYPE,
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION,
  siteLink: {
    browserUrl: process.env.BROWSER_URL,
    priceCommissionPercent: process.env.SITE_LINK_COMMISSION_PERCENT || 10,
    loginURL: process.env.SITE_LINK_LOGIN_URL,
    unitsURL: process.env.SITE_LINK_UNITS_URL,
    sitesURL: process.env.SITE_LINK_SITES_URL,

    // storehub user (In Singapore)
    user: process.env.SITE_LINK_USER,
    pass: process.env.SITE_LINK_PASS,
    code: process.env.SITE_LINK_CODE,

    // JWD user (in Thailand)
    userJWD: process.env.SITE_LINK_USER_JWD,
    passJWD: process.env.SITE_LINK_PASS_JWD,
    codeJWD: process.env.SITE_LINK_CODE_JWD,
    locationCodeJWD: process.env.SITE_LINK_LOCATION_JWD,
  },
  termination: {
    noticeDays: process.env.TERMINATION_NOTICE_DAYS,
  },
  gogox: {
    clientId: process.env.GOGOX_CLIENT_ID,
    clientSecret: process.env.GOGOX_CLIENT_SECRET,
    apiUrl: process.env.GOGOX_API_URL,
  },
  yotpo: {
    apiKey: process.env.YOTPO_API_KEY,
    apiSecret: process.env.YOTPO_API_SECRET,
  },
  constants: {
    sndPickupCommissionPercent: 10,
  },
  csEmail: {
    singapore: 'help@spacenextdoor.com',
    thailand: 'help@spacenextdoor.io',
    japan: 'help@spacenextdoor.com',
    korea: 'help@spacenextdoor.com',
  },
  doorController: {
    apiUrl: process.env.DOOR_CONTROLLER_API_URL,
    apiKey: process.env.DOOR_CONTROLLER_API_KEY,
  },
  supportedLanguages: ['en-US', 'th', 'ja'],
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    exchange: process.env.SND_EXCHANGE,
    update_es_key: process.env.SND_UPDATE_ES_KEY,
    update_stock_key: process.env.SND_UPDATE_STOCK_KEY,
  },
  stockService: {
    filter: process.env.FILTER_BY_STOCK_URL,
  },
  renewal: {
    createBefore: 2, // days
  },
  clevertap: {
    accountId: process.env.CLEVERTAP_ACCOUNT_ID,
    accountPasscode: process.env.CLEVERTAP_ACCOUNT_PASSCODE,
  },
}));
