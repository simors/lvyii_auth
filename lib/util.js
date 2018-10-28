/**
 * Created by yangyang on 2018/3/19.
 */
var redis = require('redis');
var Promise = require('bluebird');

module.exports = function (LYAUTH) {
  
  this.createCaptcha = function(type) {
    var code = "";
    var codeLength = 4;//验证码的长度
    var random = []
    if (!type || type === 'small') {
      random = new Array(0,1,2,3,4,5,6,7,8,9);//随机数
    } else {
      random = new Array(0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');//随机数
    }
    var len = random.length
    for(var i = 0; i < codeLength; i++) {//循环操作
      var index = Math.floor(Math.random()*len);//取得随机数的索引
      code += random[index];//根据索引取得随机数加到code上
    }
    return code
  }
  
  this.saveCaptcha = function (phone, captcha, subprefix, callback) {
    Promise.promisifyAll(redis.RedisClient.prototype)
    var redisCfg = LYAUTH._config.mediaCfg
    var client = redis.createClient(redisCfg.redis_port, redisCfg.redis_url)
    client.auth(redisCfg.redis_auth)
    client.select(redisCfg.redis_db)
    // 建议增加 client 的 on error 事件处理，否则可能因为网络波动或 redis server
    // 主从切换等原因造成短暂不可用导致应用进程退出。
    client.on('error', function (err) {
      return callback(err)
    })
  
    var key = LYAUTH._config.appName + ":" + subprefix + ":" + phone
    client.setAsync(key, captcha).then(() => {
      client.expire(key, 60*10)   // 设置10分钟的过期时间
      callback()
    }).catch(err => {
      callback(err)
    }).finally(() => {
      client.quit()
    })
  }
  
  this.getCaptcha = function (phone, subprefix, callback) {
    Promise.promisifyAll(redis.RedisClient.prototype)
    var redisCfg = LYAUTH._config.mediaCfg
    var client = redis.createClient(redisCfg.redis_port, redisCfg.redis_url)
    client.auth(redisCfg.redis_auth)
    client.select(redisCfg.redis_db)
    // 建议增加 client 的 on error 事件处理，否则可能因为网络波动或 redis server
    // 主从切换等原因造成短暂不可用导致应用进程退出。
    client.on('error', function (err) {
      return callback(err)
    })
  
    var key = LYAUTH._config.appName + ":" + subprefix + ":" + phone
    return client.getAsync(key).then((token) => {
      return token
    }).catch(err => {
      callback(err)
    }).finally(() => {
      client.quit()
    })
  }
}