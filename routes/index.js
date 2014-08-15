var Promise = require('bluebird'),
    express = require('express'),
    router = express.Router(),
    moment = require('moment'),
    db = require('../lib/db'),
    Token = db.Token,
    PromoCode = db.PromoCode;

router.get('/health-check', function (req, res) {
  Promise.all([ PromoCode.unclaimed(), Token.unclaimed(), Token.count() ]).spread(function (unclaimedPromoCodes, unclaimedTokens, tokenCount) {
    var diff = unclaimedTokens - unclaimedPromoCodes;
    var overcommit = diff > 0 ? diff / unclaimedTokens : 0;
    res.set('X-Unclaimed-Promo-Codes', unclaimedPromoCodes);
    res.set('X-Unclaimed-Tokens', unclaimedTokens)
    res.set('X-Overcommit', overcommit);
    res.send(overcommit > 0.7 || tokenCount === 0 ? ':(' : ':)');
  })
});

router.get('/:token', function (req, res) {
  var submittedToken = req.params.token;
  if (!submittedToken || submittedToken.length != 12) {
    res.redirect('/');
  } else {
    new Token({ token: submittedToken.toUpperCase() }).fetch({ withRelated: 'promo_code' }).then(function (token) {
      if (!token || !token.related('promo_code').get('promo_code')) {
        res.redirect('/');
      } else {
        var promo_code = token.related('promo_code'),
            expires_at = moment(promo_code.get('generated_at')).add(28, 'days'),
            days_left = expires_at.diff(moment(), 'days'),
            days_left_human = moment.duration(days_left, 'days').humanize(),
            view_name = days_left > 0 ? 'token' : 'token-expired';
        res.render(view_name, {
          promo_code: promo_code.get('promo_code'),
          days_left: days_left_human
        });
      }
    });
  }
});

router.get('/', function (req, res) {
  res.render('index', { csrf: req.csrfToken(), token: req.session.token || '' });
});

router.post('/', function (req, res) {
  var submittedToken = req.session.t_last = req.body.token;
  if (!submittedToken || submittedToken.length != 12) {
    res.status(400).json({ error: 'INVALID_TOKEN' });
  } else {
    new Token({ token: submittedToken.toUpperCase() }).fetch({ withRelated: 'promo_code' }).then(function (token) {
      if (!token) {
        res.status(400).json({ error: 'INVALID_TOKEN' });
      } else {
        req.session.token = token.get('token');
        if (token.related('promo_code').get('promo_code')) {
          res.json(token.toJSON());
        } else {
          token.redeem().then(function (redeemedToken) {
            console.log('Redeemed token ' + redeemedToken.get('token') + ' for promo code ' + redeemedToken.related('promo_code').get('promo_code'));
            res.json(redeemedToken);
          });
        }
      }
    });
  }
});

module.exports = router;
