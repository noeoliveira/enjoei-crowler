require("dotenv").config();
import "./firebase";

import express from "express";
import webPush from "web-push";
import hash from "object-hash";
import path from "path";
import { getDatabase } from "firebase-admin/database";
import { listener, monitor } from "./monitor";
import puppeteer from "./puppeteer";

async function init() {
  const cluster = await puppeteer.init();
  monitor(cluster, process.env.SHOP as string);
  await cluster.idle();
}
init();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

const db = getDatabase();

const publicVapidKey = process.env.PUBLIC_VAPID_KEY as string;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY as string;

webPush.setVapidDetails(
  "mailto:noe.oliveira1995@gmail.com",
  publicVapidKey,
  privateVapidKey
);

app.post("/subscribe", async (req, res) => {
  const { subscription, ...data } = req.body;

  res.status(201).json({});

  await saveNotification(data, subscription);
});

app.use(express.static(path.join(__dirname, "client")));

app.set("port", process.env.PORT || 5000);

app.listen(app.get("port"), () => {
  console.log(`Express running`);
});

notify();

function notify() {
  const ref = db.ref(`notifications`);
  ref.on("child_added", async (snapshot) => {
    const subscription = snapshot.val();

    listener(process.env.SHOP as string, async (product) => {
      const payload = JSON.stringify({
        title: "Novo produto",
        message: `${product.name} foi adicionado ao seu carrinho`,
        ...product,
      });

      webPush
        .sendNotification(subscription, payload)
        .catch((error) => console.error(error));
    });
  });
}

async function saveNotification(data: any, subscription: any) {
  const ref = db.ref(`notifications`);
  const hash_subscription = hash(subscription);

  await ref
    .orderByChild("subscriptions")
    .equalTo(hash_subscription)
    .once("value")
    .then(async (snapshot) => {
      const val = snapshot.val();

      if (!val) {
        await ref.update({
          [hash(subscription)]: subscription,
        });
      }
    });
}
