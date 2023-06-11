const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const ballot = req.body;

  if (!ballot || typeof ballot != 'object')
    return res.json({ error: 'bad_request' });

  if (!ballot.ballot_box_number || !Number.isInteger(ballot.ballot_box_number))
    return res.json({ error: 'bad_request' });

  if (!ballot.state_vote_count || !Number.isInteger(ballot.state_vote_count))
    return res.json({ error: 'bad_request' });

  if (!ballot.opposition_vote_count || !Number.isInteger(ballot.opposition_vote_count))
    return res.json({ error: 'bad_request' });

  fs.readFile(path.join(__dirname, '../../data/results.json'), (err, data) => {
    if (err) return res.json({ error: err });

    const results = JSON.parse(data);
    
    if (results.find(each => each.ballot_box_number == ballot.ballot_box_number && each.state_vote_count == ballot.state_vote_count && each.opposition_vote_count == ballot.opposition_vote_count ))
      return res.json({ success: true });

    results.push({
      ballot_box_number: ballot.ballot_box_number,
      state_vote_count: ballot.state_vote_count,
      opposition_vote_count: ballot.opposition_vote_count
    });

    fs.writeFile(path.join(__dirname, '../../data/results.json'), JSON.stringify(results), err => {
      if (err) return res.json({ error: err });

      return res.json({ success: true }); 
    });
  });
}