import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Eye, Check, Paperclip, 
  Trash2, ChevronLeft, Send, FileText, Plus, AlertCircle, FileCheck
} from 'lucide-react';

interface CustomAttachment {
  id: string;
  filename: string;
  content: string; // Base64
  size: string;
  type?: string;
}

export const EmailPreviewModal: React.FC = () => {
  const { isEmailModalOpen, setIsEmailModalOpen, emailModalData } = useApp();
  const [customRecipient, setCustomRecipient] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Attachments State
  const [includeOfficialPdf, setIncludeOfficialPdf] = useState(true);
  const [customAttachments, setCustomAttachments] = useState<CustomAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emailModalData) {
      const defaultTo = emailModalData.recipientEmail || 'gerencia@servirov.cl';
      setCustomRecipient(defaultTo);
      
      const centerName = emailModalData.nombre || 'Pilpilehue';
      const reportDate = emailModalData.fecha || new Date().toISOString().split('T')[0];
      setCustomSubject(`[INFORME OFICIAL] Inspección ROV y Mortalidad - ${centerName} (${reportDate})`);

      const bodyText = `Estimados Gerencia de Operaciones y Equipo Técnico,

Adjuntamos el Informe Oficial de Inspección Submarina ROV y Mortalidad del centro de cultivo ${centerName}.

El documento adjunto contiene el estado estructural de los módulos, integridad de costuras, biomasa y control de biofouling.

• Piloto ROV: ${emailModalData.piloto || 'Operador Especialista'}
• Jefe de Centro: ${emailModalData.jefeCentro || 'Supervisor Faenas'}
• Empresa: ${emailModalData.empresa || 'SERVIROV Soluciones Submarinas'}
• Puerto / Base: ${emailModalData.puerto || 'Puerto Montt'}

Atentamente,
División de Operaciones Submarinas
SERVIROV Soluciones Submarinas
notificaciones@subvision.servirov.cl`;

      setEmailBody(bodyText);
      setIncludeOfficialPdf(true);
      setCustomAttachments([]);
      setErrorMessage(null);
      setSentSuccess(false);
    }
  }, [emailModalData]);

  if (!isEmailModalOpen || !emailModalData) return null;

  const centerName = emailModalData.nombre || 'Pilpilehue';
  const reportDate = emailModalData.fecha || new Date().toISOString().split('T')[0];
  const pdfFilename = `INFORME_INSPECCION_${centerName.toUpperCase().replace(/\s+/g, '_')}_${reportDate.replace(/-/g, '_')}.pdf`;

  const handleClose = () => {
    setIsEmailModalOpen(false);
    setShowPdfPreview(false);
    setSentSuccess(false);
    setIsSending(false);
    setErrorMessage(null);
  };

  // Trigger file browser for additional attachments (PDF, images, docs)
  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // 15 MB file size limit
      if (file.size > 15 * 1024 * 1024) {
        alert(`El archivo "${file.name}" supera el tamaño máximo permitido de 15 MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const cleanBase64 = result.includes(',') ? result.split(',')[1] : result;
        const sizeStr = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        setCustomAttachments(prev => [
          ...prev,
          {
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            filename: file.name,
            content: cleanBase64,
            size: sizeStr,
            type: file.type
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeCustomAttachment = (id: string) => {
    setCustomAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Fetch official prebuilt PDF from public directory as Base64
  const fetchReportPdfBase64 = async (): Promise<string | null> => {
    try {
      const response = await fetch('/informe_subvision.pdf');
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const clean = res.includes(',') ? res.split(',')[1] : res;
          resolve(clean);
        };
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('No se pudo cargar el PDF base desde /informe_subvision.pdf:', err);
      return null;
    }
  };

  const handleSend = async () => {
    const trimmedRecipient = customRecipient.trim();
    if (!trimmedRecipient || !trimmedRecipient.includes('@')) {
      alert('Por favor ingrese una dirección de correo de destino válida en el campo "Para:".');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    const reportFindings = emailModalData.findings || [
      {
        id: 'f-fallback',
        jaula: '103',
        seccion: 'Fondo',
        clasificacion: 'Rotura de Red',
        observacion: emailModalData.redes || emailModalData.nombre,
        fotoUrl: '/report_pecera409.jpg',
        profundidad: '20 metros'
      }
    ];

    try {
      // 1. Prepare attachments
      const finalAttachments: Array<{ filename: string; content: string }> = [];

      // Official report PDF
      if (includeOfficialPdf) {
        const officialBase64 = await fetchReportPdfBase64();
        if (officialBase64) {
          finalAttachments.push({
            filename: pdfFilename,
            content: officialBase64
          });
        }
      }

      // Additional custom files
      customAttachments.forEach(att => {
        finalAttachments.push({
          filename: att.filename,
          content: att.content
        });
      });

      // 2. Build Executive HTML template
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: #081124; padding: 24px; border-bottom: 3px solid #06b6d4;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">SUBVISION <span style="color: #06b6d4;">•</span> SERVIROV</h1>
                <p style="color: #22d3ee; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.5px;">Sistema Oficial de Telemetría e Inspección Submarina</p>
              </div>
            </div>
          </div>

          <!-- Body Content -->
          <div style="padding: 24px;">
            <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; border-radius: 8px; font-size: 13px; color: #334155; line-height: 1.6; white-space: pre-wrap; margin-bottom: 24px;">
${emailBody.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </div>

            <!-- Parameters Grid Table -->
            <div style="margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Detalles de la Inspección</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; background: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; color: #64748b; font-weight: 600; width: 35%;">Centro / Módulo:</td>
                  <td style="padding: 10px 14px; color: #0f172a; font-weight: bold;">${centerName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                  <td style="padding: 10px 14px; color: #64748b; font-weight: 600;">Fecha de Inspección:</td>
                  <td style="padding: 10px 14px; color: #0f172a;">${reportDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; color: #64748b; font-weight: 600;">Piloto ROV:</td>
                  <td style="padding: 10px 14px; color: #0f172a;">${emailModalData.piloto || 'Operador Especialista'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                  <td style="padding: 10px 14px; color: #64748b; font-weight: 600;">Jefe de Centro:</td>
                  <td style="padding: 10px 14px; color: #0f172a;">${emailModalData.jefeCentro || 'Supervisor Faenas'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #64748b; font-weight: 600;">Condición de Puerto:</td>
                  <td style="padding: 10px 14px; color: #0284c7; font-weight: 600;">${emailModalData.puerto || 'Puerto Montt'}</td>
                </tr>
              </table>
            </div>

            <!-- Findings summary -->
            <div style="margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Hallazgos Técnicos Registrados (${reportFindings.length})</h3>
              ${reportFindings.map(f => {
                const isRotura = (f.clasificacion || '').toLowerCase().includes('rotura');
                const badgeBg = isRotura ? '#fee2e2' : '#fef3c7';
                const badgeColor = isRotura ? '#dc2626' : '#d97706';
                return `
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <strong style="color: #0f172a; font-size: 12px;">Jaula ${String(f.jaula).replace('Jaula ', '')} • ${f.seccion || 'Estructura'} (${f.profundidad || 'Cota'})</strong>
                      <span style="background: ${badgeBg}; color: ${badgeColor}; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; text-transform: uppercase;">${f.clasificacion || 'Revisión'}</span>
                    </div>
                    <div style="font-size: 11px; color: #475569; line-height: 1.4;">${f.observacion || 'Sin observaciones registradas.'}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Attachments List Manifest -->
            ${finalAttachments.length > 0 ? `
              <div style="margin-top: 20px; padding: 14px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
                <span style="font-size: 11px; font-weight: bold; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
                  Archivos Adjuntos Incluidos (${finalAttachments.length}):
                </span>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #15803d; line-height: 1.5;">
                  ${finalAttachments.map(a => `<li><strong>${a.filename}</strong></li>`).join('')}
                </ul>
              </div>
            ` : ''}

          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            Despachado automáticamente desde la plataforma oficial <strong>SUBVISION</strong> • SERVIROV Soluciones Submarinas.<br />
            Remitente verificado: <a href="mailto:notificaciones@subvision.servirov.cl" style="color: #0284c7; text-decoration: none;">notificaciones@subvision.servirov.cl</a>
          </div>
        </div>
      `;

      // 3. Dispatch to API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: trimmedRecipient,
          subject: customSubject,
          html: emailHtml,
          text: emailBody,
          fromName: 'SUBVISION - SERVIROV',
          attachments: finalAttachments
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Error al despachar el correo electrónico');
      }

      setIsSending(false);
      setSentSuccess(true);
      
      setTimeout(() => {
        handleClose();
      }, 2500);

    } catch (err: any) {
      setIsSending(false);
      setErrorMessage(err.message || 'Error inesperado al conectar con el servicio de correo.');
    }
  };

  const reportFindings = emailModalData.findings || [
    {
      id: 'f-fallback',
      jaula: '103',
      seccion: 'Fondo',
      clasificacion: 'Rotura de Red',
      observacion: emailModalData.redes || emailModalData.nombre,
      fotoUrl: '/report_pecera409.jpg',
      profundidad: '20 metros'
    }
  ];

  const totalAttachmentsCount = (includeOfficialPdf ? 1 : 0) + customAttachments.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      
      {/* Hidden native file input for custom attachments */}
      <input 
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.zip"
        onChange={handleAddFiles}
        className="hidden"
      />

      {/* Sent Snackbar Notification */}
      {sentSuccess && (
        <div className="fixed bottom-6 left-6 z-[120] bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-4 text-xs border border-emerald-500/40 animate-slide-in">
          <span className="flex items-center gap-2 font-medium">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[3]" />
            </span>
            <span>
              Correo oficial enviado con éxito a <strong>{customRecipient}</strong> ({totalAttachmentsCount} adjunto{totalAttachmentsCount === 1 ? '' : 's'}).
            </span>
          </span>
          <button onClick={handleClose} className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider cursor-pointer ml-2">
            Cerrar
          </button>
        </div>
      )}

      {/* Modern Minimalist Container */}
      <div className="bg-white text-slate-800 rounded-2xl shadow-[0_25px_60px_rgba(15,23,42,0.18)] border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col relative font-sans animate-scale-in max-h-[92vh]">
        
        {/* HEADER */}
        <div className="bg-slate-50/80 px-5 py-3.5 flex items-center justify-between border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
              Despacho Oficial — Correo Electrónico
            </span>
            <span className="text-[9px] bg-cyan-100 text-cyan-800 font-mono px-2 py-0.5 rounded-md font-semibold">
              @subvision.servirov.cl
            </span>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="flex-1 font-medium">{errorMessage}</span>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-red-400 hover:text-red-600 text-[11px] font-bold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {showPdfPreview ? (
          /* ================= ATTACHMENT PREVIEW OVERLAY ================= */
          <div className="flex-grow bg-slate-900 flex flex-col min-h-[500px] overflow-hidden">
            <div className="bg-slate-800 px-5 py-2.5 flex items-center justify-between text-slate-300 text-xs border-b border-slate-700">
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold tracking-tight transition-colors cursor-pointer text-[10px] uppercase font-mono"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver al Borrador</span>
              </button>
              <span className="font-mono text-slate-400 text-[10px] truncate max-w-xs">{pdfFilename}</span>
            </div>

            {/* Simulated PDF print sheet inside overlay */}
            <div className="flex-grow overflow-y-auto p-4 flex justify-center">
              <div className="bg-white w-full max-w-xl shadow-2xl p-6 text-slate-800 space-y-4 rounded-sm text-[9.5px] leading-relaxed my-2">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-sky-700 tracking-wide uppercase">CAMANCHACA • SERVIROV</span>
                  </div>
                  <div className="text-right">
                    <h1 className="font-black text-slate-900 uppercase leading-none text-xs">Informe de Inspección ROV</h1>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{centerName}</p>
                  </div>
                </div>

                {/* Grid info */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-slate-200 pb-3 font-medium text-[9px] text-slate-600">
                  <div><strong>Fecha:</strong> {reportDate}</div>
                  <div><strong>Piloto:</strong> {(emailModalData.piloto || 'Piloto ROV').toUpperCase()}</div>
                  <div><strong>Centro:</strong> {centerName}</div>
                  <div><strong>Puerto:</strong> {(emailModalData.puerto || 'Puerto Montt').toUpperCase()}</div>
                </div>

                {/* Cages List */}
                <div className="space-y-4">
                  {reportFindings.map((f: any, i: number) => {
                    return (
                      <div key={i} className="flex gap-4 border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex-1 space-y-1 text-slate-600">
                          <p className="font-bold text-slate-800">Jaula {f.jaula} - Sección {f.seccion}</p>
                          <p><strong>Clasificación:</strong> {f.clasificacion}</p>
                          <p><strong>Profundidad:</strong> {f.profundidad}</p>
                          <p><strong>Observación:</strong> {String(f.observacion || '').toUpperCase()}</p>
                        </div>
                        <div className="w-[100px] h-[60px] bg-slate-100 rounded border border-slate-200 overflow-hidden shrink-0 relative">
                          <img 
                            src={f.fotoUrl} 
                            alt={`Hallazgo ${i + 1}`}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-center text-[8px] text-slate-500 font-semibold">
                  <div>
                    <div className="w-24 border-b border-slate-300 mx-auto mb-1" />
                    <p className="text-slate-800 font-bold">{emailModalData.piloto || 'Piloto ROV'}</p>
                  </div>
                  <div>
                    <div className="w-24 border-b border-slate-300 mx-auto mb-1" />
                    <p className="text-slate-800 font-bold">{emailModalData.jefeCentro || 'Jefe de Centro'}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* ================= MODERN COMPOSE FORM ================= */
          <div className="flex-grow flex flex-col overflow-y-auto">
            
            {/* TO (DESTINATARIO) FIELD */}
            <div className="px-5 py-2.5 flex items-center border-b border-slate-100 text-xs gap-3">
              <span className="w-16 text-slate-400 font-medium">Para:</span>
              <input 
                type="text"
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                className="flex-grow bg-slate-50/70 border border-slate-200/90 focus:border-cyan-500 focus:bg-white rounded-lg px-3 py-1.5 outline-none text-slate-800 transition-all placeholder:text-slate-400 font-semibold text-xs"
                placeholder="destinatario@correo.cl (o varios separados por coma)"
              />
            </div>

            {/* SUBJECT FIELD */}
            <div className="px-5 py-2.5 flex items-center border-b border-slate-100 text-xs gap-3">
              <span className="w-16 text-slate-400 font-medium">Asunto:</span>
              <input 
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="flex-grow bg-slate-50/70 border border-slate-200/90 focus:border-cyan-500 focus:bg-white rounded-lg px-3 py-1.5 outline-none text-slate-800 transition-all font-semibold text-xs"
                placeholder="Asunto del correo"
              />
            </div>

            {/* BODY TEXT AREA */}
            <div className="px-5 pt-3 pb-2 flex-grow flex flex-col">
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full flex-grow bg-slate-50/30 border border-slate-200/60 rounded-xl p-3 outline-none focus:border-cyan-500 focus:bg-white text-xs text-slate-700 leading-relaxed font-sans resize-none placeholder:text-slate-400 transition-all"
                rows={8}
                placeholder="Escribe el cuerpo del mensaje aquí..."
              />
            </div>

            {/* ATTACHMENTS SECTION */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">
                    Archivos Adjuntos ({totalAttachmentsCount})
                  </span>
                </div>
                
                {/* Add files trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100/80 px-2.5 py-1 rounded-lg border border-cyan-200/60 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adjuntar PDF o Archivo</span>
                </button>
              </div>

              {/* Attachments Chips List */}
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pt-1">
                
                {/* Official Report PDF Chip */}
                {includeOfficialPdf ? (
                  <div className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center gap-2.5 transition-all shadow-2xs group">
                    <div className="w-7 h-7 bg-red-100 border border-red-200 text-red-600 rounded flex items-center justify-center font-bold text-[9px] shrink-0">
                      PDF
                    </div>
                    <div className="text-left">
                      <span className="text-[11px] font-bold text-slate-700 block max-w-[210px] truncate" title={pdfFilename}>
                        {pdfFilename}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        184 KB • Reporte Oficial
                      </span>
                    </div>
                    <div className="flex items-center gap-1 ml-1">
                      <button 
                        onClick={() => setShowPdfPreview(true)}
                        className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-cyan-600 transition-all cursor-pointer"
                        title="Previsualizar reporte PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setIncludeOfficialPdf(false)}
                        className="p-1 rounded text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                        title="Quitar este adjunto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIncludeOfficialPdf(true)}
                    className="border border-dashed border-slate-300 hover:border-cyan-500 rounded-xl p-2 flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-600 transition-all cursor-pointer bg-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Re-incluir Reporte Oficial ({pdfFilename})</span>
                  </button>
                )}

                {/* Custom Uploaded Files Chips */}
                {customAttachments.map((att) => {
                  const isPdf = att.filename.toLowerCase().endsWith('.pdf');
                  const isImg = att.filename.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/);
                  const badgeColor = isPdf 
                    ? 'bg-red-100 text-red-600 border-red-200' 
                    : isImg 
                      ? 'bg-purple-100 text-purple-600 border-purple-200' 
                      : 'bg-blue-100 text-blue-600 border-blue-200';
                  const badgeText = isPdf ? 'PDF' : isImg ? 'IMG' : 'DOC';

                  return (
                    <div 
                      key={att.id}
                      className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center gap-2.5 transition-all shadow-2xs group"
                    >
                      <div className={`w-7 h-7 rounded border flex items-center justify-center font-bold text-[9px] shrink-0 ${badgeColor}`}>
                        {badgeText}
                      </div>
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-slate-700 block max-w-[180px] truncate" title={att.filename}>
                          {att.filename}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          {att.size} • Adjunto
                        </span>
                      </div>
                      <button 
                        onClick={() => removeCustomAttachment(att.id)}
                        className="p-1 rounded text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer ml-1"
                        title="Eliminar archivo adjunto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* FOOTER ACTION BAR */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                
                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] disabled:bg-slate-300 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer select-none font-sans"
                >
                  {isSending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Despachando correo y adjuntos...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 fill-white" />
                      <span>Enviar Correo Oficial</span>
                    </>
                  )}
                </button>

                {/* Attach File Button Shortcut */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium border border-slate-200 bg-white"
                  title="Adjuntar otro documento o PDF"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Adjuntar</span>
                </button>
              </div>

              {/* Discard button */}
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                title="Descartar borrador"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
