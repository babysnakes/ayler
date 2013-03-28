module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    distDir: "target/dist",
    standaloneJar: "target/ayler-<%= pkg.version %>-standalone.jar",
    distExecutable: "<%= distDir %>/ayler-<%= pkg.version %>",

    less: {
      development: {
        options: {
          paths: ["vendor/bootstrap/less/"]
        },
        files: {
          "resources/public/css/app.css":
          "src/less/application.less"
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
          "resources/public/js/app.js": "src/javascript/app.js"
        }
      }
      // todo: Create a production configuration as well!
    },

    concat: {
      // pretty versions for development
      development: {
        src: ["vendor/jquery/jquery.js",
              "vendor/angular/angular.js",
              "vendor/bootstrap/docs/assets/js/bootstrap.js"],
        dest: "resources/public/js/dependencies.js"
      },
      // minified versions for production
      production: {
        src: ["vendor/jquery/jquery.min.js",
              "vendor/angular/angular.min.js",
              "vendor/bootstrap/docs/assets/js/bootstrap.min.js"],
        dest: "resources/public/js/dependencies.js"
      }
    },

    clean: ["resources/public/js/*.js",
            "resources/public/css/*.css"],

    karma: {
      unit: {
        configFile: "config/karma.conf.js"
      }
    },

    watch: {
      css: {
        files: ["vendor/bootstrap/less/*.less",
                "src/less/application.less"],
        tasks: ["less:development"],
        options: {
          nospawn: true
        }
      },
      deps: {
        files: ["vendor/jquery/jquery.js",
                "vendor/angular/angular.js",
                "vendor/bootstrap/docs/assets/js/bootstrap.js"],
        tasks: ["concat:development"]
      },
      app: {
        files: "src/javascript/*.js",
        tasks: ["uglify:development", "karma:unit:run"]
      },
      karma: {
        files: "test/javascript/unit/*.js",
        tasks: ['karma:unit:run']
      }
    },

    shell: {
      options: {
        failOnError: true,
        stderr: true
      },
      uberjar: {
        command: "lein with-profile production do clean, uberjar",
        options: {
          stdout: true,
          stderr: true
        },
      },
      standalone: {
        command: "cp <%= standaloneJar %> <%= distDir %>/ayler-<%= pkg.version %>.jar"
      },
      mkdirDistDir: {
        command: "mkdir -p <%= distDir %>"
      },
      hashbang: {
        command:  "echo '#!/usr/bin/env java -Xmx128m -jar' ><%= distExecutable %>"
      },
      catjar: {
        command: "cat <%= standaloneJar %>>><%= distExecutable %>"
      },
      makeExec: {
        command: "chmod +x <%= distExecutable %>"
      }
    },

    replace: {
      project: {
        src: "project.clj",
        overwrite: true,
        replacements: [{
          from: /(\(defproject ayler ").*("\s*)/,
          to: "$1<%= pkg.version %>$2"
        }],
      },
      component: {
        src: "config/component.json",
        overwrite: true,
        replacements: [{
          from: /("version": ")0.0.0(",\s*)/,
          to: "$1<%= pkg.version %>$2"
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('default',
                     "Service. generates assets automatically upon change.",
                     ['clean', 'less:development',
                      'concat:development', 'uglify:development', 'watch']);
  grunt.registerTask('production',
                     "Generate assets for production.",
                     ['clean', 'less:development',
                      'uglify:development', 'concat:production']);
  grunt.registerTask('release',
                     "Create a release executable (target/ayler).",
                     ['production', "shell:uberjar",
                      "shell:mkdirDistDir", "shell:hashbang",
                      "shell:catjar", "shell:makeExec",
                      "shell:standalone"]),
  grunt.registerTask('version',
                     'Update a version according to one specified in package.json',
                     ["replace:project", "replace:component"])
};
