import { readFile, writeFile } from "fs";
import { join } from "path";

// Path to the JSON file
const filePath = "./data.json";

// Read the JSON file
readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  try {
    // Parse the JSON data
    const jsonData = JSON.parse(data);

    console.log(jsonData);

    // Map the data to extract only id, name, and description
    const mappedData = jsonData.content.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
    }));
    // Write the mapped data back to the file
    writeFile(
      "./data.json",
      JSON.stringify(mappedData, null, 2),
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing to the file:", writeErr);
          return;
        }
        console.log("Mapped data successfully written to mappedData.json");
      }
    );
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
  }
});
