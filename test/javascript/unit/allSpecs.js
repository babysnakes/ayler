// describe("Application: Ayler", function() {
//   var ctrl, scope;

//   describe("Controller: MainCtrl", function() {
//     beforeEach(function() {
//       scope = {};
//       ctrl = new MainCtrl(scope);
//       scope.errors = [];
//       scope.anyErrors = false;
//     });

//     it("starts with empty title", function() {
//       expect(scope.title).toEqual("");
//     });

//     it("prepends colon to the requested title.",function() {
//       scope.setTitle("testme");
//       expect(scope.title).toEqual(": testme");
//     });

//     describe("#handleResponse", function () {
//       it("returns the handled response if status is done", function () {
//         var response = {status: "done", response: "hello"};
//         var handler = function(response) {
//           return response + " world!";
//         };
//         expect(scope.handleResponse(response, handler)).toEqual("hello world!");
//       });
//     });

//     describe("#errorHandler", function() {
//       it("handles correctly invokations without status", function() {
//         scope.errorHandler("hello world");
//         expect(scope.errors[0]).toBe("hello world");
//       });

//       it("spacifies the status code if provided.", function() {
//         scope.errorHandler("hello world", 404);
//         expect(scope.errors[0]).toBe("hello world (status: 404)");
//       });

//       it("has spacial handling of 403 errors", function() {
//         scope.errorHandler("hello world", 403);
//         expect(scope.errors[0]).toBe("Your session has expired. Please refresh the browser.");
//       });

//       it("sets anyErrors on every error", function() {
//         scope.errorHandler("hello world");
//         expect(scope.anyErrors).toBeTruthy();
//       });
//     });

//     describe("#clearErrors", function(){
//       beforeEach(function() {
//         scope.anyErrors = true;
//         scope.errors = ["hello world"];
//       });

//       it("clears the anyErrors flag", function() {
//         scope.clearErrors();
//         expect(scope.anyErrors).toBeFalsy();
//       });

//       it("clears the errors", function() {
//         scope.clearErrors();
//         expect(scope.errors.length).toBe(0);
//       });
//     });
//   });

//   describe("Controller: NamespaceListCtrl", function() {
//     var $httpBackend, location;
//     var nsResponse = {
//       "status": "done",
//       "response": [{"name": "clojure.core", "url": "clojure.core"},
//                    {"name": "clojure.main", "url": "clojure.main"},
//                    {"name": "other.ns", "url": "other.ns"}]};
//     var varResponse = {
//       "status": "done",
//       "response": [{"name":"*","url":"clojure.core/%2A"},
//                    {"name":"*'","url":"clojure.core/%2A%27"},
//                    {"name":"*1","url":"clojure.core/%2A1"}]};

//     beforeEach(inject(function($location, $rootScope, $controller, _$httpBackend_) {
//       scope = $rootScope.$new();
//       scope.handleResponse = function() {};
//       scope.httpFetch = function() {};
//       ctrl = $controller(NamespaceListCtrl, {$scope: scope});
//     }));

//     it("#namespacesHandler assigns namespaces", function() {
//       scope.namespacesHandler(nsResponse["response"]);
//       expect(scope.namespaces[0]["name"]).toBe("clojure.core");
//     });

//     it("#varsHandler assigns vars", function() {
//       scope.varsHandler(varResponse["response"]);
//       expect(scope.vars[2]["name"]).toBe("*1");
//     });

//     it("#resetVarsFilter should do as advertised", function() {
//       scope.vrs = "filter";
//       scope.resetVarsFilter();
//       expect(scope.vrs).toBe("");
//     });
//   });

//   describe("Controller: NamespaceCtrl", function() {
//     var $httpBackend, location;

//     beforeEach(inject(function($routeParams, $rootScope, $controller, _$httpBackend_) {
//       scope = $rootScope.$new();
//       $routeParams.namespace = "hello?";
//       scope.handleResponse = function() {};
//       scope.loadVars = function() {};
//       scope.httpFetch = function() {};
//       scope.resetVarsFilter = function() {};
//       scope.setTitle = function() {};
//       spyOn(scope, "resetVarsFilter");
//       spyOn(scope, "setTitle");
//       ctrl = $controller(NamespaceCtrl, {$scope: scope});
//     }));

//     it("correctly assigns nsName", function() {
//       expect(scope.nsName).toBe("hello%3F");
//     });

//     it("resets vars filter when loaded", function() {
//       expect(scope.resetVarsFilter).toHaveBeenCalled();
//     });

//     it("sets the title with the correct namespace", function() {
//       expect(scope.setTitle).toHaveBeenCalledWith(scope.nsName);
//     });

//     it("handleNsDoc assigns docstring", function() {
//       scope.handleNsDoc("hello");
//       expect(scope.docstring).toEqual("hello");
//     });

//     it("handles indicates the lack of namespace docs", function() {
//       scope.handleNsDoc('');
//       expect(scope.docstring).toEqual("No Namespace Docs.");
//     });
//   });

//   describe("Controller: VarInfoCtrl", function() {
//     var $httpBackend;

//     beforeEach(inject(function($routeParams, $rootScope, $controller, _$httpBackend_) {
//       $routeParams.namespace = "ns?";
//       $routeParams.var = "vr?";
//       scope = $rootScope.$new();
//       scope.httpFetch = function() {};
//       scope.setTitle = function() {};
//       scope.vars = [];
//       scope.loadVars = function() {};
//       scope.handleResponse = function() {};
//       ctrl = $controller(VarInfoCtrl, {$scope: scope});
//     }));

//     it("correctly assigns nsName and varName", function() {
//       expect(scope.nsName).toBe("ns%3F");
//       expect(scope.varName).toBe("vr%3F");
//     });

//     it("#handleVarDoc handles docs correctly", function() {
//       scope.handleVarDoc("hello world");
//       expect(scope.docstring).toBe("hello world");
//     });

//     it("#handleVarDoc indicates when docs not found", function() {
//       scope.handleVarDoc("");
//       expect(scope.docstring).toBe("No Docs.");
//     });

//     it("#handleSource handles source correctly", function() {
//       scope.handleSource("(some source)");
//       expect(scope.source).toMatch(/\<span class\=/)
//     });

//     it("#handleSource indicates source not found", function() {
//       scope.handleSource(null);
//       expect(scope.source).toBe("<span>Source not found.</span>");
//     });

//     it("#refreshVars should reload vars when varlist is empty", function() {
//       scope.vars = [];
//       spyOn(scope, "loadVars");
//       scope.refreshVars();
//       expect(scope.loadVars).toHaveBeenCalled();
//     });

//     it("#refreshVars should not reload vars if varlist exists", function() {
//       scope.vars = ["one", "two", "three"];
//       spyOn(scope, "loadVars");
//       scope.refreshVars();
//       expect(scope.loadVars).not.toHaveBeenCalled();
//     });
//   });

//   describe("Controller: AllNsCtrl", function(){
//     beforeEach(inject(function($rootScope, $location, $controller, _$httpBackend_) {
//       scope = $rootScope.$new();
//       scope.httpFetch = function() {};
//       ctrl = $controller(AllNsCtrl, {$scope: scope});
//     }));

//     it("#handleAllNses assigns response correctly", function() {
//       response = ["clojure.core", "other.namespace"];
//       scope.handleAllNses(response);
//       expect(scope.allNses).toEqual(response);
//     });
//   });
// });
