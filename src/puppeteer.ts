import { Cluster } from "puppeteer-cluster";
import puppeteer from "puppeteer-core";

let cluster: Cluster;
async function init() {
  if (!cluster) {
    cluster = await Cluster.launch({
      puppeteerOptions: {
        executablePath: process.env.CHROME_BIN,
        // headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      },
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 2,
      puppeteer,
    });

    process.on("SIGTERM", () => {
      cluster.close();
      process.exit();
    });
    console.log("browser initialized");
  }
  return cluster;
}

async function close() {
  await cluster.close();
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
