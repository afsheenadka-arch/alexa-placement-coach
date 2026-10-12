const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DB = path.join(__dirname, "data.json");
const TOPICS = ["arrays", "strings", "sorting", "linked lists", "trees", "graphs", "dp"];

const QUIZ = {
  arrays: [
    ["Index of the first element in most languages?", ["0", "1", "-1"], 0],
    ["Time to access arr[i]?", ["O(n)", "O(1)", "O(log n)"], 1],
    ["Which technique finds a pair with a given sum in a sorted array?", ["Two pointers", "Recursion", "Hashing only"], 0],
  ],
  strings: [
    ["Are strings immutable in Java?", ["Yes", "No", "Only when empty"], 0],
    ["Time to check if a string is a palindrome?", ["O(1)", "O(n)", "O(n^2)"], 1],
    ["Which data structure helps count character frequency?", ["Hash map", "Stack", "Queue"], 0],
  ],
  sorting: [
    ["Average time of merge sort?", ["O(n)", "O(n log n)", "O(n^2)"], 1],
    ["Which sort is stable by default?", ["Quick sort", "Merge sort", "Heap sort"], 1],
    ["Worst case of quick sort?", ["O(n log n)", "O(n^2)", "O(n)"], 1],
  ],
};

const load = () => {
  try { return JSON.parse(fs.readFileSync(DB, "utf8")); } catch { return { logs: [] }; }
};
const save = (d) => fs.writeFileSync(DB, JSON.stringify(d, null, 2));

let quiz = null; // active quiz state (single user demo)

function logProgress(text) {
  const m = text.match(/(\d+)/);
  const count = m ? parseInt(m[1], 10) : 1;
  const topic = TOPICS.find((t) => text.includes(t)) || "general";
  const d = load();
  d.logs.push({ date: new Date().toISOString(), topic, count });
  save(d);
  return `Logged ${count} ${topic} problem${count > 1 ? "s" : ""}. Nice work, keep the streak going.`;
}

function plan() {
  const d = load();
  const totals = Object.fromEntries(TOPICS.map((t) => [t, 0]));
  d.logs.forEach((l) => { if (l.topic in totals) totals[l.topic] += l.count; });
  const weakest = TOPICS.slice().sort((a, b) => totals[a] - totals[b])[0];
  const last = d.logs.length ? d.logs[d.logs.length - 1].topic : null;
  let msg = `Tonight: solve 2 ${weakest} problems, since it is your least practiced topic.`;
  if (last && last !== "general" && last !== weakest) msg += ` Then spend 15 minutes revising ${last}.`;
  return msg;
}

function summary() {
  const d = load();
  const week = d.logs.filter((l) => Date.now() - new Date(l.date) < 7 * 864e5);
  if (!week.length) return "No problems logged this week yet. Try saying: I solved 3 arrays problems.";
  const by = {};
  week.forEach((l) => (by[l.topic] = (by[l.topic] || 0) + l.count));
  const total = week.reduce((s, l) => s + l.count, 0);
  const days = new Set(week.map((l) => l.date.slice(0, 10))).size;
  const parts = Object.entries(by).map(([t, c]) => `${t}: ${c}`).join(", ");
  return `This week you solved ${total} problems across ${days} day${days > 1 ? "s" : ""}. ${parts}.`;
}

function ask() {
  const q = quiz.qs[quiz.i];
  return `Question ${quiz.i + 1}: ${q[0]}\nA) ${q[1][0]}\nB) ${q[1][1]}\nC) ${q[1][2]}`;
}

function answer(letter) {
  const q = quiz.qs[quiz.i];
  const ok = "abc".indexOf(letter) === q[2];
  if (ok) quiz.score++;
  const feedback = ok ? "Correct." : `Not quite. The answer is ${"ABC"[q[2]]}.`;
  quiz.i++;
  if (quiz.i < quiz.qs.length) return `${feedback}\n${ask()}`;
  const end = `${feedback}\nQuiz done. You scored ${quiz.score} out of ${quiz.qs.length}.`;
  quiz = null;
  return end;
}

app.post("/api/command", (req, res) => {
  const text = String(req.body.text || "").toLowerCase().trim();
  let reply;
  if (quiz && /^[abc]$/.test(text.replace(/[^a-c]/g, "")) && text.length <= 12) {
    reply = answer(text.replace(/[^a-c]/g, ""));
  } else if (text.includes("quiz")) {
    const topic = Object.keys(QUIZ).find((t) => text.includes(t));
    if (!topic) reply = "Which topic? Try: quiz me on arrays, strings, or sorting.";
    else { quiz = { qs: QUIZ[topic], i: 0, score: 0 }; reply = ask(); }
  } else if (/solved|did|completed|log/.test(text)) reply = logProgress(text);
  else if (/summary|week|how did i do/.test(text)) reply = summary();
  else if (/plan|study|what should i/.test(text)) reply = plan();
  else reply = "I can log your progress, plan tonight's study, quiz you, or summarize your week.";
  res.json({ reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Alexa Placement Coach running at http://localhost:${PORT}`));
