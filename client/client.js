const publicVapidKey =
  "BKpoazSjyUjbJ0L1fzFOMpDWw8aTefNmm420os27FX3bHj-dtwAfYzUNFsVfrbwuwYIAI3HbPYTlMWlV8vD6NxI";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// const triggerPush = document.querySelector(".trigger-push");

async function triggerPushNotification() {
  if ("serviceWorker" in navigator) {
    const register = await navigator.serviceWorker.register("/worker.js", {
      scope: "/",
    });

    // const name = document.getElementById("name").value;
    // const email = document.getElementById("email").value;
    // const shop = document.getElementById("shop").value;

    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });

    await fetch("/subscribe", {
      method: "POST",
      body: JSON.stringify({ subscription }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    alert("Service Worker is not supported in this browser");
    console.error("Service workers are not supported in this browser");
  }
}

triggerPushNotification().catch((error) => console.error(error));
