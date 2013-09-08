describe("State service", function() {
  var state;

  beforeEach(function() {
    module("ayler");
  });

  describe("#setTitle", function() {
    it("sets the title to 'Ayler' when no title given", inject(function(State) {
      State.setTitle();
      expect(State.title).toEqual("Ayler");
    }));

    it("prefix the provided title with 'Ayler: ", inject(function(State) {
      State.setTitle("my name");
      expect(State.title).toEqual("Ayler: my name");
    }));
  });

  describe("#setNsList", function() {
    it("converts each namespace to name and url", inject(function(State) {
      State.setNsList(["me<"]);
      expect(State.nsList).toContain({name: "me<", url: "me%3C"});
    }));

    describe("#setDoc", function() {
      it("populates the doc", inject(function(State) {
        State.setDoc("some doc");
        expect(State.doc).toEqual("some doc");
      }));

      it("indicates when no doc was found", inject(function(State) {
        State.setDoc(null);
        expect(State.doc).toEqual("No documentation found.");
      }));
    });
  });

  describe("#setVarList", function() {
    beforeEach(inject(function(State) {
      state = State;
      state.setVarList("core:one")(["me<"]);
    }));

    it("sets the varList name with unescaped value", function() {
      expect(_.first(state.varList).name).toEqual("me<");
    });

    it("adds the namespace to the url and escapes it all", function() {
      expect(_.first(state.varList).url).toEqual("core%3Aone/me%3C");
    });
  });

  describe("#appendError", function() {
    beforeEach(inject(function(State) {
      state = State;
      state.appendError("help");
    }));

    it("appends the supplied error", function() {
      expect(_.last(state.errors)).toEqual("help");
    });

    it("sets the showErrors flag", function() {
      expect(state.showErrors).toBeTruthy();
    });
  });

  describe("#clearErrors", function() {
    beforeEach(inject(function(State) {
      state = State;
      state.appendError("help");
      state.clearErrors();
    }));

    it("clears the error list", function() {
      expect(state.errors).toEqual([]);
    });

    it("clears the showError flag", function() {
      expect(state.showErrors).toBeFalsy();
    });
  });
});

describe("ApiClient Service", function() {
  var state, target, http;

  beforeEach(function() {
    module("ayler");
    inject(function(State, $http) {
      state = State;
      http = $http;
    });
    inject(function(ApiClient) {target = ApiClient;});
  });

  describe("#handleError", function() {
    it("adds the error when no status provided.", function() {
      target.handleError("myerror");
      expect(state.errors[0]).toEqual("myerror");
    });

    it("adds default error when no error supplied (nrepl issue?)", function() {
      target.handleError("");
      expect(state.errors[0]).toMatch(/unknown/);
    });

    it("indicates csrf error on status 403", function() {
      target.handleError("some error", 403);
      expect(state.errors[0]).toMatch(/expired/);
    });

    it("shows the status if provided", function() {
      target.handleError("some error", 500);
      expect(state.errors[0]).toMatch(/some error/);
      expect(state.errors[0]).toMatch(/status: 500/);
    });

    it("displays only uniq errors", function() {
      target.handleError("Some Error", 500);
      target.handleError("Some Error", 500);
      expect(state.errors.length).toEqual(1);
    });
  });

  describe("#handleResponse", function() {
    it("calls the provided handler on status: done", function() {
      var response = {status: "done", response: ["one"]};
      var handler = function(input) { state.nsList = input; };
      target.handleResponse(response, handler);
      expect(state.nsList).toEqual(["one"]);
    });

    it("adds the response to the error list if status is error", function() {
      var response = {status: "error", "response": "ERROR"};
      target.handleResponse(response, "doc");
      expect(state.doc).toBeFalsy();
      expect(state.errors).toContain("ERROR");
    });

    // TODO: Test the default alert
  });
});

describe("state manipulation: ", function() {
  var state, ctrl;

  beforeEach(function() {
    module("ayler");
    inject(function(State) {
      state = State;
      state.doc = "DOC";
      state.source = "SOURCE";
      state.displayDoc = true;
      state.displaySource = true;
      state.title = "some title";
      state.vrs = "abcde"; // var filtering
      state.symbolName = "Some / Name";
      state.varList = ["some", "vars"];
    });
  });

  describe("by NsListCtrl", function() {
    beforeEach(inject(function(ApiClient, $controller) {
      spyOn(ApiClient, "httpGet");
      ctrl = $controller("NsListCtrl", {$scope: {}});
    }));

    it("resets the doc, source and varList", function() {
      expect(state.doc).toBe(null);
      expect(state.source).toBe(null);
      expect(state.varList).toEqual([]);
    });

    it("resets the displayDoc and displaySource", function() {
      expect(state.displayDoc).toBeFalsy();
      expect(state.displaySource).toBeFalsy();
    });

    it("sets symbol name to empty and matching title", function() {
      expect(state.symbolName).toBe(null);
      expect(state.title).toEqual("Ayler");
    });
  });

  describe("NsViewCtrl", function() {
    var apiClient, scope;
    var constructTestController = function(nslist, namespace) {
      inject(function(ApiClient, $controller, $routeParams) {
        state.nsList = nslist;
        apiClient = ApiClient;
        scope = {};
        spyOn(ApiClient, "httpGet");
        $routeParams.namespace = namespace;
        $controller("NsViewCtrl", {$scope: scope});
      });
    };

    it("resets the source and the var filtering", function() {
      constructTestController(["one", "two"], "clojure.java.io");
      expect(state.source).toBe(null);
      expect(state.vrs).toEqual("");
    });

    it("hides the source but display the doc", function() {
      constructTestController(["one", "two"], "clojure.java.io");
      expect(state.displayDoc).toBeTruthy();
      expect(state.displaySource).toBeFalsy();
    });

    it("sets the symbolName to the namespace with matching title", function() {
      constructTestController(["one", "two"], "clojure.java.io");
      expect(state.symbolName).toEqual("clojure.java.io");
      expect(state.title).toEqual("Ayler: clojure.java.io");
    });

    it("populates the varList", function() {
      constructTestController(["one", "two"], "clojure.java.io");
      var urls = _.map(apiClient.httpGet.calls, function(call) {
        return call.args[0];
      });
      expect(urls).toContain("/api/ls/clojure.java.io");
    });

    it("does not reload the nsList is it's not empty", function() {
      constructTestController(["one", "two"], "clojure.java.io");
      expect(apiClient.httpGet.calls[0].args[0])
        .toEqual("/api/ls/clojure.java.io");
    });

    it("populates the nsList if it's empty", function() {
      constructTestController([], "clojure.java.io");
      expect(apiClient.httpGet.calls[0].args[0]) .toEqual("/api/ls");
    });
  });

  describe("VarViewCtrl", function() {
    var apiClient, scope, apiCalls;
    var constructTestController = function(nslist, varlist, namespace, varname) {
      inject(function(ApiClient, $controller, $routeParams) {
        state.nsList = nslist;
        state.varList = varlist;
        state.displayDoc = false;
        state.displaySource = false;
        apiClient = ApiClient;
        scope = {};
        spyOn(ApiClient, "httpGet");
        $routeParams.namespace = namespace;
        $routeParams.var = varname;
        $controller("VarViewCtrl", {$scope: scope});
        apiCalls = apiClient.httpGet.calls;
      });
    };

    it("displays both the source and the doc", function() {
      constructTestController(["ns"], ["var"], "namespace", "var");
      expect(state.displaySource).toBeTruthy();
      expect(state.displayDoc).toBeTruthy();
    });

    it("does not refresh the nsList and varList if they have value", function() {
      constructTestController(["ns"], ["var"], "namespace", "var");
      var urls = _.map(apiCalls, function(call) {return call.args[0];});
      expect(urls).not.toContain("/api/ls");
      expect(urls).not.toContain("/api/ls/namespace");
    });

    it("sets the symbolName and the matching title", function() {
      constructTestController(["ns"], ["var"], "namespace%2A", "var%2A");
      expect(state.symbolName).toEqual("namespace* / var*");
      expect(state.title).toEqual("Ayler: namespace* / var*");
    });
  });
});
