## Visão geral

Duas frentes de trabalho:

**A) Correções no diálogo de código do aluno** (rápido, ~1 arquivo)
**B) Redesign completo do onboarding do professor** (estrutura nova, multi-etapas, ~3-4 arquivos)

---

## PARTE A — Diálogo "Entrar na turma" (aluno)

Arquivo: `src/pages/edu/EduEntry.tsx`

1. **Voltar para o card "Sou Estudante" ao fechar**
   - Quando `showStudentCode` fecha, reabrir `showRolePicker` automaticamente (em vez de cair no EDU home).
   - Limpar `?join=1` da URL ao fechar para evitar reabertura em loop.

2. **Máscara + validação de 6 caracteres**
   - Input controlado: aceita só `[A-Z0-9]`, força uppercase, máx 6 chars.
   - Render visual de 6 "slots" (estilo OTP) mostrando cada caractere digitado em destaque.
   - Botão "Entrar" desabilitado enquanto `code.length < 6`.
   - Mensagens de erro claras inline:
     - "Código deve ter 6 caracteres" (validação local)
     - "Código não encontrado. Verifique com seu professor." (RPC retornou null)

3. **Confirmação visual com nome da turma + professor**
   - Após `student_join_class_by_code` retornar `class_id`, buscar `classes` (name) + `profiles` (full_name do teacher_id) — RLS já permite via membership recém-criada.
   - Mostrar tela de sucesso dentro do mesmo dialog: ✓ "Você entrou em [Turma]" / "Professor(a): [Nome]" + botão "Ir para minha turma".
   - Só então navegar para `/edu/aluno`.

---

## PARTE B — Onboarding do Professor (redesign completo)

### Arquivos
- **Reescrever**: `src/pages/edu/EduOnboarding.tsx` (stepper de 5 etapas)
- **Novo**: `src/components/edu/onboarding/StepProfessor.tsx`
- **Novo**: `src/components/edu/onboarding/StepEscola.tsx`
- **Novo**: `src/components/edu/onboarding/StepTurmas.tsx` (batch creation)
- **Novo**: `src/components/edu/onboarding/StepLivros.tsx`
- **Novo**: `src/components/edu/onboarding/StepPreferencias.tsx`
- **Novo**: `src/components/edu/onboarding/StepperHeader.tsx` (barra progresso + indicador)
- **Migration**: adicionar colunas em `edu_teachers` (`display_name`, `subjects[]`, `grades[]`, `experience_years`, `school_name`, `school_city`, `school_state`, `school_type`, `shifts[]`, `prefs jsonb`).

### Fluxo (5 etapas, < 3 min)

```text
[1 Professor] → [2 Escola] → [3 Turmas] → [4 Livros] → [5 Preferências] → ✓ Pronto
```

Stepper superior fixo: número + label + barra de progresso + botão "Voltar". Animação suave entre etapas (slide horizontal).

### Etapa 1 — Professor

- Headline: "Vamos te conhecer"
- Sub: "Em 3 minutos sua sala de aula está pronta."
- Campos:
  - Nome completo (input)
  - Como os alunos te chamam? (input, default "Prof. [primeiro nome]")
  - Email profissional (já vem do auth, readonly + "alterar")
  - Matérias (multi-chip: Literatura ✓, Português, Redação, Outra)
  - Séries que leciona (chips multi-select: 6º · 7º · 8º · 9º · 1ºEM · 2ºEM · 3ºEM)
  - Experiência (segmented: <2a · 2-5a · 5-10a · 10+a) — **opcional**

### Etapa 2 — Escola

- Headline: "Onde você ensina"
- Campos agrupados em card único:
  - Nome da escola (autocomplete leve, salva no perfil)
  - Cidade + UF (dois inputs lado a lado, UF como select)
  - Tipo (radio cards: Pública · Privada · Curso/Pré-vestibular)
  - Turnos (toggle chips: Manhã · Tarde · Noite — multi)
- Automação: escola fica salva — próximas turmas usam por default.

### Etapa 3 — Turmas (batch creation) ★ PRINCIPAL

- Headline: "Crie suas turmas de uma vez"
- Sub: "Você poderá editar tudo depois."
- UX: tabela editável com linhas dinâmicas. Cada linha:
  - Série (select)
  - Quantas turmas? (stepper 1-10) → gera automaticamente A, B, C…
  - Alunos por turma (input opcional)
- Botão "+ Adicionar série"
- Preview ao vivo: "Você vai criar **9 turmas**: 6ºA, 6ºB, 6ºC, 7ºA…" (chips)
- Botão secundário: "Pular — criar turmas depois"

### Etapa 4 — Livros

- Headline: "O que vão ler?"
- Pergunta inicial (radio cards grandes):
  - "Mesmo livro para todas as turmas" → seleciona 1 livro, aplica em batch
  - "Livro diferente por turma" → expande lista das turmas criadas, cada uma com seu seletor
- Sugestões automáticas por série (badges "Sugerido para 9º ano").
- Busca por título/autor + opção "Cadastrar manualmente".
- Botão "Decidir depois" disponível.

### Etapa 5 — Preferências pedagógicas

- Headline: "Como você quer ensinar?"
- 4 toggles em cards com ícone + descrição curta:
  - Gamificação ativa (XP, conquistas) — default ON
  - Ranking entre turmas — default OFF
  - Meta semanal de leitura — default ON
  - Notificações de progresso por email — default ON
- CTA final: "Concluir e ir para o painel"

### Tela de sucesso

- Confete sutil. "Tudo pronto, [nome]."
- Resumo: "X turmas criadas · Y alunos esperados · Livro: Z"
- Botões: "Convidar alunos agora" (mostra códigos das turmas) · "Ir para o painel"

---

## Diretrizes UI/Design

- Layout: container centralizado max-w-2xl, card único por etapa, espaçamento generoso (`py-12`).
- Stepper superior compacto, sticky, com gradient accent (azul → dourado) na barra.
- Tipografia: títulos `text-3xl font-bold`, subtítulos `text-base text-muted-foreground`.
- Componentes: shadcn `Card`, `Input`, `RadioGroup`, `Toggle`, `Badge`. Chips custom para multi-select.
- Cores: tokens semânticos do projeto (Royal Blue + Gold). Nada hardcoded.
- Microcopy profissional, sem emojis nos títulos (apenas ícones lucide).
- Transições: `framer-motion` slide entre etapas, fade nos chips de preview.
- Acessibilidade: focus rings, labels explícitos, navegação por teclado.

---

## Funcionalidades inteligentes

- **Batch turmas**: gera A/B/C automaticamente.
- **Aplicar livro em massa**: 1 click para todas as turmas.
- **Sugestão de livros por série**: heurística simples (ex: 9º → "Vidas Secas").
- **Salvar escola**: reaproveita em criações futuras.
- **Pular etapas opcionais** (turmas, livros) — professor pode terminar depois.
- **Editar tudo depois** em `/edu/configuracoes` e `/edu/turmas`.

---

## Aspectos técnicos

- Persistência: cada step salva em `localStorage` (recuperação se fechar) + commit final em transação ao concluir.
- Schema: migration adiciona colunas em `edu_teachers` + cria turmas em lote via insert múltiplo.
- Validação: `zod` por step antes de avançar.
- Roteamento: `/edu/onboarding` único, com query `?step=N` para deep-link.

---

## Ordem de execução

1. Parte A (correções diálogo aluno) — rápido, isola bug atual.
2. Migration de colunas em `edu_teachers`.
3. Stepper + 5 componentes de etapa.
4. Reescrita de `EduOnboarding.tsx` orquestrando.
5. Tela de sucesso + redirect ao dashboard.