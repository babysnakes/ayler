"use strict";

$(document).ready(function() {
  // bootstrap tooltips for the navigation images
  $("ul.nav i").tooltip({placement: "bottom"});
});

angular.module('ayler', [])
  .config(["$routeProvider", function($routeProvider) {
    $routeProvider
      .when("/", {})
      .when("/:namespace", {
        controller: NamespaceCtrl,
        templateUrl: "templates/ns-docstring.html"
      })
      .when("/:namespace/:var", {
        controller: VarInfoCtrl,
        templateUrl: "templates/var.html"
      });
  }]);

function MainCtrl($scope) {
  $scope.setTitle = function(name) {
    $scope.title = ": " + name;
  };

  // parse all possibole response status from the server.
  $scope.handleResponse = function (response, handler) {
    switch (response.status) {
    case "disconnected":
      $scope.$broadcast("connect", {disconnected: true});
      break;
    case "not-connected":
      $scope.$broadcast("connect");
      break;
    case "error":
      $scope.errorHandler(response.response);
      break;
    case "done":
      return handler(response.response);
    default:
      alert("Unknown response: " + response);
    }
  };

  // Global error handler. Every error in this application should
  // invoke this method.
  $scope.errorHandler = function(data, status) {
    if (status === undefined) {
      $scope.errors.push(data);
    } else if (status === 403) { // anti-forgery expired
      $scope.errors.push("Your session has expired. Please refresh the browser.");
    } else {
      $scope.errors.push(data + " (status: " + status + ")");
    }
    $scope.anyErrors = true;
  };

  // A common behavior for $http.get.
  //
  // params:
  // * http - $http
  // * url - The path to get
  // * flag - The attribute that ngShow uses for busy indicator
  // * handler - The handler for success response
  $scope.httpFetch = function(http, url, flag, handler) {
    flag = true;
    http.get(url)
      .success(function(data) {
        flag = false;
        $scope.handleResponse(data, handler);
      })
      .error(function(data, status, headers, config) {
        flag = false;
        $scope.errorHandler(data, status);
      });
  };

  // Clears the error (e.g. when pressing "Dismiss") so they won't
  // appear the next time the connection form displays.
  $scope.clearErrors = function() {
    $scope.errors = [];
    $scope.anyErrors = false;
  };

  $scope.errors = [];
  $scope.anyErrors = false;
  $scope.title = "";
};

function NamespaceListCtrl($scope, $http, $location) {
  // Listener for the "connect" event to display the connnection
  // form. Optionally set the disconnected flag which causes a
  // disconnection error to display.
  $scope.$on("connect", function(event, args) {
    if (args && args.disconnected) {
      $scope.disconnected = true;
    };
    $scope.displayConnectForm();
  });

  $scope.disconnect = function($event) {
    $event.preventDefault();
    $http.post("/api/disconnect/")
      .success(function(data) {
        $location.path("/");
        $scope.init();
      })
      .error(function(data, status, headers, config) {
        $scope.errorHandler(data, status);
      })
  };

  // Display the connect form modal.
  $scope.displayConnectForm = function() {
    $("#connectForm").modal('show');
  };

  // Submit the connection form.
  $scope.connect = function(){
    $http.post("/api/remote/", {
      "port": $scope.remotePort,
      "host": $scope.remoteHost
    }).success(function(data) {
      $("#connectForm").modal('hide');
      $location.path("/");
      $scope.init();
    }).error(function(data, status, headers, config) {
      $scope.errorHandler(data, status);
    });
  };

  // Handler for the namespace-list-response.
  $scope.namespacesHandler = function(response) {
    $scope.namespaces = response;
  };

  // Handler for the var-list-response.
  $scope.varsHandler = function(response) {
    $scope.vars = response;
  };

  // Reset vars filter. Used when selecting new namespace to display.
  $scope.resetVarsFilter = function() {
    $scope.vrs = "";
  };

  // Loads the available namespaces.
  $scope.loadNamespaces = function() {
    $scope.httpFetch($http, "api/ls", $scope.nsLoading, $scope.namespacesHandler);
  };

  // Loads available vars in a namespace
  $scope.loadVars = function(namespace) {
    $scope.httpFetch($http, "/api/ls/" + namespace,
                     $scope.varLoading, $scope.varsHandler);
  };

  // Reloads namespace list. Invoked by ngClick.
  $scope.refreshClicked = function($event) {
    $event.preventDefault();
    $scope.loadNamespaces();
  };

  // Common behavior for execuating on start and on certain refresh
  // schenarios (e.g. when commiting the connect form).
  // TODO: Later we should architect this better so we won't need to
  //       call this function manually.
  $scope.init = function() {
    $scope.vars = [] // Initially empty until loadVars() is triggered;
    $scope.resetVarsFilter();
    $scope.nsLoading = false;    // ngShow flag
    $scope.varLoading = false;   // ngShow flag
    $scope.disconnected = false; // ngShow flag
    $scope.loadNamespaces();
  };

  $scope.init();
};

function NamespaceCtrl($scope, $routeParams, $http) {
  // Handler for displaying namespace docstring.
  $scope.handleNsDoc = function(response) {
    $scope.docstring = response || "No Namespace Docs.";
  };

  // Loads the docstring for the namespace.
  $scope.loadDocstring = function() {
    var docstringUrl = "/api/doc/" + $scope.nsName;
    $scope.httpFetch($http, docstringUrl, $scope.nsDocLoading, $scope.handleNsDoc);
  };

  $scope.nsDocLoading = false; // ngShow flag.
  $scope.nsName = escape($routeParams.namespace);
  $scope.loadVars($scope.nsName);
  $scope.loadDocstring();
  $scope.resetVarsFilter();
  $scope.setTitle($scope.nsName);
};

function VarInfoCtrl($scope, $routeParams, $http) {
  // Handler for var docstring.
  $scope.handleVarDoc = function(response) {
    $scope.docstring = response || "No Docs.";
  };

  // Handler for var source.
  $scope.handleSource = function(response) {
    if (response) {
      $scope.source = hljs.highlight("clojure", response).value
    } else {
      $scope.source = "<span>Source not found.</span>"
    }
  };

  // Since currently we display either this controller or the
  // NamespaceCtrl we may need to load the vars on controller
  // initialization if the user accessed var url directly.
  $scope.refreshVars = function() {
    if ($scope.vars.length === 0) {
      $scope.loadVars($scope.nsName);
    };
  };

  // Loads the var's docstring.
  $scope.loadDocstring = function() {
    var docstringUrl = "/api/doc/" + $scope.nsName + "/" + $scope.varName;
    $scope.httpFetch($http, docstringUrl, $scope.docLoading, $scope.handleVarDoc);
  };

  // Loads the var's source
  $scope.loadSource = function() {
    var sourceUrl = "/api/source/" + $scope.nsName + "/" + $scope.varName;
    $scope.httpFetch($http, sourceUrl, $scope.sourceLoading, $scope.handleSource);
  };

  $scope.nsName = escape($routeParams.namespace);
  $scope.varName = escape($routeParams.var);
  $scope.setTitle($scope.nsName + " / " + $scope.varName);
  $scope.loadDocstring();
  $scope.loadSource();
  $scope.refreshVars();
};
