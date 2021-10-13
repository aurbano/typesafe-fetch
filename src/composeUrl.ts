import { ComposeUrlParams, KeyValueMap } from './types';

const addQuery = (url: string, query?: KeyValueMap): string => {
  if (!query || Object.entries(query).length < 1) {
    return encodeURI(url);
  }

  const params = new URLSearchParams(query as Record<string, string>);
  return `${encodeURI(url)}?${params.toString()}`;
};

const addBase = (baseUrl: string | undefined, url: string): string => {
  if (/^https?:\/\//.test(url)) {
    return url;
  }

  if (baseUrl !== undefined) {
    return `${baseUrl}${url}`;
  }

  // Relative URL
  return url;
};

const replacePathParams = (endpoint: string, path: KeyValueMap): string => Object.entries(path).reduce(
  (result: string, [key, value]) => result.replace(`{${key}}`, String(value)),
  endpoint,
);

/**
 * Convert a parameterized endpoint into a full URL combining a base URL, query, and path parameters.
 * @returns The full URL
 */
const composeUrl = ({
  baseUrl,
  endpoint = '',
  path = {},
  query = {},
}: ComposeUrlParams): string => addBase(baseUrl, addQuery(replacePathParams(endpoint, path), query));

export default composeUrl;
