(ns ayler.nrepl-client-test
  (:require ayler.test-helpers
   [ayler.nrepl-client :as client])
  (:use clojure.test))

(def doc-response
  '({:id "5a30b723-4071-4c10-8cfa-7168f98048d6",
     :out "-------------------------\n",
     :session "7bae7c57-40da-4f41-a876-bb0877ad2b05"}
    {:id "5a30b723-4071-4c10-8cfa-7168f98048d6",
     :out "clojure.core/inc\n",
     :session "7bae7c57-40da-4f41-a876-bb0877ad2b05"}
    {:id "5a30b723-4071-4c10-8cfa-7168f98048d6",
     :out "([x])\n",
     :session "7bae7c57-40da-4f41-a876-bb0877ad2b05"}
    {:id "5a30b723-4071-4c10-8cfa-7168f98048d6",
     :out "  Returns a number one greater than num. Does not auto-promote\n  longs, will throw on overflow. See also: inc'\n",
     :session "7bae7c57-40da-4f41-a876-bb0877ad2b05"}
    {:id "5a30b723-4071-4c10-8cfa-7168f98048d6",
     :ns "user",
     :session "7bae7c57-40da-4f41-a876-bb0877ad2b05",
     :value "nil"}
    {:id "5a30b723-4071-4c10-8cfa-7168f98048d6",
     :session "7bae7c57-40da-4f41-a876-bb0877ad2b05",
     :status ["done"]}))

(def non-existance-doc-response
  '({:id "5f91a6e0-0671-49ce-bf12-5e3afb8d26c4",
     :ns "user",
     :session "478996d7-b9ee-4eed-8bcd-037bb0bb6781",
     :value "nil"}
    {:id "5f91a6e0-0671-49ce-bf12-5e3afb8d26c4",
     :session "478996d7-b9ee-4eed-8bcd-037bb0bb6781",
     :status ["done"]}))

(def sample-error-response
  '({:ex "class clojure.lang.Compiler$CompilerException",
     :id "8ac69338-6668-4b26-87ee-d3831c5a35d5",
     :root-ex "class clojure.lang.Compiler$CompilerException",
     :session "969446d9-3648-4e1b-9663-dd9daf135240",
     :status ["eval-error"]}
    {:err "CompilerException java.lang.RuntimeException: Unable to resolve symbol: docc in this context, compiling:(NO_SOURCE_PATH:1) \n",
     :id "8ac69338-6668-4b26-87ee-d3831c5a35d5",
     :session "969446d9-3648-4e1b-9663-dd9daf135240"}
    {:id "8ac69338-6668-4b26-87ee-d3831c5a35d5",
     :session "969446d9-3648-4e1b-9663-dd9daf135240",
     :status ["done"]}))

(def long-value-response
  '({:id "c3399b6d-2631-494d-bbf5-f206ff09813b",
     :ns "user",
     :session "c8f210ec-c7e2-48d3-8104-44882d07af43",
     :value "(cheshire.parse clojure.tools.nrepl.misc seesaw.font clojure.set slingshot.slingshot cheshire.generate clojure.tools.nrepl.middleware.load-file clj-ns-browser.sdoc clj-ns-browser.utils ring.middleware.multipart-params clojure.uuid clojure.tools.nrepl.middleware.session clojure.tools.namespace clojure.test clj-http.lite.util seesaw.make-widget ring.middleware.multipart-params.temp-file seesaw.action ring.middleware.flash clojure.pprint j18n.core seesaw.bind clojure.tools.nrepl.middleware.interruptible-eval complete.core ring.util.codec seesaw.dev seesaw.value seesaw.timer clojure.walk seesaw.options reply.exports clj-ns-browser.web ring.util.servlet seesaw.mig clojure.tools.nrepl user seesaw.meta clj-info.doc2map seesaw.keystroke clojure.main clojure.java.classpath clojure.tools.nrepl.transport seesaw.util clojure.core.incubator ring.middleware.cookies clojure.tools.nrepl.middleware.pr-values clojure.core clj-http.lite.client clj-info.doc2txt clj-time.format ring.middleware.nested-params clojure.tools.nrepl.server seesaw.scroll seesaw.to-widget ring.middleware.keyword-params seesaw.event seesaw.table clojure.zip ayler.app clojure.java.browse ring.middleware.content-type clojure.java.shell ring.middleware.session seesaw.layout clojure.repl seesaw.core ring.adapter.jetty seesaw.dnd seesaw.cells cheshire.core clj-ns-browser.inspector clj-ns-browser.toggle-listbox clj-info.doc2html compojure.handler compojure.route hiccup.util clojure.tools.macro hiccup.core compojure.core seesaw.icon clj-info.doc-info-EN compojure.response ring.util.mime-type cheshire.factory clj-info clojure.tools.trace ayler.webapp clojure.tools.nrepl.ack cd-client.core clojure.stacktrace seesaw.border clj-ns-browser.browser clojure.java.io clj-time.core clojure.string seesaw.selector clojure.core.protocols seesaw.clipboard seesaw.color ring.middleware.session.memory clojure.tools.nrepl.bencode clojure.instant seesaw.cursor ring.util.response clojure.java.javadoc clojure.reflect ring.middleware.params seesaw.rsyntax clout.core seesaw.widget-options ring.middleware.head ring.middleware.file-info hiccup.compiler clojure.tools.nrepl.middleware seesaw.selection seesaw.invoke seesaw.graphics slingshot.support ring.middleware.session.store ring.util.data seesaw.config clj-http.lite.core clojure.template)"}
    {:id "c3399b6d-2631-494d-bbf5-f206ff09813b",
     :session "c8f210ec-c7e2-48d3-8104-44882d07af43",
     :status ["done"]}))

(def disconnected-response {:status :disconnected})

(deftest parsing-response
  (testing "when remote call returns correct"
    (let [out (client/parse-response doc-response)]
      (is (= (:status out) :done))))
  (testing "when remote call returns error"
    (let [out (client/parse-response sample-error-response)]
      (is (= (:status out) :error))))
  (testing "cleaning unused keys"
    (let [out (client/parse-response doc-response)]
      (is (not (contains? out :id)))
      (is (not (contains? out :session)))))
  (testing "when response is just a status hash return it"
    (let [out (client/parse-response disconnected-response)]
      (is (= out disconnected-response)))))

(deftest error-handling
  (testing "when disconnected, returns a hash with :status => :disconnected"
    (client/set-remote 1)
    (let [result (#'client/eval-on-remote-nrepl :eval "(+ 1 2)")]
      (is (= result {:status :disconnected}))))
  (testing "when disconnected, returns a hash with :status => :not-connected"
    (client/disconnect)
    (let [result (#'client/eval-on-remote-nrepl :eval "(+ 1 2)")]
      (is (= result {:status :not-connected})))))
