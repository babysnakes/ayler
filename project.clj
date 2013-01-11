(defproject ayler "0.1.0-SNAPSHOT"
  :description "External namespace browswer for clojure projects."
  ;; :url "http://example.com/FIXME"
  :license {:name "GPLv3"
            :url "http://www.gnu.org/licenses/"}
  :dependencies [[org.clojure/clojure "1.4.0"]
                 [org.clojure/tools.nrepl "0.2.0-RC1"]
                 [ring/ring-core "1.1.6"]
                 [ring/ring-jetty-adapter "1.1.6"]
                 [enlive "1.0.1" :exclusions [org.clojure/clojure]]
                 [compojure "1.1.3"
                  :exclusions [org.clojure/tools.macro]]
                 [com.taoensso/timbre "1.2.0"]
                 [org.clojure/tools.cli "0.2.2"]]

  :profiles {:dev
             {:dependencies [[ring-mock "0.1.3"]]
              :plugins [[lein-pedantic "0.0.5"]]}}

  :main ayler.app
  :pedantic :warn
  :min-lein-version "2.0.0")
