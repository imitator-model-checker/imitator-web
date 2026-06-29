/**
 * Thin browser-side API client for runner commands.
 *
 * The forms module owns user interactions, while this module keeps HTTP calls
 * in one place so endpoint paths and request payloads are easy to audit.
 */

/**
 * Starts an Imitator run from multipart form data.
 *
 * @param {FormData} parameters FormData built from the Imitator runner form.
 * @returns {Promise<object>} JSON response containing the created run metadata.
 */
export async function runImitator(parameters) {
  const response = await fetch('/api/imitator/run', {
    method: 'POST',
    body: parameters,
  });

  return response.json();
}

/**
 * Starts an artifact run from serialized form data.
 *
 * @param {string} parameters JSON payload built from the artifact runner form.
 * @returns {Promise<object>} JSON response containing the created run metadata.
 */
export async function runArtifact(parameters) {
  const response = await fetch('/api/artifact/run', {
    method: 'POST',
    body: parameters,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

/**
 * Requests cancellation of an artifact run.
 *
 * @param {string} identifier Runner workspace identifier returned by the API.
 * @returns {Promise<void>}
 */
export async function stopArtifact(identifier) {
  await fetch('/api/artifact/stop', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
    headers: {
      'Content-type': 'application/json',
    },
  });
}

/**
 * Requests cancellation of one or more Imitator subprocesses.
 *
 * @param {string[] | string} identifiers Process ids returned by the run API,
 * either as an array or a dash-separated string for older callers.
 * @returns {Promise<void>}
 */
export async function stopImitator(identifiers) {
  const pids = Array.isArray(identifiers) ? identifiers : identifiers.split('-');

  await fetch('/api/imitator/stop', {
    method: 'POST',
    body: JSON.stringify({ identifiers: pids }),
    headers: {
      'Content-type': 'application/json',
    },
  });
}
