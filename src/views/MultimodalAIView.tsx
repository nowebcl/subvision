import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BrainCircuit, Send, FileText, Image, Search, User } from 'lucide-react';
import { queryGroq } from '../lib/groq';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  attachment?: {
    name: string;
    type: 'sonar' | 'image' | 'document';
  };
  timestamp: string;
}

export const MultimodalAIView: React.FC = () => {
  const { currentUser, selectedCenter } = useApp();
  const [inputText, setInputText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<{ name: string; type: 'sonar' | 'image' | 'document' } | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const userEmail = currentUser?.email || 'default';
    const saved = localStorage.getItem(`subvision_chat_history_${userEmail}`);
    if (saved) {
      return JSON.parse(saved);
    }
    const userName = currentUser?.name?.split(' ')[0] || 'Operador';
    return [
      {
        id: 'msg-1',
        sender: 'ai' as const,
        text: `Hola ${userName}. Soy el Agente IA Servirov. Puedo asistirte en la interpretación de ecogramas, reportes de fondeo, análisis acústicos y detección de roturas de mallas. ¿Qué deseas analizar hoy? ¿Quieres enviar un informe?`,
        timestamp: '15:20'
      }
    ];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userEmail = currentUser?.email || 'default';
    localStorage.setItem(`subvision_chat_history_${userEmail}`, JSON.stringify(chatHistory));
  }, [chatHistory, currentUser]);

  const clearChatHistory = () => {
    const userName = currentUser?.name?.split(' ')[0] || 'Operador';
    const initialMsg = [
      {
        id: 'msg-1',
        sender: 'ai' as const,
        text: `Hola ${userName}. Soy el Agente IA Servirov. Puedo asistirte en la interpretación de ecogramas, reportes de fondeo, análisis acústicos y detección de roturas de mallas. ¿Qué deseas analizar hoy? ¿Quieres enviar un informe?`,
        timestamp: new Date().toLocaleTimeString().substring(0, 5)
      }
    ];
    setChatHistory(initialMsg);
  };

  const groqModel = 'llama-3.1-8b-instant';

  const queryGemini = async (userText: string, fileAttachment: typeof selectedAttachment): Promise<string> => {
    const systemPrompt = `Eres el Agente IA Servirov de SUBVISION, una plataforma industrial desarrollada por la empresa SERVIROV para el monitoreo de redes de pesca y centros de cultivo.
Tu función es ayudar a los operadores técnicos a analizar la telemetría, el estado de las mallas, las líneas de fondeo y los parámetros oceanográficos del centro seleccionado.

Aquí tienes el estado actual del Centro de Cultivo en tiempo real:
- Nombre del Centro: ${selectedCenter.name}
- Ubicación: ${selectedCenter.location} (${selectedCenter.region})
- Coordenadas Geográficas: ${selectedCenter.coordinates}

Parámetros Oceanográficos:
- Temperatura del Agua: ${selectedCenter.waterParams.temperature} °C
- Oxígeno Disuelto: ${selectedCenter.waterParams.dissolvedOxygen} mg/L
- pH: ${selectedCenter.waterParams.ph}
- Salinidad: ${selectedCenter.waterParams.salinity} psu
- Velocidad de Corriente: ${selectedCenter.waterParams.currentSpeed} nudos

Módulos e Integridad de Redes (Mallas Peceras/Loberas):
${selectedCenter.cages.map(c => `* ${c.name.replace('Jaula', 'Módulo')}: Especie = ${c.species}, Cantidad de Peces = ${c.count}, Peso Promedio = ${c.avgWeightKg} kg, Biomasa = ${c.biomassTons} ton, Integridad de Malla = ${c.netIntegrity}%, Tensión de Fondeo = ${c.mooringTensionKn} kN, Estado de Alerta = ${c.status}`).join('\n')}

Líneas de Fondeo y Anclajes:
${selectedCenter.mooringLines.map(l => `* ${l.code}: Tensión = ${l.tensionKn} kN (Límite Máximo = ${l.limitKn} kN), Estado = ${l.status}, Ángulo = ${l.angle}°`).join('\n')}

Reglas operativas para tus respuestas:
1. Sé técnico, profesional, conciso y directo en tus respuestas.
2. Utiliza formato markdown para estructurar tus respuestas (títulos ###, listas con *, negritas).
3. Si el usuario te pregunta sobre un centro o sobre datos específicos (ej. "¿Cómo está el oxígeno?", "¿Hay alguna jaula crítica?"), responde con base EN LA TELEMETRÍA REAL listada arriba.
4. Si el usuario adjunta un archivo (ej. ecograma o imagen submarina), analiza semánticamente el archivo mencionado y genera un diagnóstico realista (por ejemplo, relacionando roturas en la malla o biofouling).
5. Mantén un tono industrial-técnico y no comercial.
6. Al finalizar cada una de tus respuestas o análisis técnicos, debes preguntarle siempre al usuario al final del texto: "¿Quieres enviar un informe?".`;

    let finalPrompt = userText;
    if (fileAttachment) {
      finalPrompt = `[Archivo Adjunto Cargado: ${fileAttachment.name} (tipo: ${fileAttachment.type})]\n\n${userText}`;
    }

    try {
      return await queryGroq(systemPrompt, finalPrompt, groqModel);
    } catch (err: any) {
      console.error(err);
      return `### Error del Asistente AI\n\nNo se pudo obtener el diagnóstico del motor de IA (Groq):\n*   **Mensaje:** ${err.message || err}`;
    }
  };

  const handleSend = async (textToSend: string, fileAttachment = selectedAttachment) => {
    if (!textToSend.trim() && !fileAttachment) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      attachment: fileAttachment ? { name: fileAttachment.name, type: fileAttachment.type } : undefined,
      timestamp: new Date().toLocaleTimeString().substring(0, 5)
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedAttachment(null);
    setLoading(true);

    const botResponse = await queryGemini(textToSend, fileAttachment);

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'ai',
      text: botResponse,
      timestamp: new Date().toLocaleTimeString().substring(0, 5)
    };

    setChatHistory(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="flex-1 flex bg-slate-50 min-h-[calc(100vh-73px)] animate-fade-in">
      
      {/* Chat workspace */}
      <div className="flex-1 flex flex-col p-6 space-y-6">
        
        {/* View Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-cyan-600 animate-pulse" />
              Agente IA Servirov
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Analice imágenes submarinas, telemetría o archivos acústicos para diagnosticar fallas estructurales.
            </p>
          </div>
          <div className="flex items-center gap-3">

            
            <button 
              onClick={clearChatHistory}
              className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm bg-white"
            >
              Limpiar Chat
            </button>
          </div>
        </div>

        {/* Message Logs */}
        <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-premium overflow-y-auto space-y-4 max-h-[460px]">
          {chatHistory.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isAI ? 'bg-slate-900 text-white' : 'bg-cyan-500 text-slate-950'
                }`}>
                  {isAI ? 'AI' : <User className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className={`p-4 rounded-2xl text-xs space-y-2 border ${
                  isAI 
                    ? 'bg-slate-50 border-slate-100 text-slate-700' 
                    : 'bg-cyan-50 border-cyan-100/50 text-slate-800'
                }`}>
                  {msg.attachment && (
                    <div className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-100 font-mono text-[10px] text-slate-500 mb-1">
                      {msg.attachment.type === 'sonar' ? <Search className="w-4 h-4 text-cyan-600" /> : msg.attachment.type === 'image' ? <Image className="w-4 h-4 text-cyan-600" /> : <FileText className="w-4 h-4 text-cyan-600" />}
                      <span>{msg.attachment.name}</span>
                    </div>
                  )}

                  {/* Render text with basic markdown format */}
                  <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-sans">
                    {msg.text.split('\n').map((line, lIndex) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={lIndex} className="text-sm font-bold text-slate-900 mt-2 mb-1 flex items-center gap-1.5">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('*   ') || line.startsWith('-   ')) {
                        return <li key={lIndex} className="ml-4 list-disc text-slate-600">{line.substring(4)}</li>;
                      }
                      if (line.startsWith('1.  ') || line.startsWith('2.  ')) {
                        return <li key={lIndex} className="ml-4 list-decimal text-slate-600">{line.substring(4)}</li>;
                      }
                      // bold text replacement
                      if (line.includes('**')) {
                        const parts = line.split('**');
                        return (
                          <p key={lIndex} className="my-1">
                            {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-950 font-bold">{p}</strong> : p)}
                          </p>
                        );
                      }
                      return <p key={lIndex} className="my-1">{line}</p>;
                    })}
                  </div>
                  
                  <div className="text-[9px] text-slate-400 text-right font-mono mt-1">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-2xl">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                AI
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px] text-slate-400 font-mono ml-2">Analizando datos oceanográficos...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="space-y-3">
          {/* Selected File Banner */}
          {selectedAttachment && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-cyan-50 border border-cyan-100 rounded-xl text-[10px] text-cyan-800 w-max gap-4 font-mono">
              <span className="flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5" /> Archivo cargado: {selectedAttachment.name}
              </span>
              <button onClick={() => setSelectedAttachment(null)} className="font-bold hover:text-cyan-950 font-mono text-xs">X</button>
            </div>
          )}

          <div className="flex gap-3 bg-white border border-slate-100 rounded-2xl p-2.5 shadow-premium">
            <div className="flex items-center gap-1.5 border-r border-slate-100 pr-2">
              {/* Simulate attachment buttons */}
              <button
                onClick={() => setSelectedAttachment({ name: 'sonar_grid_jaula105.raw', type: 'sonar' })}
                title="Cargar ecograma sonar"
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-cyan-600 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedAttachment({ name: 'rov_bottom_tears.jpg', type: 'image' })}
                title="Cargar foto submarina"
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-cyan-600 transition-colors"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
              placeholder="Pregunte sobre mallas, fondeos o suba ecogramas de sonar..."
              className="flex-1 bg-transparent border-none text-slate-700 placeholder-slate-400 text-xs focus:outline-none px-2"
            />
            
            <button
              onClick={() => handleSend(inputText)}
              className="p-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
