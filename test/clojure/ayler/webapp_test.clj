(ns ayler.webapp-test
  (:require [ayler.webapp :as web]
            [clojure.test :refer (deftest testing is)]
            [ring.mock.request :refer (request)]))

(deftest custom-csrf-response
  (let [response (web/app (request :post "/api/disconnect/"))]
    (is (= (:status response) 403))
    (is (= (get-in response [:headers "Content-Type"]) "application/json; charset=utf-8"))))
