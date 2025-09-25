# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin "@rails/ujs", to: "rails-ujs.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "@rails/actioncable", to: "actioncable.esm.js"
pin_all_from "app/javascript/channels", under: "channels"
pin "firebase/app", to: "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js"
pin "firebase/analytics", to: "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js"
pin "firebase/messaging", to: "https://www.gstatic.com/firebasejs/12.3.0/firebase-messaging.js"
