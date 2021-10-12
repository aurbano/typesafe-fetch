import composeUrl from "./composeUrl";
import { KeyValueMap, SafeFetchOptions } from "./types";

const getSafeFetch = <paths>(options: SafeFetchOptions) => {
  type Path = keyof paths;
  type PathMethods<P extends Path> = keyof paths[P];

  type RequestParams<
    P extends Path,
    M extends PathMethods<P>
  > = "parameters" extends keyof paths[P][M]
    ? paths[P][M]["parameters"]
    : undefined;

  type BodyParams<
    P extends Path,
    M extends PathMethods<P>
  > = "body" extends keyof RequestParams<P, M>
    ? RequestParams<P, M>["body"]
    : undefined;

  type PathParams<
    P extends Path,
    M extends PathMethods<P>
  > = "path" extends keyof RequestParams<P, M>
    ? RequestParams<P, M>["path"]
    : undefined;

  type QueryParams<
    P extends Path,
    M extends PathMethods<P>
  > = "query" extends keyof RequestParams<P, M>
    ? RequestParams<P, M>["query"]
    : undefined;

  type ResponseType<
    P extends Path,
    M extends PathMethods<P>
  > = paths[P][M] extends {
    responses: { 200: { schema: { [x: string]: any } } };
  }
    ? paths[P][M]["responses"][200]["schema"]
    : undefined;

  type RequestInit<P extends Path, M extends PathMethods<P>> = {
    method: M;
    headers?: HeadersInit;
  } & ("query" extends keyof RequestParams<P, M>
    ? {
        query: QueryParams<P, M>;
      }
    : {}) &
    ("path" extends keyof RequestParams<P, M>
      ? {
          path: PathParams<P, M>;
        }
      : {}) &
    ("body" extends keyof RequestParams<P, M>
      ? {
          body: BodyParams<P, M>;
        }
      : {});

  type RequestInitBase = {
    method: string;
    headers: HeadersInit;
    query?: KeyValueMap;
    path?: KeyValueMap;
    body?: BodyInit;
  };

  type SafeFetchFn = <P extends Path, M extends PathMethods<P>>(
    endpoint: P,
    init: RequestInit<P, M>
  ) => Promise<ResponseType<P, M>>;

  /**
   * Type-safe generic apiCall function - given a specific path it only allows the appropriate
   * methods to be passed, and given a combination of path & method it only allows the correct
   * parameters (path, query & body) in a full type-safe manner, based on the Swagger docs for the API.
   *
   * The response type is also the exact object based on the path & method combination.
   */
  const safeFetch: SafeFetchFn = (endpoint, init) => {
    const { method, path = {}, query = {}, body } = init as RequestInitBase;

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
