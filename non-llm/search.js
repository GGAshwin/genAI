// import { express } from "express";
// import { bodyParser } from "body-parser";
// import { cors } from "cors";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// import { findBestMatch } from "string-similarity";
const findBestMatch = require("string-similarity").findBestMatch;
// import * as data from "../data.json" assert { type: "json" };
const data = require("./data.json");

const refinedData = data;

function findBestMatchingPackage(input, dataSet, threshold = 0.3) {
  const stringsToMatch = dataSet.map(
    (item) => `${item.name} ${item.description}`
  );

  const matchResult = findBestMatch(input, stringsToMatch);
  const bestMatch = matchResult.ratings[matchResult.bestMatchIndex];

  if (bestMatch.rating < threshold) {
    return { message: "No relevant match found.", code: 404 };
  }

  return dataSet[matchResult.bestMatchIndex];
}

// const userInput =
//   //   "I am looking for a store package that automates Google Cloud Storage production.";
//   "random text that is not in the data set";

app.post("/suggest", (req, res) => {
  const userInput = req.body.input;

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
  res.json({ status: "OK" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
