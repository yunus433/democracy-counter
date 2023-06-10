const cluster = require('cluster');
const dotenv = require('dotenv');
const express = require('express');
const favicon = require('serve-favicon');
const http = require('http');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const numCPUs = process.env.WEB_CONCURRENCY || require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++)
    cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const app = express();
  const server = http.createServer(app);

  const URL = process.env.URL || 'http://localhost:3000';
  const PORT = process.env.PORT || 3000;

  // const apiRouteController = require('./routes/apiRoute');
  const indexRouteController = require('./routes/indexRoute');
  // const notaryRouteController = require('./routes/notaryRoute');

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

  app.use((req, res, next) => {
    res.locals.URL = URL;

    next();
  });

  app.use('/', indexRouteController);
  // app.use('/api', apiRouteController);
  // app.use('/notary', notaryRouteController);

  server.listen(PORT, () => {
    console.log(`Server is on port ${PORT} as Worker ${cluster.worker.id} running @ process ${cluster.worker.process.pid}`);
  });
}
