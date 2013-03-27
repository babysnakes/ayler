(ns ayler.api-test
  (:require [ayler.api :as api])
  (:use clojure.test))

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