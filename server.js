
const os = require('os');
const cluster = require('cluster');

if (cluster.isMaster) {
  for (let i = 0; i < 4; i++) {
    const worker = cluster.fork();
    worker.on('message', (msg) => {
      console.log(worker.id, msg);
    });
  }
  return;
}

const Koa = require('koa');
const serve = require('koa-static');

const app = new Koa();
app.use(serve('./public'));
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);
const emitter = require('socket.io-emitter')({ host: 'localhost', port: 6379 });
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));

io.on('connection', (socket) => {
  socket.on('posting', (msg) => {
    process.send(msg);
    emitter.emit('posted:project/1', { type: 'posted', peyload: { msg, test: true, pid: process.pid } });
  });
})

server.listen(3000);
console.log('server listened 3000');
