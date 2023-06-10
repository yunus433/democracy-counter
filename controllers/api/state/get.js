const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  fs.readFile(path.join(__dirname, '../../../api/STATE_API.json'), (err, data) => {
    if (err) return res.json({ error: err });

    const auditors = JSON.parse(data);

    return res.json(auditors);
  });
}