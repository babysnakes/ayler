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
      alert("Disconnected");
      break;
    case "not-connected":
      alert("Please connect");
      break;
    case "error":
      alert(response.response);
      break;
    case "done":
      return handler(response.response);
    default:
      alert("Unknown response: " + response);
    }
  };

  $scope.errorHandler = function(data, status) {
    alert("Error: " + data + " (status: " + status + ")");
  };

  $scope.title = "";
};

function NamespaceListCtrl($scope, $http) {
  $scope.notImplemented = function($event) {
    $event.preventDefault();
    console.log("not-implemented!");
  };

  $scope.namespacesHandler = function(response) {
    $scope.namespaces = response;
  };

  $scope.varsHandler = function(response) {
    $scope.vars = response;
  };

  $scope.varsHandler = function(response) {
    $scope.vars = response;
  };

  $scope.resetVarsFilter = function() {
    $scope.vrs = "";
  };

  $scope.loadNamespaces = function() {
    $scope.nsLoading = true;
    $http.get("/api/ls")
      .success(function(data) {
        $scope.nsLoading = false;
        $scope.handleResponse(data, $scope.namespacesHandler)
      })
      .error(function(data, status, headers, config) {
        $scope.nsLoading = false;
        $scope.errorHandler(data, status);
      });
  };

  $scope.loadVars = function(namespace) {
    $scope.varLoading = true;
    $http.get("/api/ls/" + namespace)
      .success(function (data) {
        $scope.varLoading = false;
        $scope.handleResponse(data, $scope.varsHandler)
      })
      .error(function(data, status, headers, config) {
        $scope.varLoading = false;
        $scope.errorHandler(data, status);
      });
  };

  $scope.refreshClicked = function($event) {
    $event.preventDefault();
    $scope.loadNamespaces();
  };

  $scope.vars = []; // Initially empty until loadVars() is triggered;
  $scope.nsLoading = false;
  $scope.varLoading = false;
  $scope.loadNamespaces();
};

function NamespaceCtrl($scope, $routeParams, $http) {
  $scope.handleNsDoc = function(response) {
    $scope.docstring = response || "No Namespace Docs."
  };

  $scope.updateVars = function() {
    $scope.loadVars($scope.nsName);
  };

  $scope.loadDocstring = function() {
    $scope.nsDocLoading = true;
    $http.get("/api/doc/" + $scope.nsName)
      .success(function(data) {
        $scope.nsDocLoading = false;
        $scope.handleResponse(data, $scope.handleNsDoc)
      })
      .error(function(data, status, headers, config) {
        $scope.nsDocLoading = false;
        $scope.errorHandler(data, status);
      });
  };

  $scope.nsDocLoading = false;
  $scope.nsName = $routeParams.namespace;
  $scope.updateVars();
  $scope.loadDocstring();
  $scope.resetVarsFilter();
  $scope.setTitle($scope.nsName);
};

function VarInfoCtrl($scope, $routeParams, $http) {
  $scope.handleVarDoc = function(response) {
    $scope.docstring = response || "No Docs.";
  };

  $scope.handleSource = function(response) {
    $scope.source = response || "Source not found.";
  };

  $scope.refreshVars = function() {
    if ($scope.vars.length === 0) {
      $scope.loadVars($scope.nsName);
    };
  };

  $scope.loadDocstring = function() {
    $scope.docLoading = true;
    $http.get("/api/doc/" + $scope.nsName + "/" + $scope.varName)
      .success(function(data) {
        $scope.docLoading = false;
        $scope.handleResponse(data, $scope.handleVarDoc);
      })
      .error(function(data, status, header, config) {
        $scope.docLoading = false;
        $scope.errorHandler(data, status);
      });
  };

  $scope.loadSource = function() {
    $scope.sourceLoading = true;
    $http.get("/api/source/" + $scope.nsName + "/" + $scope.varName)
      .success(function(data) {
        $scope.sourceLoading = false;
        $scope.handleResponse(data, $scope.handleSource);
      })
      .error(function(data, status, header, config) {
        $scope.sourceLoading = false;
        $scope.errorHandler(data, status);
      });
  };

  $scope.nsName = $routeParams.namespace;
  $scope.varName = $routeParams.var
  $scope.loadDocstring();
  $scope.loadSource();
  $scope.refreshVars();
};
