describe("Application: Ayler", function() {
  describe("Controller: MainCtrl", function() {
    var ctrl, scope;

    beforeEach(function() {
      scope = {};
      ctrl = new MainCtrl(scope);
    });

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
        var handler = function(response) {
            return response + " world!";
        };

        expect(scope.handleResponse(response, handler)).toEqual("hello world!");
      });
    });
  });
});
