
export const telebirrConfig = {
  baseUrl:
    "https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway",

  webBaseUrl:
    "https://developerportal.ethiotelebirr.et:38443/payment/web/paygate?",

  fabricAppId:
    process.env.TELEBIRR_FABRIC_APP_ID,

  appSecret:
    process.env.TELEBIRR_APP_SECRET,

  merchantAppId:
    process.env.TELEBIRR_MERCHANT_APP_ID,

  merchantCode:
    process.env.TELEBIRR_SHORT_CODE,

  privateKey:
    process.env.TELEBIRR_PRIVATE_KEY,
};
