"use strict";

$(document).ready(function() {
  // bootstrap tooltips for the navigation images
  $("ul.nav i").tooltip({placement: "bottom"});
});

angular.module('ayler', [])
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

    $scope.loadNamespaces = function() {
      $http.get("/api/ls")
        .success(function(data) {
          $scope.handleResponse(data, $scope.namespacesHandler)
        })
        .error($scope.errorHandler);
    };

    $scope.refreshClicked = function($event) {
      $event.preventDefault();
      $scope.loadNamespaces();
    }

    $scope.loadNamespaces();
  });
