# Temporary name: Ayler

A Web based clojure namespace browser that connects to your project's
repl.

## Development environment setup

### Asset management
This project uses [node.js][node] based tools to manage assets (plus other
stuff). You have to install it (currently we use version 0.8.x) and
then run the following (from the root of the repository):

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

## License

Copyright © 2013 Haim Ashkenazi

Distributed under the GPLv3 license.

[node]: http://nodejs.org
