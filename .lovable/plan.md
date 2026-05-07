## Plano: Persistência real do BookQuest EDU + convites + PDF de relatórios

Vou estruturar em 4 frentes. Confirme antes de eu executar (a parte 1 inclui migration de banco que precisa da sua aprovação).

### 1. Schema do banco (migration)

Criar tabelas que ainda não existem:

- `edu_journeys` — jornadas de leitura
  - title, book_id, book_title, author, total_pages, total_chapters, teacher_id, created_at/updated_at
- `edu_journey_classes` — vínculo N:N jornada ⇄ turma (com `assigned_at`)
- `edu_journey_chapter_questions` — perguntas por capítulo de uma jornada
  - journey_id, chapter_number, question_text, created_by
- `edu_reports` — histórico de relatórios gerados/enviados
  - class_id, student_user_id, teacher_id, period_label, metrics (jsonb: progress, chapters, frequency, reflections), analysis_text, teacher_note, status ('rascunho'|'gerado'|'enviado'), sent_at, pdf_url (opcional)
- `edu_teacher_settings` — preferências do professor (jsonb: school_name, signature, email_settings, notification_prefs)

Já existem e serão reutilizadas: `classes`, `class_members`, `class_questions`, `class_reading_progress`, `class_question_responses`, `edu_class_announcements`, `edu_teachers`.

RLS: professores veem/editam apenas seus dados (via `teacher_id = auth.uid()`); alunos veem jornadas/perguntas das turmas em que são membros (via EXISTS em `class_members`).

### 2. Convites e vínculo de alunos

- **Botão "Convidar alunos"** dentro de cada turma (`EduTurmaDetail`):
  - Mostra o `access_code` da turma com botão copiar
  - Gera link `/edu/entrar?code=ABC123`
  - Botão WhatsApp/E-mail (mailto + wa.me) com mensagem pronta
- **Tela do aluno** `/edu/entrar` (já parcialmente existe via `EduAluno`): formulário simples para inserir código → usa `find_class_by_code` (já existe) → insere em `class_members`. Se não logado, redireciona para `/auth?redirect=...`.
- **Vínculo manual pelo professor**: na aba "Alunos" da turma, campo de busca por @username/email → cria `class_members` direto (precisa de uma RPC `teacher_add_student_to_class` security definer, pois RLS atual só permite o próprio user inserir).

### 3. CRUD real (substituindo mocks)

- `EduJornadas.tsx` → usa `edu_journeys` + `edu_journey_classes` (criar/listar/duplicar/excluir)
- `EduPerguntas.tsx` → usa `edu_journey_chapter_questions` (CRUD por capítulo)
- `EduComunicacao.tsx` → usa `edu_class_announcements` (já existe tabela)
- `EduRelatorios.tsx` → 
  - Lista de alunos vem de `class_members` + `profiles` + `class_reading_progress`
  - Métricas calculadas a partir de progresso real
  - Salva em `edu_reports` ao gerar; muda status ao "enviar"
- `EduConfiguracoes.tsx` → usa `edu_teacher_settings` (upsert)
- `EduTurmaDetail.tsx` → aba Alunos lista `class_members` reais com progresso

### 4. PDF do relatório

- Adicionar `jspdf` (já leve) via `bun add jspdf`
- Função `generateReportPDF(report, student, classData, teacherSettings)`:
  - Cabeçalho com nome da escola/professor, logo BookQuest EDU
  - Bloco "Aluno": nome, turma, período
  - Bloco "Métricas" em tabela: progresso %, capítulos lidos, frequência, reflexões
  - Bloco "Análise pedagógica" (texto gerado)
  - Bloco "Observação do professor" (campo livre)
  - Rodapé com data e assinatura
- Botões: **Baixar PDF** e **Enviar aos responsáveis** (apenas marca status — envio real por e-mail fica como Fase 2 com edge function + Resend)

### Arquivos afetados

**Migration:** 1 nova migration com 5 tabelas + RLS + 1 RPC `teacher_add_student_to_class`

**Editados:**
- `src/pages/edu/EduJornadas.tsx`
- `src/pages/edu/EduPerguntas.tsx`
- `src/pages/edu/EduRelatorios.tsx`
- `src/pages/edu/EduComunicacao.tsx`
- `src/pages/edu/EduConfiguracoes.tsx`
- `src/pages/edu/EduTurmaDetail.tsx`
- `src/pages/edu/EduAluno.tsx` (fluxo entrar com código)

**Novos:**
- `src/hooks/useJourneys.ts`
- `src/hooks/useJourneyQuestions.ts`
- `src/hooks/useReports.ts`
- `src/hooks/useTeacherSettings.ts`
- `src/lib/edu/generateReportPDF.ts`
- `src/components/edu/InviteStudentsDialog.tsx`

### Fora do escopo desta rodada (para não inflar)

- Envio real de e-mail aos responsáveis (precisa Resend + edge function — posso fazer em seguida se quiser)
- Upload do PDF para Storage (por ora download direto)
- Cadastro de e-mail dos responsáveis por aluno (posso adicionar tabela `student_guardians` se quiser já)

Posso seguir com tudo isso? Ou prefere que eu já inclua na mesma rodada o envio por e-mail (Resend) e a tabela de responsáveis?