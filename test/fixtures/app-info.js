const LYAUTH = require('../..');
const callbackFuncs = require('./callback')

const appInfo = {
  fetchUserById: callbackFuncs.getUserById,
  loginWithMobilePhone: callbackFuncs.loginWithMobilephone,
  loginWithUsername: callbackFuncs.loginWithUsername
};

LYAUTH.init(appInfo);

module.exports = appInfo;
