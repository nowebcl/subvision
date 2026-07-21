import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Eye, Check, Paperclip, 
  Trash2, ChevronLeft, Send
} from 'lucide-react';

export const EmailPreviewModal: React.FC = () => {
  const { isEmailModalOpen, setIsEmailModalOpen, emailModalData } = useApp();
  const [customRecipient, setCustomRecipient] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (emailModalData) {
      setCustomRecipient(emailModalData.recipientEmail || 'gerencia@empresa.cl');
      const bodyText = `Estimados Gerencia de Operaciones y Equipo Técnico,

Adjuntamos el Informe Oficial de Inspección Submarina ROV y Mortalidad del centro de cultivo ${emailModalData.nombre || 'Pilpilehue'}.

El documento adjunto contiene el estado estructural de los módulos, integridad de costuras, biomasa y control de biofouling.

Piloto ROV: ${emailModalData.piloto}
Jefe de Centro: ${emailModalData.jefeCentro}
Empresa: ${emailModalData.empresa}
Puerto: ${emailModalData.puerto}

Atentamente,
División de Operaciones Submarinas
SERVIROV Soluciones Submarinas`;

      setEmailBody(bodyText);
    }
  }, [emailModalData]);

  if (!isEmailModalOpen || !emailModalData) return null;

  const { nombre, fecha, jefeCentro, piloto, puerto } = emailModalData;
  const pdfFilename = `INFORME_INSPECCION_${nombre.toUpperCase().replace(/\s+/g, '_')}_${fecha.replace(/-/g, '_')}.pdf`;

  const handleClose = () => {
    setIsEmailModalOpen(false);
    setShowPdfPreview(false);
    setSentSuccess(false);
    setIsSending(false);
  };

  const handleSend = () => {
    setIsSending(true);
    // Simulate short network delay
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    }, 1200);
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
  ];  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      
      {/* Sent Snackbar Notification */}
      {sentSuccess && (
        <div className="fixed bottom-6 left-6 z-[120] bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-4 text-xs border border-slate-800 animate-slide-in">
          <span className="flex items-center gap-1.5 font-medium">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>Correo oficial enviado con éxito.</span>
          </span>
          <button onClick={handleClose} className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider cursor-pointer">
            Deshacer
          </button>
        </div>
      )}

      {/* Modern Minimalist White Container */}
      <div className="bg-white text-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-200/60 w-full max-w-2xl overflow-hidden flex flex-col relative font-sans animate-scale-in">
        
        {/* MODERN MINIMAL LIGHT HEADER */}
        <div className="bg-slate-50/70 px-5 py-3.5 flex items-center justify-between border-b border-slate-200/50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Nuevo Mensaje — Despacho Técnico</span>
          <button 
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {showPdfPreview ? (
          /* ================= ATTACHMENT PREVIEW OVERLAY ================= */
          <div className="flex-grow bg-slate-900 flex flex-col min-h-[500px]">
            <div className="bg-slate-800 px-5 py-2.5 flex items-center justify-between text-slate-300 text-xs border-b border-slate-750">
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold tracking-tight transition-colors cursor-pointer text-[10px] uppercase font-mono"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
                <span>Volver al Borrador</span>
              </button>
              <span className="font-mono text-slate-400 text-[10px] truncate max-w-xs">{pdfFilename}</span>
            </div>

            {/* Simulated PDF print sheet inside overlay */}
            <div className="flex-grow overflow-y-auto p-4 flex justify-center">
              <div className="bg-white w-full max-w-xl shadow-2xl p-6 text-slate-800 space-y-4 rounded-xs text-[9.5px] leading-relaxed my-2">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-sky-700 tracking-wide uppercase">Camanchaca</span>
                  </div>
                  <div className="text-right">
                    <h1 className="font-black text-slate-900 uppercase leading-none text-xs">Informe de Inspección ROV</h1>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{nombre}</p>
                  </div>
                </div>

                {/* Grid info */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-slate-200 pb-3 font-medium text-[9px] text-slate-600">
                  <div><strong>Fecha:</strong> {fecha}</div>
                  <div><strong>Piloto:</strong> {piloto.toUpperCase()}</div>
                  <div><strong>Centro:</strong> {nombre}</div>
                  <div><strong>Puerto:</strong> {puerto.toUpperCase()}</div>
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
                          <p><strong>Observación:</strong> {f.observacion.toUpperCase()}</p>
                        </div>
                        <div className="w-[100px] h-[60px] bg-slate-100 rounded border border-slate-200 overflow-hidden shrink-0 relative">
                          <img 
                            src={f.fotoUrl} 
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
                    <p className="text-slate-800 font-bold">{piloto}</p>
                  </div>
                  <div>
                    <div className="w-24 border-b border-slate-300 mx-auto mb-1" />
                    <p className="text-slate-800 font-bold">{jefeCentro}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* ================= MODERN COMPOSE FORM ================= */
          <div className="flex-grow flex flex-col min-h-[480px]">
            
            {/* TO FIELD */}
            <div className="px-5 py-3 flex items-center border-b border-slate-100 text-xs gap-4">
              <span className="w-12 text-slate-400 font-medium">Para:</span>
              <input 
                type="email"
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                className="flex-grow bg-slate-50/60 border border-slate-200/80 focus:border-slate-300 rounded-lg px-3 py-1.5 outline-none text-slate-700 transition-all placeholder:text-slate-400 font-semibold"
                placeholder="correo@titular.cl"
              />
            </div>

            {/* SUBJECT FIELD */}
            <div className="px-5 py-3 flex items-center border-b border-slate-100 text-xs gap-4">
              <span className="w-12 text-slate-400 font-medium">Asunto:</span>
              <div className="flex-grow font-bold text-slate-700 pl-3 py-1.5 bg-slate-50 border border-slate-150 rounded-lg">
                [INFORME OFICIAL] Inspección ROV y Mortalidad - {nombre} ({fecha})
              </div>
            </div>

            {/* BODY TEXT AREA */}
            <div className="flex-grow p-5 flex flex-col">
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full flex-grow bg-transparent border-none outline-none text-xs text-slate-700 leading-relaxed font-sans resize-none placeholder:text-slate-400"
                style={{ minHeight: '260px' }}
              />

              {/* ATTACHMENT CARD (MODERN LIGHT STYLE) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex">
                <div className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 flex items-center gap-3.5 w-max transition-all shadow-2xs group">
                  <div className="w-8 h-8 bg-red-100 border border-red-200 text-red-600 rounded flex items-center justify-center font-bold text-[9px] shrink-0">
                    PDF
                  </div>
                  <div className="pr-1 text-left">
                    <span className="text-[10px] font-bold text-slate-700 block max-w-[200px] truncate">{pdfFilename}</span>
                    <span className="text-[9px] text-slate-450 block font-mono">2.4 MB • Reporte Adjunto</span>
                  </div>
                  <button 
                    onClick={() => setShowPdfPreview(true)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-200/50 hover:text-cyan-600 transition-all cursor-pointer"
                    title="Previsualizar reporte PDF"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* MODERN FOOTER ACTION BAR */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-4">
                
                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-300 text-white text-xs font-bold px-6 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer select-none font-sans"
                >
                  {isSending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 fill-white" />
                      <span>Enviar</span>
                    </>
                  )}
                </button>

                {/* Tool Attachment Icon */}
                <button 
                  onClick={() => setShowPdfPreview(true)}
                  className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Ver adjunto"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>

              {/* Discard button */}
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                title="Descartar borrador"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
