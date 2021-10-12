export type SafeFetchOptions = {
  baseUrl?: string;
  fetch: typeof fetch;
};

export type KeyValueMap = Record<string, string | number | boolean>;

export type ComposeUrl = (params: {
  baseUrl?: string;
  endpoint: string;
  path: KeyValueMap;
  query: KeyValueMap;
}) => string;