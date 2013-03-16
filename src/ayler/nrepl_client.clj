(ns ayler.nrepl-client
  "Helper functions for evaluating code on a remote nrepl server."
  (:require [clojure.tools.nrepl :as repl]
            [taoensso.timbre :as timbre]))

(defonce ^:private _remote (atom []))

(defn set-remote
  "Set the host and port of the remote address"
  ([port] (set-remote port "localhost"))
  ([port host] (reset! _remote [:port port :host host])))

(defn disconnect
  "disconnect from server"
  []
  (reset! _remote []))

(defn eval-on-remote-nrepl
  "Evaluates the op and code on the remote nrepl.

  * op - nrepl :op, usually :eval
  * code - the code to evaluate (encoded with pr-str)

  Returns:
  * If _remote is not configured => {:status :not-connected}
  * If a connection error occured => {:status :disconnected}
  * Otherwise returns the output of the remote evaluation."
  [op code]
  (if (empty? @_remote)
    {:status :not-connected}
    (try
      (with-open [conn (apply repl/connect @_remote)]
        (-> (repl/client conn 1000)
            (repl/message {:op op :code code})
            doall))
      (catch java.net.ConnectException e
        (do (timbre/warn (str "Error connecting to: " @_remote
                              " -> " (.getMessage e)))
            {:status :disconnected})))))

(defn parse-response
  "Parses a response from evaluating remotely and returns a hash with
  descriptive status and the response data. See the doc for
  'eval-on-remote-nrepl' for description of spacial status return."
  [response]
  (if (map? response)
    response
    (let [combined (-> (map repl/read-response-value response)
                       repl/combine-responses
                       (dissoc :id :session))]
      (if (= (:status combined) #{"done"})
        (assoc combined :status :done)
        (assoc combined :status :error)))))

(def execute
  "Composes parse-response with eval-on-remote-nrepl."
  (comp parse-response eval-on-remote-nrepl))

(defmacro evaluate-remote
  "Converts the supplied forms to strings and runs 'execute' on them."
  [code]
  `(execute :eval ~(pr-str code)))
