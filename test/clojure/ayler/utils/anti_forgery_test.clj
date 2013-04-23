(ns ayler.utils.anti-forgery-test
  (:require [ayler.middleware.anti-forgery-angular :as angular])
  (:use clojure.test
        ayler.utils.anti-forgery))

(deftest anti-forgery-cookie-test
  (with-redefs [angular/*anti-forgery-token* "abcdefg"]
    (testing "when supplied response if string"
      (is (thrown? AssertionError (anti-forgery-cookie "hello world"))))
    (testing "regular functionality"
      (let [response (anti-forgery-cookie {:body "" :status 200})]
        (println response)
        (is (= (get-in response [:cookies "XSRF-TOKEN" :value]) "abcdefg"))))))
