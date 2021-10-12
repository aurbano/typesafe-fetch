import fetch from 'node-fetch';
import { mocked } from 'ts-jest/utils';

import getSafeFetch from '..';
import { paths as PetstoreApi } from './petstore';

jest.mock('node-fetch', () => jest.fn());

const safeFetch = getSafeFetch<PetstoreApi>({ fetch: fetch as any });

describe('safeFetch', () => {
  beforeEach(() => {
    mocked(fetch).mockClear();
    mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({}),
    } as any);
  });

  it('Replaces path params', async () => {
    const method = 'post';
    const petId = 123;

    await safeFetch('/pet/{petId}/uploadImage', {
      method,
      path: {
        petId,
      },
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`/pet/${petId}/uploadImage`, { method });
  });

  it('Sends query params', async () => {
    const method = 'get';

    await safeFetch('/pet/findByStatus', {
      method,
      query: {
        status: ['available'],
      },
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `/pet/findByStatus?${encodeURI('status[0]')}=available`,
      {
        method,
      },
    );
  });

  it('Sends body params', async () => {
    const method = 'post';

    const body = {
      name: 'test name',
      photoUrls: ['test photo url'],
    };

    await safeFetch('/pet', {
      method,
      body,
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/pet', {
      method,
      body,
    });
  });

  it('Allows different baseUrls', async () => {
    const customBaseUrl = 'http://example.com';
    const method = 'get';
    const petId = 1;

    const safeFetchBaseUrl = getSafeFetch<PetstoreApi>({
      baseUrl: customBaseUrl,
      fetch: fetch as any,
    });

    await safeFetchBaseUrl('/pet/{petId}', {
      method,
      path: {
        petId,
      },
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${customBaseUrl}/pet/${petId}`, {
      method,
    });
  });

  it('Supports custom fetch fns', async () => {
    const method = 'get';
    const petId = 1;

    const fetchFn = jest.fn();
    fetchFn.mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    });

    const safeCustomFetch = getSafeFetch<PetstoreApi>({
      fetch: fetchFn as any,
    });

    await safeCustomFetch('/pet/{petId}', {
      method,
      path: {
        petId,
      },
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith(`/pet/${petId}`, {
      method,
    });
  });
});
