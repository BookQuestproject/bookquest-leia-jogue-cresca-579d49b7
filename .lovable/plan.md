## Objetivo

Aplicar o mesmo layout/estética das páginas demo (`/edu/demo/professor` e `/edu/demo/aluno`) nas salas reais, ligando-as a dados reais do Supabase, e garantir que o professor cai direto nessa nova UI ao terminar o onboarding ou ao criar uma nova turma.

## Estrutura proposta

Criar dois novos componentes de "casca visual" reutilizáveis baseados nos demos, e plugar dados reais:

```
src/pages/edu/
├── EduProfessor.tsx        ← reescrito com layout do DemoEduProfessor (dados reais)
├── EduAluno.tsx            ← reescrito com layout do DemoEduAluno (dados reais)
├── EduTurmaDetail.tsx      ← passa a renderizar EduProfessor com classId selecionado
```

A sidebar/topo, cards de stats, lista de alunos, ranking, atividades, anúncios, perfil compacto do aluno, sections (Dashboard / Livro / Trilha / Atividades / Ranking / Missões / Conquistas / Progresso) ficam visualmente idênticos ao demo, só trocando os dados de `DEMO_*` por hooks reais que já existem:

- `useClasses`, `useClassReadingProgress`, `useEduEngagement` (challenges, achievements, announcements), `useClassDiscussions`, `useClassQuestions`, `useEduRole` (studentClasses), `useProfile`.

## Mudanças por arquivo

### 1. `src/pages/edu/EduProfessor.tsx` (reescrita)
- Substituir o `EduDashboard` atual por uma página com:
  - Sidebar idêntica ao `DemoEduProfessor` (Painel / Turma / Atividades / Relatórios + perfil + Sair).
  - Header com nome da turma selecionada + código.
  - Tabs `overview / students / reviews / reports` com cards visuais do demo.
  - Seletor de turma no topo se houver mais de uma (`useClasses`).
  - Stats reais: nº alunos, progresso médio, ativos hoje, atividades a corrigir.
  - Ranking real via `class_reading_progress`.
  - Anúncios reais (`useEduEngagement.createAnnouncement`).
- Mantém `EduLayout` apenas se necessário; caso contrário descarta para usar a sidebar do demo.

### 2. `src/pages/edu/EduAluno.tsx` (reescrita)
- Substituir layout atual por estrutura do `DemoEduAluno`:
  - Sidebar com perfil compacto (nível, ✦ Essência, 🔥 streak via `useUserStats`).
  - Sections: Início, Livro da Turma, Trilha, Atividades, Ranking, Missões, Conquistas, Progresso.
  - Atualização de página via `updateProgress` real.
  - Ranking real, conquistas reais, atividades reais (`useClassQuestions` + responses).
- Manter `JoinClass` flow já existente para alunos sem turma.

### 3. `src/pages/edu/EduTurmaDetail.tsx`
- Como o professor agora tem painel completo em `/edu/professor` com seletor de turma, esta rota passa a apenas redirecionar para `/edu/professor?classId=:id` OU continuar como visão "detalhada" reaproveitando o mesmo componente de painel apontando para aquela turma.

### 4. `src/pages/edu/EduOnboarding.tsx`
- Já redireciona para `/edu/professor` no `finish()`. Como `/edu/professor` agora terá o novo layout, o problema do "não cai no design demo" se resolve automaticamente.
- Ajustar o botão "Criar nova turma" (em `EduTurmas`) para também levar a `/edu/professor` após criação, em vez do `EduDashboard` antigo.

### 5. Limpeza
- `EduDashboard.tsx` antigo pode permanecer ou ser removido. Vou removê-lo se não tiver outra referência.

## Pontos técnicos

- Reaproveitar todos os hooks reais já existentes — não criar novos endpoints.
- Para evitar componente gigante, vou extrair sub-seções (StatCard, RankingList, AnnouncementsCard, ActivitiesList, BookProgressCard) para `src/components/edu/classroom/`.
- Ícones e tokens (`text-accent`, `bg-card`, `text-primary`) já existem no design system.
- Sidebar mobile bottom-nav idêntica ao demo.

## Fora de escopo desta iteração

- Modo de leitura imersivo (`DemoReadingMode`) e `ReadingPrepGuide` — esses ficam só no demo por enquanto, salvo se você pedir explicitamente.
- Atividades com correção em massa pelo professor ficam com a UI do demo, mas validação completa de submissões reais exige outra rodada.

## Resultado esperado

- Professor termina onboarding → cai em `/edu/professor` com layout idêntico ao demo, mostrando suas turmas reais.
- Aluno entra na turma → cai em `/edu/aluno` com layout idêntico ao demo do aluno, mostrando livro real.
- `/edu/turmas/:id` abre a mesma sala visual, focada na turma selecionada.

Posso prosseguir?
