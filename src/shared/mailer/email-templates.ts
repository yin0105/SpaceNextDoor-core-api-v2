import { template as t } from '../utils/template-string';

// template ids from sendgrid portal
const emailTemplates = [
  {
    locale: 'en-US',
    template: {
      SEND_OTP: 'd-91b44a82b2f3428b9df9f46e2a9a6b21',
      BOOKING_CONFIRMED: 'd-6f129802328d4e3b8c0e492b9f94266a',
      TERMINATION_REQUESTED: 'd-6300c20a3cae46d28daacb4f9a5925c0',
      BOOKING_CANCELLED: 'd-84d16cca210d4aa48cf3ba281af077fb',
      NEXT_RENEWAL: 'd-dc7c7223a931460cb954152d1fcfe4d0',
      FAILED_RENEWAL: 'd-14fd5f3919434ec3a407daa064630ec3',
      GET_QUOTATION: 'd-a47a903960c041fb9f721a12673b2893',
      QUOTATION_REJECTED: 'd-a47a903960c041fb9f721a12673b2893',
      QUOTATION_REMINDER: 'd-a47a903960c041fb9f721a12673b2893',

      // HOST
      HOST_BOOKING_CANCELLATION: 'd-3d76ec13ac914f8084815770629bd3f7',
      HOST_NEW_SITE_LISTED: 'd-09fc7e987c5b48c9b841eea9fc8f6589',
      HOST_NEW_SITE_SUBMITTED: 'd-3d958f205aa14e1ba344db2e906e1b6e',
      HOST_NEW_RESERVATION: 'd-8ab4f5d325cd445aa833b186fad2febf',
    },
  },
  {
    locale: 'th',
    template: {
      SEND_OTP: 'd-d04417fd48a744b8b78264ecc5655f8e',
      BOOKING_CONFIRMED: 'd-a0174942620142d38b7a4472fe549f17',
      TERMINATION_REQUESTED: 'd-7bfaf528abcc42079b0d7155b8d352d6',
      BOOKING_CANCELLED: 'd-6f5d5d50c93a4c0f8ff3d2a3d357702f',
      NEXT_RENEWAL: 'd-62e692e91ac94044ba62653dd02bf250',
      FAILED_RENEWAL: 'd-53dc16d2ad124b37bb8e0505a1a8257c',
      GET_QUOTATION: 'd-845e3a9aa8564ad387fa2bb63a68e7e2',
      QUOTATION_REJECTED: 'd-845e3a9aa8564ad387fa2bb63a68e7e2',
      QUOTATION_REMINDER: 'd-845e3a9aa8564ad387fa2bb63a68e7e2',

      // HOST
      HOST_BOOKING_CANCELLATION: 'd-c361eaca625e45408f4544d8dcf715f0',
      HOST_NEW_SITE_LISTED: 'd-9f092c7413944075911dd8c7bf15f3ae',
      HOST_NEW_SITE_SUBMITTED: 'd-6de9dcec064e421faf136a032539d3e2',
      HOST_NEW_RESERVATION: 'd-6a14792b84794bd491f6cf2b2af24452',
    },
  },
  {
    locale: 'ja',
    template: {
      SEND_OTP: 'd-c82817356ea449e3a9c19b389f6634b7',
      BOOKING_CONFIRMED: 'd-543bc88c00504bdb87f4277f7b9b99e9',
      TERMINATION_REQUESTED: 'd-1a37c53ef7344107b6f23843875e398a',
      BOOKING_CANCELLED: 'd-0e7c0fac3a384571a8b69c0eff7b1807',
      NEXT_RENEWAL: 'd-10d1b494d8fb407896a1ea65a44c1456',
      FAILED_RENEWAL: 'd-64c047c515234b1fa2a22c62902ab8b3',
      GET_QUOTATION: 'd-dd34a1020d0949cf98f03e2584554d47',
      QUOTATION_REJECTED: 'd-dd34a1020d0949cf98f03e2584554d47',
      QUOTATION_REMINDER: 'd-dd34a1020d0949cf98f03e2584554d47',

      // HOST
      HOST_BOOKING_CANCELLATION: 'd-6c916dc262794fd794267231c1d61b2d',
      HOST_NEW_SITE_LISTED: 'd-4c19ccf3a1dd4490897a21dc99327ce9',
      HOST_NEW_SITE_SUBMITTED: 'd-12c04246ec0c497db704715a1dfc561a',
      HOST_NEW_RESERVATION: 'd-93c4407439a44e0780e1bd0e0692626c',
    },
  },
];

export const adminEmailTemplates = {
  ADMIN_TERMINATION_PAYMENT_FAILED: 'd-4f15b73dd27f403f8fe5660df32fa306',
};

export enum TemplateNames {
  SEND_OTP = 'SEND_OTP',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  TERMINATION_REQUESTED = 'TERMINATION_REQUESTED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  NEXT_RENEWAL = 'NEXT_RENEWAL',
  FAILED_RENEWAL = 'FAILED_RENEWAL',
  GET_QUOTATION = 'GET_QUOTATION',
  HOST_CANCELLATION = 'HOST_CANCELLATION',
  HOST_NEW_SITE_LISTED = 'HOST_NEW_SITE_LISTED',
  HOST_NEW_SITE_SUBMITTED = 'HOST_NEW_SITE_SUBMITTED',
  HOST_NEW_RESERVATION = 'HOST_NEW_RESERVATION',
  HOST_BOOKING_CANCELLATION = 'HOST_BOOKING_CANCELLATION',
  ADMIN_TERMINATION_PAYMENT_FAILED = 'ADMIN_TERMINATION_PAYMENT_FAILED',
  QUOTATION_REJECTED = 'QUOTATION_REJECTED',
  QUOTATION_REMINDER = 'QUOTATION_REMINDER',
}

// SMS notification template
const smsTemplates = [
  {
    locale: 'en-US',
    template: {
      // tslint:disable-next-line:max-line-length
      OTP_MESSAGE: t`Space Next Door: Your login code is ${'otp'}, please fill it in within 1 minute before it expires.`,
      COMPLETE_BOOKING: t`Your booking #${'shortId'} has been completed. Thank you for trusting us - Space Next Door`,
      CANCEL_BOOKING: t`Your booking has been cancelled for booking id: ${'shortId'}.
          Please contact customer support for further detail.`,
      CANCEL_BOOKING_ORDER: t`Your order has been cancelled for order id: ${'orderId'}.
          Please contact customer support for further detail.`,
      RENEWAL_FAIL: t`Your payment has been failed for booking id: ${'shortId'}. Please contact customer support.`,
      HOST_PAYOUT: t`We send a new payment ${'amount'}${'currency'}
    to your default bank.
    Related with Space ID: ${'spaceId'}, Booking ID: ${'shortId'},
    Renewal Start Date: ${'renewal_start_date'}, Renewal End Date: ${'renewal_end_date'}`,
    },
  },
  {
    locale: 'th',
    template: {
      OTP_MESSAGE: t`Space Next Door: โค้ดเข้าสู่ระบบของคุณคือ ${'otp'} โปรดใส่โค้ดภายใน 1 นาทีก่อนที่จะหมดอายุ`,
      COMPLETE_BOOKING: t`'การจองหมายเลข #${'shortId'} ของคุณสำเร็จแล้ว ขอบคุณที่ไว้วางใจเรา - Space Next Door`,
      CANCEL_BOOKING: t`การจองหมายเลข ${'shortId'} ของคุณได้ถูกยกเลิกเรียบร้อยแล้ว
  โปรดติดต่อฝ่ายบริการลูกค้าสำหรับข้อมูลเพิ่มเติม`,
      CANCEL_BOOKING_ORDER: t`คำสั่งซื้อหมายเลข ${'orderId'} ของคุณได้ถูกยกเลิกเรียบร้อยแล้ว
  โปรดติดต่อฝ่ายบริการลูกค้าสำหรับข้อมูลเพิ่มเติม`,
      RENEWAL_FAIL: t`การชำระเงินสำหรับการจองหมายเลข ${'shortId'} ของคุณล้มเหลว โปรดติดต่อฝ่ายบริการลูกค้า`,
      HOST_PAYOUT: t`เราได้ส่งข้อมูลการชำระเงินใหม่เป็นจำนวน ${'amount'}${'currency'}
ไปที่ธนาคารที่คุณตั้งค่าไว้
เกี่ยวกับพื้นที่หมายเลข: ${'spaceId'}, หมายเลขการจอง: ${'shortId'},
วันที่เริ่มต้นการจอง: ${'renewal_start_date'}, วันหมดอายุการจอง: ${'renewal_end_date'}`,
    },
  },
  {
    locale: 'ja',
    template: {
      OTP_MESSAGE: t`スペースネクストドア：お客様のログインコードは${'otp'}です。失効しないよう1分以内に入力してください。`,
      COMPLETE_BOOKING: t`予約 #${'shortId'} 手続きが完了しました。ご予約まことにありがとうございます - スペースネクストドア`,
      CANCEL_BOOKING: t`お客様のご予約${'shortId'}はキャンセルされました。詳細情報につきましては、カスタマーサポートまでお問合せください。`,
      CANCEL_BOOKING_ORDER: t`お客様のご注文はキャンセルされました。注文ID: ${'orderId'} 詳細情報につきましては、カスタマーサポートまでお問合せください。`,
      RENEWAL_FAIL: t`予約ID：${'shortId'}のお支払いを完了できませんでした。お手数ですがカスタマーサポートまでお問合せください。`,
      HOST_PAYOUT: t`当社より${'amount'}${'currency'}
      をお客様のご登録銀行口座に送金しました。
      関連スペースID: ${'space_id'}、予約ID: ${'shortId'}、
      更新有効日: ${'renewal_start_date'}、更新終了日: ${'renewal_end_date'}`,
    },
  },
];

export enum SMSNames {
  OTP_MESSAGE = 'OTP_MESSAGE',
  COMPLETE_BOOKING = 'COMPLETE_BOOKING',
  CANCEL_BOOKING = 'CANCEL_BOOKING',
  CANCEL_BOOKING_ORDER = 'CANCEL_BOOKING_ORDER',
  RENEWAL_FAIL = 'RENEWAL_FAIL',
  HOST_PAYOUT = 'HOST_PAYOUT',
}

/**
 * Get translated email template
 * @param locale
 * @param templateId
 * @returns
 */
export const getEmailTemplateT = (
  templateId: TemplateNames,
  locale = 'en-US',
): string => {
  // Fallback to en-US if provided locale is not supported
  if (!['en-US', 'th', 'ja'].includes(locale)) {
    locale = 'en-US';
  }
  const { template } = emailTemplates.find((s): boolean => s.locale === locale);
  if (template && !template[templateId]) {
    throw new Error('Template not found');
  }
  return template[templateId];
};

/**
 * Get translated template, usage example:
 * 1. Without variable
 *  smsTemplateT(SMSNames.OTP_MESSAGE,'th')
 * 2. with variable
 * smsTemplateT(SMSNames.OTP_MESSAGE,'th')({ otp: '1234' })
 * @param templateId
 * @param locale
 * @returns function
 */
export const smsTemplateT = (templateId: SMSNames, locale = 'en-US'): any => {
  // Fallback to en-US if provided locale is not supported
  if (!['en-US', 'th', 'ja'].includes(locale)) {
    locale = 'en-US';
  }
  const { template } = smsTemplates.find((s): boolean => s.locale === locale);
  if (template && !template[templateId]) {
    throw new Error('Template not found');
  }
  return template[templateId];
};
