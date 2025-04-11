"use client"

import { useEffect } from "react"
import { getToken, onMessage } from "firebase/messaging"
import { messaging } from "@/lib/firebase"
import { useSession } from "next-auth/react"

export const FCMTokenRegister = () => {
  const { data: session } = useSession()

  useEffect(() => {
    const registerFcm = async () => {
      if (!session?.user?.email) return

      try {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        })

        if (token) {
          console.log("✅ FCM token obtained:", token)

          await fetch("/api/users/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          })
        }
      } catch (err) {
        console.error("❌ Unable to get FCM token", err)
      }
    }

    registerFcm()
    console.log(Notification.permission);
    
console.log("entering");

    // 🟢 Foreground listener
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log(2+"0>"+payload);
      console.log("📬 Foreground push notification received:", payload)
console.log(3);

      // Optional native browser toast
      if (Notification.permission === "granted") {
        console.log(5);
        console.log(10);
        
        console.log("payload is",payload);
        
        new Notification(payload.notification?.title || "New Notification", {
          body: payload.notification?.body || "",
          icon: "/favicon.ico",
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return null
}
