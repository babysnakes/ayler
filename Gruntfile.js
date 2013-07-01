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
        files: {
          "resources/public/js/dependencies.js": [
            "vendor/jquery/jquery.js",
            "vendor/angular/angular.js",
            "vendor/bootstrap/docs/assets/js/bootstrap.js",
            "vendor/highlight.js/highlight.pack.js"],
          "resources/public/js/angular-scenario.js": [
            "vendor/angular-scenario/angular-scenario.js"],
          "resources/public/js/scenarios.js": [
            "test/javascript/e2e/scenarios.js"],
          "resources/public/test/test.html": ["test/html/e2e.html"]
        },
      },
      // minified versions for production
      production: {
        src: ["vendor/jquery/jquery.min.js",
              "vendor/angular/angular.min.js",
              "vendor/bootstrap/docs/assets/js/bootstrap.min.js",
              "vendor/highlight.js/highlight.pack.js"],
        dest: "resources/public/js/dependencies.js"
      },
      vendorCss: {
        src: ["vendor/highlight.js/styles/tomorrow.css"],
        dest: "resources/public/css/dependencies.css"
      }
    },

    copy: {
      html: {
        files: [
          {
            expand: true,
            cwd: "src/html",
            src: ["**"],
            dest: "resources/public/"
          }
        ]
      },
      images: {
        files: [
          {
            expand: true,
            cwd: "vendor/bootstrap/img/",
            src: "*",
            dest: "resources/public/img/"
          },
          {
            expand: true,
            cwd: "vendor/images/",
            src: "*",
            dest: "resources/public/img/"
          }
        ]
      }
    },

    clean: ["resources"],

    karma: {
      unit: {
        configFile: "config/karma.conf.js",
        background: true
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
                "vendor/angular-scenario/angular-scenario.js",
                "vendor/bootstrap/docs/assets/js/bootstrap.js",
                "test/javascript/e2e/scenarios.js",
                "test/html/e2e.html"],
        tasks: ["concat:development"],
        options: {
          nospawn: true
        }
      },
      app: {
        files: "src/javascript/*.js",
        tasks: ["uglify:development", "karma:unit:run"]
      },
      karma: {
        files: "test/javascript/unit/*.js",
        tasks: ['karma:unit:run']
      },
      html: {
        files: "src/html/**/*.html",
        tasks: ["copy:html"]
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
        }
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
      },
      checkoutVendor: {
        command: "git checkout f709eef -- vendor && git reset HEAD -- vendor/",
        options: {
          stdout: true,
          stderr: true
        }
      },
      bower: {
        command: "node_modules/.bin/bower install",
        options: {
          stdout: true,
          stderr: true
        }
      }
    },

    replace: {
      project: {
        src: "project.clj",
        overwrite: true,
        replacements: [{
          from: /(\(defproject ayler ").*("\s*)/,
          to: "$1<%= pkg.version %>$2"
        }]
      },
      component: {
        src: "config/component.json",
        overwrite: true,
        replacements: [{
          from: /("version": ").*(",\s*)/,
          to: "$1<%= pkg.version %>$2"
        }]
      },
      version: {
        src: "src/clojure/ayler/version.clj",
        overwrite: true,
        replacements: [{
          from: /(\(def version ").*("\))/,
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
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('vendor',
                     "Get javascript and css dependencies",
                     ["shell:bower", "shell:checkoutVendor"]),
  grunt.registerTask('default',
                     "Service. generates assets automatically upon change.",
                     ['clean',
                      "copy:html",
                      "copy:images",
                      'less:development',
                      "concat:vendorCss",
                      'concat:development',
                      'uglify:development',
                      'karma:unit',
                      'watch']);
  grunt.registerTask('production',
                     "Generate assets for production.",
                     ['clean',
                      'copy:html',
                      "copy:images",
                      'less:development',
                      "concat:vendorCss",
                      'uglify:development',
                      'concat:production']);
  grunt.registerTask('release',
                     "Create a release executable (target/ayler).",
                     ['production', "shell:uberjar",
                      "shell:mkdirDistDir", "shell:hashbang",
                      "shell:catjar", "shell:makeExec",
                      "shell:standalone"]),
  grunt.registerTask('version',
                     'Update a version according to one specified in package.json',
                     ["replace:project", "replace:component", "replace:version"]);
};
