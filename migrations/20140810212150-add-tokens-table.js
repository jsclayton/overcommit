exports.up = function(db, done) {
  var sql = [ 'create table tokens (',
              ' id serial primary key,',
              ' created_at timestamp with time zone not null default now(),',
              ' updated_at timestamp with time zone not null default now(),',
              ' token text not null,',
              ' note text',
              ');' ].join('');
  db.runSql(sql, done);
};

exports.down = function(db, done) {
  db.dropTable('tokens', done);
};
