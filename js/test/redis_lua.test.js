// Generated by CoffeeScript 1.6.2
(function() {
  var Shavaluator, redisClient, shavaluator, should, testHelper, _;

  _ = require('underscore');

  should = require('should');

  Shavaluator = require('shavaluator');

  testHelper = require('./test_helper');

  redisClient = null;

  shavaluator = new Shavaluator;

  shavaluator.load(require('../lib/redis_lua'));

  describe('Lua scripts for redisExpLock', function() {
    before(function() {
      redisClient = testHelper.getRedisClient();
      return shavaluator.redis = redisClient;
    });
    beforeEach(function(done) {
      return redisClient.flushdb(done);
    });
    describe('setnx_pexpire', function() {
      var ttl;

      ttl = 50;
      describe("with key that hasn't been set yet", function() {
        it('returns 1 for keys the do not yet exist', function(done) {
          return shavaluator.setnx_pexpire({
            keys: 'testKey',
            args: ['testValue', ttl]
          }, function(err, result) {
            result.should.eql(1);
            return done();
          });
        });
        return it('sets the expiration correctly', function(done) {
          return shavaluator.setnx_pexpire({
            keys: 'testKey',
            args: ['testValue', ttl]
          }, function(err, result) {
            return redisClient.pttl('testKey', function(err, result) {
              result.should.not.be.below(0);
              result.should.not.be.above(this.ttl);
              return done();
            });
          });
        });
      });
      return describe("with key that already exists", function(done) {
        beforeEach(function(done) {
          return redisClient.set('testKey', 'testValue', function(err, result) {
            return done();
          });
        });
        it('does not set the key', function(done) {
          return shavaluator.setnx_pexpire({
            keys: 'testKey',
            args: ['newValue', ttl]
          }, function(err, result) {
            result.should.eql(0);
            return done();
          });
        });
        return it('does not set an expiration time', function(done) {
          return redisClient.pttl('testKey', function(err, result) {
            result.should.eql(-1);
            return done();
          });
        });
      });
    });
    return describe('delequal', function() {
      beforeEach(function(done) {
        return redisClient.set('testKey', 'matchThis', done);
      });
      it('returns zero if the key does not exist', function(done) {
        return shavaluator.delequal({
          keys: 'nonexistent',
          args: '1'
        }, function(err, result) {
          should.not.exist(err);
          result.should.eql(0);
          return done();
        });
      });
      describe('when using a matching argument value', function() {
        beforeEach(function(done) {
          var _this = this;

          return shavaluator.delequal({
            keys: 'testKey',
            args: 'matchThis'
          }, function(err, result) {
            _this.err = err;
            _this.result = result;
            return done();
          });
        });
        it('should return 1', function() {
          should.not.exist(this.err);
          return this.result.should.eql(1);
        });
        return it('should remove the key', function(done) {
          return redisClient.get('testKey', function(err, result) {
            should.not.exist(err);
            should.not.exist(result);
            return done();
          });
        });
      });
      return describe('when using a non-matching argument value', function(done) {
        beforeEach(function(done) {
          var _this = this;

          return shavaluator.delequal({
            keys: 'testKey',
            args: 'doesNotMatch'
          }, function(err, result) {
            _this.err = err;
            _this.result = result;
            return done();
          });
        });
        it('should return zero', function() {
          should.not.exist(this.err);
          return this.result.should.eql(0);
        });
        return it('should not remove the key', function(done) {
          return redisClient.get('testKey', function(err, result) {
            should.not.exist(err);
            result.should.eql('matchThis');
            return done();
          });
        });
      });
    });
  });

}).call(this);
