var crypto = require('crypto');

module.exports = function(LY) {
  return function(options) {
    options = options || {};

    return function(req, res, next) {
      var appId, appKey, contentType, param, prod, prodHeader, prodValue, sessionToken;
      contentType = req.headers['content-type'];
      if (/^text\/plain.*/i.test(contentType)) {
        if (req.body && req.body !== '') {
          req.body = JSON.parse(req.body);
        }
        appId = req.body._ApplicationId;
        appKey = req.body._ApplicationKey;
        prodValue = req.body._ApplicationProduction;
        sessionToken = req.body._SessionToken;
        for (param in req.body) {
          // remove _* but keep __*
          if (param.charAt(0) === '_' && param.charAt(1) !== '_') {
            delete req.body[param];
          }
        }
        prod = 1;
        if (prodValue === 0 || prodValue === false) {
          prod = 0;
        }
        req.LY = {
          id: appId,
          key: appKey,
          prod: prod,
          sessionToken: sessionToken
        };
      } else {
        appId = req.headers['x-ly-id'];
        appKey = req.headers['x-ly-key'];
        prodHeader = req.headers['x-ly-prod'];
        sessionToken = req.headers['x-ly-session'];
        prod = 1;
        if (prodHeader === '0' || prodHeader === 'false') {
          prod = 0;
        }
        req.sessionToken = sessionToken;
        req.LY = {
          id: appId,
          key: appKey,
          prod: prod,
          sessionToken: sessionToken
        };
      }
      return next();
    };
  }
}

function signByKey(timestamp, key) {
  return crypto.createHash('md5').update('' + timestamp + key).digest('hex');
}
