(defproject ayler "0.4.0-SNAPSHOT"
  :description "External namespace browswer for clojure projects."
  ;; :url "http://example.com/FIXME"
  :license {:name "GPLv3"
            :url "http://www.gnu.org/licenses/"}
  :dependencies [[org.clojure/clojure "1.4.0"]
                 [org.clojure/tools.nrepl "0.2.3"]
                 [ring/ring-core "1.1.8"]
                 [ring/ring-jetty-adapter "1.1.8"]
                 [compojure "1.1.5"
                  :exclusions [org.clojure/tools.macro]]
                 [com.taoensso/timbre "2.1.2"]
                 [org.clojure/tools.cli "0.2.2"]
                 [ring/ring-json "0.2.0"]
                 [ring-anti-forgery "0.3.0-SNAPSHOT"]]

  :source-paths ["src/clojure"]
  :test-paths ["test/clojure"]

  :profiles {:dev {:source-paths ["src/dev"]
                   :dependencies [[ring-mock "0.1.5"]
                                  [org.clojure/tools.namespace "0.2.3"]
                                  [org.clojure/java.classpath "0.2.0"]]}
             :production {:main ayler.app}}

  :main ^{:skip-aot true} ayler.app ; avoid issues with tools.namespace.

  :min-lein-version "2.2.0")
