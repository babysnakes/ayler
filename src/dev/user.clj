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
                    (assoc :remote [6001 "localhost"])
                    (assoc-in [:settings :join?] false)))))

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

(defn find-all-tests
  "Find all tests under test/"
  []
  (let [test-dir (io/file "test/")]
    (find-namespaces-in-dir test-dir)))

(defn find-all-sources
  "Finds all namespaces under src/"
  []
  (let [src-dir (io/file "src/clojure")]
    (find-namespaces-in-dir src-dir)))

;; Can not require these nses by running in the script. why?
(comment
  (map require (find-all-tests))
  (map require (find-all-sources)))

(defn run-all-tests
  "Runs all tests! requires them to be loaded manually first (WHY?)."
  []
  (apply test/run-tests (find-all-tests)))

;; Local Variables:
;; peval: (define-clojure-indent
;;         (alter-var-root 'defun))
;; End:
