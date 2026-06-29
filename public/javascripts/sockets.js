import { Transmit } from '/vendor/transmit-client.js';
import {
  appendArtifactOutput,
  appendDownloadLink,
  resetRunningState,
  updateModelOutput,
} from './utils.js';

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
    resetRunningState();
    return;
  }

  const { model, type, message } = payload;
  if (!model) return;

  if (type === 'stdout' || type === 'error') {
    updateModelOutput(model, message);
  }

  if (type === 'files') {
    for (const file of message.files) {
      appendDownloadLink('#output-files', message.path, file);
    }
  }
});

artifactSubscription.onMessage(function (payload) {
  if (payload.event === 'exit') {
    resetRunningState();
    return;
  }

  const { name, type, message } = payload;
  if (!name) return;

  if (type === 'stdout' || type === 'error') {
    appendArtifactOutput(message);
  }

  if (type === 'files') {
    for (const file of message.files) {
      appendDownloadLink('#artifact-output-files', message.path, file);
    }
  }
});

await Promise.all([imitatorSubscription.create(), artifactSubscription.create()]);
