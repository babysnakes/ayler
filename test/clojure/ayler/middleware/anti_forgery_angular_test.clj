(ns ayler.middleware.anti-forgery-angular-test
  (:use clojure.test
        ring.mock.request
        ayler.middleware.anti-forgery-angular))

(deftest forgery-protection-test
  (let [response {:status 200, :headers {}, :body "Foo"}
        handler  (wrap-anti-forgery-angular (constantly response))]
    (are [status req] (= (:status (handler req)) status)
         ;; request without token headers
         403 (request :post "/")
         ;; request with headers but no session (fake token)
         403 (-> (request :post "/")
                 (assoc-in [:headers "x-xsrf-tokennre"] "fake-token:-not-in-session"))
         ;; different token in header and session
         403 (-> (request :post "/")
                 (assoc :session {:xsrf-token "saved-token"})
                 (assoc-in [:headers "x-xsrf-token"] "fake-token"))
         ;; valid request
         200 (-> (request :post "/")
                 (assoc :session {:xsrf-token "saved-token"})
                 (assoc-in [:headers "x-xsrf-token"] "saved-token"))
         200 (-> (request :post "/")
                 (assoc :session {:xsrf-token "58CHwYz/smVZEwwIz+l1J8Wjf/UCnlLTZzPggDRRIVk9DZniVs6JCFDZgMray2Ack9X0Nz4wPpGmoR7I"})
                 (assoc-in [:headers "x-xsrf-token"] "58CHwYz%2FsmVZEwwIz%2Bl1J8Wjf%2FUCnlLTZzPggDRRIVk9DZniVs6JCFDZgMray2Ack9X0Nz4wPpGmoR7I")))))

(deftest token-in-session-test
  (let [response {:status 200, :headers {}, :body "Foo"}
        handler  (wrap-anti-forgery-angular (constantly response))]
    (testing "generation of token on new sessions"
      (is (contains? (:session (handler (request :get "/"))) :xsrf-token)))
    (testing "new generation of xsrf token on each request"
      (is (not= (get-in (handler (request :get "/")) [:session :xsrf-token])
                (get-in (handler (request :get "/")) [:session :xsrf-token]))))))

(deftest token-binding-test
  (letfn [(handler [request]
            {:status 200
             :headers {}
             :body *anti-forgery-token*})]
    (let [response ((wrap-anti-forgery-angular handler) (request :get "/"))]
      (is (= (get-in response [:session :xsrf-token])
             (:body response))))))

(deftest nil-response-test
  (letfn [(handler [request] nil)]
    (let [response ((wrap-anti-forgery-angular handler) (request :get "/"))]
      (is (nil? response)))))

(deftest single-token-per-session-test
  (let [expected {:status 200, :headers {}, :body "Foo"}
        handler  (wrap-anti-forgery-angular (constantly expected))
        actual   (handler
                  (-> (request :get "/")
                      (assoc-in [:session :xsrf-token] "foo")))]
    (is (= actual expected))))

(deftest not-overwrite-session-test
  (let [response {:status 200 :headers {} :body nil}
        handler  (wrap-anti-forgery-angular (constantly response))
        session  (:session (handler (-> (request :get "/")
                                        (assoc-in [:session "foo"] "bar"))))]
    (is (contains? session :xsrf-token))
    (is (= (session "foo") "bar"))))
