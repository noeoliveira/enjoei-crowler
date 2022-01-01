import { Page } from "puppeteer";
import { IProduct } from "../interfaces/IProduct";

async function listProduct(page: Page) {
  try {
    let next = false;
    let list: IProduct[] = [];
    do {
      await Promise.all([
        page.waitForSelector("div.c-product-feed__list", { timeout: 5000 }),
        page.waitForSelector("div.c-product-card", { timeout: 5000 }),
      ]);
      const products = await page.$$("div.c-product-card");
      list = [
        ...list,
        ...(await Promise.all(
          products.map(async (product) => {
            const id = await product.$eval(
              "div.c-product-card__img-wrapper > a",
              (el) => {
                const [path] = (el.getAttribute("href") as string).split("?");

                return path.split("-").pop() as string;
              }
            );
            const url = await product.$eval(
              "div.c-product-card__img-wrapper > a",
              (el) => {
                return el.getAttribute("href") || undefined;
              }
            );

            const urlImage = await product.$eval(
              "div.c-product-card__img-wrapper > a>img",
              (el) => {
                return el.getAttribute("data-src") || undefined;
              }
            );

            const price = await product.$eval(
              " div.c-product-card__info-wrapper > div.c-product-card__text-wrapper.has-card-actions > span.c-product-card__price > span",
              (el) => {
                return el.textContent?.match(/\d+(?:(\.-\,)\d{2})?/gm)?.[0];
              }
            );

            const name = await product.$eval(
              " div.c-product-card__info-wrapper > div.c-product-card__text-wrapper.has-card-actions > h2.c-product-card__title",
              (el) => {
                return el.textContent?.replace("\n", "").trim();
              }
            );

            const brand = await product.$eval(
              " div.c-product-card__info-wrapper > div.c-product-card__text-wrapper.has-card-actions > span.c-product-card__brand",
              (el) => {
                return el.textContent?.replace("\n", "").trim();
              }
            );

            return { id, url, urlImage, price, name, brand };
          })
        )),
      ];

      next = await hasNext(page);
    } while (next);

    return list;
  } catch (error: any) {
    console.log(error.message);

    return [];
  }
}

async function hasNext(page: Page) {
  await page.waitForSelector(
    `div.c-product-feed__pagination > .c-product-feed-pagination > a[rel="next"]`
  );
  const originalHref = await page.$eval(
    `div.c-product-feed__pagination > .c-product-feed-pagination > a[rel="next"]`,
    (el) => {
      return el.getAttribute("href");
    }
  );

  if (originalHref === "#") {
    return false;
  }

  const button = await page.$(
    `div.c-product-feed__pagination > .c-product-feed-pagination > a[rel="next"]`
  );

  await Promise.all([button?.click(), page.waitForNavigation()]);

  return true;
}

async function countProduct(page: Page) {
  await page.waitForSelector("div.o-tabs__container > a.o-tabs__item");
  return Number(
    await page.$eval("div.o-tabs__container > a.o-tabs__item", (el) => {
      return el.textContent?.match(/\d+/gm)?.[0];
    })
  );
}

export default { listProduct, countProduct };
