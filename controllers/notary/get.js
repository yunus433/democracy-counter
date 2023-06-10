module.exports = (req, res) => {
  return res.render('notary/index', {
    page: 'notary/index',
    title: 'Audit and Validate the Results of Your Ballot',
    includes: {
      external: {
        css: ['general', 'header', 'page'],
        js: ['ancestorWithClassName', 'cookies', 'header', 'page', 'serverRequest']
      }
    }
  });
}