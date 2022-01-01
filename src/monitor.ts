import puppeteer from "./puppeteer";
import crowlers from "./crowlers";

import { getDatabase } from "firebase-admin/database";
import { IProduct } from "./interfaces/IProduct";
import { Page } from "puppeteer";

const db = getDatabase();

export async function monitor(page: Page, shop: string) {
  await navigation(page, shop);

  console.log("find all products");

  const products = await existDocuments(
    shop,
    await crowlers.products.listProduct(page)
  );

  await saveProductBulk(shop, products);

  function randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  const timeMin = 5000;
  const timeMax = (process.env.TIME_CHECK || 20 * 1000) as number;

  setInterval(async () => {
    await navigation(page, shop, { lp: "7d" });
    const newProducts = await crowlers.products.listProduct(page);
    let prod_notify: IProduct[] = await existDocuments(shop, newProducts);

    if (prod_notify.length > 0) {
      await saveProductBulk(shop, prod_notify);
    }
  }, randomBetween(timeMin, timeMax));
}

async function existDocuments(shop: string, newProducts: IProduct[]) {
  const ref = db.ref(`shopping/${shop}`);
  let prod_notify: IProduct[] = [];
  await Promise.all(
    newProducts.map(async (product) => {
      await ref
        .child(product.id)
        .once("value")
        .then((snapshot) => {
          if (!snapshot.exists()) {
            prod_notify.push({
              ...product,
              created_at: Date.now(),
              updated_at: Date.now(),
            });
          }
        });
    })
  );
  return prod_notify;
}

export function listener(
  shop: string,
  callback: (products: IProduct) => Promise<void>
) {
  const ref = db.ref(`shopping/${shop}`);
  ref
    .orderByChild("created_at")
    .startAfter(Date.now())
    .on(
      "child_added",
      async (snapshot) => {
        const product = snapshot.val();

        console.log(snapshot.key, product);
        await callback(product);
      },
      {}
    );
}

async function navigation(page: Page, shop: string, filter?: { lp: string }) {
  let url = `https://www.enjoei.com.br/${shop}`;
  if (filter) {
    console.log(puppeteer.filters(filter));

    url += `?${puppeteer.filters(filter)}`;
    console.log(`navigating to shop:${shop} url:${url}`);
  }

  await Promise.all([
    page.goto(url, {
      waitUntil: "networkidle2",
    }),
    page.waitForNavigation(),
  ]);
}

async function saveProductBulk(shop: string, products: IProduct[]) {
  const ref = db.ref(`shopping/${shop}`);
  console.log("save products: " + products.length);
  await ref.update(
    products.reduce((acc, product) => {
      return { ...acc, [product.id]: product };
    }, {})
  );
  console.log("products saved");
}
