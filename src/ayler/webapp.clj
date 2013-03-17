(ns ayler.webapp
  "The webapp"
  (:require [ring.util.response :refer (resource-response)]
            [compojure.route :as route]
            [compojure.handler :as handler])
  (:use [compojure.core :only (defroutes GET)]
        [ayler.helpers :only (var-route)]))

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
