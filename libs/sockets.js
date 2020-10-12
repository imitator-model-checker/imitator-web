// socket io listening to connection
module.exports = function (io) {
  io.on('connection', (socket) => {});

  return io;
};
