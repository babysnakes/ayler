(ns ayler.app
  (:require [taoensso.timbre :as timbre]
            [ayler.nrepl-client :as client])
  (:use [ayler.webapp :only (app)]
        [ring.adapter.jetty :only (run-jetty)]
        [clojure.tools.cli :only (cli)]
        ayler.version)
  (:gen-class))

(def app-args
  "The command line arguments"
  [["-p" "--port" "port to run on (default 5000)" :parse-fn #(Integer. %)]
   ["-P", "nrepl port to connect to" :parse-fn #(Integer. %)]
   ["-H", "nrepl host to connect to" :default "localhost"]
   ["--version" "display the version and exit"]
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
  (let [[arguments _ banner] (try (apply cli args app-args)
                                  (catch Exception e
                                    (println (str "Error: " (.getMessage e)))
                                    (println "run with -h for usage.")
                                    (System/exit 0)))
        options (merge {:join? true} (select-keys arguments [:port]))]
    (when (contains? arguments :help)
      (println banner)
      (System/exit 0))
    (when (contains? arguments :version)
      (println (str "Ayler " version))
      (System/exit 0))
    (when (contains? arguments :level)
      (timbre/set-level! (:level arguments)))
    (when (contains? arguments :P)
      (client/set-remote (:P arguments) (:H arguments)))
    (run-server options)))
