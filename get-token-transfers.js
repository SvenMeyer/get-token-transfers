// alchemy - getAssetTransfers
// https://docs.alchemy.com/reference/getassettransfers-sdk-v3

const { Alchemy, Network } = require("alchemy-sdk");

const POLS_ETH ="0x83e6f1e41cdd28eaceb20cb649155049fac3d5aa";
const POLS_ETH_DEPLOY_TX = "0x62231876fc5798d5fddcea660ccd2f10f5a5d779eb92dd54f49960408ef7a7eb";
const POLS_ETH_DEPLOY_DATE = "2020-09-28";  // Sep-28-2020 10:46:20 PM +UTC - The start date from which to get the transfers (any format that is accepted by momentjs)
const POLS_ETH_DEPLOY_BLOCK = 10953732;
const POLS_ETH_DEPLOY_ACCOUNT = "0xa8ff9e209e70ccbde820b75c51ece964ee165e04";

// Configures the Alchemy SDK
const config = {
    apiKey: process.env.ALCHEMY_API_KEY, //"alchemy-replit", // Replace with your API key
    network: Network.ETH_MAINNET, // Replace with your network
};

// Creates an Alchemy object instance with the config to use for making requests
const alchemy = new Alchemy(config);


const main = async () => {
    //Assign the contract address to a variable
    let toAddress = "0x1E6E8695FAb3Eb382534915eA8d7Cc1D1994B152";

  //The response fetches the transactions the specified addresses.
    let response = await alchemy.core.getAssetTransfers({
        fromBlock: POLS_ETH_DEPLOY_BLOCK,
        fromAddress: POLS_ETH_DEPLOY_ACCOUNT,
        contractAddresses: [POLS_ETH],
        // toAddress: toAddress,
        excludeZeroValue: true,
        category: ["erc20"],
        // maxCount: 2
      })

    // Logging the response to the console
    console.log(response);
    console.log("response.transfers.length =", response.transfers.length);

    const raw = response.transfers[0].rawContract;
    console.log("response.transfers[0].rawContract =", raw);
    console.log("raw.value =", raw.value);

    const pageKey = response.pageKey;
    if (pageKey === undefined) {
        console.log("NO pageKey")}
    else {
        console.log("pageKey =", pageKey); }
};

main();
