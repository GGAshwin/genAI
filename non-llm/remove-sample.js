const data = require("./data.json");
const fs = require("fs");

const filteredData = data.filter((item) => {
  return !item.name.includes("sample") && !item.description.includes("sample");
});

console.log(filteredData.length);
console.log(data.length);

const sameDesc = new Set();
const uniqueDesc = data.filter((item) => {
  const desc = item.description.toLowerCase();
  if (sameDesc.has(desc)) {
    return false;
  } else {
    sameDesc.add(desc);
    return true;
  }
});

console.log(uniqueDesc.length);

const withoutStringTest = uniqueDesc.filter((item) => {
  const name = item.name.toLowerCase();
  const description = item.description.toLowerCase();
  return !name.includes("test") && !description.includes("test");
});

console.log(withoutStringTest.length);

// console.log(filteredData);
fs.writeFileSync(
  "./filteredData.json",
  JSON.stringify(withoutStringTest, null, 2),
  "utf-8"
);
