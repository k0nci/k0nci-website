/*
Cloudflare Workers fetch handler.
This worker code is executed only if a static asset is missing from the CDN.
Reference: https://developers.cloudflare.com/workers/static-assets/#routing-behavior
When triggered, it redirects all requests to the origin root path.
*/
export default {
  async fetch(request) {
    const url = new URL(request.url);
    return Response.redirect(url.origin + '/', 301);
  },
};
