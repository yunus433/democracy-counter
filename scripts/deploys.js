import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';
import fetch from 'node-fetch';
import Web3 from 'web3';

const STATE_API = '';
const OPOSITION_API = '';

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

web3.eth
  .getBlockNumber()
  .then(async result => {
    console.log('Current block number: ' + result);

    const stateAuditors = await fetch(STATE_API).json();
    const opositionAuditors = await fetch(OPOSITION_API).json();
    
    
  })
  .catch(error => {
      console.error(error);
  });