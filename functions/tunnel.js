export async function onRequest(context) {
    // Contents of context object
    const {
      request, // same as existing Worker API
      env, // same as existing Worker API
      params, // if filename includes [id] or [[path]]
      waitUntil, // same as ctx.waitUntil in existing Worker API
      next, // used for middleware or to fetch assets
      data, // arbitrary space for passing data between middlewares
    } = context;

    const SLUG = '/tunnel/';
    const url = new URL(request.url)
  
    if (request.method === 'GET' && url.pathname.startsWith(SLUG) && (url.pathname.endsWith('.js') || url.pathname.endsWith('.js.map'))) {
        const path = url.pathname.slice(SLUG.length);
        // Fetch and pass the same response, including headers
        return fetch(`https://browser.sentry-cdn.com/${path}`);
      }

      if (request.method === 'POST' && url.pathname === SLUG) {
        let { readable, writable } = new TransformStream()
        request.body.pipeTo(writable);
    
        // We tee the stream so we can pull the header out of one stream 
        // and pass the other straight as the fetch POST body 
        const [header, body] = readable.tee();
    
        let decoder = new TextDecoder()
        let chunk = '';
    
        const headerReader = header.getReader();
    
        while (true) {
          const { done, value } = await headerReader.read();
    
          if (done) {
            break;
          }
    
          chunk += decoder.decode(value);
          
          const index = chunk.indexOf('\n');
    
          if (index >= 0) {
            // Get the first line
            const firstLine = chunk.slice(0, index);
            const event = JSON.parse(firstLine);
            const dsn = new URL(event.dsn);
            // Post to the Sentry endpoint!
            return fetch(`https://${dsn.host}/api${dsn.pathname}/envelope/`, { method: 'POST', body });
          }
        }
      }

      return new Response(null, { status: 404 });
  }