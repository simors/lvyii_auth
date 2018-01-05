/**
 * Created by yangyang on 2018/1/5.
 */
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('supertest');
var should = require('should');
var assert = require('assert');

const LYAUTH = require('../');
const appInfo = require('./fixtures/app-info');

var app = express();

app.use(LYAUTH.express());
app.use(bodyParser.json());

describe('auth', function() {
  it('mobile_login', function (done) {
    request(app)
      .post('/1/users/loginWithMobilePhone')
      .send({mobilephone: '13587369299', password: '321456'})
      .expect(200, function (err, res) {
        var result = res.body
        result.id.should.be.equal('123')
        done(err);
      });
  });
  
  it('mobile_login_error', function (done) {
    request(app)
      .post('/1/users/loginWithMobilePhone')
      .send({mobilephone: '13587369299', password: '21456'})
      .expect(400, function (err, res) {
        done(err);
      });
  });
  
});