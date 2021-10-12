import withQuery from "with-query";
import { ComposeUrl, KeyValueMap } from "./types";

const addQuery = (
  url: string,
  query: KeyValueMap | string | undefined
): string => (query ? withQuery(encodeURI(url), query) : encodeURI(url));

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

const replacePathParams = (endpoint: string, path: KeyValueMap): string =>
  Object.entries(path).reduce(
    (result: string, [key, value]) => result.replace(`{${key}}`, String(value)),
    endpoint
  );

/**
 * Convert a parameterized endpoint into a full URL combining a base URL, query, and path parameters.
 * @param options
 * @param {String} options.endpoint - The API endpoint
 * @param {String|Object} [options.path=undefined] - Path parameters in the URL as an object where the keys indicate parameters to replace in the format {parameter}
 * @param {Object} [options.query=undefined] - Query parameters
 * @returns {String} - The full URL
 */
const composeUrl: ComposeUrl = ({
  baseUrl,
  endpoint = "",
  path = {},
  query = {},
}): string =>
  addBase(baseUrl, addQuery(replacePathParams(endpoint, path), query));

export default composeUrl;
