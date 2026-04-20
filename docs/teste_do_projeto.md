# Testando o Projeto (Syntax Blaster)

Este guia prático foi criado para te ajudar a rodar, testar e publicar o projeto no seu Digital Ocean.

## 1. Como rodar o projeto localmente para testes
Como o projeto utiliza puramente **HTML Vanilla, CSS e JavaScript**, você não precisa instalar o Node.js, frameworks complexos, ou compilar nada. 

Existem duas formas fáceis para você testar na sua máquina:

### Opção A: Usando uma Extensão de Live Server
Se você estiver utilizando VS Code:
1. Instale a extensão **Live Server** (por Ritwick Dey).
2. Abra a pasta `c:\repo\syntax_blaster` no seu editor.
3. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.
4. O navegador abrirá a porta padrão (ex: `http://127.0.0.1:5500`) com o jogo carregado.

### Opção B: Usando Python (Caso já possua instalado)
Abra seu terminal na pasta do projeto e rode o comando:
```bash
python -m http.server 8000
```
Em seguida, acesse no navegador: `http://localhost:8000`

## 2. Testando e Jogando
Ao abrir o navegador:
1. Veja que as palavras ("FUNCTION", "ASYNC") começarão a cair da parte superior da tela livremente.
2. No seu teclado, digite a primeira letra de uma das palavras que estão no visor. Você verá os seguintes efeitos:
   - Uma linha laser azul será conectada à palavra que foi recém-almejada.
   - O formato da palavra mudará para "Diamante".
   - Digitar cada próxima letra irá marcá-la em vermelho.
3. Se você errar alguma tecla depois de começar, sua barra de "COMBO" vai acabar.
4. Para testar a penalidade: deixe com que uma das palavras caia no precipício sem digitar todas as letras... Você verá a barra verde do **BUFFER** diminuir no painel inferior.
5. Se a barra `BUFFER_CAPACITY` acabar, o jogo ativará a tela de encerramento (`KERNEL PANIC`).

## 3. Publicando na Digital Ocean 🌊
O Digital Ocean possui uma funcionalidade chamada **App Platform**, perfeita para seu projeto estático.

1. Faça o commit e o _push_ desse código para o **GitHub** ou GitLab.
2. Vá até o painel principal do Digital Ocean e selecione **"Apps"** -> **"Create App"**.
3. Selecione seu repositório sincronizado.
4. O Digital Ocean dectectará automaticamente que o projeto foca em páginas web estáticas graças ao fato de haver um único ponto de entrada `index.html`.
5. Confirme o _deployment_. Pronto! Você receberá um link público.
