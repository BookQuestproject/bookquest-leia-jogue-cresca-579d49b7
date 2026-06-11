## Plano de Correção – BookQuest

Esta é uma lista grande (9 frentes, várias delas profundas). Em vez de tentar fazer tudo de uma vez (o que costuma gerar regressões), proponho dividir em **3 fases priorizadas**. Você confirma a fase 1, eu entrego, validamos, e seguimos.

Antes disso, preciso de **clarificações** em alguns pontos que mudam totalmente o escopo:

### Perguntas críticas
1. **Quiz literário** – você se refere ao `/quiz-literario` (onboarding) ou ao quiz de capítulo dentro da trilha? O sintoma "qualquer tecla anula a questão" sugere o de capítulo. Confirma?
2. **Assinatura / PIX** – PIX no Stripe exige conta Stripe Brasil habilitada para PIX. Posso (a) corrigir o fluxo atual de cartão e (b) adicionar PIX como método extra no Checkout. Ok seguir assim?
3. **Biblioteca – "adicionar mais livros"** – quantos e de qual fonte? Posso adicionar ~20 clássicos de domínio público com capas do Open Library / Wikimedia. Serve?
4. **Desafios iniciais** – quer desafios estáticos pré-cadastrados (ex.: "Leia 1 capítulo", "Complete o quiz", "Adicione 3 livros à estante") aparecendo para todo usuário novo nos primeiros 7 dias?

---

### Fase 1 – Estabilidade (bugs bloqueantes)
**Objetivo:** Site não quebra, fluxos críticos funcionam.

1. **Capas dos livros (causa raiz)**
   - Criar componente `<BookCover />` único com fallback automático (`onError` → placeholder SVG local), lazy loading e `loading="lazy"`.
   - Substituir todos os `<img src={cover}>` de Biblioteca, Comunidade, Trilhas, Estante por esse componente.
   - Auditar `book_overrides` / `book_trail_enrichments` para URLs quebradas e popular fallback canônico (Open Library `covers.openlibrary.org`).

2. **Erros ao dar F5 (causa raiz)**
   - Auditar hooks que fazem fetch antes de `auth.loading` resolver (padrão race-condition já documentado no projeto).
   - Adicionar guard `if (authLoading) return;` consistente em `useBookshelf`, `useMyTrails`, `useActiveTrail`, `useNotifications`, `useReadingPlan`.
   - Revisar `onAuthStateChange` para garantir que callbacks não usam `await` direto (deadlock conhecido).

3. **Quiz literário (causa raiz)**
   - Remover listeners globais de `keydown` que interceptam Space/Enter durante o quiz.
   - Adicionar estado `isProcessing` para bloquear cliques duplos.
   - Garantir feedback visual (verde/vermelho) e auto-avanço após 1,2s.

4. **Assinatura – corrigir fluxo atual**
   - Investigar erro real no `create-checkout` (provavelmente origin não-allowlisted ou plano inválido).
   - Adicionar logs claros e mensagem de erro no frontend em vez de tela branca.

### Fase 2 – Conteúdo e relacionamentos
5. **Livro de trilha não aparece na comunidade** – mapear `trilha.book_id ↔ community.book_id` e criar comunidade automaticamente quando faltar (via migration + trigger).
6. **Excluir comentários** – botão de lixeira para autor + RLS policy `DELETE USING auth.uid() = user_id` em `community_comments` e `class_chapter_discussions`.
7. **Biblioteca – mais livros + capas garantidas** – seed de ~20 obras via migration de dados, todas com cover validada.

### Fase 3 – Engajamento
8. **Progresso de leitura** – tempo estimado por capítulo (baseado em páginas × 2min/pg), barra de % concluída no card da trilha e na página do livro.
9. **Desafios iniciais** – 5 desafios pré-definidos para novos usuários (primeiros 7 dias), exibidos no topo de `/missoes` e no `/home`.
10. **PIX no Stripe Checkout** – adicionar `payment_method_types: ["card", "pix"]` (requer conta Stripe BR).

---

### Como prosseguir
Por favor responda:
- As 4 perguntas críticas acima.
- Se topa começar pela **Fase 1** (estabilidade) e aprovar as próximas fases depois de validar.

Se preferir que eu vá atacando tudo na ordem listada sem esperar (assumindo respostas padrão: quiz = capítulo, PIX = adicionar como extra, biblioteca = 20 clássicos, desafios = estáticos), me diga "manda ver tudo".
