import type { Plugin } from 'vite';
import { handleApiRequest } from './api.ts';

export function zendrApiPlugin(): Plugin {
  return {
    name: 'zendr-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        const url = req.url.split('?')[0];
        const method = req.method || 'GET';

        // Read body for POST/PUT
        let body: any = null;
        if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const raw = Buffer.concat(buffers).toString('utf-8');
          try {
            body = raw ? JSON.parse(raw) : {};
          } catch {
            body = {};
          }
        }

        try {
          const response = await handleApiRequest(url, method, req.headers, body);
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(response.data));
        } catch (err: any) {
          console.error('[API Middleware Error]', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
        }
      });
    }
  };
}
