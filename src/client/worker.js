self.addEventListener("push", (e) => {
  const { title, message, urlImage, ...data } = e.data.json();

  self.registration.showNotification(
    title, // title of the notification
    {
      body: message, //the body of the push notification
      data,
      image: urlImage,
      icon: urlImage, // icon
    }
  );
});

self.addEventListener("notificationclick", (event) => {
  // event.notification.close(); // Android needs explicit close.

  const url = event.notification.data.url;
  console.log(url);
  clients.openWindow(url);
  // event.waitUntil(
  //   clients.matchAll({ type: "window" }).then((windowClients) => {
  //     // Check if there is already a window/tab open with the target URL

  //     for (const client of windowClients) {
  //       //console.log(client);
  //       // If so, just focus it.
  //       if (client.url === url && "focus" in client) {
  //         return client.focus();
  //       }
  //     }

  //     // console.log("clients", clients);
  //     // If not, then open the target URL in a new window/tab.
  //     if (clients.openWindow) {
  //       return clients.openWindow(url);
  //     }
  //   })
  // );
});
