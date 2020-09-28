// socket io listening to connection
module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('a user connected');
  });

  return io;
};
