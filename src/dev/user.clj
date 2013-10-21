(ns user
  (:require [ayler.app :as app]
            [clojure.java.io :as io]
            [clojure.test :as test]
            [clojure.tools.namespace.repl :refer (refresh refresh-all)]
            [clojure.tools.namespace.find :refer (find-namespaces-in-dir)]))

(def system nil)

(defn init
  "Construct development env."
  []
  (alter-var-root #'system
    (constantly (-> (app/system)
                    (assoc :remote [6001 "localhost"])))))

(defn start
  "Starts the development system"
  []
  (alter-var-root #'system app/start))

(defn stop
  "Stops the development system"
  []
  (alter-var-root #'system app/stop))

(defn go
  "Initialize and run"
  []
  (init)
  (start))

(defn reset []
  (stop)
  (refresh :after 'user/go))

(defn find-nses-in-path
  "Finds all namespaces in supplied path."
  [path]
  (let [dir (io/file path)]
    (find-namespaces-in-dir dir)))

(defn run-all-tests
  "Runs all tests! requires them to be loaded manually first (WHY?)."
  []
  (apply test/run-tests (find-nses-in-path "test/")))

;; Local Variables:
;; peval: (define-clojure-indent
;;         (alter-var-root 'defun))
;; End:
