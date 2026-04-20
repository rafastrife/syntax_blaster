# Conceito de Design para Jogo de Digitação "Syntax Blaster"

**Vibe e Tema:**
O design deve ser focado no tema **"Hackeando o Kernel"** ou **"Retro-Futurismo de Terminal"**. Deve parecer que o usuário está digitando comandos dentro de uma matriz de dados ou um terminal antigo de alta tecnologia.

**Paleta de Cores:**
1. **Fundo:** Preto absoluto (`#000000`) ou azul-escuro muito profundo (`#05050a`).
2. **Cores Principais (Neon/Fluorescente):**
   * Verde Terminal Matrix (`#00FF41`)
   * Ciano Elétrico (`#00FFFF`)
   * Roxo Monokai (`#A6E22E` ou `#AE81FF` para destaques)
3. **Feedback de Erro:** Vermelho Vivo/Neon (`#FF003C`).

**Tipografia:**
* **Obrigatório:** Usar uma fonte **Monospace** de alta legibilidade (ex: `Fira Code`, `JetBrains Mono`, `Source Code Pro`). Deve evocar a sensação de código de programação.

**Elementos Visuais e Feedback:**
1. **Nave do Jogador:** Minimalista, parecida com um cursor de terminal (`_` ou `>`) ou uma representação vetorial geométrica simples.
2. **Inimigos (Naves):** Vetoriais, geométricos. O texto da palavra reservada flutua logo acima ou dentro da nave.
3. **Efeito de Texto:**
   * **Palavra Ativa (Trava de Alvo):** A cor da palavra muda para Ciano Elétrico e ganha um leve brilho.
   * **Letras Digitadas:** Desaparecem ou ficam transparentes/escuras, restando apenas o restante da palavra a ser digitada em destaque.
   * **Erro de Digitação:** A palavra inimiga dá uma leve piscada em Vermelho Neon.
4. **Tiros/Explosão:** Os tiros devem ser linhas retas, finas e rápidas. A explosão deve parecer "dados corrompidos" se espalhando (partículas).
5. **Fundo Dinâmico:** Efeito sutil no Canvas de "chuva de código Matrix" bem escuro no fundo, para não atrapalhar a legibilidade.

**Interface (HUD):**
* Canto superior esquerdo: `SCORE: 000000` (Fonte Monospace Verde)
* Canto superior direito: `WAVE: 1`
* Centro da tela (após Game Over): Grande texto em Vermelho Neon: `KERNEL PANIC - GAME OVER` com um botão "REBOOT".