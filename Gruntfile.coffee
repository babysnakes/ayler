module.exports = (grunt) =>
  grunt.initConfig
    less:
      development:
        options:
          paths: ["resources/vendor/bootstrap/less/"]
        files:
          "resources/public/css/app.css":
            "resources/assets/less/application.less"

    concat:
      development:
        src:
          [
            "resources/vendor/jquery/jquery.js",
            "resources/vendor/angular/angular.js",
            "resources/vendor/bootstrap/docs/assets/js/bootstrap.js"
          ]
        dest: "resources/public/js/dependencies.js"
      production:
        src:
          [
            "resources/vendor/jquery/jquery.min.js",
            "resources/vendor/angular/angular.min.js",
            "resources/vendor/bootstrap/docs/assets/js/bootstrap.min.js"
          ]
        dest: "resources/public/js/dependencies.js"

    watch:
      css:
        files:
          [
            "resources/vendor/bootstrap/less/*.less",
            "resources/assets/less/application.less"
          ]
        tasks: ["less:development"]
        options:
          nospawn: true
      js:
        files:
          [
            "resources/vendor/jquery/jquery.js",
            "resources/vendor/angular/angular.js",
            "resources/vendor/bootstrap/docs/assets/js/bootstrap.js"
          ]
        tasks: ["concat:development"]

  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.registerTask('default', ['less:development', 'concat:development', 'watch'])
  grunt.registerTask('production', ['less:development', 'concat:production'])
