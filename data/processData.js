const path = require("path");
const fs = require("fs");
const csv = require("csvtojson");

const publicDir = "public";
const pricesDir = "price";
const pricesDirFromNode = path.join(publicDir, pricesDir);
const pairsFile = "pairs.json";
const pairFiles = new Set();

// Make sure dir exists
fs.mkdirSync(pricesDirFromNode, { recursive: true });

async function processData() {
  const files = fs.readdirSync(__dirname).filter(file => file.endsWith(".csv"));
  for (const file of files) {
    const csvFilePath = path.join(__dirname, file);
    const csvData = fs.readFileSync(csvFilePath, "utf8");
    const prices = await csv().fromString(removeFirstLine(csvData));

    // Take only the necessary data
    // Store as array of arrays to minimize size
    const data = prices
      .reverse()
      .map(dataItem => [dataItem.Date, dataItem.Close]);

    // Parse name for pair, file = "Coinbase_ETHUSD_d.csv"
    const [exchange, pair] = file.split("_");
    const newFilename = `${pair}.json`;
    const newFilepath = path.join(pricesDirFromNode, newFilename);
    fs.writeFileSync(newFilepath, JSON.stringify(data));
    pairFiles.add(path.join(pricesDir, newFilename));
  }

  // Store an index of pair files for the UI to pick from
  fs.writeFileSync(
    path.join(publicDir, pairsFile),
    JSON.stringify(Array.from(pairFiles))
  );
}

/**
 * Removes first line from a file with a single search
 * @param {string} data
 * @return {string}
 */
function removeFirstLine(data) {
  const index = data.indexOf("\n");
  return data.slice(index + 1);
}

processData();
