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
  (:require [ayler.nrepl-client :as client]
            [clojure.string :as str]
            [taoensso.timbre :as timbre]))

(defn- generic-response-parser
  "Handling the response from evaluating remotely. If the response
  contains no error information it uses the suplied handler to
  evaluate the response. Otherwise it uses it's own logic."
  [response handler]
  (timbre/trace (str "parsing response: " response))
  (case (:status response)
    :disconnected response
    :not-connected response
    :error (do
             (timbre/warn (str "Parsing error response: " (:err response)))
             {:status :error :response (:err response)})
    :done {:status :done :response (handler response)}))

(def ^:private value-response-handler
  #(first (:value %)))

(def ^:private publics-response-handler
  (comp keys value-response-handler))

(defn- compose-response
  "Compose a response from the supplied query and handler"
  [query handler]
  (-> (client/evaluate query)
      (generic-response-parser handler)))

(defn query-loaded-namespaces
  "Return a list of symbols of loaded namespaces."
  []
  (compose-response (pr-str '(map ns-name (all-ns))) value-response-handler))

(defn query-namespace-docstring
  "returns docstring for requested namespace (specify namespace as string)"
  [ns]
  (compose-response (pr-str `(:doc (meta (find-ns (symbol ~ns)))))
                    value-response-handler))

(defn query-docstring
  "returns docstring for requested var (specify var as string). It
  tries to mimic the output of the (doc) command - add argument list
  if it's a function, fix indentation, etc."
  [var]
  (compose-response (pr-str
                     `(-> (str (:arglists (meta (find-var (symbol ~var))))
                               "\n  "
                               (:doc (meta (find-var (symbol ~var)))))
                          (str/replace-first #"\A\n" "")
                          (str/replace-first #"\A  \Z" "")))
                    value-response-handler))

(defn query-source
  "returns the source for the requested function (specify var as string)"
  [f]
  (compose-response (pr-str `(clojure.repl/source-fn (symbol ~f)))
                    value-response-handler))

(defn query-namespace-publics
  "returns the public variables of the supplied namespace"
  [ns]
  (compose-response (pr-str `(ns-publics (symbol ~ns)))
                    publics-response-handler))

(defn query-all-namespaces
  "A list of all namespaces in classpath"
  []
  (let [query (pr-str '(do
                         (require 'clojure.tools.namespace.find)
                         (require 'clojure.java.classpath)
                         (clojure.tools.namespace.find/find-namespaces
                          (clojure.java.classpath/classpath))))]
    (compose-response query value-response-handler)))

(defn load-namespace
  "require namespace on remote nrepl"
  [namespace]
  (compose-response (pr-str `(require (quote ~(symbol namespace))))
                    value-response-handler))
