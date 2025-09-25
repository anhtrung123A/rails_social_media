import "@hotwired/turbo-rails"
import "controllers"
import "@rails/ujs"
import "channels"
import "./notifications.js"
// ✅ Import named exports directly from the module specifier
// import { initializeApp } from "firebase/app"
// import { getMessaging, getToken, onMessage } from "firebase/messaging"

// const firebaseConfig = {
//   apiKey: "AIzaSyDKvnVLHanhgFHeU6h_y7XnuGONhSKC4aw",
//   authDomain: "rails-social-media-wpn.firebaseapp.com",
//   projectId: "rails-social-media-wpn",
//   storageBucket: "rails-social-media-wpn.firebasestorage.app",
//   messagingSenderId: "630991265303",
//   appId: "1:630991265303:web:406a59f72cbd02be4f0652",
// }

// const app = initializeApp(firebaseConfig)
// const messaging = getMessaging(app)
// const VAPID_KEY = "BCqnAgHYmphEL-hLXdkXmDSJFWoNvUybItQTkrSGbyLleyrz3e7rNhCVY4qdCBiod0xFIArc9ua5m9_9nxswO4g"

// async function requestFCMToken() {
//   try {
//     const permission = await Notification.requestPermission()
//     if (permission !== "granted") {
//       console.log("Notification permission not granted")
//       return null
//     }

//     const token = await getToken(messaging, { vapidKey: VAPID_KEY })
//     console.log("✅ FCM Token:", token)
//     return token
//   } catch (err) {
//     console.error("Error getting FCM token:", err)
//   }
// }
// onMessage(async remoteMessage => {
//     console.log(1)
// })
// // Run on page load
// document.addEventListener("turbo:load", () => {
//   requestFCMToken()
// })