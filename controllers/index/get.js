module.exports = (req, res) => {
  return res.render('index/index', {
    page: 'index/index',
    title: 'Instantaniously Learn the Results of the Election',
    includes: {
      external: {
        css: ['general', 'header', 'page'],
        js: ['ancestorWithClassName', 'interact', 'page', 'serverRequest', 'web3']
      }
    }
  });
}