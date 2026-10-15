# Alexa Placement Coach

A simulated Alexa+ experience that helps CS students prepare for placements. Talk or type to your coach to log practice, get a study plan, take quizzes, and review your week.

Built solo for the Amazon Developer Hackathon (Alexa+ track, simulated experience).

## Features

- **Log progress:** "I solved 3 arrays problems"
- **Daily plan:** "What should I study tonight?" picks your least-practiced topic
- **Quizzes:** "Quiz me on arrays" (also strings, sorting, linked lists, trees, graphs, dp), answered with A, B, or C
- **Weekly summary:** "How did I do this week?"
- **Voice:** speak commands with the Mic button and hear replies (Chrome or Edge)

## MCP layer

The coach's abilities are exposed as MCP tools over Streamable HTTP at `POST /mcp`: `log_progress`, `get_study_plan`, `get_weekly_summary`, `start_quiz`, `grade_quiz`. The web page is a simulated Alexa+ front end that calls these tools, and it shows each tool call in the chat. Any MCP client (for example the MCP Inspector) can connect to `http://localhost:3000/mcp`.

## Run it locally

Requires [Node.js](https://nodejs.org) (LTS).

```
npm install
npm start
```

Open http://localhost:3000 in Chrome or Edge.

## Tech

- Frontend: HTML, CSS, JavaScript, Web Speech API
- Backend: Node.js and Express
- Storage: a local `data.json` file (created automatically, not committed)

No API keys or paid services are needed.

## License

MIT
