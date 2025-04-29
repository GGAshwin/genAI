import express from "express";
import bodyParser from "body-parser"; // Default import for CommonJS module
import cors from "cors";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Ollama } from "@langchain/ollama";
import ollama from "ollama";

import data from "./non-llm/filteredData.json" assert { type: "json" };

const { json } = bodyParser; // Destructure the `json` method from bodyParser

const app = express();
app.use(cors());
app.use(json()); // Use the `json` middleware
const port = 3000;

let embeddedDocs = [];

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  // model: "deepseek-r1:7b",
  baseUrl: "http://127.0.0.1:11434",
});

console.log(embeddings);

async function setup() {
  const texts = data.map((doc) => `${doc.name || ""} ${doc.description}`);
  const vectors = await embeddings.embedDocuments(texts);

  embeddedDocs = vectors.map((vector, i) => ({
    ...data[i],
    vector,
  }));
}

const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
};

function extractJsonFromLLMResponse(text) {
  if (text.match(/^\[/)) {
    text = JSON.parse(text);
    return text[0];
  }
  const match = text.match(/```json\s+([\s\S]*?)\s+```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Invalid JSON returned from LLM:", e);
      return null;
    }
  }
  return null;
}

async function pickBestWithLLM(userInput, packages) {
  const messages = [
    {
      role: "system",
      content: `You are an expert assistant on SDK packages and only return json values. You are given a list of SDK package data:\n${JSON.stringify(
        packages
      )}
    Your task is to match the user's query to the most relevant package.
    - If a match is found, return only a JSON object with the following keys: "id", "name", and "description".
    - If no match is found, respond with the plain text: "No package found".
    - Do not add any explanation or extra content.`,
    },
    {
      role: "user",
      content: `User query: "${userInput}"`,
    },
  ];

  console.log("Generating response...");

  const llm = await ollama.chat({
    model: "gemma3:1b",
    baseUrl: "http://127.0.0.1:11434",
    messages: messages,
  });

  console.log(llm.message.content);

  const response = extractJsonFromLLMResponse(llm.message.content);

  console.log(response);

  return response;
}

app.post("/suggest", async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: "Question required" });

  console.log("Embbeddings:", embeddings);

  const queryEmbedding = await embeddings.embedQuery(input);

  console.log("Query Embedding:", queryEmbedding);

  const ranked = embeddedDocs
    .map((doc) =>
      // console.log(doc),
      ({
        doc,
        score: cosineSimilarity(queryEmbedding, doc.vector),
      })
    )
    .sort((a, b) => b.score - a.score);

  const topFive = ranked.slice(0, 5);

  console.log("Ranked:", topFive);

  const topCandidates = topFive.map((pak) => {
    return {
      id: pak.doc.id,
      name: pak.doc.name,
      description: pak.doc.description,
    };
  });

  console.log(topCandidates);

  const best = await pickBestWithLLM(input, topCandidates);

  if (!best) return res.json({ message: "No package found" });
  return res.json(best);
});

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  await setup();
});
