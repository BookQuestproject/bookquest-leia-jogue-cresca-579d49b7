# Onboarding Completo BookQuest EDU

Plano grande dividido em 7 partes. Vou implementar tudo, mas preciso confirmar pontos críticos antes — a Parte 0 (limpeza) é destrutiva e irreversível.

## ⚠️ Decisões necessárias antes de começar

1. **Limpeza de dados (Parte 0)** — Vou apagar TODOS os dados de:
   - `classes`, `class_members`, `class_reading_progress`, `class_questions`, `class_question_responses`, `class_chapter_discussions`, `class_book_history`, `edu_journeys`, `edu_journey_classes`, `edu_journey_chapter_questions`, `edu_reports`, `edu_class_announcements`, `edu_class_challenges`
   - **NÃO** vou apagar: `profiles`, `auth.users`, `edu_teachers` (contas reais), `book_*` (livros do catálogo são reais).
   - **Confirme se posso apagar TODAS as turmas/jornadas, mesmo as suas de teste como admin.**

2. **Página pública `/entrar/:codigo`** — aluno cria conta nova ali. Hoje o cadastro passa pelo `/quiz-literario` obrigatório. Para alunos vindos por link de turma, vou **pular o quiz literário** e ir direto pro onboarding gamificado EDU. OK?

3. **Professores antigos sem perfil completo** — vou marcar como "perfil incompleto" todo `edu_teachers` que não tiver `school_name` em `edu_teacher_settings` E forçar tela bloqueante. OK?

---

## Parte 0 — Limpeza
Migration `TRUNCATE` nas tabelas listadas acima (CASCADE).

## Parte 1 — Schema (migration)
Adicionar em `profiles`:
- `grades_taught text[]` (séries que leciona)
- `city text`, `state text`
- `school_name text` (já existe em settings, espelhar no profile p/ professor)

Adicionar em `classes`:
- `year integer` (ano letivo)
- `student_count_estimate integer`

Adicionar em `class_members`:
- `last_seen_at timestamptz` (para status Ativo/Inativo/Não acessou)

Flag onboarding em `edu_teachers`:
- `onboarding_completed boolean default false`
- `profile_completed boolean default false`

Flag onboarding aluno em `profiles`:
- `edu_onboarding_completed boolean default false`
- `avatar_character text` (Explorador/Mago/etc)

## Parte 2 — Gate professor antigo
Componente `TeacherProfileGate` em `EduProfessor.tsx` e `EduLayout`: se `profile_completed=false`, renderiza tela bloqueante com formulário (nome, séries, escola, cidade/UF). Só libera o painel após salvar.

## Parte 3 — Wizard professor (novo)
Nova página `src/pages/edu/EduOnboarding.tsx` com 5 passos:
1. Boas-vindas
2. Perfil (mesmos campos do gate)
3. Criar primeira turma
4. Mostrar código + link `/entrar/CODIGO` com botões copiar
5. Criar primeira jornada (livro/autor/datas/capítulos) → grava em `edu_journeys` + `edu_journey_classes`
6. Final → marca `onboarding_completed=true` → vai pro painel

`EduProfessor.tsx` redireciona para `/edu/onboarding` se `onboarding_completed=false`.

## Parte 4 — Tour guiado professor
Reutilizar `TutorialContext`: criar conjunto separado `eduTeacherSteps` (Dashboard, Nova Turma, Código, Jornadas) com chave própria `bookquest_edu_teacher_tour_done`. Disparar ao terminar wizard.

## Parte 5 — Página pública `/entrar/:codigo`
Nova página `src/pages/edu/JoinClass.tsx`:
- Busca turma por código (RPC `find_class_by_code`)
- Mostra nome da turma
- Form: nome, e-mail, senha → `signUp` com metadata `{is_edu_student: true, class_code}`
- Após signup: salva código em `localStorage` e redireciona para `/edu/onboarding-aluno`
- Adiciona `/entrar/:codigo` em `App.tsx` e em `exemptPaths` do `QuizGate`

## Parte 6 — Onboarding gamificado aluno
Nova página `src/pages/edu/EduAlunoOnboarding.tsx`, 4 telas:
1. Boas-vindas
2. Escolher avatar (5 opções com ícones)
3. Como funciona (3 cards)
4. Primeira missão (livro atual da turma)

Ao final:
- Insere em `class_members` via RPC
- Marca `edu_onboarding_completed=true`
- Vai para `/edu/aluno`

## Parte 7 — Tutorial dashboard aluno
Steps EDU para `/edu/aluno`: Jornadas, Quizzes, Pontos/Ranking. Chave `bookquest_edu_student_tour_done`.

## Parte 8 — Lista de alunos na turma
Em `EduTurmaDetail.tsx`: tabela com nome, e-mail, status calculado:
- Sem `last_seen_at` → "Não acessou ainda"
- Acessou nos últimos 7d → "Ativo"
- Caso contrário → "Inativo"

Trigger ou update no client em `class_members.last_seen_at` quando aluno carrega o painel.

---

## Resumo de arquivos
- **Migration**: novos campos + truncate de tabelas EDU
- **Novos**: `EduOnboarding.tsx`, `EduAlunoOnboarding.tsx`, `JoinClass.tsx`, `TeacherProfileGate.tsx`
- **Editados**: `App.tsx` (rotas), `QuizGate.tsx` (exempt /entrar e /edu/*), `EduProfessor.tsx`, `EduTurmaDetail.tsx`, `TutorialContext.tsx` (steps EDU), `useTeacherSettings.ts`

Confirma os 3 pontos do topo (especialmente a limpeza destrutiva) e eu começo a implementação?
