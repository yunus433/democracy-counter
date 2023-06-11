const dotenv = require("dotenv");
const fetch = require("node-fetch");
const fs = require("fs");
const keccak256 = require("keccak256");
const path = require("path");

const { MerkleTree } = require("merkletreejs");
const { Web3 } = require("web3");

dotenv.config({ path: path.join(__dirname, "../.env") });

const LOCAL_DEPLOY_ADDRESS = 'http://127.0.0.1:8545';
const STATE_API = process.env.STATE_API || "http://localhost:3000/api/state";
const OPOSITION_API = process.env.OPOSITION_API || "http://localhost:3000/api/opposition";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const DEPLOY_ADDRESS = process.env.SCROLL_TESTNET_URL || LOCAL_DEPLOY_ADDRESS;

const web3 = new Web3(new Web3.providers.HttpProvider(DEPLOY_ADDRESS));
web3.eth.Contract.handleRevert = true;

// Read the bytecode from the file system
const bytecodePath = path.join(
  __dirname,
  "../public/artifacts/contracts/DemocracyCounter.bin"
);

const bytecode = fs.readFileSync(bytecodePath, "utf8");

// Create a new contract object using the ABI and bytecode
const abi = require("../public/artifacts/build-info/DemocracyCounter.json");
const MyContract = new web3.eth.Contract(abi);

async function deploy() {
  try {
    if (DEPLOY_ADDRESS == LOCAL_DEPLOY_ADDRESS) {
      const providersAccounts = await web3.eth.getAccounts();
      const defaultAccount = providersAccounts[0];
      console.log("deployer account:", defaultAccount);
  
      const stateAuditors = await (await fetch(STATE_API)).json();
      const opositionAuditors = await (await fetch(OPOSITION_API)).json();
  
      const leaves = stateAuditors
        .map(auditor => {
          return keccak256([
            auditor.public_key,
            auditor.name,
            auditor.proof_of_identity,
            auditor.ballot_box_number,
            false,
          ]);
        })
        .concat(
          opositionAuditors.map(auditor => {
            return keccak256([
              auditor.public_key,
              auditor.name,
              auditor.proof_of_identity,
              auditor.ballot_box_number,
              true,
            ]);
          })
        );
  
  
      const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      const root = merkleTree.getHexRoot();
  
      console.log("Merkle Tree Root: " + root);
  
      const myContract = MyContract.deploy({
        data: "0x" + bytecode,
        arguments: [root]
      });
  
      // optionally, estimate the gas that will be used for development and log it
      const gas = await myContract.estimateGas({
        from: defaultAccount,
      });
      console.log("estimated gas:", gas);
  
      // Deploy the contract to the Ganache network
      const tx = await myContract.send({
        from: defaultAccount,
        gas,
        gasPrice: 10000000000,
      });
      console.log("Contract deployed at address: " + tx.options.address);
  
      // Write the Contract address to a new file
      const deployedAddressPath = path.join(
        __dirname,
        "../public/build/DemocracyCounter.bin"
      );
      fs.writeFileSync(deployedAddressPath, tx.options.address);
    } else {
      const signer = web3.eth.accounts.privateKeyToAccount('0x' + PRIVATE_KEY.toString());
      web3.eth.accounts.wallet.add(signer);

      console.log("deployer account:", signer.address);
      
      const stateAuditors = await (await fetch(STATE_API)).json();
      const opositionAuditors = await (await fetch(OPOSITION_API)).json();
  
      const leaves = stateAuditors
        .map(auditor => {
          return keccak256([
            auditor.public_key,
            auditor.name,
            auditor.proof_of_identity,
            auditor.ballot_box_number,
            false,
          ]);
        })
        .concat(
          opositionAuditors.map(auditor => {
            return keccak256([
              auditor.public_key,
              auditor.name,
              auditor.proof_of_identity,
              auditor.ballot_box_number,
              true,
            ]);
          })
        );

      const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      const root = merkleTree.getHexRoot();
  
      console.log("Merkle Tree Root: " + root);
  
      const myContract = MyContract.deploy({
        data: "0x" + bytecode,
        arguments: [root]
      });
  
      // optionally, estimate the gas that will be used for development and log it
      const gas = await myContract.estimateGas({
        from: signer.address
      });
      console.log("estimated gas:", gas);
  
      // Deploy the contract to the Ganache network
      const tx = await myContract
        .send({
          from: signer.address,
          gas
        })
        .once("transactionHash", txhash => {
          console.log(`Mining deployment transaction ...`);
          console.log('https://l2scan.scroll.io/address/', txhash);
        });
      console.log("Contract deployed at address: " + tx.options.address);
    }
  } catch (error) {
    console.error(error);
  }
}

deploy();
