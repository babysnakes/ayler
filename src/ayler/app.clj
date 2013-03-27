(ns ayler.app
  (:require [taoensso.timbre :as timbre]
            [ayler.nrepl-client :as client])
  (:use [ayler.webapp :only (app)]
        [ring.adapter.jetty :only (run-jetty)]
        [clojure.tools.cli :only (cli)])
  (:gen-class))

(def app-args
  "The command line arguments"
  [["-p" "--port" "port to run on (default 5000)" :parse-fn #(Integer. %)]
   ["-P", "nrepl port to connect to (required)" :parse-fn #(Integer. %)]
   ["-H", "nrepl host to connect to" :default "localhost"]
   ["-l" "--level" "log level (warn info debug trace)" :parse-fn keyword]
   ["-h" "--help" "show this message"]])

(defn run-server
  "Start the jetty server"
  ([] (run-server {}))
  ([options]
     (let [opts (merge {:port 5000 :join? false} options)]
       (defonce server (run-jetty app opts)))))

(defn -main
  "All starts here"
  [& args]
  (let [[arguments _ banner] (apply cli args app-args)
        options (merge {:join? true} (select-keys arguments [:port]))]
    (when (contains? arguments :help)
      (println banner)
      (System/exit 0))
    (when (contains? arguments :level)
      (timbre/set-level! (:level arguments)))
    (when-not (contains? arguments :P)
      (println "Error: nrepl port (-P) is required!")
      (println banner)
      (System/exit 1))
    (client/set-remote (:P arguments) (:H arguments))
    (run-server options)))
