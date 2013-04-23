# Project history

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

