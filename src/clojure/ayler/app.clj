(ns ayler.app
  (:require [taoensso.timbre :as timbre]
            [ayler.nrepl-client :as client]
            ayler.version)
  (:use [ayler.webapp :only (app)]
        [ring.adapter.jetty :only (run-jetty)]
        [clojure.tools.cli :only (cli)])
  (:gen-class))

(def app-args
  "The command line arguments"
  [["-p" "--port" "port to run on (default 5000)" :parse-fn #(Integer. %)]
   ["-P", "nrepl port to connect to" :parse-fn #(Integer. %)]
   ["-H", "nrepl host to connect to" :default "localhost"]
   ["--version" "display the version and exit"]
   ["-l" "--level" "log level (warn info debug trace)" :parse-fn keyword]
   ["-h" "--help" "show this message"]])

(defn system
  "Returns a new instance of the application."
  []
  {:settings {:port 5000 :join? true}})

(defn start
  "Start all components of the application. Returns the updates system."
  [system]
  (when-let [remote (:remote system)]
    (apply client/set-remote remote))
  (when-let [level (:log-level system)]
    (timbre/set-level! level))
  (if-let [server (:server system)]
    (do
      (.start server)
      system)
    (assoc system :server (run-jetty app (:settings system)))))

(defn stop
  "Stops all components of the application. Returns the updated system."
  [system]
  (when-let [server (:server system)]
    (.stop server))
  (assoc system :remote (client/extract-remote)))

(defn -main
  "All starts here"
  [& args]
  (let [[arguments _ banner] (try (apply cli args app-args)
                                  (catch Exception e
                                    (println (str "Error: " (.getMessage e)))
                                    (println "run with -h for usage.")
                                    (System/exit 0)))
        {:keys [port level P H]} arguments
        system (system)]
    (when (contains? arguments :help)
      (println banner)
      (System/exit 0))
    (when (contains? arguments :version)
      (println (str "Ayler " ayler.version/version))
      (System/exit 0))
    (-> system
        (#(if level (assoc % :log-level level) %))
        (#(if P (assoc % :remote [P H]) %))
        (#(if port (assoc-in % [:settings :port] port) %))
        start)))
