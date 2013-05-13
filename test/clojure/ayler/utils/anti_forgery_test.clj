(ns ayler.utils.anti-forgery-test
  (:require [ring.middleware.anti-forgery])
  (:use clojure.test
        ayler.utils.anti-forgery))

(deftest anti-forgery-cookie-test
  (with-redefs [ring.middleware.anti-forgery/*anti-forgery-token* "abcdefg"]
    (testing "when supplied response if string"
      (is (thrown? AssertionError (anti-forgery-cookie "hello world"))))
    (testing "regular functionality"
      (let [response (anti-forgery-cookie {:body "" :status 200})]
        (println response)
        (is (= (get-in response [:cookies "XSRF-TOKEN" :value]) "abcdefg"))))))

(deftest token-extractor-test
  (testing "it extracts the token (if exists)"
    (is (nil? (token-header-extractor {:headers {}})))
    (is (= "some-token"
           (token-header-extractor {:headers {"x-xsrf-token" "some-token"}}))))
  (testing "it decodes the token"
    (is (= "some/token"
           (token-header-extractor {:headers {"x-xsrf-token" "some%2Ftoken"}})))))
