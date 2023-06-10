const dotenv = require('dotenv');
const fetch = require('node-fetch');
const fs = require('fs');
const keccak256 = require('keccak256');
const path = require('path');

const { MerkleTree } = require('merkletreejs');
const { Web3 } = require('web3');

dotenv.config({ path: path.join(__dirname, '.env') });

const STATE_API = process.env.STATE_API || 'http://localhost:3000/api/state';
const OPOSITION_API = process.env.OPOSITION_API || 'http://localhost:3000/api/opposition';

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
web3.eth.Contract.handleRevert = true;

// Read the bytecode from the file system
const bytecodePath = path.join(__dirname, '../artifacts/contracts/DemocracyCounter.bin');

const bytecode = fs.readFileSync(bytecodePath, 'utf8');

// Create a new contract object using the ABI and bytecode
const abi = require('../artifacts/build-info/DemocracyCounter.json');
const MyContract = new web3.eth.Contract(abi);

async function deploy() {
  try {
    const providersAccounts = await web3.eth.getAccounts();
    const defaultAccount = providersAccounts[0];
    console.log('deployer account:', defaultAccount);

    const stateAuditors = await fetch(STATE_API).json();
    const opositionAuditors = await fetch(OPOSITION_API).json();



    const myContract = MyContract.deploy({
        data: '0x' + bytecode,
        arguments: [1],
    });

    // optionally, estimate the gas that will be used for development and log it
    const gas = await myContract.estimateGas({
        from: defaultAccount,
    });
    console.log('estimated gas:', gas);

        // Deploy the contract to the Ganache network
        const tx = await myContract.send({
            from: defaultAccount,
            gas,
            gasPrice: 10000000000,
        });
        console.log('Contract deployed at address: ' + tx.options.address);

      // Write the Contract address to a new file
      const deployedAddressPath = path.join(__dirname, '../build/DemocracyCounter.bin');
      fs.writeFileSync(deployedAddressPath, tx.options.address);
  } catch (error) {
      console.error(error);
  }
}

deploy();


