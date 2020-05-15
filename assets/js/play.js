/*
  global fillPuzzle
  global cleanWords
 */

/*
 * From StackOverflow:
 * https://stackoverflow.com/questions/35294633/what-is-the-vanilla-js-version-of-jquerys-getjson/35294675
 */
function fetch(url, doneFn, errFn) {
  let request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      let data = JSON.parse(request.responseText);
      doneFn(data);
    } else {
      if (errFn) {
        errFn(request.responseText);
      }
    }
  };
  request.onerror = function(err) {
    if (errFn) {
      errFn(err);
    }
  };
  request.send();
}

/*
 * From StackOverflow:
 * https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
 */
function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === "?"
    ? queryString.substr(1)
    : queryString
  ).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    var key = decodeURIComponent(pair[0]);
    query[key] = "";
    if (pair[1]) {
      query[key] = decodeURIComponent(pair[1].replace(/\+/g, "%20"));
    }
  }
  return query;
}

function listenToValidateAnswer(blankContainerEl, answer, callback) {
  let ranCallbackOnce = false;
  let expectedAnswer = answer.toLowerCase();
  blankContainerEl.addEventListener("keyup", e => {
    let wordBlanks = Array.from(
      blankContainerEl.querySelectorAll(".blank-word")
    );
    let enteredAnswer = wordBlanks
      .map(wordEl => {
        return Array.from(wordEl.querySelectorAll(".blank-content"))
          .map(space => space.innerText)
          .join("")
          .toLowerCase();
      })
      .join(" ");
    callback(blankContainerEl, enteredAnswer, expectedAnswer);
  });
}

function showBlankContainerValidation(
  blankContainerEl,
  enteredAnswer,
  expectedAnswer
) {
  if (enteredAnswer === expectedAnswer) {
    blankContainerEl.classList.add("correct-answer");
  } else {
    blankContainerEl.classList.remove("correct-answer");
  }
}

function showWholePageValidation(
  blankContainerEl,
  enteredAnswer,
  expectedAnswer
) {
  if (enteredAnswer === expectedAnswer) {
    document.querySelector(".confetti-container").classList.remove("hidden");
    // document.querySelector(".answer-text").classList.remove("rotated-180");
  } else {
    document.querySelector(".confetti-container").classList.add("hidden");
    // document.querySelector(".answer-text").classList.add("rotated-180");
  }
}

function listenToValidateAnswerByWords(containerEl, name, validationFn) {
  const words = cleanWords(name.toLowerCase()).split(" ");
  const wordEls = Array.from(containerEl.querySelectorAll(".blank-word"));
  let selectedWordEl = null;
  let expectedAnswer = null;
  wordEls.forEach((wordEl, i) => {
    wordEl.addEventListener("keydown", e => {
      selectedWordEl = wordEl;
      expectedAnswer = words[i];
    });
    wordEl.addEventListener("keyup", e => {
      if (selectedWordEl !== null && expectedAnswer !== null) {
        let enteredAnswer = Array.from(
          selectedWordEl.querySelectorAll(".blank-content")
        )
          .map(space => space.innerText)
          .join("")
          .toLowerCase();
        validationFn(selectedWordEl, enteredAnswer, expectedAnswer);
      }
    });
  });
}

function main(data, printerFriendlyMode) {
  console.log(data);
  if (
    (printerFriendlyMode || data.printerFriendly) &&
    data.printImageA &&
    data.printImageB
  ) {
    data.imageA = data.printImageA;
    data.imageB = data.printImageB;
    if (data.printCredits) {
      data.credits = data.printCredits;
    }
  }
  fillPuzzle(data, document, { Image: window.Image }, true);
  let answerText = document.querySelector(".answer-text");
  answerText.addEventListener("click", e => {
    if (answerText.classList.contains("rotated-180")) {
      answerText.classList.remove("rotated-180");
    } else {
      answerText.classList.add("rotated-180");
    }
  });
  listenToValidateAnswerByWords(
    document.querySelector("#plant-a .blank-container"),
    data.nameA,
    showBlankContainerValidation
  );

  listenToValidateAnswerByWords(
    document.querySelector("#plant-b .blank-container"),
    data.nameB,
    showBlankContainerValidation
  );
  // listenToValidateAnswer(
  //   document.querySelector("#plant-a .blank-container"),
  //   data.nameA,
  //   showBlankContainerValidation
  // );
  // listenToValidateAnswer(
  //   document.querySelector("#plant-b .blank-container"),
  //   data.nameB,
  //   showBlankContainerValidation
  // );
  listenToValidateAnswerByWords(
    document.querySelector("#fun-fact"),
    data.funFact,
    showBlankContainerValidation
  );
  listenToValidateAnswer(
    document.querySelector("#fun-fact"),
    data.funFact,
    showWholePageValidation
  );
  Array.from(document.querySelectorAll(".word-option")).forEach(el => {
    el.addEventListener("click", e => {
      if (el.classList.contains("crossed-out")) {
        el.classList.remove("crossed-out");
      } else {
        el.classList.add("crossed-out");
      }
    });
  });
}

let pageEl = document.getElementById("page");
let lostEl = document.getElementById("lost");

function failureCallback(err) {
  pageEl.classList.add("hidden");
  lostEl.classList.remove("hidden");
  console.error(err);
}

let pageURL = window.location.href;
let params = parseQuery(window.location.search);
const rawEl = document.querySelector("#raw");
const printerFriendly =
  params.print && params.print !== "false" && params.print !== "0";
if (params.d) {
  try {
    const data = JSON.parse(atob(params.d));
    main(data, printerFriendly);
  } catch (err) {
    failureCallback(err);
  }
} else if (rawEl !== null) {
  const data = JSON.parse(rawEl.innerText);
  main(data, printerFriendly);
} else {
  if (pageURL[pageURL.length - 1] === "/") {
    pageURL = pageURL.substr(0, pageURL.length - 1);
  }
  const partsOfURL = pageURL.split("/");
  const puzzleID = partsOfURL[partsOfURL.length - 1];
  fetch(
    `/puzzledata/${puzzleID}`,
    data => {
      main(data, printerFriendly);
    },
    failureCallback
  );
}
