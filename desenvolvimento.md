# Software Design Document: Desenvolvimento

## Visão Geral
Este documento descreve a arquitetura e a lógica implementada no jogo "Syntax Blaster", construído primariamente em HTML5, CSS3 e JavaScript (Vanilla). 

## Tecnologias Utilizadas
- **HTML5:** Estrutura semântica para UI do jogo e telas de sobreposição (Game Over).
- **CSS3:** Efeitos visuais avançados (`box-shadow`, `text-shadow`, animações) e layout (`Flexbox`).
- **JavaScript (ES6+):** Motor do jogo via `requestAnimationFrame` sem dependências externas.
- **Nenhum Framework:** Para garantir alta performance e compatibilidade de deployment (Digital Ocean App Platform / Droplet como recurso estático).

## Arquitetura e Lógica Principal (Game Loop)
O jogo funciona em um *Classic Game Loop*:
1. **Temporizador:** Baseado em Delta Time (`dt`) medido pela diferença de `performance.now()`.
2. **Spawning:** Palavras são aleatoriamente instanciadas na parte superior (`y = -50`) e injetadas no DOM com uma velocidade randomizada e influenciada por um "SPEED MULTIPLIER".
3. **Física/Movimento:** Cada entidade é manipulada alterando sua propriedade CSS `top` repetidamente.
4. **Resolução de Colisão:** Quando a poisição vertical passa a altura da janela do navegador menos 100px (`y > window.innerHeight - 100`), considera-se "Impacto", removendo buffer e zerando o combo.

## Mecânica Mestre: State e Tipagem
Gerenciamento de Estado foca numa variável global `gameState`:
- Quando uma tecla é pressionada, busca a primeira letra que corresponde entre todas as palavras instanciadas (priorizando a palavra mais baixa, `lowestY`).
- A palavra é marcada como `activeWord`. Eventos de teclado seguintes são filtrados rigorosamente para verificar "Hit or Miss" na palavra ativa.
- **Laser Beam:** Renderizado via cálculos matemáticos de Trigonometria básica (`Math.atan2()`) entre o X/Y da base e o X/Y da entidade para rotação da pseudo-linha e tamanho (hipotenusa).

## Estrutura de Arquivos
- `/index.html`: *Entrypoint* e estrutura.
- `/style.css`: Estilização e theming central.
- `/script.js`: Lógica principal, ciclo de jogo, eventos e mecânicas.
