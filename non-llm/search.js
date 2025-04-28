const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { findBestMatch } = require("string-similarity");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const data = require("./filteredData.json");
const refinedData = data;

// MAIN FUNCTION - ONLY SLIGHTLY IMPROVED
// function findBestMatchingPackage(input, dataSet, threshold = 0.2) {
//   const lowerCaseInput = input
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/gi, "")
//     .trim(); // normalize input

//   const stringsToMatch = dataSet.map((item) =>
//     `${item.name} ${item.description}`
//       .toLowerCase()
//       .replace(/[^a-z0-9\s]/gi, "")
//       .trim()
//   );

//   const matchResult = findBestMatch(lowerCaseInput, stringsToMatch);
//   const bestMatch = matchResult.ratings[matchResult.bestMatchIndex];

//   if (bestMatch.rating < threshold) {
//     return { message: "No relevant match found.", code: 404 };
//   }

//   return dataSet[matchResult.bestMatchIndex];
// }

function findBestMatchingPackage(input, dataSet, threshold = 0.2) {
  const lowerCaseInput = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, "")
    .trim();

  // Step 1: Prioritize based on important keywords first
  for (const item of dataSet) {
    const combinedText = `${item.name} ${item.description}`.toLowerCase();
    if (lowerCaseInput.includes("excel") && combinedText.includes("excel")) {
      return item;
    }
    if (
      lowerCaseInput.includes("powerpoint") &&
      combinedText.includes("powerpoint")
    ) {
      return item;
    }
    if (lowerCaseInput.includes("web") && combinedText.includes("web")) {
      return item;
    }
  }

  // Step 2: fallback to string similarity
  const stringsToMatch = dataSet.map((item) =>
    `${item.name} ${item.description}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, "")
      .trim()
  );

  const matchResult = findBestMatch(lowerCaseInput, stringsToMatch);
  const bestMatch = matchResult.ratings[matchResult.bestMatchIndex];

  if (bestMatch.rating < threshold) {
    return { message: "No relevant match found.", code: 404 };
  }

  return dataSet[matchResult.bestMatchIndex];
}

app.post("/suggest", (req, res) => {
  const userInput = req.body.input;

  console.log("User input:", userInput);

  if (!userInput) {
    return res.status(400).json({ error: "Input is required" });
  }

  const result = findBestMatchingPackage(userInput, refinedData);

  if (result.code === 404) {
    return res.status(404).json({ message: result.message });
  }

  res.json(result);
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", name: process.env.name, uris: process.env.uris });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
