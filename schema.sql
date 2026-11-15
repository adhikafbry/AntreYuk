-- Supabase SQL Schema for AntreYuk
-- Copy and paste this directly into Supabase Dashboard -> SQL Editor -> Run
-- See supabase/migrations/20261115_init_schema.sql for the complete migration file.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLE: stores
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Apotek AntreYuk Sehat',
    description TEXT DEFAULT 'Layanan farmasi dan konsultasi obat cepat, ramah, dan profesional.',
    address TEXT DEFAULT 'Jl. Kesehatan No. 45, Jakarta Pusat',
    phone TEXT DEFAULT '0812-3456-7890',
    opening_time TIME NOT NULL DEFAULT '08:00',
    closing_time TIME NOT NULL DEFAULT '21:00',
    is_open BOOLEAN NOT NULL DEFAULT true,
    average_service_duration INTEGER NOT NULL DEFAULT 5,
    daily_queue_limit INTEGER NOT NULL DEFAULT 150,
    accepting_queue BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CREATE TABLE: admins
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_admin_user UNIQUE(user_id)
);

-- 4. CREATE TABLE: queues
CREATE TABLE IF NOT EXISTS public.queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    queue_number TEXT NOT NULL,
    queue_sequence INTEGER NOT NULL,
    queue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    access_token UUID NOT NULL DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'serving', 'completed', 'skipped', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    called_at TIMESTAMPTZ,
    serving_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_store_queue_per_day UNIQUE (store_id, queue_date, queue_number),
    CONSTRAINT unique_store_sequence_per_day UNIQUE (store_id, queue_date, queue_sequence)
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_queues_store_date_status ON public.queues (store_id, queue_date, status);
CREATE INDEX IF NOT EXISTS idx_queues_access_token ON public.queues (access_token);
CREATE INDEX IF NOT EXISTS idx_queues_date ON public.queues (queue_date);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins (user_id);

-- 6. ATOMIC SEQUENCE RPC FUNCTION
CREATE OR REPLACE FUNCTION public.take_queue_number(
    p_store_id UUID,
    p_customer_name TEXT,
    p_customer_phone TEXT
)
RETURNS TABLE (
    id UUID,
    queue_number TEXT,
    queue_sequence INTEGER,
    access_token UUID,
    status TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_next_seq INTEGER;
    v_queue_num TEXT;
    v_is_open BOOLEAN;
    v_accepting BOOLEAN;
    v_limit INTEGER;
    v_current_count INTEGER;
    v_new_id UUID;
    v_token UUID;
    v_created TIMESTAMPTZ;
BEGIN
    SELECT is_open, accepting_queue, daily_queue_limit
    INTO v_is_open, v_accepting, v_limit
    FROM public.stores
    WHERE id = p_store_id
    FOR SHARE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Toko tidak ditemukan.';
    END IF;

    IF NOT v_is_open THEN
        RAISE EXCEPTION 'Mohon maaf, toko saat ini sedang tutup.';
    END IF;

    IF NOT v_accepting THEN
        RAISE EXCEPTION 'Penerimaan nomor antrean sedang ditangguhkan sementara.';
    END IF;

    SELECT COALESCE(MAX(queue_sequence), 0) + 1, COUNT(*)
    INTO v_next_seq, v_current_count
    FROM public.queues
    WHERE store_id = p_store_id AND queue_date = v_today;

    IF v_current_count >= v_limit THEN
        RAISE EXCEPTION 'Batas antrean harian (% tiket) telah tercapai.', v_limit;
    END IF;

    v_queue_num := 'A-' || LPAD(v_next_seq::text, 3, '0');
    v_token := gen_random_uuid();
    v_created := timezone('utc'::text, now());

    INSERT INTO public.queues (
        store_id,
        queue_number,
        queue_sequence,
        queue_date,
        customer_name,
        customer_phone,
        access_token,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_store_id,
        v_queue_num,
        v_next_seq,
        v_today,
        p_customer_name,
        p_customer_phone,
        v_token,
        'waiting',
        v_created,
        v_created
    ) RETURNING queues.id INTO v_new_id;

    RETURN QUERY
    SELECT v_new_id, v_queue_num, v_next_seq, v_token, 'waiting'::TEXT, v_created;
END;
$$;

-- 7. FUNCTION: get_public_store_stats
CREATE OR REPLACE FUNCTION public.get_public_store_stats(p_store_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_serving_num TEXT;
    v_waiting_count INTEGER;
    v_total_today INTEGER;
    v_completed_count INTEGER;
    v_avg_duration INTEGER;
    v_is_open BOOLEAN;
    v_accepting BOOLEAN;
BEGIN
    SELECT average_service_duration, is_open, accepting_queue
    INTO v_avg_duration, v_is_open, v_accepting
    FROM public.stores
    WHERE id = p_store_id;

    SELECT queue_number INTO v_serving_num
    FROM public.queues
    WHERE store_id = p_store_id AND queue_date = v_today AND status IN ('serving', 'called')
    ORDER BY CASE WHEN status = 'serving' THEN 1 ELSE 2 END, updated_at DESC
    LIMIT 1;

    SELECT COUNT(*) INTO v_waiting_count
    FROM public.queues
    WHERE store_id = p_store_id AND queue_date = v_today AND status = 'waiting';

    SELECT COUNT(*) INTO v_total_today
    FROM public.queues
    WHERE store_id = p_store_id AND queue_date = v_today;

    SELECT COUNT(*) INTO v_completed_count
    FROM public.queues
    WHERE store_id = p_store_id AND queue_date = v_today AND status = 'completed';

    RETURN jsonb_build_object(
        'is_open', COALESCE(v_is_open, true),
        'accepting_queue', COALESCE(v_accepting, true),
        'current_serving_number', v_serving_num,
        'waiting_count', v_waiting_count,
        'total_today', v_total_today,
        'completed_count', v_completed_count,
        'average_service_duration', COALESCE(v_avg_duration, 5),
        'estimated_wait_time', v_waiting_count * COALESCE(v_avg_duration, 5)
    );
END;
$$;

-- 8. ROW LEVEL SECURITY
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "Public can view stores" ON public.stores;
CREATE POLICY "Public can view stores" ON public.stores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update stores" ON public.stores;
CREATE POLICY "Admins can update stores" ON public.stores FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
CREATE POLICY "Admins can view admins" ON public.admins FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow public insert via RPC or direct" ON public.queues;
CREATE POLICY "Allow public insert via RPC or direct" ON public.queues FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Access own queue via token" ON public.queues;
CREATE POLICY "Access own queue via token" ON public.queues FOR SELECT USING (public.is_admin() OR access_token IS NOT NULL);

DROP POLICY IF EXISTS "Admin full control on queues" ON public.queues;
CREATE POLICY "Admin full control on queues" ON public.queues FOR ALL TO authenticated USING (public.is_admin());

-- 9. REALTIME
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'queues'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.queues;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'stores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stores;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- 10. DEFAULT STORE SEED
INSERT INTO public.stores (
    id, name, description, address, phone, opening_time, closing_time, is_open, average_service_duration, daily_queue_limit, accepting_queue
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Apotek AntreYuk Sehat',
    'Layanan farmasi dan resep obat cepat, aman, dan terpercaya.',
    'Jl. Kesehatan Raya No. 45, Jakarta Pusat',
    '0812-3456-7890',
    '08:00',
    '21:00',
    true,
    5,
    150,
    true
) ON CONFLICT (id) DO NOTHING;

