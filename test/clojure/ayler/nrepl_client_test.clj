(ns ayler.nrepl-client-test
  (:require ayler.test-helpers
   [ayler.nrepl-client :as client]
   [ayler.fixtures :as f])
  (:use clojure.test))

(deftest parsing-response
  (testing "when remote call returns correct"
    (let [out (client/parse-response f/raw-doc-response)]
      (is (= (:status out) :done))))
  (testing "when remote call returns error"
    (let [out (client/parse-response f/raw-sample-error-response)]
      (is (= (:status out) :error))))
  (testing "cleaning unused keys"
    (let [out (client/parse-response f/raw-doc-response)]
      (is (not (contains? out :id)))
      (is (not (contains? out :session)))))
  (testing "when response is just a status hash return it"
    (let [out (client/parse-response f/disconnected-response)]
      (is (= out f/disconnected-response)))))

(deftest error-handling
  (with-redefs [client/_remote (atom [])] ;; do not change running configuration.
    (testing "various _remote states"
      (testing "when disconnected, returns a hash with :status => :disconnected"
        (client/set-remote 1 "localhost")
        (let [result (#'client/eval-on-remote-nrepl :eval "(+ 1 2)")]
          (is (= result {:status :disconnected}))))
      (testing "when disconnected, returns a hash with :status => :not-connected"
        (client/disconnect)
        (let [result (#'client/eval-on-remote-nrepl :eval "(+ 1 2)")]
          (is (= result {:status :not-connected})))))))

(deftest extract-remote
  (testing "extract real values from _remote"
    (with-redefs [client/_remote (atom [:port 2000 :host "localhost"])]
      (is (= (client/extract-remote) [2000 "localhost"]))))
  (testing "returns null if port/host not configured"
    (with-redefs [client/_remote (atom [])]
      (is (nil? (client/extract-remote))))))
