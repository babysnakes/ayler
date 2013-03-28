# Temporary name: Ayler
A Web based clojure namespace browser that connects to your project's
nrepl. Currently it's very basic:

* It can only display loaded namespaces.
* It only shows public vars.
* It displays the docstring of selected namespace.
* It displays the docstring and source of selected var.
* You can't configure target nrepl via web. Only via the command line
  upon running.
* Poor error handling.
* ...

## Running the application
This application is distributed as either fat jar or executable jar.
The executable jar only works on unix like machines and must be copied to
somewhere in your `$PATH` and made executable. The jar can be run with
the usual `java [JAVA_OPTS] -jar /path/to/ayler-standalone.jar`.

In either case run the command with `-h` as argument to see the usage.
Currently you must specify the port of the *nrepl* that you want to
connect to via the `-P` option. There's no way to change it once the
application is running.

Once it's running open a browser and point it to
[http://localhost:5000][server]. If you specified a different port adopt the
port to match.

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
* Finally, to generate both fat jar (*target/ayler-standalone.jar*) and
  executable jar (*target/ayler*) run:
  * `grunt release`

### Managing versions
The application version should be configured in `package.json` and not
in the expected `project.clj`. After changing the version in
`package.json` run (see above about *grunt*):

    # grunt version

and it will replace the version in all required places.

## License
Copyright © 2013 Haim Ashkenazi

Distributed under the GPLv3 license.

[node]: http://nodejs.org
[pjs]: http://phantomjs.org
[server]: http://localhost:5000/
