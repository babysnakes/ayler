(ns ayler.api
  "Handles all API calls."
  (:require [taoensso.timbre :as timbre]
            [ayler.ns-queries :as queries]
            [ayler.nrepl-client :as client])
  (:use [compojure.core :only (defroutes GET POST)]
        [ring.middleware.json :only (wrap-json-response wrap-json-params)]
        [ring.util.response :only (response)]
        [ring.util.codec :only (url-encode url-decode)]
        [ayler.helpers :only (var-route)]))

(defn- convert-to-name-and-url
  [col f]
  (timbre/trace (str "conver to name and url: " col))
  (->> col
       sort
       (map f)))

(defn- nses-to-name-and-url
  "converts the namespace list to a map with :name and encoded :url"
  [col]
  (convert-to-name-and-url
   col
   (fn [x] {:name (name x) :url (url-encode (name x))})))

(defn- vars-to-name-and-url
  "Converts the list of vars to :name and :url (with full url)"
  [namespace, col]
  (convert-to-name-and-url
   col
   (fn [x] {:name (name x) :url (str namespace "/" (url-encode (name x)))})))

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
      (apply-handler-if-successfull nses-to-name-and-url)))

(defn- all-namespaces
  []
  (-> (queries/query-all-namespaces)
      (apply-handler-if-successfull sort)))

(defn- ns-vars
  "Lists the vars in a namespace"
  [namespace]
  (-> (url-decode namespace)
      queries/query-namespace-publics
      (apply-handler-if-successfull (partial vars-to-name-and-url namespace))))

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
  (-> (var-route routes)
      wrap-json-response
      wrap-json-params))
