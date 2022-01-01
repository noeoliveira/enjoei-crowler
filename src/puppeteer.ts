import puppeteer from "puppeteer";

let browser: puppeteer.Browser;
async function init() {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: process.env.CHROME_BIN,
      // headless: false,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    process.on("SIGTERM", () => {
      browser.close();
      process.exit();
    });
    console.log("browser initialized");
  }
  return browser;
}

async function close() {
  await browser.close();
}

interface IFilters {
  [key: string]: string;
}

function filters(filtersOptions: IFilters) {
  const params = new URLSearchParams();

  if (filtersOptions) {
    Object.entries(filtersOptions).forEach(([key, value]) => {
      params.append(key, value);
    });
  }

  return params.toString();
}

export default { init, close, filters };
