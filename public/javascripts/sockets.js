/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */

import { Transmit } from '/vendor/transmit-client.js';

const transmit = new Transmit({
  baseUrl: window.location.origin,
  uidGenerator: () => {
    if (window.crypto && 'randomUUID' in window.crypto) {
      return window.crypto.randomUUID();
    }

    return Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
    ).join('');
  },
});

const imitatorSubscription = transmit.subscription('imitator-output');
const artifactSubscription = transmit.subscription('artifact-output');

imitatorSubscription.onMessage(function (payload) {
  if (payload.event === 'exit') {
    hideSpinner();
    enableRunButton();
    hideStopButton();
    return;
  }

  const { model, type, message } = payload;
  if (!model) return;

  if (type === 'stdout' || type === 'error') {
    $(`pre[id="stdout-${model}"]`).text(message);
  }

  if (type === 'files') {
    for (const file of message.files) {
      $('#output-files').append(
        `<span onclick="downloadFile('${message.path}', '${file}');" class="file chip cursor-pointer mr-1 mb-1">${file}</span>`
      );
    }
  }
});

artifactSubscription.onMessage(function (payload) {
  if (payload.event === 'exit') {
    hideSpinner();
    enableRunButton();
    hideStopButton();
    return;
  }

  const { name, type, message } = payload;
  if (!name) return;

  if (type === 'stdout' || type === 'error') {
    $('#artifact-stdout').append(message);
  }

  if (type === 'files') {
    for (const file of message.files) {
      $('#artifact-output-files').append(
        `<span onclick="downloadFile('${message.path}', '${file}');" class="file chip cursor-pointer mr-1 mb-1">${file}</span>`
      );
    }
  }
});

await Promise.all([imitatorSubscription.create(), artifactSubscription.create()]);
