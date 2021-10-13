import fetch from 'cross-fetch';

import getSafeFetch from '..';
import { paths as PetstoreApi } from './petstore.schema';

// eslint-disable-next-line import/prefer-default-export
export const baseUrl = 'https://example.com';

const safeFetch = getSafeFetch<PetstoreApi>({
  fetch: (url, { method, body, headers }) => fetch(
    new URL(url, baseUrl).toString(),
    { method, body: body as any, headers },
  ).then((res) => res.json()),
});

describe('safeFetch', () => {
  describe('Integration', () => {
    it('Sends post request with path params', async () => {
      const method = 'post';
      const petId = 123;

      const res = await safeFetch('/pet/{petId}/uploadImage', {
        method,
        path: {
          petId,
        },
      });

      expect(res.code).toBe(5);
    });

    it('Sends get request with query params', async () => {
      const method = 'get';

      const res = await safeFetch('/pet/findByStatus', {
        method,
        query: {
          status: ['available'],
        },
      });

      expect(res.length).toBe(1);
      expect(res[0].name).toBe('test-name');
      expect(res[0].photoUrls[0]).toBe('test-url');
    });
  });

  describe('Mocked fetch', () => {
    const fetchFn = jest.fn();

    const mockedFetch = getSafeFetch<PetstoreApi>({
      fetch: fetchFn,
    });

    beforeEach(() => {
      fetchFn.mockClear();
      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({}),
      });
    });

    it('Sends multiple same query params', async () => {
      const method = 'get';

      await mockedFetch('/pet/findByStatus', {
        method,
        query: {
          status: ['available', 'pending'],
        },
      });

      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchFn).toHaveBeenCalledWith(
        `/pet/findByStatus?status=${encodeURIComponent('available,pending')}`,
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

      await mockedFetch('/pet', {
        method,
        body,
      });

      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchFn).toHaveBeenCalledWith('/pet', {
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
        fetch: fetchFn,
      });

      await safeFetchBaseUrl('/pet/{petId}', {
        method,
        path: {
          petId,
        },
      });

      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchFn).toHaveBeenCalledWith(`${customBaseUrl}/pet/${petId}`, {
        method,
      });
    });
  });
});
