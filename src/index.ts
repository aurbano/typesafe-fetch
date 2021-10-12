import composeUrl from './composeUrl';
import { KeyValueMap, SafeFetchOptions } from './types';

type ParamsName = 'parameters';
type QueryParamName = 'query';
type PathParamName = 'path';
type BodyParamName = 'body';
type HeaderParamName = 'header';

/**
 * Returns a type-safe fetch function for the given API definitions. The definitions can
 * be generated using he module openapi-typescript. This needs the `paths` from
 * the generated interfaces.
 *
 * A fetch function must be passed in the options.
 */
const getSafeFetch = <ApiDefinition>(options: SafeFetchOptions) => {
  type Paths = keyof ApiDefinition;
  type PathMethods<P extends Paths> = keyof ApiDefinition[P];

  // Extract all parameters from the request
  type RequestParams<
    P extends Paths,
    M extends PathMethods<P>
  > = ParamsName extends keyof ApiDefinition[P][M]
    ? ApiDefinition[P][M][ParamsName]
    : undefined;

  // Extract each type of parameter or return undefined if not required
  type ExtractParam<
    type extends string,
    P extends Paths,
    M extends PathMethods<P>
  > = type extends keyof RequestParams<P, M>
    ? RequestParams<P, M>[type]
    : undefined;

  type BodyParams<P extends Paths, M extends PathMethods<P>> = ExtractParam<
    BodyParamName,
    P,
    M
  >;

  type PathParams<P extends Paths, M extends PathMethods<P>> = ExtractParam<
    PathParamName,
    P,
    M
  >;

  type QueryParams<P extends Paths, M extends PathMethods<P>> = ExtractParam<
    QueryParamName,
    P,
    M
  >;

  type HeaderParams<P extends Paths, M extends PathMethods<P>> = ExtractParam<
    HeaderParamName,
    P,
    M
  >;

  type ResponseType<
    P extends Paths,
    M extends PathMethods<P>
  > = ApiDefinition[P][M] extends {
    responses: { 200: { schema: { [x: string]: any } } };
  }
    ? ApiDefinition[P][M]['responses'][200]['schema']
    : undefined;

  type RequestInit<P extends Paths, M extends PathMethods<P>> = {
    method: M;
    headers?: HeadersInit & HeaderParams<P, M>;
  } & (QueryParamName extends keyof RequestParams<P, M>
    ? {
        query: QueryParams<P, M>;
      }
    : {}) &
    (PathParamName extends keyof RequestParams<P, M>
      ? {
          path: PathParams<P, M>;
        }
      : {}) &
    (BodyParamName extends keyof RequestParams<P, M>
      ? {
          body: BodyParams<P, M>;
        }
      : {});

  // Required to access potentially non-existing types if the endpoint doesn't
  // have all the parameters
  type RequestInitBase = {
    method: string;
    headers: Record<string, string>;
    query?: KeyValueMap;
    path?: KeyValueMap;
    body?: BodyInit;
  };

  /**
   * Type-safe generic wrapper around the fetch function - given a specific path it only
   * allows the appropriate methods to be passed, and given a combination of path & method
   * it only allows the correct parameters (path, query & body) in a full type-safe manner,
   * based on the OpenAPI (Swagger) docs for the API.
   *
   * The response type is also the exact object based on the path & method combination.
   */
  const safeFetch = <P extends Paths, M extends PathMethods<P>>(endpoint: P, init: RequestInit<P, M>): Promise<ResponseType<P, M>> => {
    const {
      method, path = {}, query = {}, body,
    } = init as RequestInitBase;

    // Build the URL from the path param map and query params
    const url = composeUrl({
      path,
      endpoint: endpoint as string,
      query: query as KeyValueMap,
      baseUrl: options?.baseUrl,
    });

    return options
      .fetch(url, { body, method })
      .then((response) => response.json());
  };

  return safeFetch;
};

export default getSafeFetch;
