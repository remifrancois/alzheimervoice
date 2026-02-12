/**
 * CVF Service Client — Internal HTTP client for the CVF engine.
 *
 * The API gateway forwards CVF-related requests to cvf.alzheimervoice.org
 * using service-to-service authentication (x-service-key header).
 */

const CVF_URL = process.env.CVF_URL || 'http://localhost:3002';
const CVF_SERVICE_KEY = process.env.CVF_SERVICE_KEY || '';

export const cvfClient = {
  async forward(method, path, { body = null, userContext = null, query = '' } = {}) {
    const url = `${CVF_URL}${path}${query ? `?${query}` : ''}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-service-key': CVF_SERVICE_KEY,
    };

    if (userContext) {
      headers['x-user-context'] = JSON.stringify(userContext);
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const err = new Error(errBody.error || `CVF service error: ${res.status}`);
      err.statusCode = res.status;
      throw err;
    }

    return res.json();
  },

  get(path, opts) { return this.forward('GET', path, opts); },
  post(path, opts) { return this.forward('POST', path, opts); },
  del(path, opts) { return this.forward('DELETE', path, opts); },
};
