const fs = require("fs");
const btoa = require("btoa");
const puppeteer = require("puppeteer");

const inFile = "assets/json/puzzles.json";
const outDirEntries = "_play";
const outDirPDFs = "assets/pdf";
const outDirPNGs = "assets/png";

const printCSS = `
    html {
        background: white;
    }

    body {
        padding-top: 0;
    }

    .paper {
        padding: 50pt 30pt;
        box-shadow: none;
    }

    .editor {
        display: none;
    }

    .link-holder-left {
        display: none;
    }
`;

/*
* Based on Rising Stack:
* https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/
*/
async function savePageAs(url, fileType) {
    if (fileType !== "pdf" && fileType !== "png") {
        throw new Error(`Invalid file type: ${fileType}`);
    }
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: "networkidle0",
    });
    let fileRes;
    if (fileType === "pdf") {
        fileRes = await page.pdf({
            format: "Letter",
            margin: {
                top: "40px"
            },
            pageRanges: "1",
        });
    } else if (fileType === "png") {
        await page.addStyleTag({
            content: printCSS,
        });
        fileRes = await page.screenshot({
            fullPage: true,
        });
    }
    browser.close();
    return fileRes;
}

// Read puzzle data
const rawPuzzleData = fs.readFileSync(inFile);
const puzzleDataArray = JSON.parse(rawPuzzleData);
console.log("Read and parsed puzzle data.");

// Dispatch local scrapes to generate PDFs and PNGs
const scrapePromises = [];
puzzleDataArray.forEach((data, index) => {
    const number = index + 1;
    const rawData = JSON.stringify(data);
    const encoded = encodeURIComponent(btoa(rawData));
    const url = `file:${__dirname}/_layouts/puzzle.html?d=${encoded}`;
    let pdfPromise = savePageAs(url + "&print=true", "pdf");
    pdfPromise.filename = `${outDirPDFs}/${number}.pdf`;
    scrapePromises.push(pdfPromise);
    let pngPromise = savePageAs(url, "png");
    pngPromise.filename = `${outDirPNGs}/${number}.png`;
    scrapePromises.push(pngPromise);
});

// Write markdown files for Jeykll entries
puzzleDataArray.forEach((data, index) => {
    const number = index + 1;
    const filename = `${outDirEntries}/${number}.md`;
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
    console.log(`(${index + 1}/${puzzleDataArray.length}) Wrote puzzle entry to: ${filename}`);
});
console.log("Wrote all puzzle entries.");

// Write PDFs and PNGs
Promise.all(scrapePromises).then((files) => {
    files.forEach((file, i) => {
        const filename = scrapePromises[i].filename;
        fs.writeFileSync(filename, file, "binary");
        console.log(`(${i + 1}/${files.length}) Wrote puzzle file to: ${filename}`);
    });
    console.log("Wrote all PDF/PNG files.");
}).catch((err) => {
    console.log("Failed to write PDF/PNG files:");
    console.error(err);
    process.exit();
});