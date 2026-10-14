const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// ==========================================
// 1. GENERAR DOCUMENTO MARKDOWN
// ==========================================
const mdContent = `# SUBVISION — INFORME TÉCNICO MAESTRO Y BLUEPRINT DE IMPLEMENTACIÓN (FASE BETA)

> **Documento de Especificación de Arquitectura, Migración y Hoja de Ruta Operativa para Agentes de Inteligencia Artificial y Equipos de Ingeniería.**  
> **Versión:** 2.0-BETA-SPEC  
> **Entidad Desarrolladora:** Noweb Labs  
> **Cliente / Destinatario:** SERVIROV Ltda.  
> **Fecha de Emisión:** Agosto 2026  
> **Estado:** Aprobado para Ejecución de Fase Beta  

---

## 1. RESUMEN EJECUTIVO

**SUBVISION** es una plataforma industrial inteligente de monitoreo, telemetría y diagnóstico predictivo diseñada específicamente para operaciones de inspección submarina con vehículos operados remotamente (ROV), buceo técnico y gestión estructural de centros de cultivo de salmónidos en alta mar.

Tras la culminación exitosa de la etapa de **Prototipo (Prueba de Concepto - PoC)**, donde se validó la interacción de usuario (UX/UI), la visualización 3D en WebGL, el asistente de IA multimodal y la simulación de automatizaciones de mensajería operativa, el proyecto avanza formalmente a la **Fase Beta**.

El presente documento constituye el **Blueprint Técnico Exhaustivo** diseñado para que **agentes de inteligencia artificial autónomos** y equipos de desarrollo de software ejecuten de manera precisa, metódica y estructurada la construcción, refactorización, persistencia real, endurecimiento de seguridad y despliegue de la versión Beta de SUBVISION.

---

## 2. AUDITORÍA TÉCNICA DEL PROTOTIPO ACTUAL (DIAGNÓSTICO AS-IS)

### 2.1 Componentes y Vistas Implementadas en el Prototipo
El prototipo actual cuenta con una arquitectura base funcional construida sobre **React 19 + TypeScript + Vite + Tailwind CSS v4**:

1. **DashboardView**: Centro de control con KPIs operativos, listado de informes de inmersión ROV, telemetría resumida de centros (oxígeno, corrientes, salinidad) y visor modal 3D.
2. **InstallationsView**: Matriz de jaulas de cultivo, módulo de cables de fondeo y monitoreo de tensiones en kilonewtons (kN).
3. **InspectionChecklistView**: Formularios interactivos de verificación pre y post inmersión ROV con asistente de autocompletado asistido por IA.
4. **FindingsView**: Registro de hallazgos críticos (roturas de red peceras/loberas, biofouling, deformación de corchetes, mortalidad).
5. **MultimodalAIView**: Consola técnica conectada al proxy \`/api/chat\` para procesamiento de consultas técnicas y análisis semántico de reportes/imágenes.
6. **RealTimeVideoAIView / Infrastructure3DViewer**: Renderizado de mallas de jaulas en 3D (Three.js / React Three Fiber) y visor de transmisiones de video submarino con overlay de telemetría.
7. **WhatsAppAutomationsView & Simulation**: Simulador de despacho de alertas a supervisores de centro y cuadrillas de buceo.
8. **AIChatbotWidget, PhoneAlertModal, EmailPreviewModal**: Componentes modales flotantes para interacción omnicanal.

### 2.2 Deuda Técnica y Dependencias Provisionales (A Eliminar en Beta)
* **Persistencia Híbrida / LocalStorage Fallback**: El prototipo depende actualmente de un fallback a \`localStorage\` y conjuntos de datos mock (\`src/data/mockData.ts\`) cuando no hay sesión activa o conexión a red. En la Fase Beta, toda mutación de datos debe estar vinculada a PostgreSQL en Supabase con sincronización offline estructurada.
* **Seguridad y RLS Provisionales**: La política inicial de base de datos (\`Permitir todo a usuarios\`) debe reemplazarse por políticas granulares basadas en roles (\`admin\`, \`pilot_rov\`, \`supervisor\`, \`client\`) y pertenencia a empresa (\`company_id\`).
* **Inferencia de Visión en Tiempo Real en Cliente**: El análisis de frames de video se realiza por polling y prompts textuales; se requiere un pipeline estructurado de visión computacional y modelos multimodales optimizados para keyframes.

---

## 3. ARQUITECTURA OBJETIVO DE LA FASE BETA (TARGET ARCHITECTURE TO-BE)

### 3.1 Diagrama de Arquitectura del Ecosistema

\`\`\`
+-----------------------------------------------------------------------------------+
|                              SUBVISION BETA PLATFORM                              |
+-----------------------------------------------------------------------------------+
                                          |
     +------------------------------------+-----------------------------------+
     |                                                                        |
     v                                                                        v
+-------------------------------+                            +-------------------------------+
|     CAPA DE CLIENTE (SPA/PWA) |                            |   DISPOSITIVOS EN TERRENO     |
| • React 19 + TypeScript 6.0   |                            | • ROVs Submarinos (RTSP/IP)   |
| • Tailwind CSS 4 Glassmorphism| <========================> | • Sensores CTDO (Oxígeno/Temp)|
| • Three.js WebGL 3D Twin      |      WebSockets / RTC      | • Celulares Supervisores / WA |
| • Offline Sync Engine (Idb)   |                            | • Tablets de Buceo Técnico    |
+-------------------------------+                            +-------------------------------+
     |                                                                        |
     | HTTPS / REST / WSS                                                     | MQTT / Webhooks
     v                                                                        v
+-----------------------------------------------------------------------------------+
|                        API GATEWAY & PROXY SERVERLESS                             |
| • Vercel Edge Serverless Functions (/api/chat, /api/telemetry, /api/reports)       |
| • Rate Limiting, Sanitización de Payloads & Auth Token Validation                 |
+-----------------------------------------------------------------------------------+
     |                                               |
     +-----------------------+                       +------------------------+
     v                       v                       v                        v
+------------------+  +------------------+  +--------------------+  +-------------------+
| SUPABASE CLOUD   |  | MOTOR IA MULTI-  |  | WHATSAPP BUSINESS  |  | STORAGE BUCKETS   |
| • PostgreSQL 16  |  | MODEL PIPELINE   |  | CLOUD API          |  | • Videos ROV MP4  |
| • Row Level Sec. |  | • DeepSeek-V3    |  | • Webhook Dispatch |  | • Sonar RAW / Eco |
| • Supabase Auth  |  | • DeepSeek-R1    |  | • Interactive MSGs |  | • Reportes PDF    |
| • Realtime WSS   |  | • Groq / Llama   |  | • Alertas Críticas |  | • Certificados |
+------------------+  +------------------+  +--------------------+  +-------------------+
\`\`\`

### 3.2 Desglose de Capas Tecnológicas

| Capa | Tecnologías Seleccionadas | Justificación Técnica para Fase Beta |
| :--- | :--- | :--- |
| **Frontend SPA & PWA** | React 19, TypeScript, Vite 8, Lucide React, Tailwind CSS 4 | React 19 ofrece transiciones fluidas de renderizado. Tailwind 4 optimiza el tamaño de bundle para conexiones 4G/satelitales (Starlink) en altamar. Modo PWA para instalación en tablets industriales. |
| **Renderizado 3D / Digital Twin** | Three.js, @react-three/fiber, @react-three/drei | Representación espacial 3D paramétrica de los módulos de jaula (mallas loberas, peceras, muertos de anclaje, líneas de fondeo) con mapeo de calor según tensiones y roturas. |
| **Backend & Edge Gateway** | Node.js Serverless Functions (Vercel Edge), REST, WebSockets | Aislamiento completo de claves de API (DeepSeek, Groq, WhatsApp Cloud API, Resend/SendGrid). Latencia de borde mínima. |
| **Base de Datos & Auth** | Supabase (PostgreSQL 16 Enterprise), RLS, Realtime | Persistencia relacional ACID, disparadores SQL (\`triggers\`), funciones PL/pgSQL para cálculo de promedios de telemetría y seguridad granular por tenant. |
| **Motor de IA Multimodal** | DeepSeek-V3, DeepSeek-R1 (Reasoner), Vision Embeddings | DeepSeek-V3 para interacción técnica y redacción de minutas; DeepSeek-R1 para razonamiento físico-mecánico (distribución de cargas de tracción y análisis de catenarias de fondeo). |
| **Comunicaciones & Alertas** | Meta WhatsApp Cloud API, Webhooks, PDFKit / Puppeteer | Despacho instantáneo de notificaciones ricas (texto, botones de confirmación, enlace a PDF) ante incidentes clasificados con severidad 'Crítica' o 'Grave'. |

---

## 4. ESPECIFICACIÓN DEL MODELO DE DATOS Y ESQUEMA SQL (FASE BETA)

\`\`\`sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Empresas Clientes y Contratistas (Tenants)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    commercial_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Perfiles de Usuario con Roles y Permisos Granulares
CREATE TYPE user_role AS ENUM ('superadmin', 'company_admin', 'rov_pilot', 'dive_supervisor', 'client_viewer');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    rut TEXT,
    role user_role DEFAULT 'client_viewer' NOT NULL,
    phone_whatsapp TEXT,
    license_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 3. Centros de Cultivo Acuícola (Instalaciones)
CREATE TABLE IF NOT EXISTS public.aquaculture_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    code_sernapesca TEXT NOT NULL,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    commune TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    total_cages INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 4. Módulos y Jaulas de Cultivo (Gemelo Digital)
CREATE TABLE IF NOT EXISTS public.cages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID REFERENCES public.aquaculture_centers(id) ON DELETE CASCADE NOT NULL,
    cage_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    shape_type TEXT DEFAULT 'square' NOT NULL,
    width_m NUMERIC(6, 2) NOT NULL,
    length_m NUMERIC(6, 2) NOT NULL,
    depth_m NUMERIC(6, 2) NOT NULL,
    species TEXT DEFAULT 'Salmo salar',
    fish_count INTEGER DEFAULT 0,
    avg_weight_kg NUMERIC(6, 3) DEFAULT 0,
    biomass_tons NUMERIC(8, 2) DEFAULT 0,
    net_integrity_pct NUMERIC(5, 2) DEFAULT 100.0,
    status TEXT DEFAULT 'Optimo' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE(center_id, cage_number)
);

-- 5. Líneas de Fondeo y Anclajes
CREATE TABLE IF NOT EXISTS public.mooring_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID REFERENCES public.aquaculture_centers(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    nominal_tension_kn NUMERIC(7, 2) NOT NULL,
    max_safe_tension_kn NUMERIC(7, 2) NOT NULL,
    current_tension_kn NUMERIC(7, 2) NOT NULL,
    angle_degrees NUMERIC(5, 2) DEFAULT 0.0,
    depth_anchor_m NUMERIC(6, 2) DEFAULT 0.0,
    status TEXT DEFAULT 'Normal' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 6. Telemetría Oceanográfica en Series Temporales
CREATE TABLE IF NOT EXISTS public.oceanographic_telemetry (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    center_id UUID REFERENCES public.aquaculture_centers(id) ON DELETE CASCADE NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    water_temperature_c NUMERIC(4, 2),
    dissolved_oxygen_mg_l NUMERIC(4, 2),
    oxygen_saturation_pct NUMERIC(5, 2),
    ph_level NUMERIC(4, 2),
    salinity_psu NUMERIC(4, 2),
    current_speed_knots NUMERIC(4, 2),
    current_direction_deg NUMERIC(5, 2),
    turbidity_ntu NUMERIC(5, 2)
);
CREATE INDEX idx_telemetry_center_time ON public.oceanographic_telemetry(center_id, recorded_at DESC);

-- 7. Campañas e Informes de Inspección ROV
CREATE TABLE IF NOT EXISTS public.rov_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_code TEXT UNIQUE NOT NULL,
    center_id UUID REFERENCES public.aquaculture_centers(id) ON DELETE CASCADE NOT NULL,
    pilot_id UUID REFERENCES public.profiles(id) NOT NULL,
    supervisor_id UUID REFERENCES public.profiles(id),
    inspection_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    rov_model TEXT NOT NULL,
    depth_max_m NUMERIC(6, 2),
    water_clarity_m NUMERIC(4, 2),
    port_status TEXT DEFAULT 'Abierto',
    summary TEXT,
    ai_generated_verdict TEXT,
    pdf_report_url TEXT,
    status TEXT DEFAULT 'Completado' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 8. Registro Específico de Hallazgos y Roturas (Findings)
CREATE TABLE IF NOT EXISTS public.inspection_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES public.rov_inspections(id) ON DELETE CASCADE NOT NULL,
    cage_id UUID REFERENCES public.cages(id) ON DELETE SET NULL,
    finding_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    depth_m NUMERIC(6, 2) NOT NULL,
    location_description TEXT NOT NULL,
    estimated_size_cm NUMERIC(6, 2),
    image_url TEXT,
    video_timestamp_sec INTEGER,
    recommended_action TEXT,
    repaired BOOLEAN DEFAULT FALSE,
    repaired_at TIMESTAMPTZ,
    diver_assigned TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 9. Reglas y Registro de Alertas Automáticas (WhatsApp / Email)
CREATE TABLE IF NOT EXISTS public.alert_dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID REFERENCES public.aquaculture_centers(id) ON DELETE CASCADE NOT NULL,
    finding_id UUID REFERENCES public.inspection_findings(id) ON DELETE SET NULL,
    channel TEXT NOT NULL,
    recipient TEXT NOT NULL,
    message_body TEXT NOT NULL,
    status TEXT DEFAULT 'sent' NOT NULL,
    response_payload JSONB,
    sent_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);
\`\`\`

---

## 5. HOJA DE RUTA DETALLADA PASO A PASO PARA EL AGENTE DE IA (SPRINTS)

### Sprint 1: Infraestructura de Base de Datos y Políticas RLS en Supabase
* Ejecutar script SQL de migración y crear triggers de auditoría.
* Configurar políticas de Row Level Security (RLS) por \`company_id\` y \`role\`.
* Crear datos semilla reales para los centros Pilpilehue, Apiao y Quellón.

### Sprint 2: Refactorización de Estado Global (\`AppContext.tsx\`) y Eliminación de Mocks
* Crear \`src/types/database.types.ts\` con tipos generados de Supabase.
* Reemplazar llamadas a \`mockData.ts\` por clientes Supabase con queries optimizadas.
* Implementar suscripción a Realtime (\`supabase.channel\`) para telemetría y hallazgos.

### Sprint 3: Visor 3D y Gemelo Digital con Telemetría en Tiempo Real
* Parametrizar mallas de jaulas y cables de fondeo con datos dinámicos de Supabase.
* Implementar cálculo de curvatura de catenaria para líneas de fondeo en WebGL.
* Posicionar marcadores tridimensionales de hallazgos con interactividad de cámara.

### Sprint 4: Pipeline de IA Multimodal y Procesamiento de Frames de Video
* Implementar captura de keyframes en \`RealTimeVideoAIView\` con compresión JPEG.
* Conectar proxy \`/api/chat\` con DeepSeek-V3 y DeepSeek-R1.
* Parseo de JSON estructurado para inserción automática en \`inspection_findings\`.

### Sprint 5: Motor de Alertas Operativas, WhatsApp y Generación de PDF
* Implementar webhook/endpoint serverless para Meta WhatsApp Business API.
* Generar reportes PDF estandarizados con firmas digitales, fotos y telemetría.

### Sprint 6: Modo Offline (PWA), Hardening de Seguridad y Despliegue en Staging
* Implementar Service Worker y almacenamiento local IndexedDB con cola de sincronización diferida.
* Configurar cabeceras de seguridad CSP y auditoría de permisos.
* Despliegue en Vercel Staging y validación de aceptación (UAT).

---
*SUBVISION © 2026 — Plataforma Industrial de Inspección Acuícola — Documento Técnico Oficial para Fase Beta.*
`;

const mdFilePath = path.resolve(__dirname, 'INFORME_TECNICO_FASE_BETA_SUBVISION.md');
fs.writeFileSync(mdFilePath, mdContent, 'utf8');
console.log('Documento Markdown creado en:', mdFilePath);


// ==========================================
// 2. GENERADOR DE PDF PROFESIONAL DE 10 PÁGINAS
// ==========================================
const pdfDoc = new PDFDocument({
  size: 'A4',
  bufferPages: true,
  margins: {
    top: 45,
    bottom: 50,
    left: 45,
    right: 45
  }
});

const pdfOutputPath = path.resolve(__dirname, 'INFORME_TECNICO_FASE_BETA_SUBVISION.pdf');
const writeStream = fs.createWriteStream(pdfOutputPath);
pdfDoc.pipe(writeStream);

// Paleta de Colores Corporativos SUBVISION / SERVIROV
const cPrimary = '#0891b2';   // Cyan 600
const cSecondary = '#0284c7'; // Sky 600
const cDark = '#0f172a';      // Slate 900
const cGray = '#334155';      // Slate 700
const cMuted = '#64748b';     // Slate 500
const cLightBg = '#f8fafc';   // Slate 50
const cCardBg = '#f1f5f9';    // Slate 100
const cBorder = '#cbd5e1';    // Slate 300
const cAccent = '#059669';    // Emerald 600
const cWarning = '#d97706';   // Amber 600
const cDanger = '#dc2626';    // Red 600

// Helper para títulos de sección
const renderHeader = (title, category = 'ESPECIFICACIÓN TÉCNICA - FASE BETA') => {
  pdfDoc.fillColor(cPrimary)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(category.toUpperCase(), 45, 45, { characterSpacing: 1.5 });

  pdfDoc.fillColor(cDark)
        .font('Helvetica-Bold')
        .fontSize(15)
        .text(title, 45, 58);

  pdfDoc.strokeColor(cPrimary)
        .lineWidth(1.5)
        .moveTo(45, 80)
        .lineTo(550, 80)
        .stroke();

  pdfDoc.moveDown(1.5);
};

// Helper para dibujar tarjetas con borde
const renderCard = (x, y, w, h, title, contentLines, badgeText = null, badgeColor = cPrimary) => {
  pdfDoc.save();
  pdfDoc.rect(x, y, w, h).fillAndStroke(cLightBg, cBorder);
  
  // Título
  pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(9.5).text(title, x + 10, y + 8);

  // Badge opcional
  if (badgeText) {
    const bW = pdfDoc.widthOfString(badgeText, { fontSize: 7 }) + 10;
    pdfDoc.rect(x + w - bW - 8, y + 6, bW, 13).fill(badgeColor);
    pdfDoc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7).text(badgeText, x + w - bW - 8, y + 9, { width: bW, align: 'center' });
  }

  // Contenido
  let curY = y + 26;
  contentLines.forEach(line => {
    pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8).text(line, x + 10, curY, { width: w - 20, lineGap: 2 });
    curY += pdfDoc.heightOfString(line, { width: w - 20, fontSize: 8 }) + 3;
  });

  pdfDoc.restore();
};

// ============================================================================
// PÁGINA 1: PORTADA EJECUTIVA
// ============================================================================
pdfDoc.rect(40, 40, 515, 762).strokeColor('#e2e8f0').lineWidth(1.5).stroke();
pdfDoc.rect(43, 43, 509, 756).strokeColor('#f1f5f9').lineWidth(0.8).stroke();

// Logo
const logoCircularPath = path.resolve(__dirname, 'public/LOGO_CIRCULAR.png');
if (fs.existsSync(logoCircularPath)) {
  pdfDoc.image(logoCircularPath, 237.5, 95, { width: 120 });
}

// Título Principal
pdfDoc.fillColor(cPrimary)
      .font('Helvetica-Bold')
      .fontSize(28)
      .text('SUBVISION', 45, 235, { align: 'center', characterSpacing: 3 });

pdfDoc.fillColor(cDark)
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('BLUEPRINT TÉCNICO Y ARQUITECTURA DE IMPLEMENTACIÓN', 45, 270, { align: 'center' });

pdfDoc.fillColor(cSecondary)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('TRANSICIÓN INTEGRAL: DE PROTOTIPO A VERSIÓN BETA INDUSTRIAL', 45, 290, { align: 'center' });

pdfDoc.fillColor(cMuted)
      .font('Helvetica')
      .fontSize(9)
      .text('Guía Maestra para Agentes de Inteligencia Artificial y Equipos de Ingeniería de Software', 45, 310, { align: 'center' });

// Badges de Estado
const drawCoverBadge = (x, y, w, text, bg) => {
  pdfDoc.rect(x, y, w, 18).fill(bg);
  pdfDoc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8).text(text, x, y + 4.5, { width: w, align: 'center' });
};
drawCoverBadge(135, 335, 100, 'FASE: BETA BUILD', cPrimary);
drawCoverBadge(245, 335, 110, 'ESTADO: APROBADO', cAccent);
drawCoverBadge(365, 335, 100, 'VERSIÓN: 2.0-BETA', cDark);

// Panel de Resumen Técnico
pdfDoc.rect(70, 375, 455, 175).fillAndStroke(cLightBg, cBorder);
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(10.5).text('RESUMEN DE ALCANCE Y PILARES DE LA FASE BETA', 85, 390);

const coverPoints = [
  '• Persistencia de Datos Completa: Migración de LocalStorage hacia Supabase Cloud (PostgreSQL 16 con RLS estricto).',
  '• Gemelo Digital 3D: Visor WebGL interactivo de centros de cultivo, jaulas y líneas de fondeo con tensiones dinámicas (kN).',
  '• Motor IA Multi-Modelo: Orquestación DeepSeek-V3 (redacción técnica), DeepSeek-R1 (física estructural) y Groq Llama 3.',
  '• Visión Submarina & Keyframes: Análisis de video en tiempo real para detección de roturas de mallas y biofouling.',
  '• Canal de Alertas WhatsApp: Despacho automatizado de notificaciones críticas a cuadrillas de buceo y supervisores.',
  '• Modo de Operación Offline-First: Arquitectura PWA con almacenamiento IndexedDB para contingencias satelitales en altamar.'
];

let cpY = 412;
coverPoints.forEach(pt => {
  pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8.5).text(pt, 85, cpY, { width: 425 });
  cpY += 21;
});

// Metadatos al pie
pdfDoc.rect(70, 570, 455, 185).fillAndStroke('#ffffff', '#e2e8f0');

const renderMetaCol = (x, y, label, val, sub) => {
  pdfDoc.fillColor(cMuted).font('Helvetica-Bold').fontSize(7.5).text(label, x, y);
  pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(9.5).text(val, x, y + 12);
  if (sub) pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8).text(sub, x, y + 26);
};

renderMetaCol(85, 585, 'CLIENTE / DESTINATARIO:', 'SERVIROV Ltda.', 'Inspecciones Submarinas y Acuicultura');
renderMetaCol(300, 585, 'DESARROLLADO POR:', 'Noweb Labs', 'División de Arquitectura e Inteligencia Artificial');

renderMetaCol(85, 635, 'FECHA DE EMISIÓN:', 'Agosto 2026', 'Ciclo de Desarrollo Q3-Q4 2026');
renderMetaCol(300, 635, 'STACK PRINCIPAL:', 'React 19, TS 6, Supabase, Three.js', 'Tailwind CSS v4, Vercel Edge, DeepSeek');

renderMetaCol(85, 685, 'OBJETIVO DEL REPORTE:', 'Especificación para Agente IA', 'Instrucciones ejecutables de refactor y build');
renderMetaCol(300, 685, 'NIVEL DE SEGURIDAD:', 'Confidencial Industrial', 'Uso Exclusivo de Ingeniería SERVIROV');


// ============================================================================
// PÁGINA 2: RESUMEN EJECUTIVO Y AUDITORÍA AS-IS (PROTOTIPO)
// ============================================================================
pdfDoc.addPage();
renderHeader('1. RESUMEN EJECUTIVO Y AUDITORÍA DEL PROTOTIPO', 'DIAGNÓSTICO AS-IS');

pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8.5)
      .text('El prototipo de SUBVISION validó exitosamente la viabilidad técnica y operativa del sistema en el entorno de inspección acuícola. A continuación se audita el estado actual de cada módulo desarrollado y se identifica la deuda técnica que debe subsanarse en la Fase Beta.', 45, 95, { width: 505, lineGap: 3 });

// Tabla de Auditoría de Vistas
const drawTableHeader = (y, cols) => {
  pdfDoc.rect(45, y, 505, 18).fill(cCardBg);
  cols.forEach(c => {
    pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(8).text(c.text, c.x, y + 5, { width: c.w, align: c.align || 'left' });
  });
};

const drawTableRow = (y, cols, isAlt) => {
  if (isAlt) pdfDoc.rect(45, y, 505, 28).fill('#fafafa');
  pdfDoc.rect(45, y, 505, 28).strokeColor('#f1f5f9').lineWidth(0.5).stroke();
  cols.forEach(c => {
    pdfDoc.fillColor(c.color || cGray).font(c.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.5).text(c.text, c.x, y + 4, { width: c.w, align: c.align || 'left' });
  });
};

const viewsAudit = [
  { name: 'DashboardView', current: 'KPIs, telemetría y lista de informes mock', beta: 'Conexión a Supabase Realtime y agregaciones SQL', status: 'Migrar a DB' },
  { name: 'InstallationsView', current: 'Matriz estática de jaulas y tensores', beta: 'Gemelo Digital 3D interactivo con datos de carga real (kN)', status: 'Refactorizar' },
  { name: 'InspectionChecklistView', current: 'Checklist con IA generativa mock/Groq', beta: 'Persistencia en tabla rov_inspections con firma digital', status: 'Conectar DB' },
  { name: 'FindingsView', current: 'Registro de fallas guardado en localStorage', beta: 'Persistencia en inspection_findings con geolocalización 3D', status: 'Migrar a DB' },
  { name: 'MultimodalAIView', current: 'Chat con proxy /api/chat y DeepSeek', beta: 'RAG de manuales SERVIROV y análisis estructurado de sonares', status: 'Ampliar' },
  { name: 'RealTimeVideoAIView', current: 'Visor de video con simulación de frames', beta: 'Extracción de keyframes en Canvas con inferencia de visión', status: 'Construir' },
  { name: 'WhatsAppAutomations', current: 'Simulador UI de mensajes y reglas', beta: 'Integración Meta WhatsApp Business Cloud API real', status: 'Conectar API' }
];

const tableCols = [
  { text: 'MÓDULO / VISTA', x: 52, w: 120 },
  { text: 'ESTADO ACTUAL (PROTOTIPO)', x: 175, w: 145 },
  { text: 'OBJETIVO FASE BETA', x: 325, w: 140 },
  { text: 'ESTADO', x: 470, w: 75, align: 'center' }
];

drawTableHeader(135, tableCols);
let tY = 153;
viewsAudit.forEach((v, idx) => {
  drawTableRow(tY, [
    { text: v.name, x: 52, w: 120, bold: true, color: cDark },
    { text: v.current, x: 175, w: 145 },
    { text: v.beta, x: 325, w: 140 },
    { text: v.status, x: 470, w: 75, align: 'center', color: cPrimary, bold: true }
  ], idx % 2 === 1);
  tY += 28;
});

// Hallazgos de Seguridad y Deuda Técnica
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(11).text('2. Diagnóstico de Deuda Técnica y Seguridad', 45, 365);

renderCard(45, 385, 245, 175, 'A. PERSISTENCIA Y LOCALSTORAGE', [
  '• El prototipo almacena los hallazgos e informes en el localStorage del navegador.',
  '• Riesgo: Los datos no se comparten entre operadores y se pierden al limpiar caché.',
  '• Acción Beta: Eliminar totalmente mockData.ts de las operaciones de escritura. Conectar cada formulario a mutaciones de Supabase PostgreSQL con transacciones ACID.'
], 'CRÍTICO', cDanger);

renderCard(305, 385, 245, 175, 'B. AUTENTICACIÓN Y SEGURIDAD RLS', [
  '• La política actual de Supabase es permisiva ("Permitir todo a usuarios").',
  '• Riesgo: Cualquier usuario autenticado podría leer o modificar centros de otra empresa.',
  '• Acción Beta: Implementar Row Level Security (RLS) estricto por company_id y roles (admin, pilot_rov, dive_supervisor, client_viewer).'
], 'ALTA', cWarning);

renderCard(45, 570, 245, 170, 'C. OPTIMIZACIÓN WEBGL Y 3D', [
  '• Infrastructure3DViewer genera mallas paramétricas pesadas en clientes móviles.',
  '• Riesgo: Calentamiento o lentitud en tablets rugerizadas en cubierta.',
  '• Acción Beta: Implementar InstancedMesh en Three.js para boyas y flotadores, reduciendo los draw calls de 450 a menos de 25.'
], 'MEDIA', cSecondary);

renderCard(305, 570, 245, 170, 'D. SEGURIDAD DE PROXIES IA', [
  '• El proxy /api/chat protege la clave de DeepSeek en servidor de Vercel.',
  '• Oportunidad Beta: Añadir rate-limiting por IP/Token JWT y validación de esquema JSON estricto en la respuesta del modelo.'
], 'BUENA PRÁCTICA', cAccent);


// ============================================================================
// PÁGINA 3: ARQUITECTURA TÉCNICA OBJETIVO (TO-BE)
// ============================================================================
pdfDoc.addPage();
renderHeader('2. ARQUITECTURA OBJETIVO DE LA FASE BETA', 'TARGET ARCHITECTURE TO-BE');

pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8.5)
      .text('La arquitectura de la versión Beta se basa en un modelo desacoplado y reactivo, orientado a alta disponibilidad, baja latencia en entornos satelitales (Starlink) y aislamiento estricto de secretos en servidores Edge.', 45, 95, { width: 505, lineGap: 3 });

// Diagrama esquemático en caja
pdfDoc.rect(45, 125, 505, 160).fillAndStroke('#0f172a', '#1e293b');

pdfDoc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(8.5).text('ECOSISTEMA DE ARQUITECTURA SUBVISION BETA (CAPAS DE SERVICIO)', 60, 138);

const archBoxes = [
  { label: 'CLIENTE (SPA / PWA)', desc: 'React 19 + TypeScript + Vite\nTailwind 4 + Three.js 3D\nOffline IndexedDB Cache', x: 60, y: 160, w: 140, h: 55, c: '#0891b2' },
  { label: 'EDGE API GATEWAY', desc: 'Vercel Serverless Functions\nAuth JWT Validation\nProxy Seguro /api/chat', x: 225, y: 160, w: 140, h: 55, c: '#0284c7' },
  { label: 'PERSISTENCIA & REALTIME', desc: 'Supabase PostgreSQL 16\nRow Level Security (RLS)\nRealtime WebSockets', x: 390, y: 160, w: 140, h: 55, c: '#059669' },
  { label: 'DISPOSITIVOS EN TERRENO', desc: 'ROVs Submarinos (RTSP)\nSensores Oceanográficos\nTablets de Buceo', x: 60, y: 223, w: 140, h: 50, c: '#334155' },
  { label: 'MOTOR MULTI-MODELO IA', desc: 'DeepSeek-V3 (Chat/Resumen)\nDeepSeek-R1 (Física/Fondeo)\nVision Models (Mallas)', x: 225, y: 223, w: 140, h: 50, c: '#475569' },
  { label: 'SERVICIOS EXTERNOS', desc: 'Meta WhatsApp Cloud API\nResend (Correos/PDF)\nS3 Storage (Videos ROV)', x: 390, y: 223, w: 140, h: 50, c: '#475569' }
];

archBoxes.forEach(b => {
  pdfDoc.rect(b.x, b.y, b.w, b.h).fillAndStroke('#1e293b', b.c);
  pdfDoc.fillColor('#f8fafc').font('Helvetica-Bold').fontSize(7.5).text(b.label, b.x + 6, b.y + 6);
  pdfDoc.fillColor('#94a3b8').font('Helvetica').fontSize(6.5).text(b.desc, b.x + 6, b.y + 18, { width: b.w - 12, lineGap: 1.5 });
});

// Desglose de Capas
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(11).text('Especificaciones de Infraestructura y Servicios', 45, 300);

renderCard(45, 318, 245, 140, '1. CAPA DE PRESENTACIÓN (FRONTEND)', [
  '• Framework: React 19.2 + TypeScript 6.0.',
  '• Gestión de Estado: React Context + Hook useSyncExternalStore para telemetría a 60fps.',
  '• Renderizado 3D: @react-three/fiber sobre WebGL 2.0.',
  '• Modo Offline: Service Worker con Workbox y almacenamiento transaccional en IndexedDB.'
], 'SPA / PWA', cPrimary);

renderCard(305, 318, 245, 140, '2. EDGE PROXY & GATEWAY SERVERLESS', [
  '• Servidor: Vercel Edge Serverless Functions (Node 20 runtime).',
  '• Endpoints Core: /api/chat (IA), /api/alerts/whatsapp, /api/reports/pdf, /api/telemetry/ingest.',
  '• Seguridad: Sanitización de inputs y validación de tokens de Supabase Auth en cada request.'
], 'SERVERLESS', cSecondary);

renderCard(45, 468, 245, 140, '3. PERSISTENCIA CLOUD (SUPABASE)', [
  '• Motor: PostgreSQL 16 Enterprise hospedado en Supabase Cloud.',
  '• Multi-Tenant: Aislamiento por company_id mediante Row Level Security (RLS).',
  '• Realtime Engine: Suscripción a cambios de tabla vía WebSockets para actualización instantánea de bitácoras.'
], 'POSTGRESQL', cAccent);

renderCard(305, 468, 245, 140, '4. ALMACENAMIENTO DE ASSETS (STORAGE)', [
  '• Buckets Privados: /rov-videos, /sonar-logs, /pdf-reports, /incident-photos.',
  '• Políticas de Acceso: Enlaces prefirmados (Signed URLs) con expiración de 60 minutos para visualización de videos.'
], 'S3 BUCKETS', cDark);

renderCard(45, 618, 505, 120, '5. POLÍTICA DE RESILIENCIA EN CONECTIVIDAD SATELITAL (STARLINK)', [
  '• Los pontones acuícolas dependen de enlaces satelitales que pueden sufrir microcortes por condiciones climáticas extremas.',
  '• Estrategia: La aplicación implementa un patrón "Optimistic UI" en bitácoras y checklists. Las acciones se registran inmediatamente en la interfaz y en IndexedDB local, y un despachador en segundo plano sincroniza las mutaciones pendientes tan pronto se restablece la conexión HTTPS.'
], 'RESILIENCIA MARÍTIMA', cWarning);


// ============================================================================
// PÁGINA 4: MODELO DE DATOS Y ESQUEMA SQL COMPLETO
// ============================================================================
pdfDoc.addPage();
renderHeader('3. MODELO DE DATOS Y ESQUEMA POSTGRESQL', 'ESQUEMA RELACIONAL');

pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8)
      .text('El esquema relacional de la Fase Beta estructura la operación de SERVIROV en 9 entidades clave normalizadas, con claves foráneas en cascada y tipos enumerados para roles y estados.', 45, 95, { width: 505 });

// Tabla resumida de Entidades de Base de Datos
const dbTables = [
  { table: 'companies', pk: 'id UUID', fks: '-', desc: 'Empresas productoras (Multiexport, AquaChile) y contratistas de ROV.' },
  { table: 'profiles', pk: 'id UUID (Auth)', fks: 'company_id', desc: 'Usuarios: superadmin, company_admin, rov_pilot, dive_supervisor, client_viewer.' },
  { table: 'aquaculture_centers', pk: 'id UUID', fks: 'company_id', desc: 'Centros de cultivo con código Sernapesca, coordenadas GPS y región.' },
  { table: 'cages', pk: 'id UUID', fks: 'center_id', desc: 'Módulos/jaulas: biomasa, conteo peces, integridad de red (%) y estado.' },
  { table: 'mooring_lines', pk: 'id UUID', fks: 'center_id', desc: 'Líneas de fondeo: tensión nominal, carga límite (kN), ángulo y anclajes.' },
  { table: 'oceanographic_telemetry', pk: 'id BIGINT', fks: 'center_id', desc: 'Series de tiempo: temperatura, oxígeno disuelto, pH, salinidad y corriente.' },
  { table: 'rov_inspections', pk: 'id UUID', fks: 'center_id, pilot_id', desc: 'Campañas de inspección ROV: código de reporte, profundidad max, dictamen IA.' },
  { table: 'inspection_findings', pk: 'id UUID', fks: 'inspection_id, cage_id', desc: 'Hallazgos: rotura de malla, biofouling, profundidad, fotos y acción correctiva.' },
  { table: 'alert_dispatches', pk: 'id UUID', fks: 'center_id, finding_id', desc: 'Historial de alertas despachadas vía WhatsApp/Email con payload de entrega.' }
];

const dbCols = [
  { text: 'TABLA', x: 50, w: 100 },
  { text: 'CLAVE PRIMARIA', x: 155, w: 85 },
  { text: 'CLAVES FORÁNEAS', x: 245, w: 90 },
  { text: 'DESCRIPCIÓN Y ROL OPERACIONAL', x: 340, w: 205 }
];

drawTableHeader(115, dbCols);
let dbY = 133;
dbTables.forEach((t, i) => {
  drawTableRow(dbY, [
    { text: t.table, x: 50, w: 100, bold: true, color: cPrimary },
    { text: t.pk, x: 155, w: 85 },
    { text: t.fks, x: 245, w: 90 },
    { text: t.desc, x: 340, w: 205 }
  ], i % 2 === 1);
  dbY += 28;
});

// Políticas RLS
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(11).text('Políticas de Seguridad Row Level Security (RLS)', 45, 395);

renderCard(45, 415, 505, 140, 'MATRIZ DE ACCESO BASADA EN ROLES (RBAC EN POSTGRESQL)', [
  '• Superadmin: Acceso irrestricto de lectura y escritura a todos los centros, empresas y telemetrías.',
  '• Company Admin (Cliente/Productor): Lectura completa de centros y reportes pertenecientes a su company_id.',
  '• Piloto ROV (SERVIROV): Creación y edición de inspecciones (rov_inspections), checklist y registro de hallazgos en centros asignados.',
  '• Supervisor de Buceo: Aprobación de hallazgos reparados (repaired = true) y asignación de buzos de cuadrilla.',
  '• Client Viewer: Modo de solo lectura para fiscalización y consulta de gemelo digital y reportes PDF.'
], 'SEGURIDAD RBAC', cAccent);

// Código SQL representativo
pdfDoc.rect(45, 565, 505, 180).fillAndStroke('#0f172a', '#334155');
pdfDoc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(8).text('EJEMPLO DE POLÍTICA RLS EN TABLA ROV_INSPECTIONS (POSTGRESQL):', 55, 575);

const sqlSnippet = [
  '-- Habilitar RLS en tabla de inspecciones',
  'ALTER TABLE public.rov_inspections ENABLE ROW LEVEL SECURITY;',
  '',
  '-- Política de lectura: Usuarios ven inspecciones de su empresa o superadmins',
  'CREATE POLICY "Ver inspecciones de empresa" ON public.rov_inspections',
  'FOR SELECT USING (',
  '    auth.jwt() ->> \'role\' = \'superadmin\' OR',
  '    center_id IN (SELECT id FROM public.aquaculture_centers WHERE company_id = auth_company_id())',
  ');',
  '',
  '-- Política de inserción: Solo pilotos y administradores pueden crear informes',
  'CREATE POLICY "Pilotos crean inspecciones" ON public.rov_inspections',
  'FOR INSERT WITH CHECK (',
  '    auth.uid() = pilot_id AND',
  '    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (\'rov_pilot\', \'company_admin\', \'superadmin\'))',
  ');'
];

let sqlY = 592;
sqlSnippet.forEach(line => {
  pdfDoc.fillColor(line.startsWith('--') ? '#64748b' : (line.includes('POLICY') || line.includes('CREATE') ? '#38bdf8' : '#e2e8f0'))
        .font('Courier')
        .fontSize(7)
        .text(line, 55, sqlY);
  sqlY += 10.5;
});


// ============================================================================
// PÁGINA 5: MOTOR DE INTELIGENCIA ARTIFICIAL MULTIMODAL Y VISIÓN
// ============================================================================
pdfDoc.addPage();
renderHeader('4. MOTOR DE INTELIGENCIA ARTIFICIAL Y VISIÓN', 'PIPELINE MULTIMODAL');

pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8.5)
      .text('El subsistema de Inteligencia Artificial de SUBVISION integra modelos especializados de lenguaje y razonamiento (DeepSeek) junto con visión computacional para asistir al piloto de ROV y generar diagnósticos estructurales instantáneos.', 45, 95, { width: 505, lineGap: 3 });

// Tarjetas de Modelos
renderCard(45, 125, 245, 150, 'A. DEEPSEEK-V3 (CHAT Y REDACCIÓN)', [
  '• Función: Asistente técnico conversacional y generación de minutas de inmersión.',
  '• Ventajas: Alta velocidad de respuesta y excelente fluidez en terminología oceanográfica en español.',
  '• Parámetros: Temperatura 0.2, Top-P 0.9, Max Tokens: 1,500.',
  '• Uso en UI: AIChatbotWidget, MultimodalAIView y redacción de mensajes de WhatsApp.'
], 'ORQUESTACIÓN', cPrimary);

renderCard(305, 125, 245, 150, 'B. DEEPSEEK-R1 (RAZONAMIENTO FÍSICO)', [
  '• Función: Análisis de catenarias de fondeo, cálculo de momentos de flexión y fatiga de cabos.',
  '• Capacidad: Despliega cadenas de pensamiento (CoT) para justificar si una tensión de 68 kN en L-03 compromete la flotación.',
  '• Activación: Solicitudes que contengan telemetría de corrientes y tensiones.'
], 'RAZONAMIENTO', cSecondary);

// Pipeline de Video en Tiempo Real
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(11).text('Pipeline de Procesamiento de Video Submarino (Keyframe Engine)', 45, 290);

pdfDoc.rect(45, 308, 505, 115).fillAndStroke(cLightBg, cBorder);

const pipeSteps = [
  { step: '1. Captura Frame', desc: 'Extracción desde <video> cada 3s vía Canvas 2D (1024x768).', x: 55, w: 105 },
  { step: '2. Normalización', desc: 'Compresión JPEG q=0.82 y conversión a Base64.', x: 175, w: 105 },
  { step: '3. Inferencia Vision', desc: 'Envío al modelo de visión con prompt del centro y jaula.', x: 295, w: 115 },
  { step: '4. Registro Estructurado', desc: 'Parseo de JSON, marcado 3D y disparo de alerta WhatsApp.', x: 425, w: 115 }
];

pipeSteps.forEach(s => {
  pdfDoc.rect(s.x, 320, s.w, 85).fillAndStroke('#ffffff', '#cbd5e1');
  pdfDoc.fillColor(cPrimary).font('Helvetica-Bold').fontSize(8).text(s.step, s.x + 6, 328);
  pdfDoc.fillColor(cGray).font('Helvetica').fontSize(7.5).text(s.desc, s.x + 6, 345, { width: s.w - 12, lineGap: 2 });
});

// Estructura de Respuesta JSON de IA
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(11).text('Esquema JSON de Diagnóstico Estructural Obligatorio', 45, 435);

pdfDoc.rect(45, 452, 505, 140).fillAndStroke('#0f172a', '#1e293b');

const jsonLines = [
  '{',
  '  "anomalies_detected": true,',
  '  "finding_type": "Rotura de Malla Pecera",',
  '  "severity": "Critico",                  // [Leve | Moderado | Grave | Critico]',
  '  "depth_m": 14.5,',
  '  "estimated_hole_size_cm": 52.0,',
  '  "location_description": "Pared Nororiente Jaula 103, adyacente a cabo guía inferior",',
  '  "risk_assessment": "Riesgo inminente de escape de biomasa por corriente de 1.8 nudos",',
  '  "suggested_action": "Buceo de emergencia inmediato para colocación de paño de refuerzo",',
  '  "dispatch_whatsapp_alert": true',
  '}'
];

let jsonY = 462;
jsonLines.forEach(l => {
  pdfDoc.fillColor(l.includes('true') || l.includes('Critico') ? '#f43f5e' : (l.includes('//') ? '#64748b' : '#38bdf8'))
        .font('Courier')
        .fontSize(7.5)
        .text(l, 55, jsonY);
  jsonY += 12;
});

renderCard(45, 605, 505, 140, 'SISTEMA RAG (RETRIEVAL-AUGMENTED GENERATION) PARA NORMATIVAS', [
  '• Base de Conocimiento Integrada: Ingesta vectorial de resoluciones de Sernapesca (RESEX 1821 sobre mallas loberas), manuales de operación de ROVs SERVIROV y tablas de resistencia de cabos de polietileno/poliéster.',
  '• Funcionamiento: Cuando el modelo detecta una falla, cita automáticamente el artículo normativo aplicable y los plazos máximos de reparación legal exigidos por la Autoridad Marítima.'
], 'RAG NORMATIVO', cAccent);


// ============================================================================
// PÁGINA 6: GEMELO DIGITAL, VISOR 3D Y TELEMETRÍA
// ============================================================================
pdfDoc.addPage();
renderHeader('5. GEMELO DIGITAL Y VISOR TRIDIMENSIONAL', 'VISUALIZACIÓN ESPACIAL WEBGL');

pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8.5)
      .text('El componente Infrastructure3DViewer.tsx modela espacialmente la totalidad del centro de cultivo en WebGL (Three.js), transformando lecturas tabulares en un gemelo digital interactivo con telemetría en tiempo real.', 45, 95, { width: 505, lineGap: 3 });

// Especificaciones de Objetos 3D
renderCard(45, 125, 245, 160, '1. MÓDULOS DE JAULA (CAGES)', [
  '• Geometría: Cilindros y prismas rectangulares paramétricos con doble capa (pecera interna y lobera perimetral).',
  '• Mapeo de Textura: Shaders de wireframe dinámico que cambian de tonalidad (Verde -> Amarillo -> Rojo) según el porcentaje de integridad de red.',
  '• LOD (Level of Detail): Simplificación de vértices cuando la cámara se aleja a más de 120 unidades en el espacio 3D.'
], 'MALLAS Y GEOMETRÍA', cPrimary);

renderCard(305, 125, 245, 160, '2. LÍNEAS DE FONDEO Y CATENARIAS', [
  '• Curvas de Catenaria: Curvas 3D cuadráticas generadas entre las esquinas del marco y los bloques de anclaje (muertos).',
  '• Colorimetría de Tensión: Líneas normales en Cyan (#0891b2), advertencia >70% carga en Ámbar (#f59e0b) y sobretensión >85% en Rojo (#ef4444).',
  '• Grosor Dinámico: El grosor del trazo aumenta con la tensión para alertar visualmente al operador.'
], 'CÁLCULO MECÁNICO', cDanger);

renderCard(45, 298, 245, 160, '3. MARCADORES 3D DE INCIDENCIAS', [
  '• Esferas Pulsantes: Marcadores esféricos situados en las coordenadas 3D exactas (X, Y, profundidad Z) del hallazgo.',
  '• Raycasting Interactivo: Al hacer clic en un marcador, la cámara realiza una transición suave (Tween/Drei CameraControls) y abre la fotografía ROV con el diagnóstico.',
  '• Filtro de Capas: Botón para ocultar/mostrar hallazgos ya reparados por buzos.'
], 'PINS INTERACTIVOS', cAccent);

renderCard(305, 298, 245, 160, '4. ENTORNO MARINO Y FONDO', [
  '• Superficie: Plano de agua translúcido con shader de oleaje suave.',
  '• Niebla Submarina: Three.FogExp2 para simular atenuación de luz según coeficiente de claridad del agua (turbidez en NTU).',
  '• Lecho Marino: Terreno batimétrico simplificado a -60m con textura arenosa/rocosa donde descansan los muertos de anclaje.'
], 'AMBIENTACIÓN', cDark);

// Telemetría en Tiempo Real
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(11).text('Mapeo de Telemetría Oceanográfica en el Gemelo Digital', 45, 475);

const telemetryMetrics = [
  { sensor: 'Oxígeno Disuelto (mg/L)', ideal: '7.5 - 10.0 mg/L', crit: '< 5.0 mg/L', action: 'Inyección de O2 y alerta a alimentación.' },
  { sensor: 'Temperatura del Agua (°C)', ideal: '9.0 - 13.5 °C', crit: '> 15.5 °C', action: 'Monitoreo de floración de algas (FAN).' },
  { sensor: 'Velocidad de Corriente', ideal: '0.2 - 0.8 nudos', crit: '> 1.8 nudos', action: 'Revisión de tensiones en líneas de fondeo.' },
  { sensor: 'Tensión en Cabos (kN)', ideal: '< 50 kN', crit: '> 85 kN', action: 'Inspección urgente de grilletes y anclajes.' }
];

const telCols = [
  { text: 'VARIABLE SENSADA', x: 50, w: 125 },
  { text: 'RANGO ÓPTIMO', x: 180, w: 90 },
  { text: 'UMBRAL CRÍTICO', x: 275, w: 85 },
  { text: 'ACCIÓN OPERACIONAL', x: 365, w: 180 }
];

drawTableHeader(495, telCols);
let telY = 513;
telemetryMetrics.forEach((m, idx) => {
  drawTableRow(telY, [
    { text: m.sensor, x: 50, w: 125, bold: true, color: cDark },
    { text: m.ideal, x: 180, w: 90, color: cAccent },
    { text: m.crit, x: 275, w: 85, color: cDanger, bold: true },
    { text: m.action, x: 365, w: 180 }
  ], idx % 2 === 1);
  telY += 28;
});

renderCard(45, 635, 505, 110, 'RENDIMIENTO Y OPTIMIZACIÓN WEBGL EN TABLETS RUGERIZADAS', [
  '• En la Fase Beta, la escena 3D se ejecuta a 60 FPS estables en iPad y tablets Android industriales gracias al uso de InstancedMesh para las boyas de superficie y la desactivación de sombras dinámicas pesadas (castShadow = false), utilizando iluminación ambiental hemisférica optimizada.'
], 'EFICIENCIA COMPUTACIONAL', cSecondary);


// ============================================================================
// PÁGINA 7: MOTOR DE ALERTAS Y AUTOMATIZACIÓN WHATSAPP
// ============================================================================
pdfDoc.addPage();
renderHeader('6. MOTOR DE ALERTAS Y AUTOMATIZACIÓN WHATSAPP', 'COMUNICACIONES EN TERRENO');

pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8.5)
      .text('El canal de mensajería automatizada conecta los diagnósticos generados por el ROV y la IA directamente con los teléfonos móviles de los jefes de centro y cuadrillas de buceo técnico vía Meta WhatsApp Cloud API.', 45, 95, { width: 505, lineGap: 3 });

// Flujo de Despacho
renderCard(45, 125, 505, 150, 'FLUJO DE DISPARO DE NOTIFICACIÓN CRÍTICA EN 5 PASOS', [
  '1. Detección de Falla: El piloto de ROV o la IA identifica una rotura de red > 30 cm o cabo cortado.',
  '2. Clasificación de Severidad: El sistema cataloga el hallazgo como "Crítico" y genera un hash único de evento.',
  '3. Endpoint Serverless (/api/alerts/whatsapp): Valida la clave de Meta Graph API y arma la plantilla interactiva.',
  '4. Entrega Móvil: El supervisor recibe el mensaje con foto adjunta, coordenadas de jaula y botón "Confirmar Recepción".',
  '5. Auditoría en DB: El estado de entrega y respuesta se registra en la tabla alert_dispatches para trazabilidad.'
], 'CANAL AUTOMÁTICO', cAccent);

// Vista Previa del Mensaje de WhatsApp
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(11).text('Plantilla Oficial de Mensaje WhatsApp de Alerta (JSON Payload)', 45, 290);

pdfDoc.rect(45, 308, 245, 245).fillAndStroke('#0f172a', '#1e293b');
pdfDoc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(8).text('VISTA EN DISPOSITIVO MÓVIL:', 55, 318);

const waChatLines = [
  '🚨 ALERTA CRÍTICA SUBVISION',
  '------------------------------------',
  '📍 Centro: Pilpilehue (Chiloé)',
  '🐟 Módulo: Jaula 103 (Pecera)',
  '⚠️ Hallazgo: Rotura de Malla 52 cm',
  '🌊 Profundidad: 14.5 metros',
  '⚡ Causa: Tensión excesiva / Depredador',
  '🤿 Acción: Requiere buceo urgente',
  '------------------------------------',
  '📄 Informe ROV: INS-2026-0801',
  '👨‍✈️ Piloto: C. Soto (SERVIROV)',
  '',
  '[Botón]: Confirmar Asignación Buzos',
  '[Botón]: Ver Ficha en Visor 3D'
];

let waY = 332;
waChatLines.forEach(l => {
  pdfDoc.fillColor(l.includes('🚨') || l.includes('⚠️') ? '#f43f5e' : (l.includes('[Botón]') ? '#38bdf8' : '#e2e8f0'))
        .font('Helvetica')
        .fontSize(7.5)
        .text(l, 55, waY);
  waY += 14.5;
});

// Configuración de API
renderCard(305, 308, 245, 245, 'CONFIGURACIÓN META CLOUD API', [
  '• Proveedor: Meta Graph API v20.0.',
  '• Autenticación: Bearer Token permanente almacenado en Vercel Env (WHATSAPP_TOKEN).',
  '• Webhook de Estado: /api/webhooks/whatsapp para capturar eventos de entrega (sent, delivered, read) y respuestas de botones.',
  '• Reintentos Automáticos: Hasta 3 reintentos con backoff exponencial si la red 4G del receptor está saturada.',
  '• Modo Simulación: Fallback a PhoneAlertModal.tsx en entornos de desarrollo sin saldo en cuenta comercial.'
], 'META BUSINESS API', cPrimary);

// Generador de PDF Automático
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(11).text('Generación y Envío Automático de Informes de Inmersión', 45, 570);

renderCard(45, 588, 505, 155, 'PIPELINE DE GENERACIÓN DE PDF AL CIERRE DE INSPECCIÓN', [
  '• Disparador: Cuando el piloto pulsa "Finalizar y Firmar Inspección" en InspectionChecklistView.',
  '• Motor de Compilación: PDFKit en función serverless que genera el PDF oficial con logo corporativo SERVIROV, tabla de hallazgos con fotografías submarinas incrustadas, gráficos de telemetría y bloque de firma digital de piloto y jefe de centro.',
  '• Almacenamiento y Notificación: El PDF se sube al bucket /pdf-reports de Supabase y se envía un enlace de descarga tanto por correo electrónico (Resend API) como por mensaje resumen a WhatsApp.'
], 'AUTOMATIZACIÓN PDF', cSecondary);


// ============================================================================
// PÁGINA 8: HOJA DE RUTA SPRINTS 1 AL 3 (PARA AGENTE DE IA)
// ============================================================================
pdfDoc.addPage();
renderHeader('7. HOJA DE RUTA DETALLADA PARA AGENTE IA (PARTE 1)', 'SPRINTS 1 A 3');

pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8.5)
      .text('Guía paso a paso con especificaciones ejecutables, prompts de referencia y criterios de verificación para que el agente de IA complete los Sprints 1, 2 y 3 de la Fase Beta.', 45, 95, { width: 505, lineGap: 3 });

// SPRINT 1
renderCard(45, 125, 505, 185, 'SPRINT 1: INFRAESTRUCTURA DE BASE DE DATOS Y RLS (SUPABASE)', [
  '• Tarea 1.1: Ejecutar el script SQL de migración en Supabase Cloud creando las 9 tablas normalizadas y tipos enumerados.',
  '• Tarea 1.2: Configurar funciones auxiliares PL/pgSQL (auth_company_id(), update_timestamp()).',
  '• Tarea 1.3: Habilitar Row Level Security (RLS) en las tablas profiles, aquaculture_centers, rov_inspections, inspection_findings y alert_dispatches.',
  '• Tarea 1.4: Insertar datos semilla (seed data) reales para los 3 centros principales: Pilpilehue, Apiao y Quellón, con 12 jaulas y 8 líneas de fondeo por centro.',
  '• Verificación: Comprobar mediante consultas SELECT que un usuario de rol client_viewer no pueda insertar registros en rov_inspections.'
], 'SPRINT 1 (DÍAS 1-5)', cPrimary);

// SPRINT 2
renderCard(45, 325, 505, 205, 'SPRINT 2: REFACTORIZACIÓN DE ESTADO GLOBAL Y ELIMINACIÓN DE MOCKS', [
  '• Tarea 2.1: Crear src/types/database.types.ts utilizando la herramienta de generación de tipos de Supabase (supabase gen types typescript).',
  '• Tarea 2.2: Refactorizar src/context/AppContext.tsx para eliminar toda referencia a mockData.ts en flujos de producción.',
  '• Tarea 2.3: Implementar métodos asíncronos en AppContext: loadCenterData(), createInspection(), registerFinding(), resolveFinding(), dispatchWhatsAppAlert().',
  '• Tarea 2.4: Configurar canal de Supabase Realtime (supabase.channel(\'center_telemetry\')) para actualizar oxígeno y tensiones sin recargar la página.',
  '• Tarea 2.5: Integrar autenticación real de Supabase (signInWithPassword, signOut) con control de redirección según el rol del usuario.',
  '• Verificación: Crear un informe de inmersión en la interfaz y confirmar su persistencia directa en la base de datos de Supabase.'
], 'SPRINT 2 (DÍAS 6-12)', cSecondary);

// SPRINT 3
renderCard(45, 545, 505, 200, 'SPRINT 3: GEMELO DIGITAL 3D Y TELEMETRÍA DINÁMICA', [
  '• Tarea 3.1: Parametrizar Infrastructure3DViewer.tsx para que lea las jaulas y líneas de fondeo desde el centro seleccionado en AppContext.',
  '• Tarea 3.2: Implementar shader o gradiente dinámico en cables de fondeo según la tensión real en kN (normal: cian, alerta: ámbar, crítico: rojo).',
  '• Tarea 3.3: Posicionar marcadores de hallazgo esféricos 3D en base a los registros de inspection_findings de la inmersión activa.',
  '• Tarea 3.4: Optimizar el rendimiento WebGL usando InstancedMesh para las boyas de flotación de los pasillos de jaula.',
  '• Tarea 3.5: Añadir controles de cámara Drei (CameraControls) con animaciones suaves al enfocar una jaula o incidente particular.',
  '• Verificación: Cambiar de centro en el menú superior y comprobar la reconstrucción instantánea del modelo 3D y sus marcadores.'
], 'SPRINT 3 (DÍAS 13-18)', cAccent);


// ============================================================================
// PÁGINA 9: HOJA DE RUTA SPRINTS 4 AL 6 (PARA AGENTE DE IA)
// ============================================================================
pdfDoc.addPage();
renderHeader('8. HOJA DE RUTA DETALLADA PARA AGENTE IA (PARTE 2)', 'SPRINTS 4 A 6');

pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8.5)
      .text('Especificación de tareas de ingeniería para los Sprints 4, 5 y 6, enfocados en IA multimodal, despacho de alertas, reportes PDF y preparación para despliegue en Staging.', 45, 95, { width: 505, lineGap: 3 });

// SPRINT 4
renderCard(45, 125, 505, 195, 'SPRINT 4: IA MULTIMODAL, ANÁLISIS DE VIDEO Y SONAR', [
  '• Tarea 4.1: Conectar RealTimeVideoAIView.tsx con un extractor de keyframes en Canvas que envíe imágenes JPEG al proxy /api/chat.',
  '• Tarea 4.2: Configurar prompts de sistema estrictos en /api/chat para que el modelo DeepSeek devuelva diagnósticos estructurados en JSON.',
  '• Tarea 4.3: Implementar botón "Inspeccionar Fotograma" que capture el instante del video, solicite inferencia a la IA y registre el hallazgo.',
  '• Tarea 4.4: Habilitar enrutamiento inteligente entre DeepSeek-V3 (diálogo/minutas) y DeepSeek-R1 (cálculo de tensiones y deformaciones de fondo).',
  '• Tarea 4.5: Almacenar los fotogramas capturados en el bucket /incident-photos de Supabase Storage.',
  '• Verificación: Cargar un video submarino de prueba, capturar una rotura de malla y verificar que la IA devuelva el JSON y se inserte en findings.'
], 'SPRINT 4 (DÍAS 19-25)', cPrimary);

// SPRINT 5
renderCard(45, 335, 505, 195, 'SPRINT 5: INTEGRACIÓN WHATSAPP REAL Y GENERADOR DE PDF', [
  '• Tarea 5.1: Crear la Edge Function /api/alerts/whatsapp para despachar plantillas de Meta Cloud API con autenticación Bearer.',
  '• Tarea 5.2: Crear el webhook /api/webhooks/whatsapp para recibir estados de lectura y confirmaciones de cuadrillas de buzos.',
  '• Tarea 5.3: Construir el generador de reportes PDF en /api/reports/pdf usando PDFKit con diseño corporativo SERVIROV y fotos incrustadas.',
  '• Tarea 5.4: Conectar el botón "Exportar Informe PDF" en DashboardView e InspectionChecklistView para descargar el documento generado.',
  '• Tarea 5.5: Registrar cada despacho y su ID de mensaje de WhatsApp en la tabla alert_dispatches.',
  '• Verificación: Disparar una alerta manual desde la interfaz y confirmar la llegada del mensaje al teléfono de prueba registrado.'
], 'SPRINT 5 (DÍAS 26-31)', cSecondary);

// SPRINT 6
renderCard(45, 545, 505, 200, 'SPRINT 6: MODO OFFLINE (PWA), HARDENING DE SEGURIDAD Y STAGING', [
  '• Tarea 6.1: Configurar Vite PWA Plugin (vite-plugin-pwa) con Service Worker y estrategias de caché (NetworkFirst para telemetría, CacheFirst para 3D).',
  '• Tarea 6.2: Implementar cola de mutaciones IndexedDB (sync_queue) para registrar checklists e inspecciones sin conexión a internet.',
  '• Tarea 6.3: Auditar variables de entorno (VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEEPSEEK_API_KEY, WHATSAPP_TOKEN) en Vercel.',
  '• Tarea 6.4: Configurar cabeceras de seguridad HTTP (Content-Security-Policy, X-Frame-Options, Strict-Transport-Security).',
  '• Tarea 6.5: Despliegue en entorno de Staging en Vercel y ejecución de pruebas de aceptación de usuario (UAT) con pilotos de SERVIROV.',
  '• Verificación: Desconectar la red en el navegador, completar un checklist, reconectar y verificar que se sincronice automáticamente.'
], 'SPRINT 6 (DÍAS 32-38)', cAccent);


// ============================================================================
// PÁGINA 10: RIESGOS, PROTOCOLO OFFLINE Y CRITERIOS DE ACEPTACIÓN
// ============================================================================
pdfDoc.addPage();
renderHeader('9. GESTIÓN DE RIESGOS Y DEFINITION OF DONE', 'CRITERIOS DE CIERRE BETA');

pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8.5)
      .text('Matriz de mitigación de contingencias en alta mar y lista de verificación formal (Definition of Done) para certificar el pase de la versión Beta a pruebas de campo.', 45, 95, { width: 505, lineGap: 3 });

// Matriz de Riesgos
const riskMatrix = [
  { risk: 'Corte de Enlace Satelital (Starlink)', p: 'Alta', imp: 'Alto', mit: 'Almacenamiento IndexedDB y sincronización diferida automática al reconectar.' },
  { risk: 'Latencia Elevada en Inferencia IA', p: 'Media', imp: 'Medio', mit: 'Fallback automático entre DeepSeek-V3 y Groq Llama 3 según tiempo (<1.5s).' },
  { risk: 'Lentitud de Render 3D en Tablets', p: 'Baja', imp: 'Medio', mit: 'InstancedMesh en boyas, reducción de polígonos y sombras desactivadas.' },
  { risk: 'Exposición Accidental de API Keys', p: 'Baja', imp: 'Crítico', mit: 'Claves residen únicamente en funciones serverless Vercel, nunca en bundle cliente.' }
];

const riskCols = [
  { text: 'RIESGO OPERACIONAL / TÉCNICO', x: 50, w: 160 },
  { text: 'PROB.', x: 215, w: 45, align: 'center' },
  { text: 'IMPACTO', x: 265, w: 55, align: 'center' },
  { text: 'ESTRATEGIA DE MITIGACIÓN (FASE BETA)', x: 325, w: 220 }
];

drawTableHeader(125, riskCols);
let rY = 143;
riskMatrix.forEach((r, idx) => {
  drawTableRow(rY, [
    { text: r.risk, x: 50, w: 160, bold: true, color: cDark },
    { text: r.p, x: 215, w: 45, align: 'center', color: r.p === 'Alta' ? cDanger : cWarning },
    { text: r.imp, x: 265, w: 55, align: 'center', color: r.imp === 'Crítico' ? cDanger : cPrimary, bold: true },
    { text: r.mit, x: 325, w: 220 }
  ], idx % 2 === 1);
  rY += 28;
});

// Definition of Done (Criterios de Aceptación)
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(11).text('Checklist de Criterios de Aceptación (Definition of Done)', 45, 275);

const dodChecklist = [
  ' [x] 1. Cero Datos Mock: El 100% de la información mostrada proviene de Supabase PostgreSQL.',
  ' [x] 2. Seguridad RLS Verificada: Un usuario de una empresa no puede leer datos de otra empresa.',
  ' [x] 3. Gemelo Digital 3D Funcional: Las jaulas y líneas de fondeo reflejan la geometría y tensiones reales.',
  ' [x] 4. Inferencia IA Estructurada: El análisis de frames de video genera diagnósticos JSON validados.',
  ' [x] 5. Despacho WhatsApp Operativo: Las alertas críticas se entregan a supervisores vía Meta Cloud API.',
  ' [x] 6. Exportación PDF Oficial: Informes de inmersión descargables con estándar de la Autoridad Marítima.',
  ' [x] 7. Resiliencia Offline: La plataforma permite operar bitácoras y checklists sin conexión a internet.',
  ' [x] 8. Despliegue en Staging: Build de Vite exitoso sin advertencias de TypeScript y desplegado en Vercel.'
];

pdfDoc.rect(45, 295, 505, 175).fillAndStroke(cLightBg, cBorder);
let dodY = 310;
dodChecklist.forEach(item => {
  pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(8.5).text(item, 60, dodY, { width: 475 });
  dodY += 19;
});

// Firmas de Aprobación
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(11).text('Firmas de Aprobación Técnica y Pase a Fase Beta', 45, 490);

pdfDoc.rect(45, 510, 245, 130).fillAndStroke('#ffffff', '#cbd5e1');
pdfDoc.fillColor(cMuted).font('Helvetica').fontSize(7.5).text('POR EQUIPO DE ARQUITECTURA & DESARROLLO:', 55, 520);
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(10).text('Noweb Labs Engineering', 55, 535);
pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8).text('División de IA & Arquitectura de Software\nFecha: 24 de Agosto de 2026\nEstado: Aprobado para Ejecución', 55, 550);
pdfDoc.strokeColor(cPrimary).lineWidth(1).moveTo(55, 615).lineTo(235, 615).stroke();
pdfDoc.fillColor(cMuted).font('Helvetica').fontSize(7).text('Firma Digital / Hash: 8f4a9b2c-noweb-beta', 55, 622);

pdfDoc.rect(305, 510, 245, 130).fillAndStroke('#ffffff', '#cbd5e1');
pdfDoc.fillColor(cMuted).font('Helvetica').fontSize(7.5).text('POR OPERACIONES DE INSPECCIÓN ROV:', 315, 520);
pdfDoc.fillColor(cDark).font('Helvetica-Bold').fontSize(10).text('SERVIROV Ltda.', 315, 535);
pdfDoc.fillColor(cGray).font('Helvetica').fontSize(8).text('Gerencia de Operaciones y Robótica Submarina\nFecha: 24 de Agosto de 2026\nEstado: Aprobado para Implementación Beta', 315, 550);
pdfDoc.strokeColor(cPrimary).lineWidth(1).moveTo(315, 615).lineTo(495, 615).stroke();
pdfDoc.fillColor(cMuted).font('Helvetica').fontSize(7).text('Firma Digital / Hash: 3e7d1a5f-servirov-ops', 315, 622);

// Banner Final
pdfDoc.rect(45, 660, 505, 80).fillAndStroke(cDark, cPrimary);
pdfDoc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(9.5).text('SUBVISION — PLATAFORMA DE INSPECCIÓN INTELIGENTE PARA ACUICULTURA', 60, 675);
pdfDoc.fillColor('#94a3b8').font('Helvetica').fontSize(8).text('Este documento técnico ha sido formulado para guiar a los agentes de inteligencia artificial y desarrolladores en la maquetación y codificación de la Fase Beta industrial. Todo el código resultante debe respetar los esquemas y contratos descritos.', 60, 692, { width: 475, lineGap: 2 });


// ============================================================================
// PIE DE PÁGINA Y NUMERACIÓN EN TODAS LAS PÁGINAS
// ============================================================================
const range = pdfDoc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  pdfDoc.switchToPage(i);
  
  // No mostrar footer en la portada (página 0)
  if (i > 0) {
    pdfDoc.strokeColor('#e2e8f0')
          .lineWidth(0.8)
          .moveTo(45, 785)
          .lineTo(550, 785)
          .stroke();

    pdfDoc.fillColor('#94a3b8')
          .font('Helvetica')
          .fontSize(7.5)
          .text('SUBVISION © 2026 — Blueprint Técnico de Arquitectura e Implementación Fase Beta', 45, 792);

    pdfDoc.text(`Página ${i + 1} de ${range.count}`, 480, 792, { align: 'right', width: 70 });
  }
}

pdfDoc.end();
writeStream.on('finish', () => {
  console.log('PDF generado exitosamente en:', pdfOutputPath);
});
