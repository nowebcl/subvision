import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env file
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.DEEPSEEK_API_KEY || 'sk-be02e4459c334642ad12ca67a9a4123b';

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-chat-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/chat') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const { messages, model = 'deepseek-chat', temperature = 0.2 } = JSON.parse(body);

                  if (!messages || !Array.isArray(messages) || messages.length === 0) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'El campo messages es requerido.' }));
                    return;
                  }

                  const response = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${apiKey}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      model: model === 'deepseek-reasoner' ? 'deepseek-reasoner' : 'deepseek-chat',
                      messages,
                      ...(model !== 'deepseek-reasoner' && { temperature: Number(temperature) }),
                    }),
                  });

                  const data = (await response.json()) as any;

                  if (!response.ok) {
                    const errorMsg = data?.error?.message || response.statusText;
                    res.statusCode = response.status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: errorMsg }));
                    return;
                  }

                  const content = data?.choices?.[0]?.message?.content?.trim() ?? '';
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ content }));

                } catch (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: (err as any).message || 'Error interno del servidor proxy.' }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
  }
})
