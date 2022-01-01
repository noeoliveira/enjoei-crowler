import { Page } from "puppeteer";

async function login(page: Page, email: string, password: string) {
  await page.goto("https://www.enjoei.com.br/usuario/identifique-se");
  await page.waitForSelector(" div.l-wrapper > button");
  const button = await page.$("div.l-wrapper > button");

  await Promise.all([
    button?.click(),
    page.waitForSelector("input[type=email]"),
    page.waitForSelector("input[type=password]"),
  ]);
  await page.type("input[type=email]", email);
  await page.type("input[type=password]", password);
  await page.click("div.o-well> button[type=submit]");
  await page.waitForNavigation();
}

export default { login };
