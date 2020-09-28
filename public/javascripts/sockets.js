/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */

const socket = io();

socket.on('imitator_output', function (message) {
  // @ts-ignore
  $('#log-messages').text(message);
});
