import ollama from "ollama";

const input = "calculator";

const system = {
  role: "system",
  content:
    "You will create a simple HTML page with CSS and JS code. You will only return the HTML code. Don't write any explanation. You will also not use the <think> tag. Don't write anything else. Just the HTML code. Don't give me the ```html text too just the html code no other text.",
};

const message = {
  role: "user",
  content: `Create a ${input} application`,
};
const response = await ollama.chat({
  model: "deepseek-r1:7b",
  messages: [system, message],
  stream: false,
});

console.log(response.message.content);
import fs from "fs";
import path from "path";

//write the response to a html file
const outputPath = path.join("output.html");
const htmlContent = response.message.content;
fs.writeFileSync(outputPath, htmlContent);
console.log(`HTML code written to ${outputPath}`);
//open the file in the default browser
import open from "open";
open(outputPath);
