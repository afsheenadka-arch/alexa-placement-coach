// MCP layer for Alexa Placement Coach.
// Exposes the coach's logic as MCP tools over Streamable HTTP at POST /mcp.
// Stateless: every request is a complete JSON-RPC call, so no session handling is needed.
const { z } = require("zod");

module.exports = function mountMcp(app, core) {
  const text = (t) => ({ content: [{ type: "text", text: t }] });

  async function buildServer() {
    // The SDK is loaded with dynamic import() so this file works in a CommonJS project.
    const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
    const server = new McpServer({ name: "alexa-placement-coach", version: "1.0.0" });

    server.registerTool(
      "log_progress",
      {
        description: "Log solved practice problems for a topic (arrays, strings, sorting, linked lists, trees, graphs, dp).",
        inputSchema: { topic: z.string(), count: z.number().int().min(1).max(50) },
      },
      async ({ topic, count }) => text(core.addLog(topic.toLowerCase(), count))
    );

    server.registerTool(
      "get_study_plan",
      { description: "Suggest what to study tonight, based on the least-practiced topic.", inputSchema: {} },
      async () => text(core.plan())
    );

    server.registerTool(
      "get_weekly_summary",
      { description: "Summarize problems solved in the last 7 days.", inputSchema: {} },
      async () => text(core.summary())
    );

    server.registerTool(
      "start_quiz",
      {
        description: "Get a short multiple-choice quiz on a topic. Answers are not included.",
        inputSchema: { topic: z.string() },
      },
      async ({ topic }) => {
        const qs = core.QUIZ[topic.toLowerCase()];
        if (!qs) return text(`No quiz for "${topic}". Available: ${Object.keys(core.QUIZ).join(", ")}.`);
        return text(qs.map((q, i) => `Q${i + 1}: ${q[0]}\nA) ${q[1][0]}\nB) ${q[1][1]}\nC) ${q[1][2]}`).join("\n\n"));
      }
    );

    server.registerTool(
      "grade_quiz",
      {
        description: "Grade a quiz. Pass the topic and one letter (a, b or c) per question, in order.",
        inputSchema: { topic: z.string(), answers: z.array(z.string()) },
      },
      async ({ topic, answers }) => {
        const qs = core.QUIZ[topic.toLowerCase()];
        if (!qs) return text(`No quiz for "${topic}".`);
        let score = 0;
        const lines = qs.map((q, i) => {
          const ok = "abc".indexOf(String(answers[i] || "").toLowerCase().trim()) === q[2];
          if (ok) score++;
          return `Q${i + 1}: ${ok ? "correct" : "wrong, the answer is " + "ABC"[q[2]]}`;
        });
        return text(`Score: ${score} out of ${qs.length}\n${lines.join("\n")}`);
      }
    );

    return server;
  }

  app.post("/mcp", async (req, res) => {
    try {
      const { StreamableHTTPServerTransport } = await import("@modelcontextprotocol/sdk/server/streamableHttp.js");
      const server = await buildServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on("close", () => { transport.close(); server.close(); });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("MCP error:", err);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
      }
    }
  });

  // Stateless server: no GET/DELETE streams
  const notAllowed = (req, res) =>
    res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null });
  app.get("/mcp", notAllowed);
  app.delete("/mcp", notAllowed);
};
