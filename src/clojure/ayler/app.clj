(ns ayler.app
  (:require [ayler.nrepl-client :as client]
            ayler.version
            [ayler.webapp :refer (app)]
            [clojure.tools.cli :refer (cli)]
            [org.httpkit.server :refer (run-server close)]
            [taoensso.timbre :as timbre])
  (:gen-class))

(def app-args
  "The command line arguments"
  [["-p" "--port" "port to run on (default 5000)" :parse-fn #(Integer. %)]
   ["-P", "nrepl port to connect to" :parse-fn #(Integer. %)]
   ["-H", "nrepl host to connect to" :default "localhost"]
   ["--version" "display the version and exit"]
   ["-l" "--level" "log level (warn info debug trace)"
    :parse-fn keyword :default "info"]
   ["-h" "--help" "show this message"]])

(defn system
  "Returns a new instance of the application."
  []
  {:settings {:port 5000}})

(defn start
  "Start all components of the application. Returns the updates system."
  [system]
  (when-let [level (:log-level system)]
    (timbre/set-level! level))
  (when-let [remote (:remote system)]
    (apply client/set-remote remote))
  (let [server (run-server app (:settings system))]
    (timbre/info (str "Ayler started on port " (get-in system [:settings :port])))
    (assoc system :stop-server-fn server)))

(defn stop
  "Stops all components of the application. Returns the updated system."
  [system]
  (if-let [stop-server-fn (:stop-server-fn system)]
    (stop-server-fn))
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
        (#(if level (assoc % :log-level (keyword level)) %))
        (#(if P (assoc % :remote [P H]) %))
        (#(if port (assoc-in % [:settings :port] port) %))
        start)))
