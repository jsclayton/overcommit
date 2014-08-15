var Promise = require('bluebird'),
    db = {
      connectionString: process.env.DATABASE_URL
    },
    knex = require('knex')({
      client: 'pg',
      connection: db.connectionString
    }),
    bookshelf = require('bookshelf')(knex);

bookshelf.plugin('visibility');

db.Token = bookshelf.Model.extend({
  tableName: 'tokens',
  hasTimestamps: [ 'created_at', 'updated_at' ],
  promo_code: function () {
    return this.hasOne(db.PromoCode);
  },
  redeem: function () {
    var self = this;
    return db.PromoCode.query(function (qb) {
      qb.whereRaw('id in (select id from available_promo_codes limit 1 for update nowait)');
    }).save({ token_id: self.get('id'), redeemed_at: new Date(), status: 'claimed' }, { patch: true, method: 'update' }).then(function (pc) {
      return self.load([ 'promo_code' ]);
    });
  }
}, {
  count: function () {
    return bookshelf.knex('tokens').count("*").spread(function (count) {
      return count;
    });
  },
  unclaimed: function () {
    return bookshelf.knex('tokens').leftJoin('promo_codes', 'tokens.id', 'promo_codes.token_id').whereNull('promo_code').count('*').spread(function (count) {
      return count.count;
    });
  }
});

db.PromoCode = bookshelf.Model.extend({
  tableName: 'promo_codes',
  hasTimestamps: [ 'created_at', 'updated_at' ],
  hidden: [ 'token_id' ],
  token: function () {
    return this.belongsTo(db.Token);
  }
}, {
  count: function() {
    return bookshelf.knex('promo_codes').count("*").spread(function (count) {
      return count.count;
    });
  },
  unclaimed: function() {
    return bookshelf.knex('available_promo_codes').count("*").spread(function (count) {
      return count.count;
    });
  }
});

module.exports = db;
