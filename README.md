# Temporary name: Ayler

A Web based clojure namespace browser that connects to your project's
repl.

## Development environment setup

### Asset management
We use node.js to generate our assets on the fly (0.8.x). Install
[node.js][node] (which should also install npm) and run (from the root
of the repository):

    # npm install

This will install all required packages. Now copy
`config/Procfile.sample` to `Procfile` and run:

    # node_modules/.bin/forewoman start

This should generate the javascript and css files on every change.

## License

Copyright © 2013 Haim Ashkenazi

Distributed under the GPLv3 license.

[node]: http://nodejs.org
