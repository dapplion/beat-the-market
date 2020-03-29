import { pairsFile } from "./params";
import { DataPoint } from "./types";

export function getRandomWalk(
  n: number,
  initValue = 0,
  deltaMax = 1
): number[] {
  const data: number[] = [];
  let current = initValue;
  for (let i = 0; i < n; i++) {
    current += deltaMax * (Math.random() - 0.5);
    if (current < 0) current = 0;
    data.push(current);
  }
  return data;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const fullUrl = process.env.PUBLIC_URL + "/" + url;
  const data = await fetch(fullUrl).then(res => res.text());
  try {
    return JSON.parse(data);
  } catch (e) {
    throw Error(`Wrong data at ${fullUrl}: ${e.message} \n ${data}`);
  }
}

/**
 * Fetch a random pair from the available JSONs
 */
export async function fetchPriceData(
  nToFetch: number
): Promise<{
  data: DataPoint[];
  pair: string;
}> {
  try {
    // Fetch index of available pairs, fetch one at random
    const pairs = await fetchJson<string[]>(pairsFile);
    console.log(`Pairs`, pairs);
    const pairFile = pairs[Math.floor(Math.random() * pairs.length)];
    const prices = await fetchJson<[[string, string]]>(pairFile);
    console.log(`Received prices`, prices);

    // Pick a random temporal range of the pair
    const rangeToStart = prices.length - nToFetch;
    const start = Math.round(rangeToStart * Math.random());
    const data = prices
      .slice(start, start + nToFetch)
      .map(([time, price], i) => ({
        i,
        price: parseFloat(price),
        time
      }));

    // Store the pair name
    const pairName = pairFile
      .replace(".json", "")
      .replace("price/", "")
      .replace("USD", "");

    return { data, pair: pairName };
  } catch (e) {
    console.error(`Error fetching price data: ${e.message}`);

    // In case of error, return a random walk
    const data = getRandomWalk(nToFetch, 20, 5).map((v, i) => ({
      i,
      price: Math.round(100 * v) / 100,
      time: `day ${i}`
    }));

    return { data, pair: "RND" };
  }
}
