let web3;
let Contract;
let Account;
let isDeployed = false;

function getDeployedAddressPath() {
  const deployedAddressPath = '/build/DemocracyCounter.bin';

  const xhr = new XMLHttpRequest();

  xhr.open('GET', deployedAddressPath, false);
  xhr.overrideMimeType('text/plain; charset=x-user-defined');
  xhr.send(null);

  return xhr.status === 200 ? xhr.responseText : '';
};

function getBytecode() {
  const bytecodeAddressPath = '/artifacts/contracts/DemocracyCounter.bin';

  const xhr = new XMLHttpRequest();

  xhr.open('GET', bytecodeAddressPath, false);
  xhr.overrideMimeType('text/plain; charset=x-user-defined');
  xhr.send(null);

  return xhr.status === 200 ? xhr.responseText : '';
};

function getABI() {
  const abiPath = '/artifacts/build-info/DemocracyCounter.json';

  const xhr = new XMLHttpRequest();

  xhr.open('GET', abiPath, false);
  xhr.send(null);

  try {
    return xhr.status === 200 ? JSON.parse(xhr.responseText) : '';
  } catch (err) {
    throw Error('Web3JS Interaction Error: ' + err);
  }
};

async function connectMetaMask() {
  let provider = window.ethereum;

  if (typeof provider !== 'undefined') {
    try {
      Account = (await provider.request({ method: 'eth_requestAccounts' }))[0]
    } catch (err) {
      throw Error(err);
    };
  }
}

window.addEventListener('load', async () => {
  web3 = await new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
  web3.eth.Contract.handleRevert = true;

  const deployedAddress = getDeployedAddressPath();
  const bytecode = getBytecode();
  const abi = await getABI();

  Contract = await new web3.eth.Contract(abi, deployedAddress);
  isDeployed = true;
});