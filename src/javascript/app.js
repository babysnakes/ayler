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

// This will hold all the state in the application.
aylerApp.factory("State", function() {
  var state = {
    nsList: [],
    varList: [],
    errors: [],
    allNses: [],
    doc: undefined,   // ns or var docstring
    source: undefined, // var source
    escapedNamespace : undefined // we need it for calculating urls!
  };

  // Sets the page title (with constant prefix).
  state.setTitle = function(text) {
    if (text) {
      state.title = "Ayler: " + text;
    } else {
      state.title = "Ayler";
    }
  };

  // Returns a function that sets the named attribute (on State) with
  // the *data* argument or with the supplied defaultValue.
  state.setAttribute = function(name, defaultValue) {
    return function(data) {
      state[name] = data || defaultValue;
    };
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
    apiClient.handleError(data, status);
  }

  // Wrapper for $http.post.
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

aylerApp.filter("escape", function() {
  return function(input) {return escape(input)};
});

/**
 * A filter for syntax highlight using hljs. The `lang` parameter */
/** defaults to *clojure*.
 */
aylerApp.filter("hljs", function() {
  return function(input, lang) {
    lang = lang || "clojure"
    return input ? hljs.highlight(lang, input).value : "";
  };
})

aylerApp.filter('removeElements', function() {
  return function(input, elements, showAll) {
    if (showAll) {
      return input
    } else {
      return _.difference(input, elements);
    };
  };
})


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

  $scope.loadSearchNses = function($event) {
    $event.preventDefault();
    ApiClient.httpGet("/api/lsall", "allNsBusy", State.setAttribute("allNses", []));
    $("#searchNsModal").modal("show");
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
    ApiClient.httpGet("/api/ls", "nsListBusy", State.setAttribute("nsList", []));
  };

  $scope.selectNsToLoad = function() {
    var selected = escape($scope.state.selectedNs);
    if (_.isEmpty(selected) || selected === "undefined") {
      alert("Please select a namespace or press 'Cencel'");
      return;
    }
    var url = "/api/load/" + selected;
    ApiClient.httpPost(
      url, {},
      function(data) {
        $("#searchNsModal").modal("hide");
        $location.path("/" + selected);
        $scope.$broadcast("reload-nses")
      });
  };

  $scope.$on("reload-nses", function($event) {
    $scope.reloadNses($event);
  });
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

  ApiClient.httpGet("/api/ls", "nsListBusy", State.setAttribute("nsList", []));
});

// Configure the state for displaying namespace.
aylerApp.controller("NsViewCtrl", function($scope, State, $routeParams, ApiClient) {
  $scope.state = State;
  State.source = null;
  State.displaySource = false;
  State.displayDoc = true;
  State.vrs = ""; // clean var filtering on navigation
  State.escapedNamespace = $routeParams.namespace;
  State.symbolName = unescape(State.escapedNamespace);
  State.setTitle(State.symbolName);

  if (_.isEmpty(State.nsList)) {
    // only update nsList if it's empty (e.g. landed directly on page)
    ApiClient.httpGet("/api/ls", "nsListBusy", State.setAttribute("nsList", []));
  }
  ApiClient.httpGet("/api/ls/" + State.escapedNamespace,
                    "varListBusy", State.setAttribute("varList", []));
  ApiClient.httpGet("/api/doc/" + State.escapedNamespace,
                    "docBusy", State.setAttribute("doc", "No documentation found"));

});

// Configure the state for displaying var.
aylerApp.controller("VarViewCtrl", function($scope, State, $routeParams, ApiClient) {
  $scope.state = State;
  State.displayDoc = true;
  State.displaySource = true;
  State.escapedNamespace = $routeParams.namespace;
  $scope.var = $routeParams.var;
  State.symbolName = unescape(State.escapedNamespace + " / " + $scope.var);
  State.setTitle(State.symbolName);

  if (_.isEmpty(State.nsList)) {
    ApiClient.httpGet("/api/ls", "nsListBusy", State.setAttribute("nsList", []));
  };

  if (_.isEmpty(State.varList)) {
    ApiClient.httpGet("/api/ls/" + State.escapedNamespace,
                      "varListBusy", State.setAttribute("varList", []));
  };

  ApiClient.httpGet("/api/doc/" + State.escapedNamespace + "/" + $scope.var,
                    "docBusy", State.setAttribute("doc", "No documentation found"));

  ApiClient.httpGet("/api/source/" + State.escapedNamespace + "/" + $scope.var,
                    "sourceBusy", State.setAttribute("source", "Source not found"));
});
