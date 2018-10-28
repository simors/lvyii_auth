/**
 * Created by yangyang on 2018/1/4.
 */
'use strict';

var connect = require('connect');
var bodyParser = require('body-parser');
var https = require('https');
var timeout = require('connect-timeout');
var _ = require('underscore');
var jwt = require("jsonwebtoken");
const request = require('superagent');

var LYAUTH = require('./init')
var frameworks = require('./frameworks');

var LvyiiAuthUtil = require('./util')

var NODE_ENV = process.env.NODE_ENV || 'development';

LYAUTH.express = function (options) {
  return frameworks(createRootRouter(options), 'express')
}

function createRootRouter(options) {
  var router = connect();
  
  ['1'].forEach(function(apiVersion) {
    router.use('/' + apiVersion + '/users/', createUserAuthFunctionRouter(options));
  });
  
  return router;
}

function createUserAuthFunctionRouter(options) {
  options = options || {};
  
  var authFunctions = connect();
  
  authFunctions.use(timeout(options.timeout || '15s'));
  authFunctions.use(bodyParser.urlencoded({extended: false, limit: '20mb'}));
  authFunctions.use(bodyParser.json({limit: '20mb'}));
  authFunctions.use(bodyParser.text({limit: '20mb'}));
  authFunctions.use(require('../middleware/cors')());
  authFunctions.use(require('../middleware/lvyii-headers')(LYAUTH)());
  
  authFunctions.use('/me', getUserBySessionToken)
  authFunctions.use('/loginWithMobilePhone', userLoginWithMobilephone)
  authFunctions.use('/loginWithUsername', userLoginWithUsername)
  authFunctions.use('/signUpWithUsername', userSignUpWithUsername)
  authFunctions.use('/signUpWithMobilePhone', userSignUpWithMobilePhone)
  authFunctions.use('/signUpOrlogInWithMobilePhone', userSignUpOrlogInWithMobilePhone)
  authFunctions.use('/requestMobilePhoneVerify', userRequestMobilePhoneVerify)
  authFunctions.use('/verifyMobilePhone', userVerifyMobilePhone)
  authFunctions.use('/resetPassword', userResetPassword)
  authFunctions.use('/requestResetPasswordBySmsCode', userRequestResetPasswordBySmsCode)
  authFunctions.use('/resetPasswordBySmsCode', userResetPasswordBySmsCode)

  authFunctions.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.statusCode = 404;
  
    res.end(JSON.stringify({
      code: 1002,
      error: 'Can not find the router'
    }));
  })
  
  authFunctions.use(function(err, req, res, next) { // jshint ignore:line
    if(req.timeout) {
      console.error(`LvyiiAuth: ${req.originalUrl}: function timeout (${err.timeout}ms)`);
      err.code = 124;
      err.message = 'The request timed out on the server.';
    }
    responseError(res, err);
  });
  
  return authFunctions
}

const getUserBySessionToken = function (req, res) {
  if (LYAUTH._callback.fetchUserById) {
    var sessionToken = req.body.sessionToken
    var payload = jwt.verify(sessionToken, LYAUTH._config.secret)
    if (!payload.id) {
      throw new LYAUTH.Error(`undefined 'id' property for user`, {code: 101})
    }
    var userId = payload.id
    promiseTry(() => {
      return LYAUTH._callback.fetchUserById(userId).then((userInfo) => {
        if (!userInfo.id) {
          throw new LYAUTH.Error(`undefined 'id' property for user`, {code: 101})
        }
        userInfo.token = sessionToken
        return userInfo
      })
    }).then((response) => {
      responseJson(res, response)
    }).catch(err => {
      responseException(res, req.url, err)
    })
  } else {
    responseUndefined(res)
  }
}

const userLoginWithMobilephone = function (req, res) {
  if (LYAUTH._callback.loginWithMobilePhone) {
    var mobilephone = req.body.mobilephone
    var password = req.body.password
    promiseTry(() => {
      return LYAUTH._callback.loginWithMobilePhone(mobilephone, password).then((userInfo) => {
        if (!userInfo.id) {
          throw new LYAUTH.Error(`undefined 'id' property for user`, {code: 101})
        }
        userInfo.token = jwt.sign({id: userInfo.id}, LYAUTH._config.secret);
        return userInfo
      })
    }).then((response) => {
      responseJson(res, response)
    }).catch(err => {
      responseException(res, req.url, err)
    })
  } else {
    responseUndefined(res)
  }
}

const userLoginWithUsername = function (req, res) {
  if (LYAUTH._callback.loginWithUsername) {
    var username = req.body.username
    var password = req.body.password
    promiseTry(() => {
      return LYAUTH._callback.loginWithUsername(username, password).then((userInfo) => {
        if (!userInfo.id) {
          throw new LYAUTH.Error(`undefined 'id' property for user`, {code: 101})
        }
        userInfo.token = jwt.sign({id: userInfo.id}, LYAUTH._config.secret);
        return userInfo
      })
    }).then((response) => {
      responseJson(res, response)
    }).catch(err => {
      responseException(res, req.url, err)
    })
  } else {
    responseUndefined(res)
  }
}

const userSignUpWithUsername = function (req, res) {
  if (LYAUTH._callback.signUpWithUsername) {
    var username = req.body.username
    var password = req.body.password
    var attributes = req.body.attributes

    promiseTry(() => {
      return LYAUTH._callback.signUpWithUsername(username, password, attributes).then((userInfo) => {
        if (!userInfo.id) {
          throw new LYAUTH.Error(`undefined 'id' property for user`, {code: 101})
        }
        userInfo.token = jwt.sign({id: userInfo.id}, LYAUTH._config.secret);
        return userInfo
      })
    }).then((response) => {
      responseJson(res, response)
    }).catch(err => {
      responseException(res, req.url, err)
    })
  } else {
    responseUndefined(res)
  }
}

const userSignUpWithMobilePhone = function (req, res) {
  if (LYAUTH._callback.signUpWithMobilePhone) {
    var mobilephone = req.body.mobilephone
    var password = req.body.password
    var smsCode = req.body.smsCode
    var attributes = req.body.attributes
    var lvyiiAuthUtil = new LvyiiAuthUtil(LYAUTH)

    promiseTry(() => {
      function captchaCallback(err) {
        if (err) {
          throw new LYAUTH.Error(`get auth captcha error`, {code: 105})
        }
      }
      return lvyiiAuthUtil.getCaptcha(mobilephone, "auth", captchaCallback)
    }).then((result) => {
      return (result + "").toLowerCase() === (smsCode + "").toLowerCase()
    }).then((match) => {
      if (match) {
        return LYAUTH._callback.signUpWithMobilePhone(mobilephone, password, attributes).then((userInfo) => {
          if (!userInfo.id) {
            throw new LYAUTH.Error(`undefined 'id' property for user`, {code: 101})
          }
          userInfo.token = jwt.sign({id: userInfo.id}, LYAUTH._config.secret);
          return userInfo
        })
      } else {
        throw new LYAUTH.Error(`invalid sms code`, {code: 106})
      }
    }).then((response) => {
      responseJson(res, response)
    }).catch(err => {
      responseException(res, req.url, err)
    })
  } else {
    responseUndefined(res)
  }
}

const userSignUpOrlogInWithMobilePhone = function (req, res) {
  if (LYAUTH._callback.signUpOrlogInWithMobilePhone) {
    var mobilephone = req.body.mobilephone
    var smsCode = req.body.smsCode
    var attributes = req.body.attributes
    var lvyiiAuthUtil = new LvyiiAuthUtil(LYAUTH)
  
    promiseTry(() => {
      function captchaCallback(err) {
        if (err) {
          throw new LYAUTH.Error(`get auth captcha error`, {code: 105})
        }
      }
      return lvyiiAuthUtil.getCaptcha(mobilephone, "auth", captchaCallback)
    }).then((result) => {
      return (result + "").toLowerCase() === (smsCode + "").toLowerCase()
    }).then((match) => {
      if (match) {
        return LYAUTH._callback.signUpOrlogInWithMobilePhone(mobilephone, attributes).then((userInfo) => {
          if (!userInfo.id) {
            throw new LYAUTH.Error(`undefined 'id' property for user`, {code: 101})
          }
          userInfo.token = jwt.sign({id: userInfo.id}, LYAUTH._config.secret);
          return userInfo
        })
      } else {
        throw new LYAUTH.Error(`invalid sms code`, {code: 106})
      }
    }).then((response) => {
      responseJson(res, response)
    }).catch(err => {
      responseException(res, req.url, err)
    })
  } else {
    responseUndefined(res)
  }
}

/**
 * 请求认证手机号。验证的过程需要向指定的手机号发送短信，目前短信平台只支持腾讯云的短信平台。
 * 在设置短信模板时，模板中只能设置一个参数，此参数为随机生成的验证码。例如：
 * {1}为您注册验证码，请于10分钟内填写。如非本人操作，请忽略本短信。
 * 其中，{1}即为生成的验证码
 * @param req
 * @param res
 */
const userRequestMobilePhoneVerify = function (req, res) {
  var mobilephone = req.body.mobilephone
  var lvyiiAuthUtil = new LvyiiAuthUtil(LYAUTH)
  var captcha = lvyiiAuthUtil.createCaptcha()
  
  promiseTry(() => {
    if (!LYAUTH._config.verifyPhoneSmsTempId) {
      throw new LYAUTH.Error(`did not config verifyPhoneSmsTempId`, {code: 104})
    }
    function captchaCallback(err) {
      if (err) {
        throw new LYAUTH.Error(`save auth captcha error`, {code: 105})
      }
    }
    lvyiiAuthUtil.saveCaptcha(mobilephone, captcha, "auth", captchaCallback)
    var apiServer = LYAUTH._config.serverURLs['api']
    request.post(apiServer + '/1/api/sendSms')
      .send({templId: LYAUTH._config.verifyPhoneSmsTempId, phoneNumber: mobilephone, params: [captcha]})
      .end(function(err, res) {
        if (err) {
          if (res) {
            throw new LYAUTH.Error(`request send sms error ${res.text}`, {code: 103})
          }
          throw new LYAUTH.Error(`request send sms error`, {code: 103})
        }
      })
  }).then((response) => {
    responseJson(res, response)
  }).catch(err => {
    responseException(res, req.url, err)
  })
}

const userVerifyMobilePhone = function (req, res) {
  var mobilephone = req.body.mobilephone
  var code = req.body.code
  var lvyiiAuthUtil = new LvyiiAuthUtil(LYAUTH)
  
  promiseTry(() => {
    function captchaCallback(err) {
      if (err) {
        throw new LYAUTH.Error(`get captcha error`, {code: 105})
      }
    }
    return lvyiiAuthUtil.getCaptcha(mobilephone, "auth", captchaCallback)
  }).then((result) => {
    return (result + "").toLowerCase() === (code + "").toLowerCase()
  }).then((response) => {
    responseJson(res, response)
  }).catch(err => {
    responseException(res, req.url, err)
  })
}

const userResetPassword = function (req, res) {
  if (LYAUTH._callback.resetPassword) {
    var oldPassword = req.body.oldPassword
    var newPassword = req.body.newPassword
    promiseTry(() => {
      if (req.LYAUTH.sessionToken && req.LYAUTH.sessionToken !== '') {
        return req.LYAUTH.sessionToken;
      }
    }).then((sessionToken) => {
      var payload = jwt.verify(sessionToken, LYAUTH._config.secret)
      if (!payload.id) {
        throw new LYAUTH.Error(`undefined 'id' property for user`, {code: 101})
      }
      var userId = payload.id
      return LYAUTH._callback.resetPassword(userId, oldPassword, newPassword)
    }).then((response) => {
      responseJson(res, response)
    }).catch(err => {
      responseException(res, req.url, err)
    })
  } else {
    responseUndefined(res)
  }
}

const userRequestResetPasswordBySmsCode = function (req, res) {
  var mobilephone = req.body.mobilephone
  var lvyiiAuthUtil = new LvyiiAuthUtil(LYAUTH)
  var captcha = lvyiiAuthUtil.createCaptcha()

  promiseTry(() => {
    if (!LYAUTH._config.resetPwdSmsTempId) {
      throw new LYAUTH.Error(`did not config resetPwdSmsTempId`, {code: 104})
    }
    function captchaCallback(err) {
      if (err) {
        throw new LYAUTH.Error(`save captcha error`, {code: 105})
      }
    }
    lvyiiAuthUtil.saveCaptcha(mobilephone, captcha, "resetpwd", captchaCallback)
    var apiServer = LYAUTH._config.serverURLs['api']
    request.post(apiServer + '/1/api/sendSms')
      .send({templId: LYAUTH._config.resetPwdSmsTempId, phoneNumber: mobilephone, params: [captcha]})
      .end(function(err, res) {
        if (err) {
          if (res) {
            throw new LYAUTH.Error(`request send sms error ${res.text}`, {code: 103})
          }
          throw new LYAUTH.Error(`request send sms error`, {code: 103})
        }
      })
  }).then((response) => {
    responseJson(res, response)
  }).catch(err => {
    responseException(res, req.url, err)
  })
}

const userResetPasswordBySmsCode = function (req, res) {
  var password = req.body.password
  var code = req.body.code
  var mobilephone = req.body.mobilephone
  var lvyiiAuthUtil = new LvyiiAuthUtil(LYAUTH)
  
  promiseTry(() => {
    function captchaCallback(err) {
      if (err) {
        throw new LYAUTH.Error(`get reset password captcha error`, {code: 105})
      }
    }
    return lvyiiAuthUtil.getCaptcha(mobilephone, "resetpwd", captchaCallback)
  }).then((result) => {
    return (result + "").toLowerCase() === (code + "").toLowerCase()
  }).then((match) => {
    if (match) {
      if (req.LYAUTH.sessionToken && req.LYAUTH.sessionToken !== '') {
        var sessionToken = req.LYAUTH.sessionToken;
        var payload = jwt.verify(sessionToken, LYAUTH._config.secret)
        if (!payload.id) {
          throw new LYAUTH.Error(`undefined 'id' property for user`, {code: 101})
        }
        var userId = payload.id
        return LYAUTH._callback.resetPasswordBySmsCode(userId, password)
      }
    } else {
      throw new LYAUTH.Error(`invalid sms code`, {code: 106})
    }
  }).then((response) => {
    responseJson(res, response)
  }).catch(err => {
    responseException(res, req.url, err)
  })
}

function responseJson(res, data) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.statusCode = 200;
  return res.end(JSON.stringify(data));
}

function responseError(res, err) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.statusCode = err.status || err.statusCode || 400;
  res.end(JSON.stringify({
    code: err.code || 1,
    error: err && (err.message || err.responseText || err) || 'null message'
  }));
}

function responseUndefined(res) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.statusCode = 500;
  
  res.end(JSON.stringify({
    code: 1001,
    error: 'Undefined auth callback function'
  }));
}

function responseException(res, url, err) {
  var statusCode;
  
  if (err instanceof Error) {
    statusCode = err.status || err.statusCode || 500;
  } else {
    statusCode = 400;
  }
  
  if (statusCode === 500) {
    console.warn(`LvyiiAuth: ${url}: ${statusCode}: ${err.name}: ${err.message}`);
  }
  
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.statusCode = statusCode;
    
    res.end(JSON.stringify({
      code: err.code || 1,
      error: err.message || err.responseText || err || 'unknown error'
    }));
  }
}

function promiseTry(func) {
  return new Promise( (resolve, reject) => {
    try {
      Promise.resolve(func()).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = LYAUTH;