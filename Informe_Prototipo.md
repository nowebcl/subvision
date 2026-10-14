# Informe Completo del Prototipo: SUBVISION

> [!WARNING]
> **ESTADO DEL PROYECTO: PROTOTIPO (Prueba de Concepto)**
> Se deja expresa constancia de que la aplicación actual es **únicamente un prototipo** diseñado para validar el concepto, el flujo de usuario (UX/UI) y la viabilidad técnica de las integraciones. **No es una versión Beta ni un entorno de producción.** 
> Una vez concluida y aprobada esta fase de prototipado, se dará inicio a la **Fase Beta** y al **Desarrollo para Producción**.

---

## 1. Stack Tecnológico Utilizado

El prototipo se ha construido utilizando tecnologías modernas orientadas a un alto rendimiento en el navegador y una experiencia de usuario rica e interactiva:

- **Core Frontend**: **React 19** con **TypeScript** y empaquetado mediante **Vite**.
- **Estilos e Interfaz**: **Tailwind CSS v4** para diseño responsivo y utilidades atómicas, complementado con **Lucide React** para la iconografía.
- **Gráficos y Visualización 3D**: Integración de **Three.js** a través de **@react-three/fiber** y **@react-three/drei** para posibles visualizaciones inmersivas de modelos o instalaciones.
- **Exportación de Documentos**: **PDFKit** para la generación de reportes y documentos en PDF desde el lado del cliente.

---

## 2. Base de Datos y Backend (Arquitectura del Prototipo)

Al tratarse de un prototipo, la arquitectura de datos está diseñada de manera híbrida para permitir demostraciones rápidas sin depender de infraestructura pesada:

- **Proveedor Principal (Supabase)**: La aplicación está integrada con **Supabase** (que proporciona PostgreSQL, Autenticación y Storage). 
- **Modo Mock / LocalStorage**: Se ha implementado un sistema de *fallback* automático. Si las variables de entorno de Supabase no están presentes (o si se requiere probar sin conexión), el sistema almacena los datos de forma temporal en el `localStorage` del navegador y utiliza *mock data* (datos simulados). Esto permite que las vistas funcionen perfectamente durante las demostraciones del prototipo.
- **Integración de Inteligencia Artificial (DeepSeek)**: Se utiliza la IA para análisis multimodales y asistencia. Las llamadas se realizan a los modelos `deepseek-chat` y `deepseek-reasoner`. Por seguridad, la API Key no reside en el cliente; el frontend se comunica a través de un proxy serverless seguro (`/api/chat`).

---

## 3. Funciones y Módulos Principales (Vistas)

El prototipo incluye diversas interfaces funcionales (Views) que demuestran las capacidades de la plataforma:

1. **Dashboard (DashboardView)**: El panel de control principal, donde el usuario tiene una vista panorámica de métricas, estado de las instalaciones y alertas recientes.
2. **Gestión de Instalaciones (InstallationsView)**: Módulo para visualizar, registrar y administrar las diferentes instalaciones y su estado operativo.
3. **Checklist de Inspección (InspectionChecklistView)**: Formularios interactivos para llevar a cabo inspecciones de campo o rutinas de mantenimiento.
4. **Registro de Hallazgos (FindingsView)**: Sistema para documentar, categorizar y dar seguimiento a incidencias, anomalías o hallazgos durante las inspecciones.
5. **Simulación y Automatización de WhatsApp (WhatsAppSimulationView / WhatsAppAutomationsView)**: Demostración del flujo de comunicación automatizada, bots de interacción y envío de alertas directamente a dispositivos móviles de los supervisores.
6. **IA Multimodal y Video en Tiempo Real (MultimodalAIView / RealTimeVideoAIView)**: Módulos avanzados que integran la Inteligencia Artificial para el análisis de imágenes estáticas y flujos de video en tiempo real, permitiendo la detección automática de problemas o reconocimiento de patrones.
7. **Autenticación (LoginView)**: Flujo de entrada de usuarios que, en producción, estará conectado directamente a Supabase Auth.

---

## 4. Credenciales y Entorno (Solo Prototipo)

Para acceder a las demostraciones, se han configurado los siguientes usuarios de prueba:

- **Operador**: `operador@servirov.cl` / `ClaveSeguraSubvision123!`
- **Piloto**: `piloto@servirov.cl` / `ClavePiloto123!`
- **Cliente**: `cliente@servirov.cl` / `ClaveCliente123!`

**Entorno de Integración:**
- Base de datos conectada: **Supabase** (`https://oyovjfqrvlqklmerogmz.supabase.co`)
- Integración de IA conectada: **DeepSeek** (`deepseek-chat` y `deepseek-reasoner`) / **Groq**

---

## 5. Próximos Pasos: Hacia la Fase Beta y Producción

Una vez aprobado este prototipo, el ciclo de vida del proyecto avanzará a las siguientes etapas:

1. **Fase Beta**:
   - Conexión estricta a la base de datos de producción (Supabase/PostgreSQL) eliminando las dependencias del `localStorage` y datos simulados (*mocks*).
   - Implementación de reglas de seguridad a nivel de base de datos (RLS) y autenticación estricta con roles de usuario.
   - Pruebas de estrés y pruebas de usuario controladas con datos reales (pero no críticos).
2. **Pase a Producción**:
   - Despliegue en un entorno de servidores estables y escalables.
   - Implementación de CI/CD (Integración y Despliegue Continuo).
   - Monitoreo activo de errores, analíticas de uso y métricas de rendimiento.
