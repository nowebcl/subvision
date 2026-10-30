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
              const chunks: Buffer[] = [];
              req.on('data', chunk => {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
              });
              req.on('end', async () => {
                try {
                  const body = Buffer.concat(chunks).toString('utf-8');
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
      },
      {
        name: 'api-email-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/send-email') && req.method === 'POST') {
              const chunks: Buffer[] = [];
              req.on('data', chunk => {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
              });
              req.on('end', async () => {
                try {
                  const resendKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
                  if (!resendKey) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'RESEND_API_KEY no configurada en el archivo .env' }));
                    return;
                  }

                  const body = Buffer.concat(chunks).toString('utf-8');
                  const { to, subject, html, text, fromName, replyTo, attachments } = JSON.parse(body);

                  // Parse recipients
                  let recipients: string[] = [];
                  if (Array.isArray(to)) {
                    recipients = to;
                  } else if (typeof to === 'string') {
                    recipients = to.split(/[,;]/).map((e: string) => e.trim()).filter((e: string) => e.length > 0);
                  }

                  if (recipients.length === 0) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Dirección de correo destinatario no válida.' }));
                    return;
                  }

                  // Format attachments: ensure clean base64 string
                  const formattedAttachments = attachments && Array.isArray(attachments) && attachments.length > 0
                    ? attachments.map((att: any) => {
                        const raw = att.content || '';
                        const clean = typeof raw === 'string' && raw.includes(',')
                          ? raw.split(',')[1]
                          : raw;
                        return {
                          filename: att.filename,
                          content: clean
                        };
                      })
                    : undefined;

                  const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${resendKey}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      from: `${fromName || 'SUBVISION'} <notificaciones@subvision.servirov.cl>`,
                      to: recipients,
                      subject,
                      html: html || `<p>${text}</p>`,
                      text: text,
                      reply_to: replyTo || 'contacto@servirov.cl',
                      ...(formattedAttachments && { attachments: formattedAttachments })
                    }),
                  });

                  const data = (await response.json()) as any;

                  if (!response.ok) {
                    res.statusCode = response.status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: data?.message || data?.error || 'Error al despachar el correo con Resend' }));
                    return;
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, id: data?.id }));

                } catch (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: (err as any).message || 'Error interno en servidor local.' }));
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
