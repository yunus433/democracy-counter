let ballot_boxes;
let map = {};

function loadBallotBoxes(callback)  {
  serverRequest('/api/ballot_boxes', 'GET', {}, res => {
    if (res.error) return alert('Error: ' + res.error);

    ballot_boxes = res;

    callback();
  });
};

function loadMapData(callback) {
  loadBallotBoxes(() => {
    ballot_boxes.forEach(async ballot_box => {
      const state = await Contract.methods.getBallotBoxById(ballot_box.number).call();
      
      if (!map[ballot_box.city])
        map[ballot_box.city] = {
          state_vote_count: 0,
          opposition_vote_count: 0,
          state_validator_count: 0,
          opposition_validator_count: 0,
          ballot_boxes: []
        };

      map[ballot_box.city].state_vote_count += parseInt(state.state_vote_count);
      map[ballot_box.city].opposition_vote_count += parseInt(state.opposition_vote_count);
      map[ballot_box.city].state_validator_count += parseInt(state.state_validator_count);
      map[ballot_box.city].opposition_validator_count += parseInt(state.opposition_validator_count);

      map[ballot_box.city].ballot_boxes.push(ballot_box);
    });

    callback();
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