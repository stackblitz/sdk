import { describe, expect, test } from 'vitest';

import { RDC } from '$src/rdc';

function getRdc({ error, delay }: { error?: string; delay?: number } = {}) {
  const channel = new MessageChannel();

  channel.port1.onmessage = function (event) {
    const message = getResponseMessage({ ...event.data, error });
    setTimeout(() => this.postMessage(message), delay);
  };

  return new RDC(channel.port2);
}

function getResponseMessage({
  type,
  payload,
  error,
}: {
  type: string;
  payload: any;
  error?: string;
}) {
  const response = {
    type: `${type}_${error ? 'ERROR' : 'SUCCESS'}`,
    payload: {
      __reqid: payload.__reqid,
      __success: !error,
    },
  };
  if (error) {
    (response.payload as any).__error = error;
  }
  if (payload.value) {
    (response.payload as any).value = payload.value;
  }
  return response;
}

describe('RDC', () => {
  test('receives a success value', async () => {
    const rdc = getRdc({});
    await expect(
      rdc.request({
        type: 'TEST',
        payload: {},
      })
    ).resolves.toBe(null);
    await expect(
      rdc.request({
        type: 'TEST',
        payload: { value: 100 },
      })
    ).resolves.toEqual({ value: 100 });
  });

  test('receives a value after a delay', async () => {
    const rdc = getRdc({ delay: 20 });
    await expect(
      rdc.request({
        type: 'TEST',
        payload: {},
      })
    ).resolves.toBe(null);
  });

  test('receives an error message', async () => {
    const rdc = getRdc({ error: 'something went wrong' });
    await expect(rdc.request({ type: 'TEST', payload: {} })).rejects.toBe(
      'TEST_ERROR: something went wrong'
    );
  });
});
