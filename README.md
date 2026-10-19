# Alexa Placement Coach

A simulated Alexa+ experience that helps CS students prepare for placements. Talk or type to your coach to log practice, get a study plan, take quizzes, and review your week.

Built solo for the Amazon Developer Hackathon (Alexa+ track, simulated experience).

## Quick start for judges

No accounts, API keys, or paid services are needed.

**Requirements:** [Node.js](https://nodejs.org) (current LTS) and Chrome or Edge (voice input uses the browser's Web Speech API; typing works in any browser).

```
git clone https://github.com/afsheenadka-arch/alexa-placement-coach.git
cd alexa-placement-coach
npm install
npm start
```

Open http://localhost:3000.

**A 60-second tour**
1. Tap **I solved 3 arrays problems**. The chat shows the MCP tool call (`log_progress`).
2. Tap **What should I study tonight?** for a plan card based on your least-practiced topic.
3. Tap the **Quiz me on...** button, answer the question cards, and see the graded result.
4. Tap **How did I do this week?** for the weekly summary card.
5. Open **MCP activity** at the bottom to see each tool call's request and response.

The week card starts empty on a fresh install. Log a few problems to fill it, and your progress is saved in a local `data.json` file that the app creates automatically.

**Inspect the MCP server directly**

With the app running, start the MCP Inspector and connect to `http://localhost:3000/mcp` using the **Streamable HTTP** transport:

```
npx @modelcontextprotocol/inspector
```

Tools: `log_progress`, `get_study_plan`, `get_weekly_summary`, `start_quiz`, `grade_quiz`.
## Features

- **Log progress:** "I solved 3 arrays problems"
- **Daily plan:** "What should I study tonight?" picks your least-practiced topic
- **Quizzes:** "Quiz me on arrays" (also strings, sorting, linked lists, trees, graphs, dp), answered with A, B, or C
- **Weekly summary:** "How did I do this week?"
- **Voice:** speak commands with the Mic button and hear replies (Chrome or Edge)

## MCP layer

The coach's abilities are exposed as MCP tools over Streamable HTTP at `POST /mcp`: `log_progress`, `get_study_plan`, `get_weekly_summary`, `start_quiz`, `grade_quiz`. The web page is a simulated Alexa+ front end that calls these tools, and it shows each tool call in the chat. Any MCP client (for example the MCP Inspector) can connect to `http://localhost:3000/mcp`.
The MCP server is built with the official TypeScript SDK (v1.x), which implements MCP protocol version 2025-11-25, over Streamable HTTP.

## Tech

- Frontend: HTML, CSS, JavaScript, Web Speech API
- Backend: Node.js and Express
- Storage: a local `data.json` file (created automatically, not committed)

No API keys or paid services are needed.

## License

MIT
