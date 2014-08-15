exports.up = function(db, done) {
  var sql = [ 'create view available_promo_codes as',
              ' select *',
              ' from promo_codes',
              ' where token_id is null',
              '  and now() < generated_at + interval \'28 days\'',
              '  and status = \'available\'',
              ' order by generated_at;' ].join('');
  db.runSql(sql, done);
};

exports.down = function(db, done) {
  db.runSql('drop view available_promo_codes;', done);
};
