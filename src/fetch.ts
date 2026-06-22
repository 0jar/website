import { FetchState, astro } from 'astro/fetch';

export default {
  fetch(req: Request) {
    const { pathname, search } = new URL(req.url);

    if (pathname.startsWith('/stats')) {
      const headers = new Headers(req.headers);
      headers.delete('host');
      headers.delete('referer');

      return fetch(`https://cloud.umami.is${pathname.replace(/^\/stats/, '')}${search}`, {
        method: req.method,
        headers,
        body: req.body,
        duplex: 'half'
      } as RequestInit);
    }

    return astro(new FetchState(req));
  }
};
