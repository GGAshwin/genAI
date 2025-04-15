import fs from "fs";
import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Ollama } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { loadQAStuffChain } from "langchain/chains";
import ollama from "ollama";

// 📥 Step 1: Extract text from PDF
async function extractPDFText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);

  const data = await pdf(dataBuffer);
  return data.text;
}

// 📚 Step 2: Chunk and embed the text
async function createVectorStore(text) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const docs = await splitter.createDocuments([text]);

  console.log("Generating Summary...");

  const message = {
    role: "user",
    content: `Summerize this: ${JSON.stringify(docs)}`,
  };
  const response = await ollama.chat({
    model: "gemma3:1b",
    messages: [message],
    stream: true,
  });
  for await (const part of response) {
    process.stdout.write(part.message.content);
  }
}

// 🚀 Step 3: Run everything
(async () => {
  console.log("started");

  const filePath = "./sample.pdf";
  const question = "What is the document about?";

  console.log("📄 Reading PDF...");
  const text = await extractPDFText(filePath);

  console.log("🔗 Creating vector store...");
  await createVectorStore(text);
})();
