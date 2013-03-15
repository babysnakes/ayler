(ns ayler.webapp
  "The webapp"
  (:require [ring.util.response :refer (resource-response)]
            [compojure.route :as route]
            [compojure.handler :as handler])
  (:use [compojure.core :only (defroutes GET)]))

(defn- development?
  "Are we in development mode?"
  []
  (System/getProperty "ayler.dev"))

(defmacro var-route
  "Adds routes either directly or as vars according to the environment.
   This helps reloading routes on change in evelopment. Searches for the
   ayler.dev system property."
  [route]
  (if (development?)
    `(var ~route)
    route))

(defn- render
  "convert the output of various enlive functions to string"
  [col]
  (apply str col))

(defroutes app-routes
  (GET "/" _ (resource-response "/public/index.html"))
  (route/resources "/")
  (route/not-found "NOT FOUND"))

(def app
  (-> (var-route app-routes)
      handler/site))
