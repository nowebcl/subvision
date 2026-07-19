-- ====================================================
-- SCRIPT DE CREACIÓN DE TABLAS PARA SUBVISION (SUPABASE)
-- Copie y pegue este script en el editor SQL de Supabase
-- ====================================================

-- 1. Tabla de Perfiles de Operadores/Pilotos
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    cargo TEXT,
    center_id TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS y políticas para perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a usuarios" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 2. Tabla de Informes ROV
CREATE TABLE IF NOT EXISTS public.rov_reports (
    id TEXT PRIMARY KEY,
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    nombre TEXT NOT NULL,
    jefe_centro TEXT,
    piloto TEXT,
    empresa TEXT DEFAULT 'SERVIROV',
    puerto TEXT DEFAULT 'Abierto',
    redes TEXT,
    centro_id TEXT,
    user_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS y políticas para informes
ALTER TABLE public.rov_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo en informes" ON public.rov_reports FOR ALL USING (true) WITH CHECK (true);

-- 3. Tabla de Registro de Actividades
CREATE TABLE IF NOT EXISTS public.operator_activities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS y políticas para actividades
ALTER TABLE public.operator_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo en actividades" ON public.operator_activities FOR ALL USING (true) WITH CHECK (true);

-- 4. Tabla de Centros de Cultivo (Acuicultura)
CREATE TABLE IF NOT EXISTS public.aquaculture_centers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    region TEXT,
    coordinates TEXT,
    water_params JSONB,
    cages JSONB,
    mooring_lines JSONB,
    historical_oxygen JSONB,
    historical_current JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS y políticas para centros
ALTER TABLE public.aquaculture_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo en centros" ON public.aquaculture_centers FOR ALL USING (true) WITH CHECK (true);
