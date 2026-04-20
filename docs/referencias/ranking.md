# Implementação de Ranking Global (Leaderboard) via BaaS

**Contexto:**
Temos o nosso jogo de digitação "Syntax Blaster" rodando em HTML5 Canvas. Eu preciso de um sistema de Ranking (Leaderboard) **Global**, onde qualquer pessoa que acessar o site possa ver os recordes de outros jogadores.

**Tecnologia e Abordagem:**
* Como o jogo será hospedado como um site estático (Digital Ocean App Platform), não teremos um backend próprio (Node.js/Python). 
* Utilize o SDK de um **BaaS gratuito**, preferencialmente **Firebase (Firestore/Realtime Database)** ou **Supabase**.
* O banco de dados deve armazenar documentos contendo: Nome (3 letras), Score (número) e Wave (número).

**Fluxo de Funcionamento (Regras de Negócio):**
1. **Carregamento (Leitura):** Ao abrir a tela de Ranking, o jogo deve fazer uma requisição (fetch) ao BaaS, buscando apenas os **Top 10** maiores placares, ordenados de forma decrescente pelo `score`.
2. **Fim de Jogo (Game Over):** Quando o jogador perder, compare a pontuação atual com a do 10º colocado do ranking global.
3. **Input de Nome (Estilo Arcade):** Se a pontuação for suficiente para entrar no Top 10 (ou se houver menos de 10 registros no banco), exiba um modal pedindo para o jogador digitar **3 letras** para registrar seu nome (ex: `DEV`, `NEO`, `JS_`).
4. **Envio (Escrita):** Após inserir o nome, envie o novo recorde para o BaaS. Se a inserção empurrar alguém para a 11ª posição, você pode deixar o banco de dados crescer ou deletar o registro excedente para economizar espaço (defina a melhor estratégia).
5. **Atualização em Tempo Real (Opcional, mas recomendado):** Se a plataforma escolhida permitir (como os listeners do Firebase/Supabase), faça a tabela de ranking atualizar na tela assim que um novo recorde for submetido.

**Visual e UI:**
* A tela de ranking deve manter a estética "Retro-Futurismo de Terminal" (cores neon, fundo escuro, fonte Monospace).
* Exibição tabular no Canvas ou via sobreposição HTML/CSS:
  `1. NEO ..... 25000 pts (Wave 10)`
  `2. RAF ..... 18500 pts (Wave 7)`

**Tarefa:**
1. Escreva o código JavaScript necessário para conectar com o BaaS (deixe os campos de `API_KEY` ou `URL` vazios para eu preencher depois).
2. Implemente as funções de leitura (getTopScores) e escrita (submitScore).
3. Atualize o fluxo de Game Over e a interface (HTML/CSS) para lidar com esse ranking global.
4. Me dê um passo a passo em texto de como eu crio o projeto lá no painel do Firebase/Supabase para gerar essas chaves e configurar as regras de segurança básicas de leitura/escrita pública.