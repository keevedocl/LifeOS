let notifTimer = null;

const VAPID_PUBLIC_KEY =
  "PEGA_AQUI_TU_VAPID_PUBLIC_KEY";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (
    base64String +
    padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);

  return Uint8Array.from(
    [...rawData].map(char => char.charCodeAt(0))
  );
}

async function requestNotifications() {
  if (!("Notification" in window)) {
    toast("Este navegador no admite notificaciones");
    return;
  }

  try {
    const permission =
      await Notification.requestPermission();

    updateNotificationStatus();

    if (permission !== "granted") {
      toast("Las notificaciones no fueron activadas");
      return;
    }

    await registerPushSubscription();

    toast("🔔 Notificaciones activadas");

  } catch (error) {
    console.error(error);
    toast("No se pudieron activar las notificaciones");
  }
}

function updateNotificationStatus() {
  const e = document.getElementById("notifyStatus");

  if (!e) return;

  if (!("Notification" in window)) {
    e.textContent =
      "Este navegador no admite notificaciones web.";

    return;
  }

  e.textContent =
    "Estado: " + Notification.permission;
}

async function registerPushSubscription() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker no disponible");
  }

  const registration =
    await navigator.serviceWorker.ready;

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,

        applicationServerKey:
          urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
  }

  const json = subscription.toJSON();

  const user =
    await LifeOS.getCurrentUser();

  if (!user) {
    throw new Error(
      "No hay usuario autenticado."
    );
  }

  const { error } =
    await LifeOS.supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth
        },
        {
          onConflict: "endpoint"
        }
      );

  if (error) {
    console.error(
      "Error guardando suscripción:",
      error
    );

    throw error;
  }

  console.log(
    "Suscripción Push guardada correctamente."
  );
}

function startNotifications() {
  clearInterval(notifTimer);

  notifTimer =
    setInterval(
      checkNotifications,
      30000
    );

  checkNotifications();
}

function checkNotifications() {
  /*
   * La comprobación real de horarios
   * ahora la hace Supabase Edge Function.
   *
   * Esta función se mantiene para compatibilidad
   * con LifeOS.
   */
}

window.LifeOSNotifications = {
  requestNotifications,
  updateNotificationStatus,
  startNotifications,
  registerPushSubscription
};
