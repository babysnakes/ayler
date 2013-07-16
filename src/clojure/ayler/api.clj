(ns ayler.api
  "Handles all API calls."
  (:require [ayler.ns-queries :as queries]
            [ayler.nrepl-client :as client]
            [compojure.core :refer (defroutes GET POST)]
            [ring.middleware.json :refer (wrap-json-response wrap-json-params)]
            [ring.util.codec :refer (url-encode url-decode)]
            [ring.util.response :refer (response)]
            [taoensso.timbre :as timbre]))

(defn- apply-handler-if-successfull
  "If the provided response was successfull it applies the provided
  handler to the :response key. Otherwise it returns it as is."
  [response handler]
  (timbre/debug (str "checking apply-handler in: " response))
  (case (:status response)
    :done (update-in response [:response] handler)
    response))

(defn- construct-varname
  "Construct a decoded varname from namespace and vars received as url"
  [namespace var]
  (str (url-decode namespace) "/" (url-decode var)))

(defn- loaded-namespaces
  []
  (-> (queries/query-loaded-namespaces)
      (apply-handler-if-successfull sort)))

(defn- all-namespaces
  []
  (-> (queries/query-all-namespaces)
      (apply-handler-if-successfull sort)))

(defn- ns-vars
  "Lists the vars in a namespace"
  [namespace]
  (-> (url-decode namespace)
      queries/query-namespace-publics
      (apply-handler-if-successfull sort)))

(defn- ns-doc
  "Returns the docstring of namespace"
  [namespace]
  (queries/query-namespace-docstring (url-decode namespace)))

(defn- var-doc
  "Returns the docstring of a fully qualified var name"
  [namespace var]
  (->  (construct-varname namespace var)
       (queries/query-docstring)))

(defn- var-source
  "returns the source of a fully qualified var name"
  [namespace var]
  (-> (construct-varname namespace var)
      (queries/query-source)))

(defn- remote-require
  [namespace]
  (timbre/debug (str "require on remote nrepl: " namespace))
  (-> namespace
      url-decode
      queries/require-namespace))

(defn- set-remote
  [port host]
  (if (empty? port)
    (-> (response "Error! port is required!")
        (assoc :status 400))
    (let [host (if (empty? host) "localhost" host)
          port (Integer. port)]
      (-> (client/set-remote port host)
          response))))

(defroutes routes
  (GET "/api/ls" _ (response (loaded-namespaces)))
  (GET "/api/lsall" _ (response (all-namespaces)))
  (GET "/api/ls/:namespace" [namespace] (response (ns-vars namespace)))
  (GET "/api/doc/:namespace" [namespace] (response (ns-doc namespace)))
  (GET "/api/doc/:namespace/:var" [namespace var]
       (response (var-doc namespace var)))
  (GET "/api/source/:namespace/:var" [namespace var]
       (response (var-source namespace var)))
  (POST "/api/require/:namespace" [namespace :as request]
        (response (remote-require namespace)))
  (POST "/api/remote/" [port host :as request] (set-remote port host))
  (POST "/api/disconnect/" _ (response (client/disconnect))))

(def app
  (-> routes
      wrap-json-response
      wrap-json-params))
