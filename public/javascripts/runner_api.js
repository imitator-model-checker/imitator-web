export async function runImitator(parameters) {
  const response = await fetch('/api/imitator/run', {
    method: 'POST',
    body: parameters,
  });

  return response.json();
}

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

export async function stopArtifact(identifier) {
  await fetch('/api/artifact/stop', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
    headers: {
      'Content-type': 'application/json',
    },
  });
}

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
