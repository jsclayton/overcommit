module.exports = function (grunt) {

  grunt.initConfig({
    migrate: {
      options: {
        env: {
          DATABASE_URL: require('./lib/db').connectionString
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-db-migrate');

  grunt.registerTask('cleandb', 'Clean db and re-apply all migrations', function () {
    var fs = require('fs');
    var files = fs.readdirSync('./migrations');
    for (var i = 0; i < files.length; i++) {
      grunt.task.run('migrate:down');
    }
    grunt.task.run('migrate:up');
  });

};
