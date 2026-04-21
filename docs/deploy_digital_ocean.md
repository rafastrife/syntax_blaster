# Guia de Deploy — Digital Ocean App Platform via GitHub

Este guia descreve o processo completo para publicar o **Syntax Blaster** no Digital Ocean usando o **App Platform** conectado diretamente ao seu repositório GitHub.

---

## Pré-requisitos

- [ ] Conta no GitHub com o repositório `syntax_blaster` criado e com o código enviado
- [ ] Conta no [Digital Ocean](https://cloud.digitalocean.com/)
- [ ] Git instalado localmente

---

## Passo 1 — Enviar o código para o GitHub

Se ainda não fez isso, na pasta do projeto:

```bash
git init
git add .
git commit -m "feat: initial release - Syntax Blaster"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/syntax_blaster.git
git push -u origin main
```

> ⚠️ Substitua `SEU_USUARIO` pelo seu usuário real do GitHub.

---

## Passo 2 — Criar um App no Digital Ocean

1. Faça login em [cloud.digitalocean.com](https://cloud.digitalocean.com/)
2. No menu lateral, clique em **Apps**
3. Clique em **Create App**

---

## Passo 3 — Conectar ao GitHub

1. Em "Source", selecione **GitHub**
2. Clique em **Connect to GitHub** e autorize o Digital Ocean a acessar sua conta
3. Selecione o repositório `syntax_blaster`
4. Branch: **main**
5. Marque a opção **"Autodeploy"** — toda vez que você der `git push`, o site será atualizado automaticamente

---

## Passo 4 — Configurar o tipo do serviço

Quando o Digital Ocean detectar seu projeto:

1. Ele vai perguntar o tipo — selecione **Static Site**
2. Em **Output Directory**, deixe em branco (a raiz `/` é o correto, pois o `index.html` está na raiz)
3. No painel do Digital Ocean, haverá um **campo de texto** literalmente chamado **"Build Command"**. É lá que você deve copiar e COLA a seguinte linha. (AVISO: Não execute isso no seu terminal do Windows/VSCode, isso é para ser colado no site deles!):
   ```bash
   echo "export const SUPABASE_URL = '${SUPABASE_URL}';" > src/config.js && echo "export const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';" >> src/config.js
   ```

> [!IMPORTANT]
> Certifique-se de que o tipo está em **Static Site** e NÃO em "Web Service". Static Site é grátis no App Platform para sites simples.

---

## Passo 5 — Configurando as Variáveis de Ambiente (Segurança)

Nas configurações do seu App (ou na mesma tela de criação em 'Environment Variables'), adicione as duas chaves que você copiou do Supabase:

- Key: `SUPABASE_URL`   | Value: `[SUA_URL_SUPABASE]`
- Key: `SUPABASE_ANON_KEY` | Value: `[SUA_CHAVE_GIGANTE_JWT]`

> **O Pulo do Gato:** Como o arquivo `src/config.js` está no seu `.gitignore`, ela vai ignorar a sua máquina e não enviará pro GitHub, protegendo você de robôs raspadores de chaves! Mas, graças àqueles comandos que inserimos em *Build Command*, o Digital Ocean vai plugar as chaves e fabricar esse arquivo em tempo real no servidor deles na hora de publicar. Mágica hacker!

---

## Passo 5 — Configurações adicionais (opcional mas recomendado)

### Domínio personalizado

Após criar o App, vá em **Settings → Domains** e adicione seu domínio (ex: `syntaxblaster.com`). O Digital Ocean vai guiar você para apontar o DNS.

### HTTP Headers para ES Modules

O jogo usa `<script type="module">`. Servidores modernos servem com os headers corretos por padrão. O Digital Ocean App Platform já lida com isso automaticamente.

---

## Passo 6 — Deploy!

1. Clique em **"Create Resources"**
2. O build vai iniciar (geralmente leva menos de 1 minuto para um site estático)
3. Você receberá uma URL pública no formato: `https://syntax-blaster-xxxxx.ondigitalocean.app`

---

## Atualizações Futuras

Para publicar atualizações:

```bash
git add .
git commit -m "feat: nova feature"
git push origin main
```

O Digital Ocean detectará automaticamente o push e fará o re-deploy em segundos.

---

## Estrutura de Custos (referência — Apr/2026)

| Recurso | Custo |
|---|---|
| Static Site no App Platform | **Grátis** (até 3 apps estáticos) |
| Domínio customizado do Digital Ocean | ~$15/ano |
| Domínio no Registro.br / GoDaddy + apontar DNS | Varia |

> [!TIP]
> O plano mais simples do App Platform para sites estáticos é **gratuito**. Você só paga se precisar de backend (workers, databases, etc.).
