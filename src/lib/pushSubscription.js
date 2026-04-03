import { subscribePush } from '../api'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export async function registerPushSubscription(token) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[Push] Not supported in this browser')
    return
  }

  if (!VAPID_PUBLIC_KEY) {
    console.log('[Push] VITE_VAPID_PUBLIC_KEY not set')
    return
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('[Push] Permission denied')
      return
    }

    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    const sub = subscription.toJSON()
    await subscribePush({
      endpoint: sub.endpoint,
      keys: sub.keys,
    }, token)

    console.log('[Push] Subscribed successfully')
  } catch (err) {
    console.error('[Push] Registration failed:', err)
  }
}
