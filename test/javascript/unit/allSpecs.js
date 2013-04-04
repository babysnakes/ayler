describe("Application: Ayler", function() {
  describe("Controller: MainCtrl", function() {
    var ctrl, scope;

    beforeEach(function() {
      scope = {};
      ctrl = new MainCtrl(scope);
      scope.errors = [];
      scope.anyErrors = false;
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

    describe("#errorHandler", function() {
      it("handles correctly invokations without status", function() {
        scope.errorHandler("hello world");
        expect(scope.errors[0]).toBe("hello world");
      });

      it("spacifies the status code if provided.", function() {
        scope.errorHandler("hello world", 404);
        expect(scope.errors[0]).toBe("hello world (status: 404)");
      });

      it("has spacial handling of 403 errors", function() {
        scope.errorHandler("hello world", 403);
        expect(scope.errors[0]).toBe("Your session has expired. Please refresh the browser.");
      });
      
      it("sets anyErrors on every error", function() {
        scope.errorHandler("hello world");
        expect(scope.anyErrors).toBeTruthy();
      });
    });

    describe("#clearErrors", function(){
      beforeEach(function() {
        scope.anyErrors = true;
        scope.errors = ["hello world"];
      });

      it("clears the anyErrors flag", function() {
        scope.clearErrors();
        expect(scope.anyErrors).toBeFalsy();
      });
      
      it("clears the errors", function() {
        scope.clearErrors();
        expect(scope.errors.length).toBe(0);
      });
    });
  });
});
