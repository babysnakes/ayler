# Ayler: namespace browser
A web based namespace browser that's capable of displaying source code
and docstrings for the namespaces/vars in your classpath. It's main
features are:

* Requires minimal (or no) dependencies in your project. It operates
  by connecting to a running [nrepl][nrepl].
* Displays all loaded namespaces.
* Displays all public member for a selected namespace.
* Displays docstring for selected namespace.
* Displays the docstring and source of selected var.
* Allows you to search and load any namespace from a list of all
  namespaces in your classpath (provided you've added required
  dependencies).

For more information on installing and using this application please
see the [wiki][gwiki].

## Development environment setup

### Custom dependencies
We're using a custom fork of [ring-anti-forgery][]. This fork
currently only exists in github and I couldn't find an elegant way for
including github repositories as dependencies when building production
jar, so currently we require an extra step for installing the fork
locally on your repository. Later it'll either get accepted as pull
request or we'll create a custom fork.

Please run the following in order to install it locally:

```sh
# cd /to/some/directory
# git clone git://github.com/babysnakes/ring-anti-forgery.git
# cd ring-anti-forgery
# git checkout db6d0d9
# lein install
# cd .. && rm -rf ring-anti-forgery
```

### External dependencies
This project relies on external applications to manage different parts
of it's life cycle. You'll need the following applications:

* [Nodejs][node] (currently 0.10.7)
* [phantomjs][pjs] (currently 1.9.x)

Once you have these installed run the following:

* Install required node packages (make take some time):
  * `npm install`
* Configure your environment to use the installed `grunt` command.
  Either one of the below will do:
  * `export PATH=${PWD}/node_modules/.bin:$PATH`
  * `alias grunt=${PWD}/node_modules/.bin/grunt`
  * Or just install `grunt-cli` as a global npm package.
* Install required js/css dependencies (may take some time):
  * `grunt vendor`

### Grunt
[Grunt][grunt] Is a great tool for automating various tasks during the
life cycle of a project. You can find the full configuration in the
`Gruntfile.js` file. Here are a list of the most common tasks we use:

* To generate required assets on every change (leave this running
  during all development sessions):
  * `grunt`
* To run the karma (testacular) server (this is used together with the
  previous invocation to run the javascript tests on each change -
  note that you may need to set the `PHANTOMJS_BIN` environment
  variable to point to your phantomjs executable):
  * `grunt karma:unit`
* To generate assets for production:
  * `grunt production`
* To generate both fat jar (*target/ayler-standalone.jar*) and
  executable jar (*target/ayler*) run:
  * `grunt release`

During development it's advisable to run `grunt` on one terminal and
`grung karme:unit` on another.

### Managing application version
The application version should be configured in `package.json` and not
in the expected `project.clj`. After changing the version in
`package.json` run (see above about *grunt*):

    # grunt version

and it will replace the version in all required places.

### Querying outdated dependencies
There are tools to query outdated dependencies (both for assets and
for clojure dependencies).

Clojure outdated dependencies could be queried using the
[lein-outdated][] plugin.

Node outdated packages could be queried in 2 ways:

* Query for updates within the boundaries of your version constraint
  (e.g. if you specified ~1.2.0 as version you will not be shown
  version 1.3):
  * `npm outdated`
* Query for updated regardless of version constraints:
  * `npmedge`

And last, for a list of outdated assets just run `bower list`. The
up-to-date version should be specified alongside the existing
version.

### A note about asset dependencies
Most asset dependencies are downloaded from the internet by `npm` or
`bower`. However some dependencies are not available by these tools. I
created a *vendor* branch which holds dependencies like these. These
dependencies are checked out on top of the current brunch by running
`grunt vendor`.

## License
Copyright © 2013 Haim Ashkenazi

Distributed under the GPLv3 license.

[node]: http://nodejs.org
[pjs]: http://phantomjs.org
[nrepl]: https://github.com/clojure/tools.nrepl
[grunt]: http://gruntjs.com
[clojuredocs]: http://www.clojuredocs.org
[gwiki]: https://github.com/babysnakes/ayler/wiki
[ring-anti-forgery]: https://github.com/weavejester/ring-anti-forgery
[lein-outdated]: https://github.com/ato/lein-outdated
