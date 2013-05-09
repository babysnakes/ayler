(defproject ayler "0.3.0"
  :description "External namespace browswer for clojure projects."
  ;; :url "http://example.com/FIXME"
  :license {:name "GPLv3"
            :url "http://www.gnu.org/licenses/"}
  :dependencies [[org.clojure/clojure "1.4.0"]
                 [org.clojure/tools.nrepl "0.2.2"]
                 [ring/ring-core "1.1.8"]
                 [ring/ring-jetty-adapter "1.1.8"]
                 [compojure "1.1.5"
                  :exclusions [org.clojure/tools.macro]]
                 [com.taoensso/timbre "1.5.2"]
                 [org.clojure/tools.cli "0.2.2"]
                 [ring/ring-json "0.2.0"]
                 [crypto-random "1.1.0"]]

  :source-paths ["src/clojure"]
  :test-paths ["test/clojure"]
  
  :profiles {:dev
             {:dependencies [[ring-mock "0.1.3"]]
              :plugins [[lein-pedantic "0.0.5"]]
              :jvm-opts ["-Dayler.dev=t"]}}

  :main ayler.app

  :pedantic :warn
  :min-lein-version "2.0.0")
