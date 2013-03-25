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
        controller: "NamespaceCtrl",
        templateUrl: "templates/ns-docstring.html"
      });
  }])
  .controller('MainCtrl', function($scope) {
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

    $scope.errorHandler = function(data, status, headers, config) {
      alert("Error: " + data + " (status: " + status + ")");
    };

    $scope.title = "";
  })
  .controller('NamespaceListCtrl', function ($scope, $http) {
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

    $scope.loadNamespaces = function() {
      $http.get("/api/ls")
        .success(function(data) {
          $scope.handleResponse(data, $scope.namespacesHandler)
        })
        .error($scope.errorHandler);
    };

    $scope.loadVars = function(namespace) {
      $http.get("/api/ls/" + namespace)
        .success(function (data) {
          $scope.handleResponse(data, $scope.varsHandler)
        })
        .error($scope.errorHandler);
    };

    $scope.refreshClicked = function($event) {
      $event.preventDefault();
      $scope.loadNamespaces();
    };

    $scope.vars = []; // Initially empty until loadVars() is triggered;
    $scope.loadNamespaces();
  })
  .controller("NamespaceCtrl", function ($scope, $routeParams, $http) {
    $scope.handleNsDoc = function(response) {
      $scope.docstring = response || "No Namespace Docs."
    };

    $scope.updateVars = function() {
      $scope.loadVars($scope.nsName);
    };

    $scope.loadDocstring = function() {
      $http.get("/api/doc/" + $scope.nsName)
        .success(function(data) {
          $scope.handleResponse(data, $scope.handleNsDoc)
        })
        .error($scope.errorHandler);
    };

    $scope.nsName = $routeParams.namespace;
    $scope.updateVars();
    $scope.loadDocstring();
    $scope.setTitle($scope.nsName);
  });
