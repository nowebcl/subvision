/**
 * SUBVISION - Cliente de IA
 *
 * Todas las llamadas a DeepSeek pasan por el proxy serverless /api/chat.
 * La clave API NUNCA sale del servidor — el frontend solo habla con /api/chat.
 */

const getAiSettings = () => {
  try {
    const saved = localStorage.getItem('subvision_ai_settings');
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    model: 'deepseek-chat',
    temperature: 0.2,
  };
};

export async function queryGroq(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'deepseek-chat'
): Promise<string> {
  const settings = getAiSettings();

  // Normalizar modelo
  let deepseekModel = settings.model ?? 'deepseek-chat';
  if (model === 'deepseek-chat' || model === 'deepseek-reasoner') {
    deepseekModel = model;
  } else if (model === 'deepseek-r1') {
    deepseekModel = 'deepseek-reasoner';
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userPrompt   },
  ];

  // ✅ Llamada al proxy seguro — la API key permanece en el servidor
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: deepseekModel,
      temperature: deepseekModel === 'deepseek-reasoner'
        ? undefined
        : Number(settings.temperature ?? 0.2),
    }),
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorJson = await response.json();
      if (errorJson?.error) errorMessage = errorJson.error;
    } catch {}
    throw new Error(`Error en proxy IA (${response.status}): ${errorMessage}`);
  }

  const data = await response.json();
  if (!data?.content) {
    throw new Error('No se recibió contenido válido del proxy de IA.');
  }

  return data.content;
}
