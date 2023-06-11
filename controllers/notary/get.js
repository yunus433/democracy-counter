module.exports = (req, res) => {
  return res.render('notary/index', {
    page: 'notary/index',
    title: 'Audit and Validate the Results of Your Ballot',
    includes: {
      external: {
        css: ['confirm', 'general', 'header', 'page'],
        js: ['ancestorWithClassName', 'cookies', 'createConfirm', 'header', 'interact', 'keccak256', 'loadAuditors', 'merkletree', 'page', 'serverRequest', 'web3']
      }
    }
  });
}