// import { Ollama } from "@langchain/community/llms/ollama";
import { Ollama } from "ollama";
import { OllamaEmbeddings } from "@langchain/ollama"; // embeddings stay here
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "langchain/document";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 1. Your SDK metadata
const sdkData = [
  {
    name: "Excel SDK",
    description:
      "The Excel SDK package is a collection of activities allowing you to create automations using Microsoft Excel.",
  },
  {
    name: "Powerpoint SDK",
    description:
      "The PowerPoint SDK package is a collection of activities allowing you to create automations using Microsoft PowerPoint.",
  },
];

// 2. Convert to LangChain Documents
const documents = sdkData.map(
  (sdk) =>
    new Document({
      metadata: { name: sdk.name },
      pageContent: `${sdk.name}: ${sdk.description}`,
    })
);

// 3. Chunk text (if needed)
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 20,
});
const docs = await splitter.splitDocuments(documents);

// 4. Embed with Ollama
const embeddings = new OllamaEmbeddings({
  model: "gemma3:4b", // or any model that supports embeddings
  baseUrl: "http://localhost:11434",
});

const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
const retriever = vectorStore.asRetriever();

// 5. LLM setup
const llm = new Ollama({
  model: "gemma3:4b",
  baseUrl: "http://localhost:11434",
});

// 6. Define the Runnable chain
const chain = RunnableSequence.from([
  (input) => retriever.invoke(input),
  (docs) => ({
    context: docs.map((d) => d.pageContent).join("\n"),
    question: input,
  }),
  ({ context, question }) =>
    llm.invoke(
      `You are an expert on SDK tools.\nContext:\n${context}\n\nQuestion: ${question}`
    ),
  new StringOutputParser(),
]);

// 7. Ask a question
const answer = await chain.invoke(
  "Which SDK helps with PowerPoint automation?"
);
console.log("💬 Answer:", answer);
