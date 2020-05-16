/*
  global fillPuzzle
  global cleanWords
 */

/*
 * From StackOverflow:
 * https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
 */
function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    var key = decodeURIComponent(pair[0]);
    query[key] = '';
    if (pair[1]) {
      query[key] = decodeURIComponent(pair[1].replace(/\+/g, '%20'));
    }
  }
  return query;
}

const API_URL = "https://floralfacts.glitch.me";

let isShowingAnswers = false;
let btnUpdate = document.querySelector("#btn-update");
let btnShow = document.querySelector("#btn-show");
let btnClear = document.querySelector("#btn-clear");
let btnSample = document.querySelector("#btn-sample");
let btnSaveImage = document.querySelector("#btn-save-image");
let btnSavePDF = document.querySelector("#btn-save-pdf");
let btnImport = document.querySelector("#btn-import");
let btnExportLink = document.querySelector("#btn-export-link");
let btnExportJSON = document.querySelector("#btn-export-json");
let btnExportYAML = document.querySelector("#btn-export-yaml");
let inputCredits = document.querySelector("#input-credits");
let inputNameA = document.querySelector("#input-name-a");
let inputImageA = document.querySelector("#input-img-a");
let inputHintA = document.querySelector("#input-hint-a");
let inputNameB = document.querySelector("#input-name-b");
let inputImageB = document.querySelector("#input-img-b");
let inputHintB = document.querySelector("#input-hint-b");
let inputFunFact = document.querySelector("#input-fun-fact");
let inputReuseLetters = document.querySelector("#input-reuse-letters");
let inputWordBank = document.querySelector("#input-word-bank");
let inputGivenWords = document.querySelector("#input-given-words");

function cleanWordBank(raw) {
  if (raw.length == 0) {
    return [];
  }
  return raw
    .split("\n")
    .join(" ")
    .split(" ")
    .filter(word => {
      return word.length > 0;
    });
}

function fillFormFromJSON(puzzleData) {
  inputCredits.value = puzzleData.credits;
  inputNameA.value = puzzleData.nameA;
  inputImageA.value = puzzleData.imageA;
  inputHintA.value = puzzleData.hintA ? puzzleData.hintA : "";
  inputNameB.value = puzzleData.nameB;
  inputImageB.value = puzzleData.imageB;
  inputHintB.value = puzzleData.hintB ? puzzleData.hintB : "";
  inputFunFact.value = puzzleData.funFact;
  inputWordBank.value = puzzleData.wordBank.join("\n");
  if (puzzleData.given) {
    inputGivenWords.value = puzzleData.given.join("\n");
  } else {
    inputGivenWords.value = "";
  }
  inputReuseLetters.checked = puzzleData.reuseLetters;
}

function getJSONFromForm() {
  return {
    difficulty: "Beginner",
    credits: inputCredits.value,
    nameA: cleanWords(inputNameA.value),
    imageA: inputImageA.value,
    hintA: inputHintA.value,
    nameB: cleanWords(inputNameB.value),
    imageB: inputImageB.value,
    hintB: inputHintB.value,
    funFact: cleanWords(inputFunFact.value),
    wordBank: cleanWordBank(inputWordBank.value),
    given: cleanWordBank(inputGivenWords.value),
    reuseLetters: inputReuseLetters.checked,
  };
}

function clearPuzzleForm() {
  inputCredits.value = "";
  inputNameA.value = "";
  inputImageA.value = "";
  inputHintA.value = "";
  inputNameB.value = "";
  inputImageB.value = "";
  inputHintB.value = "";
  inputFunFact.value = "";
  inputWordBank.value = "";
  inputGivenWords.value = "";
  inputReuseLetters.checked = false;
}

function fillPuzzleFromJSON(data) {
  data.show = isShowingAnswers;
  fillPuzzle(data, document, { "Image": window.Image });
}

btnUpdate.addEventListener("click", e => {
  let puzzleData = getJSONFromForm();
  fillPuzzleFromJSON(puzzleData);
});
btnShow.addEventListener("click", e => {
  isShowingAnswers = !isShowingAnswers;
  btnShow.innerText = isShowingAnswers ? "Hide Solution" : "Show Solution";
  let puzzleData = getJSONFromForm();
  fillPuzzleFromJSON(puzzleData);
});
btnClear.addEventListener("click", e => {
  clearPuzzleForm();
  let puzzleData = getJSONFromForm();
  fillPuzzleFromJSON(puzzleData);
});

let samplePuzzles = [
  {
    "credits": "Images from VarageSale and Monrovia.",
    "nameA": "purple fire spikes",
    "imageA": "https://cdn.glitch.com/74fd1bd5-4234-47a8-a343-40155bb85adc%2F05d1e995c3555c8035e2970e0d07bd5d.jpg?v=1586305441780",
    "hintA": "",
    "nameB": "royal robe paraguay night shade",
    "imageB": "https://cdn.glitch.com/74fd1bd5-4234-47a8-a343-40155bb85adc%2F4506.jpg?v=1586305438681",
    "hintB": "",
    "funFact": "can grow up to eight feet tall",
    "wordBank": [
      "bulb",
      "pine",
      "star",
      "tulip",
      "windy",
      "frayed",
      "velvet",
      "lavender"
    ],
    "given": ["purple"],
    "reuseLetters": false
  },
  {
    "credits": "Images from Etsy Walawala Studio and Garden Goods Direct.",
    "nameA": "rabbit succulent",
    "imageA": "https://cdn.glitch.com/74fd1bd5-4234-47a8-a343-40155bb85adc%2F1582055187-bunny-succulents-square-1582055134.jpg?v=1586305434649",
    "hintA": "",
    "nameB": "witch hazel",
    "imageB": "https://cdn.glitch.com/74fd1bd5-4234-47a8-a343-40155bb85adc%2Fwitch_hazel_3sh25_031310_640x480_6279447a-aca3-4406-ada1-41b701ca055a_350x400_crop_center.webp?v=1586305482686",
    "hintB": "",
    "funFact": "can survive outside in mild winters",
    "wordBank": [
      "bunny",
      "early",
      "spikes",
      "happy",
      "hairy",
      "burst",
      "bubble",
      "petite",
      "chunky",
      "vegetable",
      "lightning"
    ],
    "given": [],
    "reuseLetters": true
  },
  {
    "credits": "Images from Garden Goods Direct and Lazy Flora.",
    "nameA": "sago palm",
    "imageA": "https://cdn.shopify.com/s/files/1/0212/1030/0480/products/sago_palm.jpg?v=1577191797",
    "hintA": "Its starch can be used to make deserts, including a pudding that shares its name.",
    "nameB": "coral cactus",
    "imageB": "https://cdn.shopify.com/s/files/1/1938/3931/products/Coral_cactus_malek_Aug_2019_03_1024x1024.jpg?v=1574539600",
    "hintB": "This plant requires sunlight, but it looks like it could grow at the bottom of the ocean.",
    "funFact": "poisonous sap and leaves",
    "wordBank": [
      "wide",
      "pine",
      "tree",
      "fern",
      "spine",
      "sharp",
      "snake",
      "brush",
      "bulbus",
      "crease",
      "yarrow"
    ],
    "given": [],
    "reuseLetters": false
  },
];

let currentIndex = 0;

btnSample.addEventListener("click", e => {
  btnSample.innerText = "Get Another Sample Puzzle";
  let randomPuzzle = samplePuzzles[currentIndex];
  fillFormFromJSON(randomPuzzle);
  fillPuzzleFromJSON(randomPuzzle);
  currentIndex = (currentIndex + 1) % samplePuzzles.length;
});

btnImport.addEventListener("click", e => {
  const frontMatterLine = "\n---\n";
  const dataURLParam = "?d=";
  let inputString = prompt("Enter Puzzle Data Here:");
  try {
    const frontMatterIndex = inputString.indexOf(frontMatterLine);
    const dataURLParamIndex = inputString.indexOf(dataURLParam);
    if (frontMatterIndex > -1) {
      inputString = inputString.substr(frontMatterIndex + frontMatterLine.length);
    }
    if (dataURLParamIndex > -1) {
      inputString = inputString.substr(dataURLParamIndex + dataURLParam.length);
      inputString = atob(decodeURIComponent(inputString));
    }
    let puzzleData = JSON.parse(inputString);
    fillFormFromJSON(puzzleData);
    fillPuzzleFromJSON(puzzleData);
  } catch (e) {
    alert("Could not parse input.");
  }
});

btnExportLink.addEventListener("click", e => {
  const puzzleData = getJSONFromForm();
  window.open(`${document.location.origin}/play?d=${encodeURIComponent(btoa(JSON.stringify(puzzleData)))}`);
});

btnExportJSON.addEventListener("click", e => {
  const puzzleData = getJSONFromForm();
  prompt("Copy this text into a JSON file:", JSON.stringify(puzzleData, undefined, 2));
});

btnExportYAML.addEventListener("click", e => {
  const puzzleData = getJSONFromForm();
  const outputLines = [
    `---`,
    `layout: puzzle`,
    `name: ?`,
    `difficulty: ?`,
    `printerFriendly: false`,
    `---`,
    JSON.stringify(puzzleData, undefined, 2),
  ];
  prompt("Copy this text into a YAML file:", outputLines.join("\n"));
});

btnSaveImage.addEventListener("click", e => {
  const puzzleData = getJSONFromForm();
  window.open(`${API_URL}/makepng/v?d=${encodeURIComponent(btoa(JSON.stringify(puzzleData)))}`);
});

btnSavePDF.addEventListener("click", e => {
  const puzzleData = getJSONFromForm();
  window.open(`${API_URL}/makepdf/v?d=${encodeURIComponent(btoa(JSON.stringify(puzzleData)))}`);
});

window.onbeforeunload = () => {
  const data = getJSONFromForm();
  for (let key in data) {
    if (data[key].length > 0) {
      return "You have unsaved puzzle data.";
    }
  }
}

let pageURL = window.location.href;
let params = parseQuery(window.location.search);
const printerFriendly = params.print && params.print !== "false" && params.print !== "0";
if (params.d) {
  try {
    const data = JSON.parse(atob(params.d));
    fillFormFromJSON(data);
    fillPuzzleFromJSON(data);
  } catch (err) {
    console.error(err);
  }
}