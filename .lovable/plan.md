## Visão geral

Duas frentes de trabalho, na ordem:

**A) Renomear turmas** — quick win: editar nome de qualquer turma (escolas que não usam A/B/C).
**B) Redesign completo do Painel do Professor** — Overview com KPIs, gráficos, drill-down por turma, alertas inteligentes, atividades, quizzes/reflexões e relatórios automáticos.

Referências: Google Classroom, Khan Academy Teacher, Duolingo for Schools, Notion dashboards.

---

## PARTE A — Renomear turma

### Onde

- `src/pages/edu/EduTurmas.tsx` (lista de turmas) — ícone "lápis" no card.
- `src/pages/edu/EduTurmaDetail.tsx` — botão "Renomear" no header.
- `src/hooks/useClasses.tsx` — adicionar `renameClass(id, name)` que faz `update({ name }).eq('id', id)` (RLS já permite via `Teachers can update own classes`).

### UX

- Dialog com input pré-preenchido + validação (3-40 chars, único por professor — checagem client-side).
- Toast "Turma renomeada".
- Atualização otimista da lista.

Sem mudanças de schema — coluna `name` já é livre.

---

## PARTE B — Painel do Professor (redesign)

### Rota e estrutura

- Reescrever `src/pages/edu/EduDashboard.tsx` como página Overview.
- Nova rota detalhe (já existe): `EduTurmaDetail.tsx` recebe redesign focado.
- Novos componentes em `src/components/edu/dashboard/`:
  - `KpiCard.tsx`, `KpiGrid.tsx`
  - `ProgressLineChart.tsx`, `StatusDonut.tsx`, `PagesPerDayChart.tsx`, `CompletionForecast.tsx`
  - `ClassCard.tsx` (com mini-sparkline)
  - `AlertsPanel.tsx`
  - `StudentsTable.tsx` (busca + filtros + ordenação)
  - `ClassRanking.tsx`, `StudentProgressBars.tsx`, `WeeklyActivityChart.tsx`
  - `ActivitiesPlanner.tsx` + `ActivityCalendar.tsx`
  - `QuizReflectionEditor.tsx`
  - `WeeklyReportPreview.tsx`, `ReportExportMenu.tsx`

Lib de gráficos: **recharts** (já compatível com shadcn `chart.tsx`).

### Layout (wireframe textual)

```text
┌────────────────────────────────────────────────────────────┐
│  Olá, Prof. [Nome]  ·  Semana de 12-18 mai            ⚙   │
├────────────────────────────────────────────────────────────┤
│ [KPI] Turmas   [KPI] Alunos   [KPI] % leitura  [KPI] pg/d │
│ [KPI] Atrasados (vermelho)  [KPI] Adiantados  [KPI] Ativ. │
├────────────────────────────────────────────────────────────┤
│ ⚠  Alertas inteligentes                                    │
│  • 5 alunos sem ler há 4 dias  → [Ver]                    │
│  • 7ºB atrasada no cronograma  → [Abrir turma]            │
│  • 3 alunos terminaram o livro 🎉                          │
├──────────────────────────────────┬─────────────────────────┤
│ Progresso geral (linha semanal)  │ Status alunos (donut)   │
├──────────────────────────────────┼─────────────────────────┤
│ Páginas/dia (linha)              │ Conclusão prevista      │
├──────────────────────────────────┴─────────────────────────┤
│ Minhas turmas                                   [+ Turma]  │
│ ┌─ 6ºA ─────┐ ┌─ 6ºB ─────┐ ┌─ 7ºB ─────┐                 │
│ │ Vidas Sec.│ │ Capitães..│ │ Dom Casm. │                 │
│ │ 62% ▮▮▮▯ │ │ 78% ▮▮▮▮ │ │ 31% ▮▯▯▯ │                 │
│ │ ✓ No ritmo│ │ ▲ Adiantd.│ │ ⚠ Em risco│                 │
│ │ ▁▂▄▅▆▇   │ │ ▁▃▅▇█▇   │ │ ▁▁▂▂▁▁   │                 │
│ └───────────┘ └───────────┘ └───────────┘                 │
└────────────────────────────────────────────────────────────┘
```

### Detalhe da turma (drill-down ao clicar no card)

```text
┌ 7ºB · Dom Casmurro                          [Renomear] [⋯]┐
│ KPIs: Alunos · pg/dia · ritmo · previsão · % atrasados    │
├────────────────────────────────────────────────────────────┤
│ Tabs: [Visão] [Alunos] [Ranking] [Atividades] [Quizzes]   │
│       [Relatórios]                                         │
├────────────────────────────────────────────────────────────┤
│ Visão: progresso individual (barras) + atividade semanal  │
│ Alunos: tabela rica (busca, filtros, ordenação)           │
│ Ranking: top 10 com medalhas, XP da turma                 │
│ Atividades: calendário + criar leitura/avaliativa/desafio │
│ Quizzes: editor de perguntas/alternativas/reflexões       │
│ Relatórios: preview semanal por aluno + exportar          │
└────────────────────────────────────────────────────────────┘
```

### Tabela de alunos (colunas)

Nome · Página atual · % livro · Status (badge verde/amarelo/vermelho) · Dias sem ler · Última atividade · Média pg/dia · Ações (mensagem, relatório).

Toolbar: input de busca, filtros (status, série), ordenação por coluna, export CSV.

### Alertas inteligentes (regras)

Calculadas client-side a partir de `class_reading_progress`:
- "X alunos sem ler há ≥3 dias" (last_read_date)
- "Turma Y atrasada no cronograma" (média < esperado pelo `reading_deadline`)
- "Z alunos finalizaram o livro" (current_page ≥ total_pages)
- "Aluno em risco de abandono" (sem ler ≥7 dias)

Cada alerta tem CTA contextual (abrir turma/aluno/enviar mensagem).

### Atividades

- Tipos: Leitura, Avaliativa, Desafio semanal.
- Calendário mensal (componente leve com grid 7×N).
- Reaproveita `edu_class_challenges` para Desafios; nova tabela `edu_class_activities` (migration) para Leitura/Avaliativa com `type`, `title`, `description`, `due_date`.

### Quizzes & Reflexões

- Reaproveita `edu_journey_chapter_questions` (perguntas por capítulo).
- Editor inline: listar por capítulo, editar `question_text`, criar/excluir.
- Para alternativas e texto reflexivo: estender com colunas `options jsonb`, `reflection_text text` (migration).

### Relatórios automáticos

- Preview no painel usando dados existentes (`edu_reports` já existe).
- Botões: gerar PDF (já há `src/lib/edu/generateReportPDF.ts`), enviar email/WhatsApp (link `wa.me` com template).
- Cron semanal (fora deste plano) — apenas UI de "agendar".

### KPIs — fórmulas

- % leitura geral = média(`current_page / total_pages`) por turma.
- pg/dia = média(`pages_read_today`) últimos 7 dias.
- Atrasado = ritmo < esperado para `reading_deadline`.
- Adiantado = ritmo > 1.2× esperado.

### Migrations necessárias

```sql
-- Atividades
create table edu_class_activities (
  id uuid pk default gen_random_uuid(),
  class_id uuid not null,
  teacher_id uuid not null,
  type text not null check (type in ('leitura','avaliativa','desafio')),
  title text not null,
  description text,
  due_date date,
  created_at timestamptz default now()
);
-- RLS: teacher manage own; members select.

-- Quizzes estendidos
alter table edu_journey_chapter_questions
  add column options jsonb default '[]'::jsonb,
  add column reflection_text text;
```

### Diretrizes de design

- Tokens semânticos do projeto (Royal Blue #2563EB / Gold #FACC15). Status: verde `--success`, amarelo `--warning`, vermelho `--destructive`.
- Cards `rounded-2xl`, `shadow-sm`, `p-6`, gap generoso (`gap-6`).
- Tipografia: KPIs `text-3xl font-bold`, labels `text-xs uppercase tracking-wide text-muted-foreground`.
- Gráficos: paleta consistente, grid suave, tooltips clean.
- Sem emojis em títulos (apenas ícones lucide). Microcopy direta.
- Mobile: KPIs 2 colunas, gráficos empilhados, tabela vira cards.

---

## Ordem de execução

1. **Parte A** — `renameClass` no hook + dialog em `EduTurmas.tsx` e `EduTurmaDetail.tsx`. (rápido)
2. Migrations (atividades + colunas em quizzes).
3. Componentes base do dashboard (`KpiCard`, gráficos com recharts).
4. Reescrita de `EduDashboard.tsx` (Overview + Alertas + Cards turmas).
5. Redesign de `EduTurmaDetail.tsx` em tabs.
6. Editor de Quizzes & Reflexões.
7. Preview de Relatórios + export.

Entrega faseada — confirmo cada bloco antes de seguir, ou implemento tudo se você aprovar o plano completo.
