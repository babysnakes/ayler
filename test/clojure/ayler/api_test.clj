(ns ayler.api-test
  (:require [ayler.api :as api]
            [ayler.nrepl-client :as nclient]
            [clojure.test :refer (deftest testing is)]))

(deftest nses-to-name-and-url
  (testing "when input is nil"
    (is (= (#'api/nses-to-name-and-url nil) '())))
  (testing "escaping urls"
    (let [result (#'api/nses-to-name-and-url '(hello world!))]
      (is (= (:url (second result)) "world%21"))))
  (testing "sorting namespaces"
    (let [result (#'api/nses-to-name-and-url '(world hello))]
      (is (= (:name (first result)) "hello")))))

(deftest vars-to-name-and-url
  (testing "when input is nil"
    (is (= (#'api/vars-to-name-and-url nil nil) '())))
  (testing "escaping urls"
    (let [result (#'api/vars-to-name-and-url "ns" '(hello world!))]
      (is (= (:url (second result)) "ns/world%21"))))
  (testing "sorting namespaces"
    (let [result (#'api/vars-to-name-and-url "ns" '(world hello))]
      (is (= (:name (first result)) "hello")))))

(deftest only-applying-parser-to-successfull-results
  (testing "un-successfull result"
    (let [data {:status :error :response "data"}]
      (is (= (#'api/apply-handler-if-successfull data #(%)) data))))
  (testing "successfull result"
    (is (= (#'api/apply-handler-if-successfull {:status :done :response [4 5]}
                                               (fn [x] (map inc x)))
           {:status :done :response [5 6]}))))

(deftest set-remote
  (let [response (#'api/set-remote "5000" "localhost")
        data @#'nclient/_remote]
    ;; TODO: why do I have to deref it twice?
    (is (= (second @data) 5000)
        "converts strings to integers")
    (is (map? response) "returns map")
    (is (= (:status response) 200) "status on success"))
  (testing "handle empty ports with invalid request"
    (let [response (#'api/set-remote "" "")]
      (is (= (:status response) 400))
      (is (re-find #"required" (:body response))))))

