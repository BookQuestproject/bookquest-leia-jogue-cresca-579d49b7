-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications  
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- System/triggers can insert (via security definer function)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Function to create notification when book suggestion status changes
CREATE OR REPLACE FUNCTION public.notify_suggestion_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when status changes from 'pending' to 'approved' or 'rejected'
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.status = 'approved' THEN 'success' ELSE 'warning' END,
      CASE WHEN NEW.status = 'approved' 
        THEN '📚 Sugestão Aprovada!'
        ELSE '📕 Sugestão Não Aprovada'
      END,
      CASE WHEN NEW.status = 'approved'
        THEN 'Seu livro "' || NEW.title || '" foi aprovado e já está disponível na biblioteca!'
        ELSE 'Seu livro "' || NEW.title || '" não foi aprovado. ' || COALESCE(NEW.admin_notes, 'Entre em contato para mais informações.')
      END,
      jsonb_build_object(
        'suggestion_id', NEW.id,
        'book_title', NEW.title,
        'status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on book_suggestions
CREATE TRIGGER on_suggestion_status_change
  AFTER UPDATE OF status ON public.book_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_suggestion_status_change();