-- Tabela de trilhas de mentoria
CREATE TABLE public.mentorship_tracks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    objectives text[],
    weekly_script jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabela de mentores
CREATE TABLE public.mentors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    bio text,
    avatar_url text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Associação mentores <-> trilhas (rodízio)
CREATE TABLE public.mentor_tracks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id uuid REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    track_id uuid REFERENCES public.mentorship_tracks(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(mentor_id, track_id)
);

-- Sessões de mentoria em grupo
CREATE TABLE public.mentorship_group_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id uuid REFERENCES public.mentorship_tracks(id) ON DELETE CASCADE NOT NULL,
    mentor_id uuid REFERENCES public.mentors(id) ON DELETE SET NULL,
    session_date date NOT NULL,
    session_time text NOT NULL,
    max_participants integer DEFAULT 8,
    min_participants integer DEFAULT 1,
    status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Participantes das sessões em grupo
CREATE TABLE public.group_session_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES public.mentorship_group_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id uuid NOT NULL,
    enrolled_at timestamptz DEFAULT now(),
    attended boolean DEFAULT false,
    UNIQUE(session_id, user_id)
);

-- Atualizar tabela book_suggestions para aprovação detalhada
ALTER TABLE public.book_suggestions 
ADD COLUMN IF NOT EXISTS chapters_list jsonb,
ADD COLUMN IF NOT EXISTS book_summary text,
ADD COLUMN IF NOT EXISTS narrative_context text,
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Enable RLS
ALTER TABLE public.mentorship_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_session_participants ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mentorship_tracks
CREATE POLICY "Anyone can view active tracks" ON public.mentorship_tracks
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tracks" ON public.mentorship_tracks
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para mentors
CREATE POLICY "Anyone can view active mentors" ON public.mentors
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage mentors" ON public.mentors
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para mentor_tracks
CREATE POLICY "Anyone can view mentor tracks" ON public.mentor_tracks
FOR SELECT USING (true);

CREATE POLICY "Admins can manage mentor tracks" ON public.mentor_tracks
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para mentorship_group_sessions
CREATE POLICY "Premium users can view sessions" ON public.mentorship_group_sessions
FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_premium = true 
        AND (profiles.premium_expires_at IS NULL OR profiles.premium_expires_at > now())
    ))
);

CREATE POLICY "Admins can manage sessions" ON public.mentorship_group_sessions
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para group_session_participants
CREATE POLICY "Users can view their own participations" ON public.group_session_participants
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all participations" ON public.group_session_participants
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Premium users can enroll" ON public.group_session_participants
FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_premium = true 
        AND (profiles.premium_expires_at IS NULL OR profiles.premium_expires_at > now())
    ))
);

CREATE POLICY "Users can unenroll themselves" ON public.group_session_participants
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage participations" ON public.group_session_participants
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers para updated_at
CREATE TRIGGER update_mentorship_tracks_updated_at
BEFORE UPDATE ON public.mentorship_tracks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir trilhas iniciais
INSERT INTO public.mentorship_tracks (name, slug, description, objectives) VALUES
('Rotina de Leitura', 'rotina-leitura', 'Construa o hábito de ler todos os dias com uma rotina personalizada.', ARRAY['Definir horários fixos', 'Criar gatilhos de leitura', 'Manter consistência diária', 'Evoluir no ranking']),
('Organização de Tempo', 'organizacao-tempo', 'Aprenda a encaixar a leitura na sua agenda ocupada.', ARRAY['Identificar janelas de tempo', 'Priorizar leitura', 'Equilibrar com outras atividades', 'Otimizar momentos livres']),
('Começando do Zero', 'comecando-zero', 'Para quem quer começar a ler mas não sabe por onde.', ARRAY['Escolher primeiros livros', 'Desenvolver gosto literário', 'Superar bloqueios', 'Criar momentum inicial']),
('Leitura Física e Digital', 'fisica-digital', 'Domine as duas formas de leitura e saiba quando usar cada uma.', ARRAY['Comparar formatos', 'Otimizar cada meio', 'Criar biblioteca híbrida', 'Manter anotações unificadas']);