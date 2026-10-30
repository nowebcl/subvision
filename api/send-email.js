/**
 * SUBVISION - Endpoint Serverless para Envío de Correos Oficiales con Resend
 * Dominio verificado: subvision.servirov.cl
 */
import { Resend } from 'resend';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[SUBVISION] RESEND_API_KEY no configurada en variables de entorno.');
    return res.status(500).json({ error: 'RESEND_API_KEY no está configurada en el servidor.' });
  }

  const resend = new Resend(apiKey);
  const { to, subject, html, text, fromName, replyTo, attachments } = req.body || {};

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: to, subject, html o text.' });
  }

  try {
    const sender = `${fromName || 'SUBVISION'} <notificaciones@subvision.servirov.cl>`;
    
    // Normalizar destinatarios
    let recipients = [];
    if (Array.isArray(to)) {
      recipients = to;
    } else if (typeof to === 'string') {
      recipients = to.split(/[,;]/).map(e => e.trim()).filter(e => e.length > 0);
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'Dirección de correo destinatario no válida.' });
    }

    const emailPayload = {
      from: sender,
      to: recipients,
      subject: subject,
      html: html || `<p>${text}</p>`,
      text: text,
      replyTo: replyTo || 'contacto@servirov.cl'
    };

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      emailPayload.attachments = attachments.map(att => {
        const rawContent = att.content || '';
        const cleanContent = typeof rawContent === 'string' && rawContent.includes(',')
          ? rawContent.split(',')[1]
          : rawContent;
        return {
          filename: att.filename,
          content: cleanContent
        };
      });
    }

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('[SUBVISION] Error de Resend:', error);
      return res.status(400).json({ error: error.message || error });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('[SUBVISION] Excepción en envío de correo:', err);
    return res.status(500).json({ error: err.message || 'Error interno al procesar el correo' });
  }
}
