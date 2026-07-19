/**
 * SUBVISION - Proxy Serverless para DeepSeek API
 * 
 * Este endpoint actúa como intermediario entre el frontend y la API de DeepSeek.
 * La clave API NUNCA llega al navegador — vive solo en el servidor de Vercel.
 * 
 * Ruta: /api/chat
 * Método: POST
 * Body: { messages: [...], model: string, temperature?: number }
 */

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  // Leer la clave desde el entorno del servidor (nunca expuesta al cliente)
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('[SUBVISION] DEEPSEEK_API_KEY no configurada en el servidor.');
    return res.status(500).json({ error: 'Configuración de servidor incompleta.' });
  }

  // Validar body
  const { messages, model = 'deepseek-chat', temperature = 0.2 } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'El campo messages es requerido y debe ser un array.' });
  }

  // Seguridad: limitar tamaño de mensajes para evitar abuso
  if (messages.length > 20) {
    return res.status(400).json({ error: 'Demasiados mensajes en la conversación.' });
  }

  // Limitar tokens de contenido (prevenir prompt injection masivo)
  const totalChars = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
  if (totalChars > 32000) {
    return res.status(400).json({ error: 'Contenido demasiado extenso.' });
  }

  // Modelos permitidos (whitelist)
  const allowedModels = ['deepseek-chat', 'deepseek-reasoner'];
  const safeModel = allowedModels.includes(model) ? model : 'deepseek-chat';

  // Construir body para DeepSeek
  const deepseekBody = {
    model: safeModel,
    messages,
    ...(safeModel !== 'deepseek-reasoner' && { temperature: Number(temperature) }),
  };

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deepseekBody),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || response.statusText;
      console.error(`[SUBVISION] Error DeepSeek ${response.status}: ${errorMsg}`);
      return res.status(response.status).json({ error: `Error en API: ${errorMsg}` });
    }

    // Devolver solo el contenido necesario al cliente
    const content = data?.choices?.[0]?.message?.content?.trim() ?? '';
    if (!content) {
      return res.status(502).json({ error: 'La API no retornó contenido válido.' });
    }

    return res.status(200).json({ content });

  } catch (err) {
    console.error('[SUBVISION] Error en proxy:', err);
    return res.status(500).json({ error: 'Error interno del servidor proxy.' });
  }
}
