(ns ayler.utils.anti-forgery
  (:use [ayler.middleware.anti-forgery-angular :only (*anti-forgery-token*)]))

(defn anti-forgery-cookie
  "Adds a cookie with and anti-forgery-token as it's value to the
  supplied response. Note that this response must be a full reponse
  (map), not just a string."
  [response]
  {:pre [(map? response)]}
  (-> response
      (assoc-in [:cookies "XSRF-TOKEN" :value] *anti-forgery-token*)))
