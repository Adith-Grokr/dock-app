# Desktop Agents

A macOS desktop overlay built with **Electron + React** that places animated AI agent characters directly on your screen. Agents walk across the bottom of your display, can be assigned tasks, chatted with, and fully customized — including AI-generated personas powered by Claude or Gemini.

![Desktop Agents](public/favicon.svg)

---

## What it does

- **Transparent overlay** — sits on top of all windows, passes mouse clicks through to whatever is underneath
- **Animated characters** — three distinct agent types (Architect, Pilot, Cyclist) with hand-crafted SVG artwork and smooth CSS keyframe animations
- **macOS menu bar tray** — live status of every agent, quick controls, and an "Add Agent…" entry that opens the creator form
- **AI-powered agent creator** — fill in name, profession, description, skills, tools, MCP servers, and project directory; Claude or Gemini generates a matching character type, personality, tone, and opening greeting
- **Per-agent panel** — three tabs: Overview (skills, tools, MCPs, project), Task (assign / track progress / complete), and Chat (Gemini-powered conversation in the agent's persona)
- **Group Task mode** — agents collide and "confer" when their paths cross

---

## Tech stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron 41 |
| UI framework | React 19 + Vite 8 |
| Styling | Tailwind CSS 3 |
| Icons | lucide-react |
| AI (agent chat) | Gemini 2.5 Flash (optional) |
| AI (character gen) | Claude Haiku or Gemini 2.0 Flash (optional) |

---

## Project structure

```
dock-app/
├── electron/
│   ├── main.cjs          # Main process: window, tray, IPC handlers
│   └── preload.cjs       # Context bridge — exposes window.electron to React
├── src/
│   ├── lib/
│   │   ├── constants.js  # Agent names, skills, status config, CSS animations
│   │   ├── agents.js     # makeAgent() factory — single source of agent shape
│   │   └── ai.js         # Claude & Gemini API calls + offline fallback
│   ├── components/
│   │   ├── characters/
│   │   │   ├── ArchitectSvg.jsx
│   │   │   ├── PilotSvg.jsx
│   │   │   └── CyclistSvg.jsx
│   │   ├── AgentPanel.jsx        # Per-agent floating panel (Overview/Task/Chat)
│   │   └── AgentCreatorModal.jsx # "Add Agent" form with AI generation
│   ├── App.jsx           # Root: animation loop, state, IPC listeners
│   └── main.jsx          # React entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Prerequisites

- **Node.js** 18 or later — [nodejs.org](https://nodejs.org)
- **npm** 9 or later (comes with Node)
- **macOS** (the transparent overlay and tray features are macOS-specific)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Adith-Grokr/dock-app.git
cd dock-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run start
```

This starts the Vite dev server on `http://localhost:5173` and launches Electron once the server is ready. You should see the agent character appear at the bottom of your screen and a stick-figure icon in your macOS menu bar.

---

## Optional: enable AI features

### Agent chat (Gemini)

Open `src/App.jsx` and set your Gemini API key on line 12:

```js
const apiKey = 'YOUR_GEMINI_API_KEY';
```

Get a free key at [aistudio.google.com](https://aistudio.google.com).

### AI character generation (Claude or Gemini)

No code change needed — just select **Claude** or **Gemini** in the "Add Agent…" form and paste your API key directly into the form. The key is used only for that request and is never stored.

- **Claude** key: [console.anthropic.com](https://console.anthropic.com)
- **Gemini** key: [aistudio.google.com](https://aistudio.google.com)

If you leave the model set to **Smart Default**, character generation works offline using keyword matching — no key required.

---

## Usage

### Adding an agent

**From the menu bar:**
1. Click the stick-figure icon in your macOS menu bar
2. Select **✦ Add Agent…** to open the full creator form, or
3. Use **Quick Add** for an instant Architect / Pilot / Cyclist

**From the on-screen control bar** (visible when running in development / browser):
- Click the **Agent** button to open the creator form

### Using the creator form

| Field | Description |
|---|---|
| Name | Display name (auto-assigned if left blank) |
| Profession / Role | e.g. "Backend Engineer", "DevOps Lead" |
| Description | What this agent is responsible for |
| Skills | Press **Enter** or **,** to add tags |
| Tools | e.g. `git`, `docker`, `bash`, `kubectl` |
| MCP Servers | e.g. `filesystem`, `github`, `slack` |
| Project / Directory | Absolute path to the project this agent owns |
| AI Model | Claude / Gemini / Smart Default |
| API Key | Required only when Claude or Gemini is selected |

Click **Preview Character** to see the AI-generated persona, then **Spawn Agent** to place them on screen.

### Interacting with an agent

- **Click** an agent to open their panel
- **Overview tab** — see all agent details, skills, tools, MCPs, project
- **Task tab** — assign a task with title, description, and skills; drag the progress slider; mark done or failed
- **Chat tab** — have a conversation; the agent replies in character

### Group Task mode

Toggle the **Group Task** button (people icon) in the control bar. When active, agents that walk near each other will pause and show a typing bubble — simulating a team discussion.

---

## Available scripts

| Command | Description |
|---|---|
| `npm run start` | Start Vite + Electron concurrently (development) |
| `npm run dev` | Start Vite dev server only (browser preview) |
| `npm run build` | Build the React app for production |
| `npm run lint` | Run ESLint |

---

## License

MIT
