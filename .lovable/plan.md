## BookQuest EDU — Redesign Total (Professor)

Refatoração completa da experiência do professor: nova arquitetura de menu, novas telas, comunicação por turma, relatórios automáticos individuais e configurações próprias do EDU.

### 1. Nova arquitetura do menu lateral (`EduLayout.tsx`)

Substituir os 9 itens atuais por 8 categorias focadas na rotina do professor:

```
1. Dashboard              → /edu/professor
2. Turmas                 → /edu/turmas
3. Jornadas de leitura    → /edu/jornadas
4. Perguntas de Reflexão  → /edu/perguntas
5. Comunicação            → /edu/comunicacao
6. Relatórios             → /edu/relatorios
7. Biblioteca             → /edu/livros
8. Configurações EDU      → /edu/configuracoes
```

Remover: Atividades, Quizzes, Rankings, Agenda, Mensagens (substituídos pelas novas categorias). Garantir que **nenhum link** redireciona para o BookQuest normal — o EDU vira produto próprio.

### 2. Dashboard refeito (`EduDashboard.tsx`)
- Topo: 3 botões rápidos — Nova turma, Nova jornada, Gerar relatórios
- KPIs: Turmas ativas, Alunos ativos, Leituras em andamento, Progresso médio
- 3 cards laterais: Últimas turmas criadas, Últimas jornadas aplicadas, Últimos relatórios enviados
- Feed: Atividades recentes das turmas

### 3. Turmas com sub-navegação interna (`EduTurmaDetail.tsx`)

Refatorar a página de detalhe da turma com tabs internas:
- **Visão geral** — progresso, ranking, atividade recente
- **Alunos** — lista com progresso individual, última atividade, botão "ver perfil"
- **Jornadas** — jornadas aplicadas + botões "Aplicar nova" e "Duplicar para outra turma"
- **Comunicação** — mural + chat da turma + DM individual
- **Relatórios** — lista de alunos com botão "Gerar relatório"

Lista de turmas (`EduTurmas.tsx`) já existe — ajustar cards: nome, alunos, jornada ativa, progresso médio.

### 4. Jornadas de leitura (nova `EduJornadas.tsx`)

Substitui "Atividades". Fluxo de criação em wizard de 5 passos:
1. Escolher livro (da biblioteca)
2. Definir capítulos
3. Associar perguntas por capítulo
4. Publicar jornada
5. Aplicar em uma ou várias turmas (multi-select)

Ações por jornada: Editar, Duplicar (com destaque visual forte), Aplicar em turmas.

### 5. Perguntas de Reflexão (nova `EduPerguntas.tsx`)

Renomeia "Quizzes". Biblioteca de perguntas organizada por **Livro → Capítulo**. Tipos: Aberta, Múltipla escolha, Reflexiva. Ações: criar, editar, duplicar, reutilizar em outra jornada.

### 6. Comunicação (nova `EduComunicacao.tsx`)

Substitui "Mensagens". Lista de turmas → ao selecionar uma turma:
- Mural de avisos (posts fixados)
- Mensagem para toda a turma
- Lista de alunos para mensagem individual (DM)

### 7. Relatórios automáticos (refazer `EduRelatorios.tsx`)

Funcionalidade central. Fluxo:
1. Selecionar turma
2. Lista de alunos com botão "Gerar relatório"
3. Modal/página com relatório auto-gerado:
   - Dados: nome, turma, jornadas em andamento, % progresso, capítulos concluídos, frequência, participação em reflexões
   - **Análise pedagógica automática** (texto gerado): engajamento, constância, participação, evolução — tom positivo
   - Campo "Observação do professor"
   - Botão **"Enviar para responsáveis"** (e-mail)
   - Status: Enviado / Pendente / Não enviado
   - Histórico por aluno + botão reenviar

### 8. Biblioteca (`EduLivros.tsx`)
Pequeno polish: pesquisa, favoritar, botão "Adicionar à jornada".

### 9. Configurações EDU (nova `EduConfiguracoes.tsx`)

Não redirecionar para `/configuracoes` do BookQuest. Seções:
- Perfil do professor
- Dados da escola
- Configurações de envio de relatórios (e-mail remetente, assinatura, frequência automática)
- Notificações
- Preferências visuais

### 10. Identidade visual

- Manter fundo azul + estrelas + glassmorphism
- Trocar o amarelo pastel atual por **#FACC15** (accent vibrante das brand guidelines)
- Botões com hover mais saturado, micro-animações suaves
- Tom: profissional, pedagógico, limpo (não infantil)

---

### Detalhes técnicos

**Arquivos novos:**
- `src/pages/edu/EduJornadas.tsx`
- `src/pages/edu/EduPerguntas.tsx`
- `src/pages/edu/EduComunicacao.tsx`
- `src/pages/edu/EduConfiguracoes.tsx`

**Arquivos refeitos:**
- `src/pages/edu/EduLayout.tsx` — novo menu (8 itens), garante zero links pro BookQuest
- `src/pages/edu/EduDashboard.tsx` — KPIs + cards laterais + feed
- `src/pages/edu/EduTurmaDetail.tsx` — sub-navegação interna por abas
- `src/pages/edu/EduRelatorios.tsx` — fluxo de geração + envio + histórico
- `src/App.tsx` — registrar novas rotas, remover rotas obsoletas (`/edu/atividades`, `/edu/quizzes`, `/edu/agenda`, `/edu/mensagens`)

**Arquivos deletados:**
- `src/pages/edu/EduAtividades.tsx`
- `src/pages/edu/EduQuizzes.tsx`
- `src/pages/edu/EduAgenda.tsx`
- `src/pages/edu/EduMensagens.tsx`

**Escopo de dados:** este redesign é puramente front-end/UI. Persistência real (jornadas, perguntas, relatórios enviados, configs do EDU) ficará com mocks bem estruturados — a integração com Supabase pode ser feita em uma segunda etapa quando você quiser, para não atrasar a entrega visual e evitar criar muitas tabelas sem definição final do fluxo.

Quer que eu siga esse plano ou prefere que eu já inclua as tabelas no banco (jornadas, perguntas por capítulo, relatórios enviados, configs do professor) nesta mesma rodada?
