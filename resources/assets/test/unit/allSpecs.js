describe("Application: Ayler", function() {
  describe("Controller: MainCtrl", function() {
    beforeEach(module("ayler"));

    var MainCtrl, scope;

    beforeEach(inject(function ($controller) {
      scope = {};
      MainCtrl = $controller("MainCtrl", {
        $scope: scope
      });
    }));

    it("starts with empty title", function() {
      expect(scope.title).toEqual("");
    });

    it("prepends colon to the requested title.",function() {
      scope.setTitle("testme");
      expect(scope.title).toEqual(": testme");
    });

    describe("#handleResponse", function () {
      it("returns the handled response if status is done", function () {
        var response = {status: "done", response: "hello"};
        var handler = function(response) {return response + " world!"};

        expect(scope.handleResponse(response, handler)).toEqual("hello world!");
      });
    });
  });
});
