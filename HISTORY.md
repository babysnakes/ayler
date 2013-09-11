# Project history

### 0.4.2
Features:

* It's now possible to toggle the display of already loaded namespaces
  in the *Search all namespaces* window (by default loaded namespaces
  are not displayed).
* Display errors in the *Connect to remote host* modal as well as on
  the main window.

Fixes:

* Fixed: Namespaces list don't refresh after selecting namespace to
  load.
* Updated javascript and clojure dependencies (including the new
  `ring-anti-forgery` version (which included my suggestions).

### 0.4.1
Features:

* Only show an error once.
* Improved "unknown error".
* Fixed default log level to be *info*.

### 0.4.0
Features:

* Added function arguments in the docstring (when applicable).

Fixes:

* Instead of embedding the anti-forgery middleware we use a [custom
  fork of it][braf]
* Revised [clojure workflow][workflow].
* Rewrite of *angularjs* code to better use constructs.

### 0.3.0
Features:

* Browse all namespaces in classpath.

### 0.2.1
Fixes:

* Fixed version handling.

### 0.2.0
Features:

* Configure remote connection (host/port) via web interface (It's not
  required to configure the port via CLI anymore).
* Display source with syntax highlighting.
* Nicer errors
* Anti forgery middleware (AngularJS style). More then half of it is
  copied from the [ring-anti-forgery][] project. Need to either
  extract it to different mini project or find a way to incorporate it
  to the *ring-anti-forgery* project.

Fixes:

* Project layout changes.

### 0.1.0
First release. Features:

* Lists loaded namespaces.
* Lists public vars for a namespace.
* Displays the docstring for a namespace.
* Displays the docstring and source of selected var.
* Remote nrepl is configurable only via CLI options

[ring-anti-forgery]: https://github.com/weavejester/ring-anti-forgery
[braf]: https://github.com/babysnakes/ring-anti-forgery
[workflow]: http://thinkrelevance.com/blog/2013/06/04/clojure-workflow-reloaded
