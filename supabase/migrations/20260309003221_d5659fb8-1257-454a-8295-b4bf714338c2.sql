-- Tabela de notícias
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('update', 'curiosity', 'announcement')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Políticas: todos podem ver, apenas admins podem gerenciar
CREATE POLICY "Anyone can view news"
ON public.news
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert news"
ON public.news
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update news"
ON public.news
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete news"
ON public.news
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Tabela para rastrear quais notícias foram lidas por cada usuário
CREATE TABLE public.news_read_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(news_id, user_id)
);

-- Enable RLS
ALTER TABLE public.news_read_status ENABLE ROW LEVEL SECURITY;

-- Políticas: usuários só podem ver e gerenciar seu próprio status de leitura
CREATE POLICY "Users can view their own read status"
ON public.news_read_status
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own read status"
ON public.news_read_status
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own read status"
ON public.news_read_status
FOR UPDATE
USING (auth.uid() = user_id);

-- Função para notificar usuários sobre novas notícias
CREATE OR REPLACE FUNCTION public.notify_new_news()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Criar notificação para todos os usuários autenticados
  FOR user_record IN 
    SELECT DISTINCT id FROM profiles
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      metadata
    )
    VALUES (
      user_record.id,
      CASE NEW.type
        WHEN 'update' THEN 'info'
        WHEN 'announcement' THEN 'success'
        WHEN 'curiosity' THEN 'info'
        ELSE 'info'
      END,
      '📰 Nova Notícia: ' || NEW.title,
      NEW.content,
      jsonb_build_object(
        'news_id', NEW.id,
        'news_type', NEW.type
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger para enviar notificações quando uma nova notícia é criada
CREATE TRIGGER on_news_created
AFTER INSERT ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_news();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir notícias existentes (migração dos dados hardcoded)
INSERT INTO public.news (type, title, content, is_pinned, created_at) VALUES
  ('announcement', 'Novo recurso: Trilhas por Livro!', 'Agora cada trilha representa um livro completo. Cada capítulo tem uma pergunta estratégica para testar sua compreensão. Experimente agora!', true, '2026-01-04'::timestamp),
  ('curiosity', 'Você sabia? Leitura e memória', 'Estudos mostram que pessoas que leem ficção têm maior capacidade de empatia e compreensão social. O cérebro ativa as mesmas áreas que usamos para entender emoções reais!', false, '2026-01-03'::timestamp),
  ('update', 'Sistema de Ranking atualizado', 'O ranking agora é dividido por patamar! Você compete apenas com leitores do seu nível. Bronze compete com Bronze, Ouro com Ouro, e assim por diante.', false, '2026-01-02'::timestamp),
  ('curiosity', 'A biblioteca de Alexandria', 'A antiga Biblioteca de Alexandria chegou a ter cerca de 400.000 rolos de papiro. Seria o equivalente a aproximadamente 100.000 livros modernos!', false, '2026-01-01'::timestamp),
  ('announcement', 'Livro do Mês - Fevereiro 2026', 'O Book Club de fevereiro vai ler ''O Nome do Vento'' de Patrick Rothfuss. Prepare-se para uma jornada épica! Início dia 1º de fevereiro.', false, '2025-12-30'::timestamp),
  ('update', 'Novo sistema de tocha (streak)', 'A tocha agora muda de cor conforme seus dias consecutivos! De laranja a preto absoluto para os leitores mais dedicados com 250+ dias.', false, '2025-12-28'::timestamp),
  ('curiosity', 'O poder da leitura diária', 'Ler apenas 20 minutos por dia expõe você a cerca de 1.8 milhão de palavras por ano. Isso pode melhorar significativamente seu vocabulário e habilidades de escrita.', false, '2025-12-25'::timestamp),
  ('announcement', 'Bem-vindo ao BookQuest!', 'Estamos felizes em ter você aqui! O BookQuest foi criado para transformar a leitura em uma jornada gamificada e divertida. Explore as trilhas, complete missões e suba no ranking!', false, '2025-12-20'::timestamp);
