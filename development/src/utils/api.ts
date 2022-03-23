/**
 * this is a simple api utils that help us to consolidate
 * any fetch call, and construct the api request payload
 *
 * API_BASE_URL will be grabbed from the global var
 */
const API_BASE_URL: string = (window as { [key: string]: any })['API_BASE_URL'] as string;

interface APIResponse {
  data?: string | Object,
  status: boolean,
  msg?: string,
}

interface FetchRequest {
  method: string,
  headers: {
    'Content-Type': string,
  },
  body?: string,
}

export default class APIUtils {
  /**
   * method for constructing fetch request and response
   *
   * @param reqType {string} - POST | GET
   * @param url {string}
   * @param body {Object}
   * @returns
   */
  static _makeRequest = async (reqType: string, url: string, data?: Object): Promise<APIResponse> => {
    try {
      const opts: FetchRequest = {
        method: reqType,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        opts.body = JSON.stringify(data);
      }

      const res = await fetch(
        url,
        opts,
      );

      const apiRes = await res.json();

      if (res.status !== 200) {
        return Promise.resolve(<APIResponse>apiRes);
      }

      return Promise.resolve(<APIResponse>apiRes);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
