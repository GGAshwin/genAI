import ollama from "ollama";
import * as data from "./data.json" assert { type: "json" };

const refinedData = data.default.content;

// console.log(refinedData);

const response = await ollama.chat({
  model: "gemma3:4b",
  messages: [
    {
      role: "system",
      content: `You are an expert assistant on SDK packages. Here is the available data:\n${JSON.stringify(
        refinedData
      )}. You will find and suggest me a package that closely matches the user query. You will only give me the name of the package, the id of the said package, and a short description of it. If you don't find any package that matches the user query, just say "No package found".`,
    },
    {
      role: "user",
      content:
        "I am looking for a store package that automates Google Cloud Storage production. Can you suggest me a package that does this?",
    },
  ],
});

console.log(response.message.content);
