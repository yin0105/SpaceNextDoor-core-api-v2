const commonErrorMessages = [
  {
    locale: 'en-US',
    messages: {
      PROMO_CODE_INVALID: "Promo code isn't valid or expired",
      SPACE_NOT_FOUND: 'Space not found with this id',
      AFFILIATE_SPACE: 'Your booking is not allowed to checkout here.',
      INVALID_MOVE_IN_DATE: 'Please provide correct move in date',
      INVALID_MOVE_OUT_DATE: 'Please provide correct move out date',
      BOOKING_NOT_FOUND: 'Booking not found!',
      OTP_INVALID_EXPIRED: 'OTP is not correct or expired already!',
      GET_QUOTATION_NO_SPACE:
        'We could not find any spaces that matches your search criteria - please adjust your search',
    },
  },
  {
    locale: 'th',
    messages: {
      PROMO_CODE_INVALID: 'โค้ดโปรโมชั่นไม่ถูกต้องหรือหมดอายุ',
      SPACE_NOT_FOUND: 'ไม่พบพื้นที่ด้วยหมายเลขนี้',
      AFFILIATE_SPACE: 'การจองของคุณไม่ได้รับอนุญาตให้เช็คเอาท์ที่นี่',
      INVALID_MOVE_IN_DATE: 'กรุณาระบุวันที่ย้ายเข้าที่ถูกต้อง',
      INVALID_MOVE_OUT_DATE: 'กรุณาระบุวันที่ย้ายออกที่ถูกต้อง',
      BOOKING_NOT_FOUND: 'ไม่พบการจอง',
      OTP_INVALID_EXPIRED: 'OTP ไม่ถูกต้องและหมดอายุแล้ว”',
      GET_QUOTATION_NO_SPACE:
        'เราไม่พบช่องว่างใด ๆ ที่ตรงกับเกณฑ์การค้นหาของคุณ - โปรดปรับการค้นหาของคุณ',
    },
  },
  {
    locale: 'ja',
    messages: {
      PROMO_CODE_INVALID: 'プロモーションコードが有効ではないか、期限切れです',
      SPACE_NOT_FOUND: 'このIDのスペースを見つけることはできませんでした',
      AFFILIATE_SPACE:
        '申し訳ありませんが、当サイトでのチェックアウトは許可されていません。',
      INVALID_MOVE_IN_DATE: '正しい搬入日を入力してください',
      INVALID_MOVE_OUT_DATE: '正しい退去日を入力してください',
      BOOKING_NOT_FOUND: 'ご予約が見つかりません！',
      OTP_INVALID_EXPIRED:
        'ワンタイムパスワード（OTP）が間違っているか、有効期限切れです。',
      GET_QUOTATION_NO_SPACE:
        '該当する物件が見つかりません。検索内容を変更して再度お試しください。',
    },
  },
];

export enum ErrorNames {
  PROMO_CODE_INVALID = 'PROMO_CODE_INVALID',
  SPACE_NOT_FOUND = 'SPACE_NOT_FOUND',
  AFFILIATE_SPACE = 'AFFILIATE_SPACE',
  INVALID_MOVE_IN_DATE = 'INVALID_MOVE_IN_DATE',
  INVALID_MOVE_OUT_DATE = 'INVALID_MOVE_OUT_DATE',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  OTP_INVALID_EXPIRED = 'OTP_INVALID_EXPIRED',
  GET_QUOTATION_NO_SPACE = 'GET_QUOTATION_NO_SPACE',
}

/**
 * Get translated public error messages
 * @param locale
 * @param templateId
 * @returns
 */
export const getMessageT = (
  errorName: ErrorNames,
  locale = 'en-US',
): string => {
  // Fallback to en-US if provided locale is not supported
  if (!['en-US', 'th', 'ja'].includes(locale)) {
    locale = 'en-US';
  }
  const { messages } = commonErrorMessages.find(
    (s): boolean => s.locale === locale,
  );
  if (messages && !messages[errorName]) {
    throw new Error('Error message not found');
  }
  return messages[errorName];
};

export const getTranslatedName = (
  object: any,
  fieldName: string,
  lang = 'en-US',
): string => {
  if (
    !fieldName ||
    (object && !Object?.keys(object).some((item) => item.includes(fieldName)))
  ) {
    return '';
  }

  switch (lang) {
    case 'en-US':
      return object ? object[`${fieldName}_en`] : '';
    case 'th':
      return object ? object[`${fieldName}_th`] : '';
    case 'ja':
      return object ? object[`${fieldName}_jp`] : '';
    case 'kr':
      return object ? object[`${fieldName}_kr`] : '';
    default:
      return object ? object[`${fieldName}_en`] : '';
  }
};
