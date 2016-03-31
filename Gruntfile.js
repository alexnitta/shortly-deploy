module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: { separator: ';'},
      dist: {
        src: ['public/client/**/*.js'],
        dest: 'public/dist/<%= pkg.name %>.js'
      },
      lib: {
        src: 'public/lib/**/*.js',
        dest: 'public/dist/library.js'
      }
    },


    env: {
      prod: {
        NODE_ENV: 'production',
        DEST: 'temp'
      },
      dev: {
        NODE_ENV: 'development',
        DEST: 'temp'
      }
    },


    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      target: {
        files: {
          'public/dist/<%= pkg.name %>.min.js': ['public/dist/<%= pkg.name %>.js'],
          'public/dist/library.min.js': 'public/dist/library.js'
        }
      }
    },

    eslint: {
      target: [
        'public/**/*.js',
        'app/**/*.js',
        'lib/**/*.js',
        'Gruntfile.js',
        './*.js',
        'spec/**/*.js'
      ]
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'public/',
          src: '*.css',
          dest: 'public/',
          ext: '.min.css'
        }]
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        command: 'git push live master',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-env');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
      cmd: 'grunt',
      grunt: true,
      args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////


  grunt.registerTask('test', [
    'eslint',
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'concat',
    'uglify',
    'cssmin'
  ]);


  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      grunt.task.run(['env:prod']);
      grunt.task.run(['shell:prodServer']);
    } else {
      grunt.task.run(['env:dev']);
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
    'test', 'build', 'upload'
  ]);
};
