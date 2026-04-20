# Syntax Blaster 🚀

> **Hack the Kernel** — A fast-paced cyberpunk typing game built with Vanilla JS (Canvas 2D) and the Web Audio API.

## How to Play

Type the falling words before they reach your ship. Each keystroke fires a laser interceptor.

| Key | Action |
|---|---|
| Any letter | Target / type the matching word |
| `SPACE` | **EMP** — destroys all words on screen (3 charges) |

## Project Structure

```
syntax_blaster/
├── index.html          # Entry point
├── css/
│   └── style.css       # Game Over overlay styles
├── src/
│   ├── game.js         # Main loop, state, input (ES module entry)
│   ├── constants.js    # Word bank & colour palette
│   ├── audio.js        # Web Audio API synthesiser
│   ├── matrix.js       # Matrix rain background
│   ├── ship.js         # Player ship drawing
│   ├── entities.js     # Words, bullets, particles, EMP wave
│   └── hud.js          # HUD rendering
└── docs/
    ├── testing.md              # Local testing & play guide
    ├── deploy_digital_ocean.md # Step-by-step Digital Ocean deployment
    └── ads_monetization.md     # Future ad integration guide
```

## Running Locally

Since the game uses ES modules, a local server is required (browsers block `file://` imports):

```bash
# Python (already installed on most machines)
python -m http.server 8000
# then open http://localhost:8000
```

Or use the **Live Server** extension in VS Code.

## Deploy

See [`docs/deploy_digital_ocean.md`](docs/deploy_digital_ocean.md) for step-by-step instructions to publish on Digital Ocean App Platform via GitHub.
