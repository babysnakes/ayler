(ns ayler.webapp
  "The webapp"
  (:require [ayler.api :as api]
            [ayler.utils.anti-forgery :refer :all]
            [compojure.core :refer (defroutes GET context)]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [ring.middleware.anti-forgery :refer (wrap-anti-forgery)]
            [ring.util.response :refer (resource-response)]))

(defn- render
  "convert the output of various enlive functions to string"
  [col]
  (apply str col))

(defroutes app-routes
  (GET "/" _ (anti-forgery-cookie (resource-response "/public/index.html")))
  api/app
  (route/resources "/")
  (route/not-found "NOT FOUND"))

(def app
  (-> app-routes
      (wrap-anti-forgery {:error-response access-denied-response})
      handler/site))
