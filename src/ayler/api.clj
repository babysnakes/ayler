(ns ayler.api
  "Handles all API calls."
  (:require [taoensso.timbre :as timbre]
            [ayler.ns-queries :as queries])
  (:use [compojure.core :only (defroutes GET)]
        [ring.middleware.json :only (wrap-json-response)]
        [ring.util.response :only (response)]
        [ring.util.codec :only (url-encode url-decode)]))

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

(defroutes routes
  (GET "/ls" _ (response (loaded-namespaces)))
  (GET "/ls/:namespace" [namespace] (response (ns-vars namespace)))
  (GET "/doc/:namespace" [namespace] (response (ns-doc namespace)))
  (GET "/doc/:namespace/:var" [namespace var]
       (response (var-doc namespace var)))
  (GET "/source/:namespace/:var" [namespace var]
       (response (var-source namespace var))))

(def app
  (wrap-json-response routes))