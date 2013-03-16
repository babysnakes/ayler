(ns ayler.test-helpers
  (:require [taoensso.timbre :as timbre]))

;; workaround for reducing stdout logging in test mode.
(defonce log-config
  (timbre/set-level! :fatal))
