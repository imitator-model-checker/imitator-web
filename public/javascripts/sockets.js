/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */

const socket = io();

socket.on('imitator_output', function (model, type, message) {
  if (model) {
    if (type === 'stdout' || type === 'error') {
      // @ts-ignore
      $(`#stdout-${model}`).text(message);
    }

    // render generated files
    if (type === 'files') {
      for (const file of message.files) {
        // @ts-ignore
        $('#output-files').append(
          `<span onclick="downloadFile('${message.path}', '${file}');" class="file chip cursor-pointer mr-1 mb-1">${file}</span>`
        );
      }
    }
  }
});
