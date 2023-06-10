const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  fs.readFile(path.join(__dirname, '../../../api/BALLOT_BOX_API.json'), (err, data) => {
    if (err) return res.json({ error: err });

    const boxes = JSON.parse(data);

    return res.json(boxes);
  });
}