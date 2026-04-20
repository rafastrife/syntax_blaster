# Adição de Anúncios (Ads) Futuramente

Este documento descreve as etapas e as abordagens recomendadas para monetizar o "Syntax Blaster" usando serviços de publicidade, partindo do princípio que ele está hospedado como um site estático.

## 1. Escolhendo a Rede de Displays
Sendo um jogo feito em HTML5 e JS, você pode optar por algumas das principais plataformas:
- **Google AdSense:** Bom para banners ao redor do jogo ou na tela de menu (Game Over). É a entrada mais fácil.
- **Poki / CrazyGames / GameDistribution:** Ótimas redes especializadas em Monetização para Jogos Web HTML5. Elas frequentemente pagam mais alto porém exigem integração da SDK própria para exibir as *Interstitial Ads* (Anúncios durante transições como Game Over) ou *Rewarded Ads*.

## 2. Abordagem com Google AdSense (Mais Simples)

### Passo a Passo:
1. Cadastre seu domínio no **Google AdSense**. O Digital Ocean te dará um com extensão `.onrender` ou você pode conectar o seu (`meujogo.com`).
2. O Google te dará uma tag `<script>` de aprovação do site.
3. Insira ela dentro da tag `<head>` no seu arquivo `index.html`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
4. O Google analisará o seu endereço. Uma vez aprovado, basta não usar anúncios cobrindo ativamente a tela (Google proíbe banners cobrindo a jogabilidade).

### Dica de Design In-Game para AdSense:
Em `index.html`, crie um espaço fora da div `#game-container` ou ative um "Auto Ads". Recomenda-se um container flexível do lado de fora (ex: margens laterais do navegador) focando os Ads fora da área escura do jogo, ou apenas dentro da tela `#game-over-screen`.

## 3. Integração com SDKs Especializadas em Jogos (Ex: GameDistribution)

Se for hospedar o jogo num grande portal e usar a API deles. Você deverá pausar a lógica do seu game para mostrar vídeo do patrocinador.

### No arquivo `script.js` (Ao perder):
1. Importe a SDK fornecida pela plataforma de Ads (normalmente via `<script>` no final do seu `body`).
2. Vá até a linha onde você gerencia o evento de "Game Over": 
   ```javascript
   function triggerGameOver() {
       gameState.isRunning = false;
       // -> CHAME A API DE ANÚNCIO AQUI <-
       // Exemplo: se usar GameDistribution:
       if (typeof gdsdk !== 'undefined' && gdsdk.showAd) {
           gdsdk.showAd();
       }
       // Continua pro KERNEL PANIC...
   }
   ```
3. O Vídeo interromperá e depois o jogador poderá clicar em `RESTART SYSTEM`.

## Boas Práticas
- **Evite poluir visualmente:** O design Cyberpunk limpo e escuro é o charme desse jogo. Se inserir banners, faça de forma a não estragar a iluminação sombria.
- **Não inclua anúncios durante o jogo (`gameState.isRunning == true`):** Como o jogo exige ritmo e digitação agressiva, um ad abrindo no meio destruirá o Buffer e o usuário vai se frustrar e sair. Sempre deixe os ads para a **Tela de Fim de Jogo**.
