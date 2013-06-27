(ns ayler.webapp
  "The webapp"
  (:require [ring.util.response :refer (resource-response)]
            [compojure.route :as route]
            [compojure.handler :as handler]
            [ayler.api :as api])
  (:use [compojure.core :only (defroutes GET context)]
        [ring.middleware.anti-forgery :only (wrap-anti-forgery)]
        ayler.utils.anti-forgery))

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
      (wrap-anti-forgery {:access-denied-response access-denied-response
                          :request-token-extractor token-header-extractor})
      handler/site))
