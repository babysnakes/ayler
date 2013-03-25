"use strict";

angular.module('ayler', [])
  .controller('MainCtrl', function($scope) {
    $scope.setTitle = function(name) {
      $scope.title = ": " + name;
    },

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
    },

    $scope.title = "";
  });
