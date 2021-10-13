/* global HeadersInit, BodyInit */

type FetchOptions = {
  method: string;
  body?: BodyInit;
  headers?: HeadersInit;
}

// eslint-disable-next-line no-unused-vars
export type FetchFunction = (url: string, options: FetchOptions) => Promise<any>;

export type SafeFetchOptions = {
  baseUrl?: string;
  fetch: FetchFunction;
};

export type KeyValueMap = Record<string, string | number | boolean>;

export type ComposeUrlParams = {
  baseUrl?: string;
  endpoint: string;
  path: KeyValueMap;
  query: KeyValueMap;
};
