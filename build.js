const fs = require("fs");
const btoa = require("btoa");
const puppeteer = require("puppeteer")
const gm = require("gm");

const inFile = "assets/json/puzzles.json";
const outDirEntries = "_play";
const outDirPDFs = "assets/pdf";
const outDirPNGs = "assets/png";

const imageWidth = 160;
const imageHeight = 160;

const inDirFlowers = "flower_images/flower";
const inDirSketches = "flower_images/sketch";
const outDirFlowers = "assets/flower";
const outDirSketches = "assets/sketch";

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
async function savePageAs(browser, url, fileType) {
    if (fileType !== "pdf" && fileType !== "png") {
        throw new Error(`Invalid file type: ${fileType}`);
    }
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
    return fileRes;
}

async function formatImage(imageInFile, imageOutFile) {
    return new Promise((resolve, reject) => {
        gm(imageInFile)
            .resize(imageWidth, imageHeight, "^")
            .gravity("Center")
            .crop(imageWidth, imageHeight)
            .write(imageOutFile, (err) => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
    });
}

async function formatImageDir(inDirImage, outDirImage) {
    return new Promise((resolve, reject) => {
        fs.readdir(inDirImage, (err, files) => {
            if (!err) {
                // Filter out hidden files (From S/O).
                // https://stackoverflow.com/questions/18973655/how-to-ingnore-hidden-files-in-fs-readdir-result
                files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
                const promises = files.map((filename) => {
                    const inFileImage = `${inDirImage}/${filename}`;
                    const outFileImage = `${outDirImage}/${filename}`;
                    return formatImage(inFileImage, outFileImage);
                });
                Promise.all(promises).then(resolve).catch(reject);
            } else {
                reject(err);
            }
        });
    });
}

async function main() {

    // Read puzzle data
    const rawPuzzleData = fs.readFileSync(inFile);
    const puzzleDataArray = JSON.parse(rawPuzzleData);
    console.log("Read and parsed puzzle data.");

    // Format puzzle images before generating PDFs and PNGs
    await formatImageDir(inDirFlowers, outDirFlowers);
    await formatImageDir(inDirSketches, outDirSketches);
    console.log("Formatted all images.");

    // Dispatch local scrapes to generate PDFs and PNGs
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
    });
    const scrapePromises = [];
    puzzleDataArray.forEach((data, index) => {
        const id = data.id;
        const rawData = JSON.stringify(data);
        const encoded = encodeURIComponent(btoa(rawData));
        const url = `file:${__dirname}/_layouts/puzzle.html?d=${encoded}`;
        let pdfPromise = savePageAs(browser, url + "&print=true", "pdf").then((res) => {
            console.log(`(${index + 1}/${puzzleDataArray.length}) Scraping puzzle PDF...`);
            return res;
        });
        pdfPromise.filename = `${outDirPDFs}/${id}.pdf`;
        scrapePromises.push(pdfPromise);
        let pngPromise = savePageAs(browser, url, "png").then((res) => {
            console.log(`(${index + 1}/${puzzleDataArray.length}) Scraping puzzle PNG...`);
            return res;
        });
        pngPromise.filename = `${outDirPNGs}/${id}.png`;
        scrapePromises.push(pngPromise);
    });

    // Write markdown files for Jeykll entries
    puzzleDataArray.forEach((data, index) => {
        const id = data.id;
        const isPrinterFriendly = data.isPrinterFriendly || (data.printImageA && data.printImageB);
        const filename = `${outDirEntries}/${id}.md`;
        const lines = [
            "---",
            "layout: puzzle",
            `name: ${id}`,
            `difficulty: ${data.difficulty || "Not Rated"}`,
            `printerFriendly: ${isPrinterFriendly ? "true" : "false"}`,
            "---",
            JSON.stringify(data, null, 4),
        ];
        fs.writeFileSync(filename, lines.join("\n"));
        console.log(`(${index + 1}/${puzzleDataArray.length}) Wrote puzzle entry to: ${filename}`);
    });
    console.log("Wrote all puzzle entries.");

    // Write PDFs and PNGs
    return Promise.all(scrapePromises).then((files) => {
        console.log("Scraped all puzzle PDFs and PNGs.");
        files.forEach((file, i) => {
            const filename = scrapePromises[i].filename;
            fs.writeFileSync(filename, file, "binary");
            console.log(`(${i + 1}/${files.length}) Wrote puzzle file to: ${filename}`);
        });
        browser.close();
        console.log("Wrote all PDF/PNG files.");
    }).catch((err) => {
        browser.close();
        console.log("Failed to write PDF/PNG files:");
        console.error(err);
        process.exit();
    });

}

main().then((done) => {
    console.log("Done.");
});
