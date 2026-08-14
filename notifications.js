let notifTimer = null;

const SUPABASE_URL =
  "https://wqfsgzpgshdvyjsnmqds.supabase.co";

let supabaseClient = null;

/*
 * IMPORTANTE:
 * Si tu index.html ya crea un cliente Supabase global,
 * este archivo intentará reutilizarlo.
 */

async function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (window.supabaseClient) {
    supabaseClient = window.supabaseClient;
    return supabaseClient;
  }

  if (window.supabase) {
    if (window.SUPABASE_PUBLISHABLE_KEY) {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        window.SUPABASE_PUBLISHABLE_KEY
      );

      return supabaseClient;
    }
  }

  return null;
}


/* =========================================================
   SERVICE WORKER
========================================================= */

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration =
      await navigator.serviceWorker.register("./sw.js");

    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error(
      "No se pudo registrar el Service Worker:",
      error
    );

    return null;
  }
}


/* =========================================================
   NOTIFICACIONES
========================================================= */

async function requestNotifications() {
  if (!("Notification" in window)) {
    toast("Este navegador no admite notificaciones");
    return;
  }

  const permission =
    await Notification.requestPermission();

  updateNotificationStatus();

  if (permission !== "granted") {
    toast("Las notificaciones están desactivadas");
    return;
  }

  const success =
    await registerPushSubscription();

  if (success) {
    toast("🔔 Notificaciones activadas");
  } else {
    toast("No se pudo activar el sistema Push");
  }
}


function updateNotificationStatus() {
  const e =
    document.getElementById("notifyStatus");

  if (!e) return;

  if (!("Notification" in window)) {
    e.textContent =
      "Este navegador no admite notificaciones web.";

    return;
  }

  e.textContent =
    "Estado: " + Notification.permission;
}


/* =========================================================
   PUSH SUBSCRIPTION
========================================================= */

async function registerPushSubscription() {
  try {
    if (!("serviceWorker" in navigator)) {
      console.error(
        "Service Worker no disponible"
      );

      return false;
    }

    if (!("PushManager" in window)) {
      console.error(
        "Push API no disponible"
      );

      return false;
    }

    if (
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return false;
    }

    const client =
      await getSupabaseClient();

    if (!client) {
      console.error(
        "No existe cliente Supabase."
      );

      return false;
    }

    const {
      data: {
        user
      },
      error: authError
    } = await client.auth.getUser();

    if (authError || !user) {
      console.error(
        "No hay usuario autenticado.",
        authError
      );

      return false;
    }

    const registration =
      await registerServiceWorker();

    if (!registration) {
      return false;
    }

    const {
      data: {
        publicKey
      },
      error: keyError
    } = await client.functions.invoke(
      "get-vapid-public-key"
    );

    if (
      keyError ||
      !publicKey
    ) {
      console.error(
        "No se pudo obtener la clave VAPID:",
        keyError
      );

      return false;
    }

    const subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,

        applicationServerKey:
          urlBase64ToUint8Array(publicKey)
      });

    const json =
      subscription.toJSON();

    if (
      !json.endpoint ||
      !json.keys ||
      !json.keys.p256dh ||
      !json.keys.auth
    ) {
      console.error(
        "La suscripción Push está incompleta."
      );

      return false;
    }

    const {
      error
    } = await client
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
        "Error guardando Push subscription:",
        error
      );

      return false;
    }

    return true;

  } catch (error) {
    console.error(
      "Error registrando Push:",
      error
    );

    return false;
  }
}


/* =========================================================
   CONVERSIÓN VAPID
========================================================= */

function urlBase64ToUint8Array(base64String) {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      char => char.charCodeAt(0)
    )
  );
}


/* =========================================================
   INICIALIZACIÓN
========================================================= */

async function startNotifications() {
  clearInterval(notifTimer);

  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  await registerPushSubscription();

  /*
   * Dejamos el sistema local como respaldo
   * mientras el Push remoto queda activo.
   */
  notifTimer =
    setInterval(
      checkLocalNotifications,
      30000
    );

  checkLocalNotifications();
}


/* =========================================================
   RESPALDO LOCAL
========================================================= */

function checkLocalNotifications() {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const now = new Date();

  const d =
    LifeOS.dayIndex();

  const m =
    now.getHours() * 60 +
    now.getMinutes();

  const sent =
    JSON.parse(
      localStorage.getItem(
        "lifeos_sent"
      ) || "{}"
    );

  LifeOS.state.classes
    .filter(
      c => +c.day === d
    )
    .forEach(c => {
      const [
        h,
        mi
      ] =
        c.start
          .split(":")
          .map(Number);

      const target =
        h * 60 +
        mi -
        (
          +c.reminder ||
          LifeOS.state.profile.reminder ||
          90
        );

      const key =
        LifeOS.today() +
        "_" +
        c.id;

      if (
        m === target &&
        !sent[key]
      ) {
        new Notification(
          "LifeOS · Próxima clase",
          {
            body:
              `${c.title} comienza a las ${c.start}. ` +
              `Faltan ${reminderText(
                +c.reminder || 90
              )}.` +
              (
                c.room
                  ? ` Sala ${c.room}.`
                  : ""
              )
          }
        );

        sent[key] =
          Date.now();

        localStorage.setItem(
          "lifeos_sent",
          JSON.stringify(sent)
        );
      }
    });
}


/* =========================================================
   EXPORTS
========================================================= */

window.LifeOSNotifications = {
  requestNotifications,
  updateNotificationStatus,
  startNotifications,
  registerPushSubscription
};
