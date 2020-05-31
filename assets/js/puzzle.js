function cleanWords(raw) {
  return raw
    .split(" ")
    .filter(word => {
      return word.length > 0;
    })
    .join(" ");
}

function makeBlanksEl(words, domEl, editable) {
  let hasSetAutofocus = false;
  return words.map(word => {
    let el = domEl.createElement("div");
    el.classList.add("blank-word");
    word.forEach(blank => {
      let space = domEl.createElement("div");
      space.classList.add("blank-space");
      let content = domEl.createElement("div");
      content.classList.add("blank-content");
      if (!blank.given && editable) {
        content.contentEditable = true;
        if (!hasSetAutofocus) {
          content.autofocus = true;
          hasSetAutofocus = true;
        }
      }
      let label = domEl.createElement("div");
      label.classList.add("blank-label");
      content.innerText = blank.content;
      label.innerText = blank.label;
      space.appendChild(content);
      space.appendChild(label);
      el.appendChild(space);
    });
    return el;
  });
}

function makeSequentialBlanks(
  sentence,
  startNum = 1,
  show = false,
  givenMap = {}
) {
  let n = startNum;
  const blanks = sentence.split(" ").map(word => {
    let isGiven = word in givenMap;
    return word.split("").map(letter => {
      let blank = {
        content: show || isGiven ? letter : " ",
        label: isGiven ? "" : n,
        given: isGiven
      };
      if (!isGiven) {
        n++;
      }
      return blank;
    });
  });
  return blanks;
}

function makeInvertedLetterMap(puzzleWords, givenMap) {
  let letterMap = {};
  let labelCounter = 1;
  for (let j = 0; j < puzzleWords.length; j++) {
    const word = puzzleWords[j];
    if (word in givenMap) {
      continue;
    }
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      if (!(letter in letterMap)) {
        letterMap[letter] = {
          current: 0,
          labels: [],
          words: []
        };
      }
      letterMap[letter].labels.push(labelCounter);
      letterMap[letter].words.push(word);
      labelCounter++;
    }
  }
  return letterMap;
}

function makeAnswerBlanks(
  answer,
  partWords,
  show = false,
  givenMap = {},
  reuse = false
) {
  let words = partWords.split(" ");
  let usedLabels = {};
  let letterMap = makeInvertedLetterMap(words, givenMap);
  return answer.split(" ").map(answerWord => {
    return answerWord.split("").map(letter => {
      if (letter in letterMap) {
        let currentIndex = letterMap[letter].current;
        const labelSize = letterMap[letter].labels.length;
        if (currentIndex < labelSize) {
          // Fetch source
          let labelNumber = letterMap[letter].labels[currentIndex];
          let sourceWord = letterMap[letter].words[currentIndex];
          let isGiven = sourceWord in givenMap;
          // Update index
          let nextIndex = currentIndex + 1;
          if (reuse) {
            nextIndex = nextIndex % labelSize;
          }
          letterMap[letter].current = nextIndex;
          // Return letter
          return {
            content: show || isGiven ? letter : " ",
            label: labelNumber,
            given: isGiven
          };
        }
      }
      // If we reach here, we couldn't find a letter
      return {
        content: letter,
        label: "",
        given: true
      };
    });
  });
}

function fillImage(el, imageURL, domEl, winRef) {
  if (imageURL) {
    let downloadedImg = new winRef.Image();
    downloadedImg.crossOrigin = "Anonymous";
    downloadedImg.addEventListener(
      "load",
      () => {
        let canvas = domEl.createElement("canvas");
        let context = canvas.getContext("2d");
        canvas.width = downloadedImg.width;
        canvas.height = downloadedImg.height;
        canvas.classList.add("plant-picture");
        context.drawImage(downloadedImg, 0, 0);
        el.appendChild(canvas);
      },
      false
    );
    downloadedImg.addEventListener("error", e => {
      let img = domEl.createElement("img");
      img.classList.add("plant-picture");
      img.src = imageURL;
      el.appendChild(img);
    });
    downloadedImg.src = imageURL;
  }
}

function fillPlant(inputData, domEl, winRef) {
  let {
    plantEl,
    plantName,
    imageURL,
    hint,
    numOffset,
    show,
    givenMap,
    editable
  } = inputData;
  let nameEl = plantEl.querySelector(".plant-name .blank-container");
  let imageEl = plantEl.querySelector(".plant-frame");
  imageEl.innerHTML = "";
  // let imgA = document.createElement("img");
  // imgA.classList.add("plant-picture");
  // imageElA.appendChild(imgA);
  // imgA.src = options.imageA;
  // imageElA.style.backgroundImage = `url("${options.imageA}")`;
  // imageElA.querySelector("img").src = options.imageA;
  fillImage(imageEl, imageURL, domEl, winRef);
  nameEl.innerHTML = "";
  let hintEl = plantEl.querySelector(".hint");
  hintEl.style.display = "none";
  const blanks = makeSequentialBlanks(plantName, numOffset, show, givenMap);
  makeBlanksEl(
    blanks,
    domEl,
    editable
  ).forEach(el => {
    nameEl.appendChild(el);
  });
  if (hint) {
    hintEl.querySelector(".hint-text").innerText = hint;
    hintEl.style.display = "inline-block";
  }
  return blanks;
}

function fillWordBank(inputData, domEl) {
  let {
    wordBankEl,
    puzzleWords,
    bankWords,
    givenMap,
    maxWords,
    perCol
  } = inputData;
  wordBankEl.innerHTML = "";
  let wordOptions = [];
  let wordMap = {};
  puzzleWords.forEach(word => {
    if (
      wordOptions.length < maxWords &&
      !(word in givenMap) &&
      !(word in wordMap)
    ) {
      wordOptions.push(word);
      wordMap[word] = true;
    }
  });
  bankWords.forEach(word => {
    if (
      wordOptions.length < maxWords &&
      !(word in givenMap) &&
      !(word in wordMap)
    ) {
      wordOptions.push(word);
      wordMap[word] = true;
    }
  });
  if (wordOptions.length <= 6) {
    perCol = 1
  } else if (wordOptions.length <= 8) {
    perCol = 2
  }
  let col = domEl.createElement("div");
  col.classList.add("word-column");
  wordOptions
    .sort((a, b) => {
      if (a.length == b.length) {
        return a.localeCompare(b);
      }
      return a.length - b.length;
    })
    .forEach((word, i) => {
      if (i > 0 && i % perCol == 0) {
        wordBankEl.appendChild(col);
        col = domEl.createElement("div");
        col.classList.add("word-column");
      }
      let el = domEl.createElement("div");
      el.classList.add("word-option");
      let caption = domEl.createElement("span");
      caption.setAttribute("aria-label", `Word number ${i + 1}: ${word}.`);
      let option = domEl.createElement("span");
      option.setAttribute("aria-hidden", true);
      option.innerText = word;
      el.appendChild(caption);
      el.appendChild(option);
      col.appendChild(el);
    });
  wordBankEl.appendChild(col);
}

function fillPuzzle(options, pageEl, winRef, editable = false) {
  options.nameA = cleanWords(options.nameA);
  options.nameB = cleanWords(options.nameB);
  let given = options.given || [];
  let givenMap = {};
  given.forEach(word => {
    givenMap[word] = true;
  });
  // Fill plant A
  const blanksA = fillPlant(
    {
      plantEl: pageEl.querySelector("#plant-a"),
      plantName: options.nameA,
      imageURL: options.imageA,
      hint: options.hintA,
      numOffset: 1,
      show: options.show,
      givenMap: givenMap,
      editable: editable
    },
    pageEl,
    winRef
  );
  // Fill plant B
  let plantNameA = options.nameA;
  let plantNameB = options.nameB;
  const labelOffset = blanksA.flat().reduce((offset, blank) => blank.given ? offset : offset + 1, 1);
  const blanksB = fillPlant(
    {
      plantEl: pageEl.querySelector("#plant-b"),
      plantName: options.nameB,
      imageURL: options.imageB,
      hint: options.hintB,
      numOffset: labelOffset,
      show: options.show,
      givenMap: givenMap,
      editable: editable
    },
    pageEl,
    winRef
  );
  // Fill fun fact
  let funFactEl = pageEl.querySelector("#fun-fact");
  let funFact = options.funFact;
  let allNames = plantNameA + " " + plantNameB;
  let answerBlanks = makeAnswerBlanks(
    funFact,
    allNames,
    options.show,
    givenMap,
    options.reuseLetters
  );
  funFactEl.innerHTML = "";
  makeBlanksEl(answerBlanks, pageEl, editable).forEach(el => {
    funFactEl.appendChild(el);
  });
  if (editable) {
    const blockedKeys = {
      8: "Backspace",
      9: "Tab",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown"
    };
    const keyIsAllowed = e => !(e.keyCode in blockedKeys);
    const moveToNextBlank = el => {
      if (el.parentElement.nextElementSibling) {
        // Jump to next blank in word
        let nextBlankInWord = el.parentElement.nextElementSibling.querySelector(
          ".blank-content"
        );
        if (nextBlankInWord.contentEditable === "true") {
          nextBlankInWord.focus();
        } else {
          moveToNextBlank(nextBlankInWord);
        }
      } else if (el.parentElement.parentElement.nextElementSibling) {
        // Jump to first editable blank of next word
        let nextBlankInAnswer = el.parentElement.parentElement.nextElementSibling.querySelector(
          ".blank-content"
        );
        if (nextBlankInAnswer.contentEditable === "true") {
          nextBlankInAnswer.focus();
        } else {
          moveToNextBlank(nextBlankInAnswer);
        }
      }
    };
    const moveToPrevBlank = el => {
      if (el.parentElement.previousElementSibling) {
        // Jump to next blank in word
        let prevBlankInAnswer = el.parentElement.previousElementSibling.querySelector(".blank-content");
        if (prevBlankInAnswer.contentEditable === "true") {
          prevBlankInAnswer.focus();
          return prevBlankInAnswer;
        } else {
          return moveToPrevBlank(prevBlankInAnswer);
        }
      } else if (el.parentElement.parentElement.previousElementSibling) {
        // Jump to last editable blank of previous word
        const blanks = el.parentElement.parentElement.previousElementSibling
          .querySelectorAll(".blank-space .blank-content[contentEditable]");
        blanks[blanks.length - 1].focus();
        return blanks[blanks.length - 1];
      }
      return null;
    };
    let deviceSupportsKeypress = false;
    Array.from(pageEl.querySelectorAll(".blank-content")).forEach(el => {
      // Only one character per blank: replace value if exists
      let initialContent = "";
      el.addEventListener("keydown", e => {
        initialContent = el.innerText[0];
      });
      el.addEventListener("keypress", e => {
        deviceSupportsKeypress = true;
        if (keyIsAllowed(e)) {
          e.preventDefault();
          el.innerText = String.fromCharCode(e.which);
          // Move to next blank, if available
          moveToNextBlank(el);
        }
      });
      el.addEventListener("keyup", e => {
        if (el.innerText.length > 1) {
          el.innerText = el.innerText[0];
        }
        if (e.keyCode === 39) {
          // Handle ArrowRight
          moveToNextBlank(el);
        } else if (e.keyCode === 37) {
          // Handle ArrowLeft
          moveToPrevBlank(el);
        } else if (e.keyCode === 8) {
          // Handle Backspace
          if (initialContent === undefined) {
            let prevEl = moveToPrevBlank(el);
            if (prevEl !== null) {
              prevEl.innerText = "";
            }
          } else {
            el.innerText = "";
          }
        } else if (!deviceSupportsKeypress) {
          if (el.innerText.length > 0) {
            moveToNextBlank(el);
          }
        }
      });
    });
  }
  // Fill word bank
  let wordBankEl = pageEl.querySelector(".word-bank");
  fillWordBank(
    {
      wordBankEl: wordBankEl,
      puzzleWords: allNames.split(" "),
      bankWords: options.wordBank,
      givenMap: givenMap,
      maxWords: 15,
      perCol: 3
    },
    pageEl
  );
  // Fill answers
  let answerElA = pageEl.querySelector("#answer-a");
  let answerElB = pageEl.querySelector("#answer-b");
  let answerElFact = pageEl.querySelector("#answer-fun-fact");
  answerElA.innerText = plantNameA + ".";
  answerElB.innerText = plantNameB + ".";
  answerElFact.innerText = funFact + ".";
  // Fill credits
  if (options.credits) {
    pageEl.querySelector(".credits-text").innerText = options.credits;
  }
}

if (typeof module == "undefined") {
  var module = { exports: {} };
}
module.exports = { fillPuzzle };
