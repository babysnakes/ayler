(ns ayler.webapp
  "The webapp"
  (:require [net.cgrand.enlive-html :as html]
            [compojure.route :as route]
            [compojure.handler :as handler])
  (:use [compojure.core :only (defroutes GET)]))

(defn- render
  "convert the output of various enlive functions to string"
  [col]
  (apply str col))

(html/deftemplate layout "templates/index.html"
  [])

(defroutes app-routes
  (GET "/" [] (layout))
  (route/resources "/")
  (route/not-found "NOT FOUND"))

(def app
  (-> #'app-routes
      handler/site))
