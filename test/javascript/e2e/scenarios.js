"use strict";

describe("Regular workflow", function() {
  xit("connecting to remote nrepl");

  describe("root page", function() {
    beforeEach(function() {
      browser().navigateTo("/");
      sleep(0.4);
    });

    it("fetches namespaces list on '/'", function() {
      expect(repeater(".nses-window li", "namespaces").count()).toBeGreaterThan(0);
    });

    it("offers namespace filtering", function() {
      input("nses").enter("clojure.main");
      expect(repeater(".nses-window li", "namespaces").count()).toBe(1);
    });
  });

  describe("Namespace browsing", function() {
    beforeEach(function() {
      browser().navigateTo("/#/clojure.java.io");
      sleep(0.4);
    });

    it("displays the namespace in the title", function() {
      expect(element("title", "title").text()).toMatch(/clojure.java.io/);
    });

    it("displays the var list", function() {
      expect(repeater(".vrs-window li", "vars").count()).toBeGreaterThan(0);
    });

    it("displays something as docstring", function() {
      expect(element("#docstring", "docstring").text()).toMatch(/.+/);
    });

    it("offers vars filtering", function() {
      input("vrs").enter("abcdefg");
      expect(repeater(".vrs-window li", "vars").count()).toBe(0);
    });

    it("cleans up vars filtering upon naviation to new namespace", function() {
      input("vrs").enter("abcdeflkjsde");
      browser().navigateTo("/#/clojure.main");
      expect(repeater(".vrs-window li", "vars").count()).toBeGreaterThan(0);
    });
  });

  describe("Vars browsing", function() {
    beforeEach(function() {
      browser().navigateTo("/#/clojure.main/with-bindings");
      sleep(0.4);
    });

    it("displays the namespace and var in the title", function() {
      expect(element("title", "title").text())
        .toMatch(/clojure.main \/ with-bindings/);
    });

    it("displays namespaces and vars list", function() {
      expect(repeater(".nses-window li", "namespaces").count()).toBeGreaterThan(0);
      expect(repeater(".vrs-window li", "vars").count()).toBeGreaterThan(0);
    });

    it("displays the docustring", function() {
      expect(element("#docstring").text()).toMatch(/body/);
    });

    it("displays the source", function() {
      expect(element("#source").text()).toMatch(/defmacro/);
    });
  });
});

describe("Error reporting and dismissal", function() {
  it("does now show error form if no errors exist", function() {
    browser().navigateTo("/");
    expect(element("#errors").css("display")).toBe("none");
  });

  it("displays the errors when evailable", function() {
    browser().navigateTo("/#/hello-world");
    expect(element("#errors").css("display")).toBe("block");
  });

  it("hides and deletes existing errors when clicking 'Dissmiss'", function() {
    browser().navigateTo("/#/hello-world");
    expect(repeater("#errors li", "errors").count()).toBeGreaterThan(0);
    element("#errors button", "Dismiss").click();
    expect(element("#errors").css("display")).toBe("none");
    expect(repeater("#errors li", "errors").count()).toBe(0);
  });
});

xdescribe("Exceptional cases", function() {
  it("empties the var list when navigating manually from var to '/'");
});
