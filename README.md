# Temporary name: Ayler

A Web based clojure namespace browser that connects to your project's
repl.

## Development environment setup

### Asset management

This project uses various dependencies to manage it's assets. Make
sure you have these installed:

* [Nodejs][node] (currently 0.8.x)
* [phantomjs][pjs] (currently 1.8.x)

Once you have these installed run the following:

* Install required node packages (make take some time):
  * `npm install`
* Configure your path to use the installed tools:
  * `export PATH=${PWD}/node_modules/.bin:$PATH`
* Install required js/css dependencies (may take some time):
  * `bower install`

Now, we use the `grunt` command to generate our assets. Here's a list
of most common invocations:

* To generate required assets on every change (leave this running
  during all development sessions):
  * `grunt`
* To generate assets for production
  * `grunt production`
* To run the karma (testacular) server. This is required before
  running any of the test (either directly or via the `grunt [watch]`
  invocation). Note that you may need to setup the `PHANTOMJS\_BIN`
  environment variable to point to your phantomjs executable.
  * `grunt karma:unit`

## License

Copyright © 2013 Haim Ashkenazi

Distributed under the GPLv3 license.

[node]: http://nodejs.org
[pjs]: http://phantomjs.org
