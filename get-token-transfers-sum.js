// alchemy - getAssetTransfers
// https://docs.alchemy.com/reference/getassettransfers-sdk-v3

const { Alchemy, Network } = require("alchemy-sdk");
const ethers = require('ethers');

const TOKEN_DECIMALS = 18;
const POLS_ETH_TOKEN = "0x83e6f1e41cdd28eaceb20cb649155049fac3d5aa";
const POLS_ETH_WHALE_1 = "0x20373581F525d1b85f9F9B5e7594eD5EE9a8Bc21";
const POLS_ETH_DEPLOY_TX = "0x62231876fc5798d5fddcea660ccd2f10f5a5d779eb92dd54f49960408ef7a7eb";
const POLS_ETH_DEPLOY_DATE = "2020-09-28";  // Sep-28-2020 10:46:20 PM +UTC - The start date from which to get the transfers (any format that itxs accepted by momentjs)
const POLS_ETH_DEPLOY_BLOCK = 10953732;
const POLS_ETH_DEPLOY_ACCOUNT = "0xa8ff9e209e70ccbde820b75c51ece964ee165e04";

// Configures the Alchemy SDK
const config = {
  apiKey: process.env.ALCHEMY_API_KEY, //"alchemy-replit", // Replace with your API key
  network: Network.ETH_MAINNET, // Replace with your network
};

// Creates an Alchemy object instance with the config to use for making requests
const alchemy = new Alchemy(config);

/**
 * get all transfer for a specified token for a given account
 * @param {*} account 
 * @returns array of transfers
 */
async function getAssetTransfersForAccount(account) {

  const request = {
    fromBlock: POLS_ETH_DEPLOY_BLOCK,
    contractAddresses: [POLS_ETH_TOKEN],
    // toAddress: account,
    // fromAddress: account,
    excludeZeroValue: true,
    category: ["erc20"],
    maxCount: 10,
    // pageKey
  };

  // get first batch of token receive transfers
  let transfersReceive = await alchemy.core.getAssetTransfers({ ...request, toAddress: account });
  let transfers = transfersReceive.transfers;
  let pageKey = transfersReceive.pageKey;
  console.log("Recv : pageKey =", pageKey, " , transfers.length", transfers.length);

  // if that was not all, then get more batches of token receive transfers
  while (pageKey != undefined) {
    transfersReceive = await alchemy.core.getAssetTransfers({ ...request, toAddress: account, pageKey });
    pageKey = transfersReceive.pageKey;
    console.log("Recv : pageKey =", pageKey, " , transfers.length", transfersReceive.transfers.length);
    transfers.push(...transfersReceive.transfers);
  }

  // get batches of token receive transfers
  let = requestSentTxs = { ...request, fromAddress: account };
  do {
    transfersSent = await alchemy.core.getAssetTransfers(requestSentTxs);
    pageKey = transfersSent.pageKey;
    console.log("Sent : pageKey =", pageKey, " , transfers.length", transfersSent.transfers.length);
    transfers.push(...transfersSent.transfers);
    requestSentTxs = { ...request, fromAddress: account, pageKey };
  } while (pageKey != undefined);

  return transfers;
};

function formatFloatString(s, i, f) {
  const v = ethers.formatUnits(s, TOKEN_DECIMALS).split('.');
  return v[0].padStart(i, ' ') + '.' + v[1].padEnd(f, '0');
}

async function processAccount(account) {

  const transfers = await getAssetTransfersForAccount(account);
  console.log("transfers.length =", transfers.length);

  if (transfers.length > 0) {

    transfers.sort((a, b) => {
      // Only sort on blockNum if not identical
      if (parseInt(a.blockNum) < parseInt(b.blockNum)) return -1;
      if (parseInt(a.blockNum) > parseInt(b.blockNum)) return 1;
      // Sort on uniqueId
      if (parseInt(a.uniqueId) < parseInt(b.uniqueId)) return -1;
      if (parseInt(a.uniqueId) > parseInt(b.uniqueId)) return 1;
      // Both idential, return 0
      return 0;
    });

    balance = BigInt(0);

    for (i = 0; i < transfers.length; i++) {

      const tx = transfers[i];
      if (ethers.getAddress(tx.to) == ethers.getAddress(account)) {
        balance += BigInt(tx.rawContract.value);
      } else {
        if (ethers.getAddress(tx.from) == ethers.getAddress(account)) {
          balance -= BigInt(tx.rawContract.value);
        } else {
          // ignore transfer - ERROR ? - TODO
          balance += 0n;
        }
      }

      console.log("%i , %s , %s , %s", parseInt(tx.blockNum), tx.uniqueId.padEnd(74, ' '), formatFloatString(tx.rawContract.value, 8, TOKEN_DECIMALS), formatFloatString(balance.toString(), 8, TOKEN_DECIMALS)); // tx.value);
    }

  } else {
    console.log("never received token - balance should be 0");
    // TODO check if balance = 0
  }
};


/**
 * main 
 */
async function main() {
  // const account = POLS_ETH_DEPLOY_ACCOUNT;
  const account = POLS_ETH_WHALE_1;
  result = await processAccount(account);
}

main()
  .then((v) => {
    console.log("main - end");
    // process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// const raw = response.transfers[0].rawContract;
// console.log("response.transfers[0].rawContract =", raw);
// console.log("raw.value =", raw.value);

// const pageKey = response.pageKey;
// if (pageKey === undefined) {
//     console.log("NO pageKey")}
// else {
//     console.log("pageKey =", pageKey); }
