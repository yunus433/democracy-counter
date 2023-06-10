const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  if (!req.query.public_key || typeof req.query.public_key != 'string' || !req.query.public_key.length)
    return res.json({ error: 'bad_request' });

  fs.readFile(path.join(__dirname, '../../../api/STATE_API.json'), (err, data) => {
    if (err) return res.json({ error: err });

    const state_auditors = JSON.parse(data);

    fs.readFile(path.join(__dirname, '../../../api/OPPOSITION_API.json'), (err, data) => {
      if (err) return res.json({ error: err });
  
      const opposition_auditors = JSON.parse(data);
  
      let auditor = state_auditors.find(each => each.public_key == req.query.public_key);

      if (!auditor) {
        auditor = opposition_auditors.find(each => each.public_key == req.query.public_key);

        if (!auditor)
          return res.json({ error: 'document_not_found' });
        else
          auditor.side = 1;
      } else {
        auditor.side = 0;
      }

      return res.json({ user: auditor });
    });
  });
}