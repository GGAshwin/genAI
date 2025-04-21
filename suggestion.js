import ollama from "ollama";
import * as data from "./data.json" assert { type: "json" };

const refinedData = data.default.content;

// console.log(refinedData);

const response = await ollama.chat({
  model: "gemma3:4b",
  messages: [
    {
      role: "system",
      content: `You are an expert assistant on SDK packages. You are given a list of SDK package data:\n${JSON.stringify(
        refinedData
      )}.
        
        Your task is to match the user's query to the most relevant package.
        
        - If a match is found, return only a JSON object with the following keys: "id", "name", and "description".
        - If no match is found, respond with the plain text: "No package found".
        - Do not add any explanation or extra content.`,
    },
    {
      role: "user",
      content:
        "I am looking for a store package that automates Google Cloud Storage production. Can you suggest me a package that does this?",
    },
  ],
});

console.log(response.message.content);
