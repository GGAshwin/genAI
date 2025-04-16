import ollama from "ollama";

const message = { role: "user", content: "Why is the sky blue?" };
const response = await ollama.chat({
  model: "gemma3:4b",
  messages: [message],
  stream: true,
});
for await (const part of response) {
  process.stdout.write(part.message.content);
}

// console.log(response);
