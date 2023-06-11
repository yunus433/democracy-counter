let ballot_boxes;
let ballot_results;
let map = {};
let total = {
  state: 0,
  opposition: 0
}

function loadBallotBoxes(callback)  {
  serverRequest('/api/ballot_boxes', 'GET', {}, res => {
    if (res.error) return alert('Error: ' + res.error);

    ballot_boxes = res;

    callback();
  });
};

function loadBallotResults(callback)  {
  serverRequest('/data', 'GET', {}, res => {
    if (res.error) return alert('Error: ' + res.error);

    ballot_results = res;

    callback();
  });
};

function generateBallotBoxId(
  ballot_box_number,
  state_vote_count,
  opposition_vote_count
) {
  return BigInt(ballot_box_number) * BigInt('1' + Array.from({ length: 20 }, _ => '0').join('')) + BigInt(state_vote_count) * BigInt('1' + Array.from({ length: 10 }, _ => '0').join('')) + BigInt(opposition_vote_count);
}

function loadMapData(callback) {
  loadBallotBoxes(() => {
    loadBallotResults(async () => {
      await ballot_results.forEach(async (ballot_box, index) => {
        const city = ballot_boxes.find(each => each.ballot_box_number == ballot_box.ballot_box_number).city;

        if (!city) return;

        const state = await Contract.methods.getBallotBoxById(generateBallotBoxId(
          ballot_box.ballot_box_number,
          ballot_box.state_vote_count,
          ballot_box.opposition_vote_count
        )).call();

        if (
          !state ||
          !state.exists ||
          !state.state_validator_count ||
          !state.opposition_validator_count
        ) {
          if (index == ballot_results.length - 1)
            callback();
          return;
        }
        
        if (!map[city])
          map[city] = {
            state_vote_count: 0,
            opposition_vote_count: 0,
            state_validator_count: 0,
            opposition_validator_count: 0,
            ballot_boxes: []
          };

        total.state += parseInt(state.state_vote_count);
        total.opposition += parseInt(state.opposition_vote_count);
  
        map[city].state_vote_count += parseInt(state.state_vote_count);
        map[city].opposition_vote_count += parseInt(state.opposition_vote_count);
        map[city].state_validator_count += parseInt(state.state_validator_count);
        map[city].opposition_validator_count += parseInt(state.opposition_validator_count);
  
        map[city].ballot_boxes.push({
          ballot_box_number: ballot_box.ballot_box_number,
          state_vote_count: parseInt(state.state_vote_count),
          opposition_vote_count: parseInt(state.opposition_vote_count),
          state_validator_count: parseInt(state.state_validator_count),
          opposition_validator_count: parseInt(state.opposition_validator_count)
        });

        if (index == ballot_results.length - 1)
          callback();
      });
    });
  });
};

function updateMap() {
  loadMapData(() => {
    document.getElementById('total-state').innerHTML = total.state + ' RED';
    document.getElementById('total-opposition').innerHTML = total.opposition + ' BLUE';

    Object.keys(map).forEach(city => {
      const element = document.getElementById(city);

      if (!element) return;

      element.childNodes[0].style.fill = map[city].state_vote_count > map[city].opposition_vote_count ? 'var(--state-color)' : 'var(--opposition-color)';

      if (map[city].state_vote_count == map[city].opposition_vote_count)
        element.childNodes[0].style.fill = 'var(--neutral-color)';
    });
  });
};

// function handleTransaction(event) {
//   const eachTransaction = document.createElement('div');
//   eachTransaction.classList.add('all-content-right-each-transaction-wrapper');


// }

async function listenForEvents() {
  if (isDeployed && Contract) {
    await Contract.events
      .ValidateBallotBox({ fromBlock: "earliest" })
      .on('data', event => console.log(event))
  } else {
    setTimeout(() => {
      listenForEvents();
    }, 5);
  }
}

window.addEventListener('load', async () => {
  updateMap();
  await listenForEvents();
});