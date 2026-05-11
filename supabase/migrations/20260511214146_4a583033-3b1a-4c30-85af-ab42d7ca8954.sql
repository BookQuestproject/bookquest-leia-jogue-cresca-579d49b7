
ALTER TABLE public.class_question_responses
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS teacher_feedback text;

-- Allow teachers of the class to update responses (to add feedback / mark reviewed)
DROP POLICY IF EXISTS "Teachers can review class responses" ON public.class_question_responses;
CREATE POLICY "Teachers can review class responses"
ON public.class_question_responses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.class_questions q
    JOIN public.classes c ON c.id = q.class_id
    WHERE q.id = class_question_responses.question_id
      AND c.teacher_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.class_questions q
    JOIN public.classes c ON c.id = q.class_id
    WHERE q.id = class_question_responses.question_id
      AND c.teacher_id = auth.uid()
  )
);
