const LYAUTH = require('../..');
const callbackFuncs = require('./callback')

const appInfo = {
  secret: 'kuiox2sExuYy3lXzTWdef2lCuiw3IKEF',
  fetchUserById: callbackFuncs.getUserById,
  loginWithMobilePhone: callbackFuncs.loginWithMobilephone,
  loginWithUsername: callbackFuncs.loginWithUsername,
  signUpWithUsername: callbackFuncs.signUpWithUsername,
  signUpWithMobilePhone: callbackFuncs.signUpWithMobilePhone,

};

LYAUTH.init(appInfo);

module.exports = appInfo;
