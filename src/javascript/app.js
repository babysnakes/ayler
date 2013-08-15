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
    allNses: [],
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

  state.setAllNses = function(nses) {
    state.allNses = nses || [];
    state.selectedNs = _.first(state.allNses);
  };

  state.appendError = function(error) {
    state.errors.push(error);
    state.errors = _.uniq(state.errors);
    state.showErrors = true;
  };

  state.clearErrors = function() {
    state.errors = [];
    state.showErrors = false;
  };

  return state;
});

aylerApp.factory("ApiClient", function(State, $http, $rootScope) {
  var apiClient = {};

  apiClient.handleError = function(data, status) {
    State.showErrors = true;
    switch (status) {
    case undefined:
      var message =
        "An unknown error has occured: empty response from the server." +
        "This may be caused by nrepl connection issues. " +
        "Please try again (or refresh the browser). " +
        "If it happens again you may need to restart Ayler.";
      State.appendError(data || message);
      break;
    case 403:
      State.appendError("Your session has expired. Please refresh the browser.");
      break;
    default:
      State.appendError(data + " (status: " + status + ")");
      break;
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
    case "disconnected":
      $rootScope.$broadcast("connect", {disconnected: true});
    case "not-connected":
      $rootScope.$broadcast("connect");
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

  var defaultErrorHandler = function(data, status, headers, config) {
    ApiClient.handleError(data, status);
  }

  // Wrapper for $http.get.
  //
  // params:
  // * url: The url to post to.
  // * params: The params to post (object);
  // * succ: A success function. Should accept (data) as parameter.
  // * err: An error function. Should accept 4 parameters:
  //        (data, status, headers, config).
  //        If empty the defaultErrorHandler is used.
  apiClient.httpPost = function(url, params, succ, err) {
    $http.post(url, params)
      .success(succ).error(err || defaultErrorHandler);
  };

  return apiClient;
});

aylerApp.directive("errors", function() {
  return {templateUrl: "templates/errors.html"};
});

aylerApp.controller("MainCtrl", function($scope, State, ApiClient, $location, $route) {
  $scope.state = State;

  $scope.$on("connect", function(event, args) {
    if (args && args.disconnected) {
      $scope.disconnected = true;
    } else {
      $scope.disconnected = false;
    };

    $("#connectForm").modal("show");
  });

  $scope.loadAllNses = function($event) {
    $event.preventDefault();
    ApiClient.httpGet("/api/lsall", "allNsBusy", State.setAllNses);
    $("#allNsModal").modal("show");
  };

  $scope.connect = function() {
    ApiClient.httpPost(
      "/api/remote/",
      {"port": $scope.remotePort,
       "host": $scope.remoteHost},
      function(data) {
        $("#connectForm").modal("hide");
        $location.path("/");
        $route.reload();
      });
  };

  $scope.disconnect = function($event) {
    $event.preventDefault();
    ApiClient.httpPost(
      "/api/disconnect/", {},
      function(data) {
        $route.reload();
      });
  };

  $scope.reloadNses = function($event) {
    $event.preventDefault();
    ApiClient.httpGet("/api/ls", "nsListBusy", State.setNsList);
  };

  $scope.selectNsToRequire = function() {
    var selected = escape($scope.state.selectedNs);
    var url = "/api/require/" + selected;
    ApiClient.httpPost(
      url, {},
      function(data) {
        $("#allNsModal").modal("hide");
        $location.path("/" + selected);
      });
  };
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
