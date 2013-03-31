(ns ayler.middleware.anti-forgery-angular
  "Ring middleware to prevent CSRF attacks with an anti-forgery token.

This middleware is aimed specifically at AngularJS use of XSRF-TOKEN
cookie as a way of specifying the token and X-XSRF-TOKEN header as a
way to specify the token on every POST request.

Most of the functionality and ideas are wripped from the
ring-anti-forgery project:

https://github.com/weavejester/ring-anti-forgery

Eventually it should be extracted to it's own mini project."
  (:require [taoensso.timbre :as timbre]
            [crypto.random :as random]))

(def ^:dynamic
  *anti-forgery-token*
  "Binding that stores a anti-forgery token that must be included in
  POST forms if the handler is wrapped in wrap-anti-forgery.")

(defn- session-token
  [request]
  (or (get-in request [:session :xsrf-token])
      (random/base64 60)))

(defn- assoc-session-token
  [response request token]
  (let [old-token (get-in request [:session :xsrf-token])]
    (if (= old-token token)
      response
      (-> response
          (assoc :session (:session request))
          (assoc-in [:session :xsrf-token] token)))))

(defn- secure-eql?
  [^String a ^String b]
  (if (and a b (= (.length a) (.length b)))
    (zero? (reduce bit-or (map bit-xor (.getBytes a) (.getBytes b))))
    false))

(defn- valid-request?
  [request]
  (let [headers-token (-> request (get-in [:headers "X-XSRF-TOKEN"]))
        stored-token (session-token request)]
    (and headers-token
         stored-token
         (secure-eql? headers-token stored-token))))

(defn- post-request?
  [request]
  (= :post (:request-method request)))

(def ^:private access-denied
  {:status 403
   :headers {"Content-Type" "application/json"}
   :body ""})

(defn wrap-anti-forgery-angular
  "blah blah"
  [handler]
  (fn [request]
    (binding [*anti-forgery-token* (session-token request)]
      (if (and (post-request? request) (not (valid-request? request)))
        access-denied
        (if-let [response (handler request)]
          (assoc-session-token response request *anti-forgery-token*))))))
