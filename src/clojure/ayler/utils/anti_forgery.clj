(ns ayler.utils.anti-forgery
  (:require [ring.middleware.anti-forgery :refer (*anti-forgery-token*)]
            [ring.util.codec :refer (url-decode)]))

(defn anti-forgery-cookie
  "Adds a cookie with and anti-forgery-token as it's value to the
  supplied response. Note that this response must be a full reponse
  (map), not just a string."
  [response]
  {:pre [(map? response)]}
  (-> response
      (assoc-in [:cookies "XSRF-TOKEN" :value] *anti-forgery-token*)))

(def access-denied-response
  {:status 403
   :headers {"Content-Type" "application/json; charset=utf-8"}
  :body "{\"error\": \"invalid token\"}"})

(defn token-header-extractor
  "A function to pass to wrap-anti-forgery as
  the :request-token-extractor. This matches the angular way of
  passing the token in a header."
  [request]
  (if-let [token (get-in request [:headers "x-xsrf-token"])]
    (url-decode token)))
