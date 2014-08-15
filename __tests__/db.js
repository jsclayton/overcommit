jest.autoMockOff();

var Promise = require('bluebird'),
    rand = require('../lib/token-generator'),
    db = require('../lib/db'),
    Token = db.Token,
    PromoCode = db.PromoCode;

describe('database', function () {

  beforeEach(function (done) {
    return Promise.all([ PromoCode.query().del(), Token.query().del() ]);
  });

  describe('tokens', function () {

    pit('can insert a new token', function () {
      var tokenValue = rand.generate();
      return Token.forge({ token: tokenValue }).save().then(function (token) {
        expect(token.id).toBeGreaterThan(0);
        expect(token.get('token')).toBe(tokenValue);
      });
    });

    pit('can be redeemed', function () {
      var token = new Token({ token: rand.generate() });
      var promoCode = new PromoCode({ promo_code: rand.generate() });
      return Promise.all([ token.save(), promoCode.save() ]).spread(function (t, pc) {
        return t.redeem();
      }).then(function (t) {
        expect(t.related('promo_code').get('redeemed_at')).toBeDefined();
        expect(t.related('promo_code').get('promo_code')).toBe(promoCode.get('promo_code'));
      });
    });

  });

  describe('promo codes', function () {

    pit('can insert a new promo code', function () {
      var promoCodeValue = rand.generate();
      return PromoCode.forge({ promo_code: promoCodeValue }).save().then(function (promoCode) {
        expect(promoCode.id).toBeGreaterThan(0);
        expect(promoCode.get('promo_code')).toBe(promoCodeValue);
      });
    });

    pit('can assign a token to a promo code', function () {
      var token = new Token({ token: rand.generate() });
      var promoCode = new PromoCode({ promo_code: rand.generate() });
      return Promise.all([ token.save(), promoCode.save() ]).then(function () {
        return promoCode.set('token_id', token.id).save();
      }).then(function (pc) {
        return pc.fetch({ withRelated: 'token' });
      }).then(function (redeemedPromoCode) {
        expect(redeemedPromoCode.related('token').get('token')).toBe(token.get('token'));
      });
    });

  });

});
