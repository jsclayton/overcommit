exports.up = function(db, done) {
  var sql = [ 'create table promo_codes (',
              ' id serial primary key,',
              ' created_at timestamp with time zone not null default now(),',
              ' updated_at timestamp with time zone not null default now(),',
              ' generated_at timestamp with time zone not null default now(),',
              ' redeemed_at timestamp with time zone,',
              ' status text not null default \'available\',',
              ' promo_code text not null,',
              ' token_id integer unique references tokens(id)',
              ');' ].join('');
  db.runSql(sql, done);
};

exports.down = function(db, done) {
  db.dropTable('promo_codes', done);
};
