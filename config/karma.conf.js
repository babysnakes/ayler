// Karma configuration

// base path, that will be used to resolve files and exclude
basePath = '../';


// list of files / patterns to load in the browser
// TODO: fix dependencies list so it'll not repeat the list in grunt.
files = [
  JASMINE,
  JASMINE_ADAPTER,
  "vendor/jquery/jquery.js",
  "vendor/underscore/underscore.js",
  "vendor/angular/angular.js",
  "vendor/bootstrap/docs/assets/js/bootstrap.js",
  "vendor/angular-mocks/*.js",
  "vendor/highlight.js/highlight.pack.js",
  'src/javascript/*.js',
  'test/javascript/unit/*.js'
];


// list of files to exclude
exclude = [
  "vendor/angular-*/*.min.js"
];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['PhantomJS'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
