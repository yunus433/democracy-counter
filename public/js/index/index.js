let ballot_boxes;
let ballot_results;
let map = {};

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
    loadBallotResults(() => {
      ballot_results.forEach(async ballot_box => {
        const city = ballot_boxes.find(each => each.ballot_box_number == ballot_box.ballot_box_number).city;

        if (!city) return;

        const state = await Contract.methods.getBallotBoxById(generateBallotBoxId(
          ballot_box.ballot_box_number,
          ballot_box.state_vote_count,
          ballot_box.opposition_vote_count
        )).call();

        if (!state) return;
        
        if (!map[city])
          map[city] = {
            state_vote_count: 0,
            opposition_vote_count: 0,
            state_validator_count: 0,
            opposition_validator_count: 0,
            ballot_boxes: []
          };
  
        map[city].state_vote_count += parseInt(state.state_vote_count);
        map[city].opposition_vote_count += parseInt(state.opposition_vote_count);
        map[city].state_validator_count += parseInt(state.state_validator_count);
        map[city].opposition_validator_count += parseInt(state.opposition_validator_count);
  
        map[city].ballot_boxes.push(ballot_box);
      });
  
      callback();
    });
  });
};

function updateMap() {
  loadMapData(() => {
    Object.keys(map).forEach(city => {
      const element = document.getElementById(city);

      if (!element) return;

      element.childNodes[0].style.fill = map[city].state_vote_count > map[city].opposition_vote_count ? 'var(--state-color)' : 'var(--opposition-color)';

      if (map[city].state_vote_count == map[city].opposition_vote_count)
        element.childNodes[0].style.fill = 'var(--neutral-color)';
    });
  });
};

window.addEventListener('load', async () => {
  updateMap();
});