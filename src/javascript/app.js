"use strict";

$(document).ready(function() {
  // bootstrap tooltips for the navigation images
  $("ul.nav i").tooltip({placement: "bottom"});
});

var aylerApp = angular.module("ayler", []);

aylerApp.config(function($routeProvider) {
  // Note: the routes use whitespace for template because without
  // template the controller doesn't run. We don't need the template
  // itself. We just need the controller to change the state.
  $routeProvider
    .when("/",
          {template: " ",
           controller: "NsListCtrl"})
    .when("/:namespace",
          {template: " ",
           controller: "NsViewCtrl"})
    .when("/:namespace/:var",
          {template: " ",
           controller: "VarViewCtrl"});
});

// This will hold all the
aylerApp.factory("State", function() {
  var state = {
    nsList: [],
    varList: [],
    errors: [],
    doc: undefined,   // ns or var docstring
    source: undefined // var source
  };

  // Sets the page title (with constant prefix).
  state.setTitle = function(text) {
    if (text) {
      state.title = "Ayler: " + text;
    } else {
      state.title = "Ayler";
    }
  };

  state.setNsList = function(nslist) {
    state.nsList = _.map(nslist, function(ns) {
      return {name: ns, url: escape(ns)};
    });
  };

  state.setVarList = function(ns) {
    return function(varlst) {
      state.varList = _.map(varlst, function(item) {
        return {name: item, url: escape(ns + "/" + item)};
      });
    };
  };

  state.setDoc = function(text) {
    state.doc = text || "No documentation found.";
  };

  state.setSource = function(text) {
    if (text) {
      state.source = hljs.highlight("clojure", text).value;
    } else {
      state.source = "<span>Source not found.</span>";
    }
  };

  state.appendError = function(error) {
    state.errors.push(error);
    state.showErrors = true;
  };

  state.clearErrors = function() {
    state.errors = [];
    state.showErrors = false;
  };

  return state;
});

aylerApp.factory("ApiClient", function(State, $http) {
  var apiClient = {};

  apiClient.handleError = function(data, status) {
    State.showErrors = true;
    if (status === undefined) {
      State.appendError(data);
    } else if (status === 403) { // anti-forgery expired
      State.appendError("Your session has expired. Please refresh the browser.");
    } else {
      State.appendError(data + " (status: " + status + ")");
    };
  };

  // Handles the response according to it's "status" attribute.
  //
  // params:
  // * response: object with "status" and "response" attributes.
  // * handler: A function which handles the response (e.g. set the
  //            matching attribute on State) in case the status is
  //            'done'. Receives the response as sole parameter.
  apiClient.handleResponse = function(response, handler) {
    switch(response.status) {
    case "done":
      handler(response.response);
      break;
    case "error":
      apiClient.handleError(response.response);
      break;
    default:
      alert("Unknown response: " + response);
      break;
    };
  };

  // Wrapper for $http.get.
  //
  // params:
  // * url: The url to fetch.
  // * flag: The attribute on 'State' to set as true while in
  //         progress.
  // * handler: A handler to be passsed to 'handleResponse' when
  //            successfull. See 'handleResponse' for details.
  apiClient.httpGet = function(url, flag, handler) {
    State[flag] = true;
    $http.get(url)
      .success(function(data) {
        State[flag] = undefined;
        apiClient.handleResponse(data, handler);
      })
      .error(function(data, status, headers, config) {
        State[flag] = undefined;
        apiClient.handleError(data, status);
      });
  };

  return apiClient;
});

aylerApp.directive("errors", function() {
  return {templateUrl: "templates/errors.html"};
});

aylerApp.controller("MainCtrl", function($scope, State) {
  $scope.state = State;
});

// Configure the state for listing namespaces.
aylerApp.controller("NsListCtrl", function($scope, State, ApiClient) {
  $scope.state = State;
  State.varList = [];
  State.doc = null;
  State.source = null;
  State.displayDoc = false;
  State.displaySource = false;
  State.symbolName = null; // Pretty name of the queried namespace or var.
  State.setTitle();
  ApiClient.httpGet("/api/ls", "nsListBusy", State.setNsList);
});

// Configure the state for displaying namespace.
aylerApp.controller("NsViewCtrl", function($scope, State, $routeParams, ApiClient) {
  $scope.state = State;
  State.source = null;
  State.displaySource = false;
  State.displayDoc = true;
  State.vrs = ""; // clean var filtering on navigation
  $scope.namespace = unescape($routeParams.namespace);
  State.symbolName = $scope.namespace;
  State.setTitle($scope.namespace);

  if (_.isEmpty(State.nsList)) {
    // only update nsList if it's empty (e.g. landed directly on page)
    ApiClient.httpGet("/api/ls", "nsListBusy", State.setNsList);
  }
  ApiClient.httpGet("/api/ls/" + escape($scope.namespace),
                    "varListBusy", State.setVarList($scope.namespace));
  ApiClient.httpGet("/api/doc/" + escape($scope.namespace),
                    "docBusy", State.setDoc);

});

// Configure the state for displaying var.
aylerApp.controller("VarViewCtrl", function($scope, State, $routeParams, ApiClient) {
  $scope.state = State;
  State.displayDoc = true;
  State.displaySource = true;
  $scope.namespace = unescape($routeParams.namespace);
  $scope.var = unescape($routeParams.var);
  State.symbolName = $scope.namespace + " / " + $scope.var;
  State.setTitle(State.symbolName);

  if (_.isEmpty(State.nsList)) {
    ApiClient.httpGet("/api/ls", "nsListBusy", State.setNsList);
  };

  if (_.isEmpty(State.varList)) {
    ApiClient.httpGet("/api/ls/" + escape($scope.namespace),
                      "varListBusy", State.setVarList($scope.namespace));
  };

  ApiClient.httpGet("/api/doc/" + escape($scope.namespace + "/" + $scope.var),
                    "docBusy", State.setDoc);

  ApiClient.httpGet("/api/source/" + escape($scope.namespace + "/" + $scope.var),
                    "sourceBusy", State.setSource);
});
