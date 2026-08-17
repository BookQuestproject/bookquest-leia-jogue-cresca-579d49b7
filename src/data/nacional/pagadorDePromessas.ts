/**
 * BookQuest Nacional — Colégio Nacional
 * Obra piloto: O Pagador de Promessas (Dias Gomes, 1960)
 *
 * Conteúdo fiel à peça. Nenhum acontecimento inventado.
 */

export type QuestionLevel = "facil" | "medio" | "dificil" | "professor";
export type QuestionCategory = "historia" | "personagens" | "detalhes" | "interpretacao";

export interface NacionalQuestion {
  id: string;
  partId: number;
  level: QuestionLevel;
  category: QuestionCategory;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface NacionalPart {
  id: number;
  act: string;
  title: string;
  subtitle: string;
  /** Resumo curto e objetivo — verificação de compreensão, não análise longa */
  summary: string[];
  /** Detalhes que costumam ser cobrados em prova */
  details: { label: string; text: string }[];
  /** Perguntas de interpretação (abertas, com um empurrão de raciocínio) */
  interpretation: { question: string; hint: string }[];
  questions: NacionalQuestion[];
}

export interface NacionalWork {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string;
  school: string;
  synopsis: string;
  themes: string[];
  characters: { name: string; role: string }[];
  freeParts: number;
  parts: NacionalPart[];
}

export const pagadorDePromessas: NacionalWork = {
  id: "pagador-de-promessas",
  title: "O Pagador de Promessas",
  author: "Dias Gomes",
  year: 1960,
  genre: "Teatro — drama em três atos",
  school: "Colégio Nacional",
  synopsis:
    "Zé-do-Burro, um camponês de Santana do Agreste, promete em um terreiro de candomblé doar suas terras e carregar uma cruz de madeira até a igreja de Santa Bárbara, em Salvador, se seu burro Nicolau se curasse. O animal sobrevive, e ele cumpre a promessa. Ao chegar à igreja, o padre Olavo se recusa a deixá-lo entrar com a cruz, por a promessa ter sido feita em rito afro-brasileiro. O que era um ato de fé simples vira um conflito entre religião, imprensa, polícia e política.",
  themes: [
    "Intolerância religiosa e sincretismo",
    "Fé popular x instituição eclesiástica",
    "Manipulação pela imprensa",
    "Poder, repressão e opressão social",
    "Inocência e martírio",
  ],
  characters: [
    { name: "Zé-do-Burro", role: "Protagonista. Camponês de Santana do Agreste; carrega a cruz para pagar a promessa." },
    { name: "Rosa", role: "Esposa de Zé-do-Burro. Cansada da vida no interior; se envolve com Bonitão." },
    { name: "Padre Olavo", role: "Pároco de Santa Bárbara. Proíbe a entrada da cruz por a promessa ter sido feita no candomblé." },
    { name: "Bonitão", role: "Cafetão que seduz Rosa na praça." },
    { name: "Dedé Cospe-Rima", role: "Poeta popular de cordel que transforma o caso em versos." },
    { name: "Marli", role: "Prostituta, ligada a Bonitão; a primeira a puxar conversa com Rosa e Zé." },
    { name: "Galego", role: "Dono do bar da praça, sempre atento ao lucro do movimento." },
    { name: "Minha Tia", role: "Vendedora de acarajé, filha de santo, que apoia Zé-do-Burro." },
    { name: "Monsenhor", role: "Superior do padre Olavo; tenta administrar o escândalo." },
    { name: "O Repórter", role: "Jornalista que distorce a história de Zé para vender jornal." },
    { name: "Guru / Coca", role: "Capoeiristas e figuras da praça que aderem à causa de Zé." },
    { name: "O Delegado", role: "Autoridade que trata o caso como problema de ordem pública." },
  ],
  freeParts: 2,
  parts: [
    {
      id: 1,
      act: "Ato I",
      title: "A chegada à praça",
      subtitle: "A cruz diante da igreja de Santa Bárbara",
      summary: [
        "Ainda de madrugada, Zé-do-Burro chega à praça em frente à igreja de Santa Bárbara, em Salvador, carregando uma cruz de madeira. Está exausto: veio a pé de Santana do Agreste, a sete léguas de distância.",
        "Sua mulher, Rosa, o acompanha contrariada — está cansada da caminhada e da própria vida no interior.",
        "A igreja ainda está fechada. Enquanto esperam abrir, aparecem as primeiras figuras da praça: Marli, Bonitão e o Galego, dono do bar.",
      ],
      details: [
        { label: "A promessa", text: "Zé prometeu a Santa Bárbara — invocada em um terreiro de candomblé, como Iansã — que, se seu burro Nicolau se curasse, dividiria suas terras entre os pobres e carregaria uma cruz igual à de Cristo até a igreja." },
        { label: "O burro Nicolau", text: "O animal foi atingido por um galho de árvore durante uma tempestade. É por ele, e não por uma pessoa, que a promessa foi feita." },
        { label: "A distância", text: "Sete léguas percorridas a pé, de Santana do Agreste até Salvador, com a cruz nas costas." },
        { label: "Rosa", text: "Chega reclamando, com os pés machucados; não compartilha da fé do marido e olha a cidade como possibilidade de outra vida." },
        { label: "Bonitão", text: "Aparece já observando Rosa. Sua abordagem é interesseira desde o primeiro momento." },
        { label: "O espaço", text: "Toda a peça se passa no mesmo lugar: a praça em frente à igreja — o adro, a escadaria, o bar do Galego e o tabuleiro de acarajé." },
      ],
      interpretation: [
        { question: "Por que Dias Gomes faz a peça inteira acontecer numa única praça, diante da igreja fechada?", hint: "Pense no que significa ficar do lado de fora de uma porta durante três atos." },
        { question: "O que a fala de Rosa sobre a caminhada revela sobre o casamento dos dois antes mesmo do conflito começar?", hint: "Observe do que ela reclama: dos pés, do caminho, ou da vida inteira?" },
      ],
      questions: [
        {
          id: "p1q1", partId: 1, level: "facil", category: "historia",
          text: "O que Zé-do-Burro carrega nas costas ao chegar à praça?",
          options: ["Um saco de farinha", "Uma cruz de madeira", "Uma imagem de Santa Bárbara", "O burro Nicolau ferido"],
          answer: 1,
          explanation: "Ele carrega uma cruz de madeira, igual à de Cristo, como parte da promessa.",
        },
        {
          id: "p1q2", partId: 1, level: "medio", category: "detalhes",
          text: "Qual foi o motivo original da promessa de Zé-do-Burro?",
          options: [
            "A cura de sua mulher, Rosa",
            "A cura de seu burro Nicolau, ferido por um galho durante uma tempestade",
            "A colheita perdida por causa da seca",
            "O nascimento de um filho",
          ],
          answer: 1,
          explanation: "O burro Nicolau foi atingido por um galho numa tempestade; Zé prometeu em troca da cura do animal.",
        },
        {
          id: "p1q3", partId: 1, level: "medio", category: "detalhes",
          text: "Onde a promessa foi feita?",
          options: ["Dentro da igreja de Santa Bárbara", "Em um terreiro de candomblé", "Na casa de Zé-do-Burro", "Numa procissão em Santana do Agreste"],
          answer: 1,
          explanation: "A promessa foi feita em um terreiro de candomblé, a Iansã — sincretizada com Santa Bárbara. É esse detalhe que desencadeia todo o conflito.",
        },
        {
          id: "p1q4", partId: 1, level: "professor", category: "detalhes",
          text: "Além de carregar a cruz, o que mais Zé-do-Burro prometeu fazer?",
          options: [
            "Peregrinar todos os anos até a igreja",
            "Dividir suas terras entre os pobres",
            "Nunca mais trabalhar com animais",
            "Fazer-se sacerdote",
          ],
          answer: 1,
          explanation: "Ele prometeu dividir suas terras entre os pobres — parte já cumprida antes de chegar a Salvador.",
        },
        {
          id: "p1q5", partId: 1, level: "facil", category: "personagens",
          text: "Quem acompanha Zé-do-Burro na chegada à praça?",
          options: ["Padre Olavo", "Rosa, sua esposa", "Dedé Cospe-Rima", "Minha Tia"],
          answer: 1,
          explanation: "Rosa acompanha o marido, mas visivelmente contrariada com a caminhada e com a vida que leva.",
        },
      ],
    },
    {
      id: 2,
      act: "Ato I",
      title: "A recusa do padre Olavo",
      subtitle: "A porta da igreja se fecha",
      summary: [
        "Quando a igreja abre, Zé-do-Burro procura o padre Olavo para entrar com a cruz e cumprir o último passo da promessa.",
        "O padre pergunta onde a promessa foi feita. Ao saber que foi num terreiro de candomblé, proíbe a entrada: para ele, aquilo é culto pagão e a igreja não pode legitimá-lo.",
        "Zé não entende a recusa — para ele, Santa Bárbara e Iansã são a mesma santa. Decide então esperar na escadaria, sem sair dali, até que o deixem entrar.",
      ],
      details: [
        { label: "O argumento do padre", text: "Padre Olavo considera a promessa feita em candomblé um ato de idolatria; aceitar a cruz seria a Igreja endossar o culto africano." },
        { label: "O argumento de Zé", text: "Ele não vê contradição: fez a promessa a Santa Bárbara, e o terreiro era apenas o lugar. Sua fé é sincrética e ingênua." },
        { label: "A divisão das terras", text: "O padre também se incomoda com a doação das terras, vista como influência de ideias perigosas e não como caridade cristã." },
        { label: "A decisão de Zé", text: "Ele não desiste nem vai embora: senta-se na escadaria com a cruz. É essa teimosia que transforma um caso religioso em caso público." },
        { label: "Minha Tia", text: "A baiana do acarajé, filha de santo, se solidariza com Zé — ela entende o sincretismo que o padre nega." },
      ],
      interpretation: [
        { question: "O padre Olavo age por maldade ou por convicção? O que muda na leitura da peça em cada caso?", hint: "Repare que ele não busca vantagem pessoal — ele defende uma doutrina. Isso o torna menos ou mais perigoso?" },
        { question: "Por que Zé-do-Burro não consegue compreender a recusa?", hint: "Compare o modo como ele vê Santa Bárbara com o modo como a Igreja institucional a vê." },
      ],
      questions: [
        {
          id: "p2q1", partId: 2, level: "facil", category: "historia",
          text: "Por que o padre Olavo proíbe a entrada da cruz na igreja?",
          options: [
            "Porque a cruz é grande demais para a porta",
            "Porque a promessa foi feita em um terreiro de candomblé",
            "Porque Zé-do-Burro não é batizado",
            "Porque a igreja estava em obras",
          ],
          answer: 1,
          explanation: "Para o padre, a promessa feita em rito afro-brasileiro é idolatria; aceitá-la seria a Igreja legitimar o candomblé.",
        },
        {
          id: "p2q2", partId: 2, level: "dificil", category: "interpretacao",
          text: "O que o conflito entre Zé e o padre representa na peça?",
          options: [
            "A disputa entre duas famílias da Bahia",
            "O choque entre a fé popular sincrética e a rigidez da instituição religiosa",
            "A briga por terras no sertão",
            "Uma crítica ao analfabetismo",
          ],
          answer: 1,
          explanation: "O núcleo do drama é o choque entre a religiosidade popular sincrética e a doutrina institucional.",
        },
        {
          id: "p2q3", partId: 2, level: "professor", category: "detalhes",
          text: "Além do candomblé, que outro elemento da promessa incomoda a Igreja?",
          options: [
            "O fato de Zé ter vindo a pé",
            "A doação das terras de Zé aos pobres, vista com desconfiança política",
            "O nome do burro Nicolau",
            "O tamanho da cruz",
          ],
          answer: 1,
          explanation: "A partilha das terras é lida como gesto suspeito, não como caridade — semente da futura acusação política.",
        },
        {
          id: "p2q4", partId: 2, level: "medio", category: "personagens",
          text: "Qual personagem da praça se solidariza com Zé por compreender o sincretismo religioso?",
          options: ["Bonitão", "Minha Tia, a baiana do acarajé", "O Galego", "O Repórter"],
          answer: 1,
          explanation: "Minha Tia é filha de santo e vê naturalmente a ligação entre Santa Bárbara e Iansã.",
        },
        {
          id: "p2q5", partId: 2, level: "medio", category: "historia",
          text: "Qual é a reação de Zé-do-Burro diante da recusa?",
          options: [
            "Volta imediatamente para Santana do Agreste",
            "Invade a igreja à força",
            "Senta-se na escadaria com a cruz e decide esperar",
            "Queima a cruz na praça",
          ],
          answer: 2,
          explanation: "Ele fica na escadaria com a cruz — a espera teimosa é o que transforma o caso particular em caso público.",
        },
      ],
    },
    {
      id: 3,
      act: "Ato II",
      title: "A praça toma conta do caso",
      subtitle: "Cordel, capoeira e o cheiro de notícia",
      summary: [
        "A permanência de Zé na escadaria vira atração. A praça se enche: capoeiristas, vendedores, curiosos e frequentadores do bar do Galego.",
        "Dedé Cospe-Rima transforma o caso em cordel e passa a vender seus versos; o Galego lucra com o movimento no bar.",
        "Enquanto isso, Bonitão se aproxima cada vez mais de Rosa, alimentando nela o desejo de ficar na cidade.",
      ],
      details: [
        { label: "Dedé Cospe-Rima", text: "Poeta popular que improvisa versos sobre o 'pagador de promessas' e os vende ali mesmo — a história de Zé vira mercadoria antes mesmo de virar notícia." },
        { label: "O Galego", text: "Dono do bar; mede o caso pelo aumento das vendas. Representa o oportunismo comercial." },
        { label: "Bonitão e Rosa", text: "Bonitão explora a insatisfação de Rosa: promete-lhe a cidade, o conforto e a liberdade que o marido não dá." },
        { label: "A cruz como espetáculo", text: "Ninguém na praça compartilha exatamente da fé de Zé; cada um enxerga na cruz uma oportunidade própria." },
        { label: "Os capoeiristas", text: "Guru, Coca e os demais aderem à causa por identificação com o povo da praça e com o candomblé, não por devoção católica." },
      ],
      interpretation: [
        { question: "O que significa a história de Zé virar cordel antes de virar notícia de jornal?", hint: "Compare quem conta a história: o povo ou a imprensa? Cada um conta para quê?" },
        { question: "Rosa é vítima ou traidora? Sustente sua leitura com o que ela diz sobre a vida no Agreste.", hint: "Antes de julgar o gesto, observe as escolhas reais que ela tinha." },
      ],
      questions: [
        {
          id: "p3q1", partId: 3, level: "medio", category: "personagens",
          text: "Quem transforma a história de Zé-do-Burro em versos populares?",
          options: ["O Repórter", "Dedé Cospe-Rima", "O Monsenhor", "Guru"],
          answer: 1,
          explanation: "Dedé Cospe-Rima é o poeta de cordel que improvisa e vende versos sobre o caso.",
        },
        {
          id: "p3q2", partId: 3, level: "professor", category: "detalhes",
          text: "Como o Galego, dono do bar, reage à aglomeração provocada por Zé?",
          options: [
            "Expulsa os curiosos da praça",
            "Aproveita o movimento para aumentar suas vendas",
            "Fecha o bar em protesto",
            "Oferece abrigo a Zé-do-Burro",
          ],
          answer: 1,
          explanation: "O Galego enxerga lucro: quanto mais gente na praça, melhor para o bar.",
        },
        {
          id: "p3q3", partId: 3, level: "dificil", category: "interpretacao",
          text: "O que o comportamento das figuras da praça revela sobre a sociedade retratada por Dias Gomes?",
          options: [
            "Que o povo é unido pela fé católica",
            "Que cada um transforma a fé alheia em oportunidade própria — lucro, fama ou desejo",
            "Que a religião não tem importância na Bahia",
            "Que a cidade é indiferente ao que acontece",
          ],
          answer: 1,
          explanation: "Ninguém acompanha Zé por fé: cordel, bar, imprensa e sedução exploram sua sinceridade.",
        },
        {
          id: "p3q4", partId: 3, level: "medio", category: "historia",
          text: "Que argumento Bonitão usa para se aproximar de Rosa?",
          options: [
            "Que ele pode convencer o padre a abrir a igreja",
            "Que a vida na cidade lhe daria o conforto e a liberdade que o marido não oferece",
            "Que Zé-do-Burro está doente",
            "Que ele conhece o Monsenhor",
          ],
          answer: 1,
          explanation: "Bonitão explora exatamente a insatisfação dela com a vida no Agreste.",
        },
      ],
    },
    {
      id: 4,
      act: "Ato II",
      title: "A imprensa entra em cena",
      subtitle: "A verdade distorcida",
      summary: [
        "O Repórter chega à praça e entrevista Zé-do-Burro. Não lhe interessa a fé do homem, mas o que rende manchete.",
        "A história é publicada distorcida: a divisão das terras vira 'reforma agrária', e Zé é apresentado como agitador ligado a ideias subversivas.",
        "A partir daí, o caso deixa de ser religioso e passa a ser político. A polícia começa a observar a praça.",
      ],
      details: [
        { label: "A entrevista", text: "Zé responde com sinceridade absoluta; o Repórter seleciona apenas o que serve à manchete." },
        { label: "A distorção", text: "A doação das terras é apresentada como bandeira política, transformando o camponês devoto em suposto líder revolucionário." },
        { label: "Zé não entende o jornal", text: "Ele não reconhece a própria história no que é publicado — sequer domina o vocabulário que lhe atribuem." },
        { label: "Mudança de conflito", text: "A partir daqui, além da Igreja, Zé passa a ter contra si a imprensa, a polícia e o poder político." },
        { label: "Rosa se afasta", text: "Em meio ao tumulto, Rosa cede a Bonitão — a traição acontece enquanto o marido resiste na escadaria." },
      ],
      interpretation: [
        { question: "Por que a imprensa é apresentada como uma força tão perigosa quanto a intolerância religiosa?", hint: "Repare no que basta para condenar Zé: um fato, ou a versão de um fato?" },
        { question: "Qual é o efeito dramático de Zé não compreender as palavras usadas para acusá-lo?", hint: "Quem não entende a acusação pode se defender dela?" },
      ],
      questions: [
        {
          id: "p4q1", partId: 4, level: "medio", category: "historia",
          text: "Como a imprensa apresenta a doação das terras de Zé-do-Burro?",
          options: [
            "Como um gesto de caridade cristã",
            "Como uma bandeira política ligada à reforma agrária e a ideias subversivas",
            "Como uma fraude para não pagar impostos",
            "Como uma herança de família",
          ],
          answer: 1,
          explanation: "O Repórter transforma a caridade em bandeira política, o que politiza e criminaliza o caso.",
        },
        {
          id: "p4q2", partId: 4, level: "dificil", category: "interpretacao",
          text: "O que a atuação do Repórter denuncia na peça?",
          options: [
            "A falta de jornais na Bahia",
            "A manipulação da informação, que constrói uma verdade conveniente e não a real",
            "A ineficiência da polícia",
            "O desinteresse do público por notícias",
          ],
          answer: 1,
          explanation: "Dias Gomes denuncia a imprensa que fabrica versões para vender, ignorando o sujeito real.",
        },
        {
          id: "p4q3", partId: 4, level: "professor", category: "detalhes",
          text: "Qual é a consequência imediata da publicação da matéria?",
          options: [
            "O padre libera a entrada da cruz",
            "O caso deixa de ser religioso e vira caso político, atraindo a atenção da polícia",
            "Zé-do-Burro é convidado a falar na rádio da igreja",
            "Rosa volta para Santana do Agreste",
          ],
          answer: 1,
          explanation: "Com a distorção, entra em cena o poder repressivo: a polícia passa a tratar Zé como problema de ordem pública.",
        },
        {
          id: "p4q4", partId: 4, level: "medio", category: "personagens",
          text: "O que acontece com Rosa enquanto Zé resiste na escadaria?",
          options: [
            "Ela procura o Monsenhor para interceder",
            "Ela cede a Bonitão",
            "Ela adoece e é levada para casa",
            "Ela passa a vender cordéis com Dedé",
          ],
          answer: 1,
          explanation: "A traição acontece em paralelo à resistência do marido — o abandono é também afetivo.",
        },
      ],
    },
    {
      id: 5,
      act: "Ato III",
      title: "Cerco: Igreja, polícia e povo",
      subtitle: "Todos querem a cruz, ninguém quer Zé",
      summary: [
        "O Monsenhor tenta administrar o escândalo; a solução oferecida à Igreja é conter o caso sem ceder à promessa.",
        "A polícia chega para retirar Zé da escadaria. Ele resiste pacificamente: não sai sem cumprir a promessa.",
        "O povo da praça — capoeiristas, baianas, curiosos — se agrupa em torno dele. Zé se torna, sem querer, símbolo de uma causa que não é exatamente a dele.",
      ],
      details: [
        { label: "O Monsenhor", text: "Preocupa-se sobretudo com a repercussão pública; sua lógica é institucional, não espiritual." },
        { label: "O Delegado", text: "Trata Zé como caso de ordem pública, não de fé. A recusa religiosa vira desobediência à autoridade." },
        { label: "A resistência de Zé", text: "Ele não ataca ninguém: apenas se recusa a sair sem entrar na igreja com a cruz." },
        { label: "A apropriação da causa", text: "Cada grupo dá um sentido próprio à sua permanência: religioso, político, popular, jornalístico." },
        { label: "Ofertas de saída", text: "Propõem a Zé soluções que o fariam desistir do essencial — entrar com a cruz —, e ele recusa todas." },
      ],
      interpretation: [
        { question: "Em que momento Zé-do-Burro deixa de ser um homem e passa a ser um símbolo? Ele percebe isso?", hint: "Compare o que ele pede com o que os outros dizem que ele representa." },
        { question: "Por que quase todos os personagens oferecem a Zé uma 'saída', mas nenhum aceita a solução que ele pede?", hint: "A saída de quem? Resolve o problema dele ou o problema dos outros?" },
      ],
      questions: [
        {
          id: "p5q1", partId: 5, level: "medio", category: "personagens",
          text: "Qual é a principal preocupação do Monsenhor diante do caso?",
          options: [
            "A salvação espiritual de Zé-do-Burro",
            "A repercussão pública e a imagem da Igreja",
            "A saúde do burro Nicolau",
            "A situação financeira da paróquia",
          ],
          answer: 1,
          explanation: "O Monsenhor raciocina institucionalmente: o problema é o escândalo, não a fé de Zé.",
        },
        {
          id: "p5q2", partId: 5, level: "professor", category: "detalhes",
          text: "Como Zé-do-Burro reage à chegada da polícia?",
          options: [
            "Foge com a cruz pela praça",
            "Resiste pacificamente, recusando-se a sair sem cumprir a promessa",
            "Ataca os policiais com a ajuda dos capoeiristas",
            "Entrega a cruz e vai embora",
          ],
          answer: 1,
          explanation: "Sua resistência é passiva e obstinada: ele não agride, apenas não sai.",
        },
        {
          id: "p5q3", partId: 5, level: "dificil", category: "interpretacao",
          text: "O que significa o fato de vários grupos aderirem a Zé por motivos diferentes dos dele?",
          options: [
            "Que ele finalmente foi compreendido",
            "Que sua causa individual é apropriada por interesses coletivos alheios à sua fé",
            "Que a promessa perdeu o valor religioso para ele mesmo",
            "Que o povo se converteu ao catolicismo",
          ],
          answer: 1,
          explanation: "Zé vira bandeira de causas que não são a sua — a solidão do protagonista aumenta à medida que a multidão cresce.",
        },
        {
          id: "p5q4", partId: 5, level: "facil", category: "historia",
          text: "Que instituição passa a tratar o caso como problema de ordem pública?",
          options: ["A prefeitura", "A polícia", "A escola", "O sindicato rural"],
          answer: 1,
          explanation: "O Delegado e a polícia assumem o caso como desobediência à autoridade.",
        },
      ],
    },
    {
      id: 6,
      act: "Ato III",
      title: "O desfecho: a entrada na igreja",
      subtitle: "Morto, ele entra — vivo, não podia",
      summary: [
        "No confronto final diante da igreja, Zé-do-Burro é morto — atingido durante a ação policial na praça.",
        "O povo então coloca seu corpo sobre a cruz que ele carregou por sete léguas e o carrega para dentro da igreja, à força.",
        "A promessa se cumpre exatamente como ele quis: a cruz entra na igreja. Mas ele entra morto — e não pelas mãos da instituição que lhe negou a porta.",
      ],
      details: [
        { label: "A morte", text: "Zé morre em decorrência do confronto na praça, sem jamais ter agredido ninguém." },
        { label: "O corpo sobre a cruz", text: "O povo o deita sobre a própria cruz e a carrega — a imagem final aproxima Zé de Cristo." },
        { label: "A porta arrombada", text: "A entrada acontece pela força popular, contra a vontade do padre: a Igreja não cede, é vencida." },
        { label: "Ironia trágica", text: "A promessa é cumprida ao preço da vida do promitente. A vitória é, ao mesmo tempo, derrota." },
        { label: "Rosa no fim", text: "A perda é total: Zé perde a esposa, as terras e a vida; conserva apenas a fidelidade à palavra dada." },
      ],
      interpretation: [
        { question: "A morte de Zé-do-Burro é vitória ou derrota? Defenda sua leitura.", hint: "A promessa se cumpriu — mas quem a cumpriu, no fim: ele ou o povo?" },
        { question: "Por que Dias Gomes constrói o desfecho com uma imagem tão explicitamente cristológica?", hint: "Quem nega a entrada e quem carrega a cruz? Pense na ironia dessa inversão." },
      ],
      questions: [
        {
          id: "p6q1", partId: 6, level: "facil", category: "historia",
          text: "Como termina a peça?",
          options: [
            "Zé desiste e volta para Santana do Agreste",
            "Zé é morto e o povo carrega seu corpo sobre a cruz para dentro da igreja",
            "O padre Olavo se arrepende e abre as portas",
            "Zé se converte ao candomblé e abandona a promessa",
          ],
          answer: 1,
          explanation: "Ele morre no confronto e é levado para dentro da igreja sobre a própria cruz, pela força popular.",
        },
        {
          id: "p6q2", partId: 6, level: "dificil", category: "interpretacao",
          text: "Qual é a principal ironia trágica do desfecho?",
          options: [
            "Zé entra na igreja, mas morto — e contra a vontade da instituição que lhe negou a porta",
            "O padre morre antes de Zé",
            "Rosa volta arrependida no último instante",
            "A cruz é destruída antes da entrada",
          ],
          answer: 0,
          explanation: "A promessa se cumpre ao preço da vida: a vitória é indissociável da derrota.",
        },
        {
          id: "p6q3", partId: 6, level: "professor", category: "detalhes",
          text: "Quem, de fato, leva a cruz para dentro da igreja no final?",
          options: ["O padre Olavo", "O povo da praça", "A polícia", "O Monsenhor e o Repórter"],
          answer: 1,
          explanation: "É o povo — capoeiristas, baianas, curiosos — que arromba a resistência e carrega o corpo sobre a cruz.",
        },
        {
          id: "p6q4", partId: 6, level: "medio", category: "personagens",
          text: "O que Zé-do-Burro perde ao longo da peça?",
          options: [
            "Apenas suas terras",
            "As terras, a esposa e a própria vida",
            "Apenas o burro Nicolau",
            "Somente a fé",
          ],
          answer: 1,
          explanation: "Ele perde tudo, menos a fidelidade à palavra dada — o que sustenta sua dimensão trágica.",
        },
        {
          id: "p6q5", partId: 6, level: "dificil", category: "interpretacao",
          text: "A aproximação entre Zé-do-Burro e Cristo na cena final serve para:",
          options: [
            "Sugerir que Zé era um santo desde o início",
            "Denunciar a instituição que, em nome de Cristo, negou a porta a um homem que repetia seu gesto",
            "Indicar que a peça é uma adaptação dos Evangelhos",
            "Mostrar que a fé popular é ingênua e inútil",
          ],
          answer: 1,
          explanation: "A imagem cristológica é acusatória: a Igreja recusa exatamente aquilo que diz representar.",
        },
      ],
    },
  ],
};

export const nacionalWorks: NacionalWork[] = [pagadorDePromessas];

export const getWork = (id: string) => nacionalWorks.find((w) => w.id === id);

export const allQuestions = (work: NacionalWork): NacionalQuestion[] =>
  work.parts.flatMap((p) => p.questions);

export const levelMeta: Record<QuestionLevel, { label: string; emoji: string; className: string }> = {
  facil: { label: "Fácil — compreensão", emoji: "🟢", className: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
  medio: { label: "Médio — detalhes", emoji: "🟡", className: "text-accent border-accent/30 bg-accent/10" },
  dificil: { label: "Difícil — interpretação", emoji: "🔴", className: "text-red-400 border-red-400/30 bg-red-400/10" },
  professor: { label: "Professor — específica", emoji: "⚡", className: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
};

export const categoryMeta: Record<QuestionCategory, { label: string; emoji: string }> = {
  historia: { label: "História", emoji: "📖" },
  personagens: { label: "Personagens", emoji: "🎭" },
  detalhes: { label: "Detalhes", emoji: "🔎" },
  interpretacao: { label: "Interpretação", emoji: "🧠" },
};
