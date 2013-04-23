(ns ayler.helpers
  "Just various general helpers that can be used from anywhere.")

(defn development?
  "Are we in development mode?"
  []
  (System/getProperty "ayler.dev"))

(defmacro var-route
  "Adds routes either directly or as vars according to the environment.
   This helps reloading routes on change in evelopment. Searches for the
   ayler.dev system property."
  [route]
  (if (development?)
    `(var ~route)
    route))
