(ns ayler.ns-queries
  "All the queries needed to be performed and parsed remotely in this
  application.

  All public functions in this namespace returns a hash with the
  following keys:
  * :status - indicates the status of the response (:done, :error,
              :not-connected, :disconnected)
  * :response - In case of :done status this is the required response.
                In case of :error status this is the error message.
                Otherwise nil."
  (:require ayler.test-helpers
            [ayler.nrepl-client :as client]
            [taoensso.timbre :as timbre]))

(defn- generic-response-parser
  "Handling the response from evaluating remotely. If the response
  contains no error information it uses the suplied handler to
  evaluate the response. Otherwise it uses it's own logic."
  [response handler]
  (case (:status response)
    :disconnected response
    :not-connected response
    :error (do
             (timbre/warn (str "Parsing error response: " (:err response)))
             {:status :error :response (:err response)})
    :done {:status :done :response (handler response)}))

(def ^:private value-response-handler
  #(first (:value %)))

(defmacro ^:private compose-response
  "Compose a response from the supplied query and handler"
  [query handler]
  `(-> (client/evaluate-remote ~query)
       (generic-response-parser ~handler)))

(defn query-loaded-namespaces
  "Return a list of symbols of loaded namespaces."
  []
  (compose-response (map ns-name (all-ns)) value-response-handler))
