import ollama from "ollama";

const input = "calculator";

const message = {
  role: "user",
  content: `Create a simple HTML page and write all the required CSS and JavaScript of a ${input} application. Give it some presentable styling which would be pleasing to the eye. Give me only the HTML, css and js all in one code. Don't write any explanation. Don't write anything else. Just the HTML code. dont give me the \`\`\`html text too just the html code no other text.`,
};
const response = await ollama.chat({
  model: "gemma3:4b",
  messages: [message],
  stream: false,
});

console.log(response.message.content);
import fs from "fs";
import path from "path";

//write the response to a html file
const outputPath = path.join("output.html");
fs.writeFileSync(outputPath, response.message.content);
console.log(`HTML code written to ${outputPath}`);
//open the file in the default browser
import open from "open";
open(outputPath);
