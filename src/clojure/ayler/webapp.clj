(ns ayler.webapp
  "The webapp"
  (:require [ring.util.response :refer (resource-response)]
            [compojure.route :as route]
            [compojure.handler :as handler]
            [ayler.api :as api])
  (:use [compojure.core :only (defroutes GET context)]
        [ayler.helpers :only (var-route)]
        ayler.middleware.anti-forgery-angular
        ayler.utils.anti-forgery))

(defn- render
  "convert the output of various enlive functions to string"
  [col]
  (apply str col))

(defroutes app-routes
  (GET "/" _ (anti-forgery-cookie (resource-response "/public/index.html")))
  (context "/api" [] (var-route api/app))
  (route/resources "/")
  (route/not-found "NOT FOUND"))

(def pre-app
  "That's the only way I found to be able to hot-reload the custom middlewares :("
  (-> (var-route app-routes)
      wrap-anti-forgery-angular))

(def app
  (handler/site (var-route pre-app)))
