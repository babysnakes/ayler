(ns ayler.app
  (:use [ayler.webapp :only (app)]
        [ring.adapter.jetty :only (run-jetty)]))

(defn run-server
  "Start the jetty server"
  ([] (run-server {}))
  ([options]
     (let [opts (merge {:port 5000 :join? false} options)]
       (defonce server (run-jetty app opts)))))

(defn -main
  "All starts here"
  [& args]
  ;; allow configurations via CLI options.
  (let [options {:join? true}]
    (run-server options)))
