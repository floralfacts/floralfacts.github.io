const fs = require("fs");

const inFile = "assets/json/puzzles.json";
const outDir = "_play";

const rawPuzzleData = fs.readFileSync(inFile);
const puzzleDataArray = JSON.parse(rawPuzzleData);
console.log("Read and parsed puzzle data.");
puzzleDataArray.forEach((data, index) => {
    const number = index + 1;
    const filename = `${outDir}/${number}.md`;
    const lines = [
        "---",
        "layout: puzzle",
        `name: ${number}`,
        `difficulty: ${data.difficulty || "Not Rated"}`,
        `printerFriendly: ${data.printerFriendly}`,
        "---",
        JSON.stringify(data, null, 4),
    ];
    fs.writeFileSync(filename, lines.join("\n"));
    console.log(`(${index + 1}/${puzzleDataArray.length}) Wrote puzzle file to: ${filename}`);
});
console.log("Wrote all puzzle files.");