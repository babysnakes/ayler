module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      development: {
        options: {
          paths: ["resources/vendor/bootstrap/less/"]
        },
        files: {
          "resources/public/css/app.css":
          "resources/assets/less/application.less"
        }
      }
      // todo: Create a production configuration as well!
    },
    
    uglify: {
      development: {
        options: {
          mangle: false,
          beautify: true,
          preserveComments: true
        },
        files: {
          "resources/public/js/app.js": "resources/assets/js/app.js"
        }
      }
      // todo: Create a production configuration as well!
    },

    concat: {
      // pretty versions for development
      development: {
        src: ["resources/vendor/jquery/jquery.js",
              "resources/vendor/angular/angular.js",
              "resources/vendor/bootstrap/docs/assets/js/bootstrap.js"],
        dest: "resources/public/js/dependencies.js"
      },
      // minified versions for production
      production: {
        src: ["resources/vendor/jquery/jquery.min.js",
              "resources/vendor/angular/angular.min.js",
              "resources/vendor/bootstrap/docs/assets/js/bootstrap.min.js"],
        dest: "resources/public/js/dependencies.js"
      }
    },

    clean: ["resources/public/js/*.js",
            "resources/public/css/*.css"],

    karma: {
      unit: {
        configFile: "resources/assets/karma.conf.js"
      }
    },

    watch: {
      css: {
        files: ["resources/vendor/bootstrap/less/*.less",
                "resources/assets/less/application.less"],
        tasks: ["less:development"],
        options: {
          nospawn: true
        }
      },
      deps: {
        files: ["resources/vendor/jquery/jquery.js",
                "resources/vendor/angular/angular.js",
                "resources/vendor/bootstrap/docs/assets/js/bootstrap.js"],
        tasks: ["concat:development"]
      },
      app: {
        files: "resources/assets/js/*.js",
        tasks: ["uglify:development", "karma:unit:run"]
      },
      karma: {
        files: "resources/assets/test/**/*.js",
        tasks: ['karma:unit:run']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default',
                     "Service. generates assets automatically upon change.",
                     ['clean', 'less:development',
                      'concat:development', 'uglify:development', 'watch']);
  grunt.registerTask('production',
                     "Generate assets for production.",
                     ['clean', 'less:development',
                      'uglify:development', 'concat:production']);
};
