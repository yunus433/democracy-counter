const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  fs.readFile(path.join(__dirname, '../../data/results.json'), (err, data) => {
    if (err) return res.json({ error: err });

    const result = JSON.parse(data);

    return res.json(result);
  });
}