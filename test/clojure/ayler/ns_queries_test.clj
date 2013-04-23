(ns ayler.ns-queries-test
  (:require [ayler.ns-queries :as q]
            [ayler.fixtures :as f])
  (:use clojure.test))

(deftest generic-reponse-parsing
  (testing "when remote command didn't run, just return the status"
    (is (= (#'q/generic-response-parser f/disconnected-response #(%))
           f/disconnected-response))
    (is (= (#'q/generic-response-parser f/not-connected-response #(%))
           f/not-connected-response)))
  (testing "when remote repl returned error return the message and status"
    (is (= (#'q/generic-response-parser f/require-error-response #(%))
           f/require-error-query-parsed)))
  (testing "when remove evaluation was successfull apply the provided function"
    (is (= (#'q/generic-response-parser f/successfull-evaluation-value-response
                                        (fn [x] 1))
           '{:status :done :response 1}))))

(deftest value-response-test
  (testing "it should extract the :value out of value-based responses"
    (is (= (#'q/value-response-handler f/successfull-evaluation-value-response) 3))))
