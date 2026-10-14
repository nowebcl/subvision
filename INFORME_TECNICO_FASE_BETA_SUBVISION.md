# SUBVISION — INFORME TÉCNICO MAESTRO Y BLUEPRINT DE IMPLEMENTACIÓN (FASE BETA)

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
5. **MultimodalAIView**: Consola técnica conectada al proxy `/api/chat` para procesamiento de consultas técnicas y análisis semántico de reportes/imágenes.
6. **RealTimeVideoAIView / Infrastructure3DViewer**: Renderizado de mallas de jaulas en 3D (Three.js / React Three Fiber) y visor de transmisiones de video submarino con overlay de telemetría.
7. **WhatsAppAutomationsView & Simulation**: Simulador de despacho de alertas a supervisores de centro y cuadrillas de buceo.
8. **AIChatbotWidget, PhoneAlertModal, EmailPreviewModal**: Componentes modales flotantes para interacción omnicanal.

### 2.2 Deuda Técnica y Dependencias Provisionales (A Eliminar en Beta)
* **Persistencia Híbrida / LocalStorage Fallback**: El prototipo depende actualmente de un fallback a `localStorage` y conjuntos de datos mock (`src/data/mockData.ts`) cuando no hay sesión activa o conexión a red. En la Fase Beta, toda mutación de datos debe estar vinculada a PostgreSQL en Supabase con sincronización offline estructurada.
* **Seguridad y RLS Provisionales**: La política inicial de base de datos (`Permitir todo a usuarios`) debe reemplazarse por políticas granulares basadas en roles (`admin`, `pilot_rov`, `supervisor`, `client`) y pertenencia a empresa (`company_id`).
* **Inferencia de Visión en Tiempo Real en Cliente**: El análisis de frames de video se realiza por polling y prompts textuales; se requiere un pipeline estructurado de visión computacional y modelos multimodales optimizados para keyframes.

---

## 3. ARQUITECTURA OBJETIVO DE LA FASE BETA (TARGET ARCHITECTURE TO-BE)

### 3.1 Diagrama de Arquitectura del Ecosistema

```
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
```

### 3.2 Desglose de Capas Tecnológicas

| Capa | Tecnologías Seleccionadas | Justificación Técnica para Fase Beta |
| :--- | :--- | :--- |
| **Frontend SPA & PWA** | React 19, TypeScript, Vite 8, Lucide React, Tailwind CSS 4 | React 19 ofrece transiciones fluidas de renderizado. Tailwind 4 optimiza el tamaño de bundle para conexiones 4G/satelitales (Starlink) en altamar. Modo PWA para instalación en tablets industriales. |
| **Renderizado 3D / Digital Twin** | Three.js, @react-three/fiber, @react-three/drei | Representación espacial 3D paramétrica de los módulos de jaula (mallas loberas, peceras, muertos de anclaje, líneas de fondeo) con mapeo de calor según tensiones y roturas. |
| **Backend & Edge Gateway** | Node.js Serverless Functions (Vercel Edge), REST, WebSockets | Aislamiento completo de claves de API (DeepSeek, Groq, WhatsApp Cloud API, Resend/SendGrid). Latencia de borde mínima. |
| **Base de Datos & Auth** | Supabase (PostgreSQL 16 Enterprise), RLS, Realtime | Persistencia relacional ACID, disparadores SQL (`triggers`), funciones PL/pgSQL para cálculo de promedios de telemetría y seguridad granular por tenant. |
| **Motor de IA Multimodal** | DeepSeek-V3, DeepSeek-R1 (Reasoner), Vision Embeddings | DeepSeek-V3 para interacción técnica y redacción de minutas; DeepSeek-R1 para razonamiento físico-mecánico (distribución de cargas de tracción y análisis de catenarias de fondeo). |
| **Comunicaciones & Alertas** | Meta WhatsApp Cloud API, Webhooks, PDFKit / Puppeteer | Despacho instantáneo de notificaciones ricas (texto, botones de confirmación, enlace a PDF) ante incidentes clasificados con severidad 'Crítica' o 'Grave'. |

---

## 4. ESPECIFICACIÓN DEL MODELO DE DATOS Y ESQUEMA SQL (FASE BETA)

```sql
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
```

---

## 5. HOJA DE RUTA DETALLADA PASO A PASO PARA EL AGENTE DE IA (SPRINTS)

### Sprint 1: Infraestructura de Base de Datos y Políticas RLS en Supabase
* Ejecutar script SQL de migración y crear triggers de auditoría.
* Configurar políticas de Row Level Security (RLS) por `company_id` y `role`.
* Crear datos semilla reales para los centros Pilpilehue, Apiao y Quellón.

### Sprint 2: Refactorización de Estado Global (`AppContext.tsx`) y Eliminación de Mocks
* Crear `src/types/database.types.ts` con tipos generados de Supabase.
* Reemplazar llamadas a `mockData.ts` por clientes Supabase con queries optimizadas.
* Implementar suscripción a Realtime (`supabase.channel`) para telemetría y hallazgos.

### Sprint 3: Visor 3D y Gemelo Digital con Telemetría en Tiempo Real
* Parametrizar mallas de jaulas y cables de fondeo con datos dinámicos de Supabase.
* Implementar cálculo de curvatura de catenaria para líneas de fondeo en WebGL.
* Posicionar marcadores tridimensionales de hallazgos con interactividad de cámara.

### Sprint 4: Pipeline de IA Multimodal y Procesamiento de Frames de Video
* Implementar captura de keyframes en `RealTimeVideoAIView` con compresión JPEG.
* Conectar proxy `/api/chat` con DeepSeek-V3 y DeepSeek-R1.
* Parseo de JSON estructurado para inserción automática en `inspection_findings`.

### Sprint 5: Motor de Alertas Operativas, WhatsApp y Generación de PDF
* Implementar webhook/endpoint serverless para Meta WhatsApp Business API.
* Generar reportes PDF estandarizados con firmas digitales, fotos y telemetría.

### Sprint 6: Modo Offline (PWA), Hardening de Seguridad y Despliegue en Staging
* Implementar Service Worker y almacenamiento local IndexedDB con cola de sincronización diferida.
* Configurar cabeceras de seguridad CSP y auditoría de permisos.
* Despliegue en Vercel Staging y validación de aceptación (UAT).

---
*SUBVISION © 2026 — Plataforma Industrial de Inspección Acuícola — Documento Técnico Oficial para Fase Beta.*
