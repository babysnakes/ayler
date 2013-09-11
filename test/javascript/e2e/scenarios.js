"use strict";

describe("Regular workflow", function() {
  xit("connecting to remote nrepl");

  describe("root page", function() {
    beforeEach(function() {
      browser().navigateTo("/");
      sleep(0.4);
    });

    it("fetches namespaces list on '/'", function() {
      expect(repeater(".nses-window li", "namespaces").count()).toBeGreaterThan(2);
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
      expect(repeater(".vrs-window li", "vars").count()).toBeGreaterThan(1);
    });

    it("displays something as docstring", function() {
      expect(element("#docstring", "docstring").text()).toMatch(/.+/);
    });

    it("offers vars filtering", function() {
      input("state.vrs").enter("abcdefg");
      expect(repeater(".vrs-window li", "vars").count()).toBe(0);
    });

    it("cleans up vars filtering upon naviation to new namespace", function() {
      input("state.vrs").enter("abcdeflkjsde");
      element("[href='#/clojure.main']", "clojure.main").click();
      expect(element("[name='vrs']").val()).toEqual("");
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
      expect(repeater(".nses-window li", "namespaces").count()).toBeGreaterThan(1);
      expect(repeater(".vrs-window li", "vars").count()).toBeGreaterThan(1);
    });

    it("displays the docustring", function() {
      expect(element("#docstring").text()).toMatch(/body/);
    });

    it("displays the source", function() {
      expect(element("#source").text()).toMatch(/defmacro/);
    });
  });

  describe("rendering var's dostrings", function() {
    it("displays the function's arguments", function() {
      browser().navigateTo("/#/clojure.core/inc");
      sleep(0.4);
      expect(element("#docstring").text()).toMatch(/\(\[x\]\)\n  /);
    });

    it("displays the docstring for non functions without prefixed newline", function() {
      browser().navigateTo("/#/clojure.core/*1");
      sleep(0.4);
      expect(element("#docstring").text()).toMatch(/^  \w+/);
    })
  });

  describe("Application navigation", function() {
    beforeEach(function() {
      browser().navigateTo("/");
    });

    it("from namespace to var", function() {
      element("[href='#/clojure.main']", "clojure.main").click();
      expect(browser().location().path()).toMatch("/clojure.main");
      element("[href='#/clojure.main/repl']", "clojure.main/repl").click();
      expect(browser().location().path()).toMatch("/clojure.main/repl");
    });
  });

  describe("search namespaces usage scenario", function() {
    beforeEach(function() {
      browser().navigateTo("/");
    });

    it("default usage", function() {
      element("#show-search-ns-modal", "search button").click();
      sleep(0.6);
      input("showAllNses").check(); // make sure clojure.zip shows!
      select("state.selectedNs").option("clojure.zip")
      element("#searchNsModal input[type=submit]").click();
      sleep(1);
      expect(browser().location().path()).toBe("/clojure.zip");
    });

    it("toggles display of already required namespaces", function() {
      // We're testing 'clojure.core' as it's never not-loaded.
      // Not sure exactly how element(...).html works but it seems to
      // work correctly.
      element("#show-search-ns-modal", "search button").click();
      sleep(0.6);
      input("searchNsFilter").enter("clojure.core");
      input("showAllNses").check(); // make sure clojure.core shows!
      select("state.selectedNs").option("clojure.core")
      expect(element("#searchNsModal option").html()).toEqual("clojure.core");
      input("showAllNses").check(); // make sure clojure.core is hidden!
      expect(element("#searchNsModal option").html()).toEqual("");
    });
  });
});

describe("Error reporting and dismissal", function() {
  it("does now show error form if no errors exist", function() {
    browser().navigateTo("/");
    expect(element(".alert-error").css("display")).toBe("none");
  });

  it("displays the errors when evailable", function() {
    browser().navigateTo("/#/hello-world");
    expect(element(".alert-error").css("display")).toBe("block");
    expect(element(".alert-error li").text()).toMatch(/hello-world/);
  });

  it("hides and deletes existing errors when clicking 'Dissmiss'", function() {
    browser().navigateTo("/#/hello-world");
    expect(repeater(".alert-error li", "errors").count()).toBeGreaterThan(0);
    element(".alert-error button", "Dismiss").click();
    expect(element(".alert-error").css("display")).toBe("none");
    expect(repeater(".alert-error li", "errors").count()).toBe(0);
  });
});

xdescribe("Exceptional cases", function() {
  it("empties the var list when navigating manually from var to '/'");
});
