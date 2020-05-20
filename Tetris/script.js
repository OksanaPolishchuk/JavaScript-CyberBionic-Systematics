

let main = document.querySelector(".main");
const scoreElem = document.getElementById("score");
const levelElem = document.getElementById("level");
const newTetroElem = document.getElementById("next-tetro");
const startBtm = document.getElementById("start");
const pauseBtm = document.getElementById("pause");
const gameOver = document.getElementById("game-over");

let playfield = Array(20).fill(Array(10).fill(0));

let score = 0;
let gameTimerID;
let currentLevel = 1;
let isPaused = true;
let possibleLevels = {
    1: {
        scorePerLine: 10,
        speed: 400,
        nexLevelScore: 20,
    },
    2: {
        scorePerLine: 15,
        speed: 300,
        nexLevelScore: 500,
    },
    3: {
        scorePerLine: 20,
        speed: 200,
        nexLevelScore: 1000,
    },
    4: {
        scorePerLine: 30,
        speed: 100,
        nexLevelScore: 2000,
    },
    5: {
        scorePerLine: 50,
        speed: 50,
        nexLevelScore: Infinity,
    },
};

let figures = {
    O: [
      [1, 1],
      [1, 1],
    ],
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    L: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    J: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0],
    ],
};

let activeTetro = getNewTetro();
let nextTetro = getNewTetro();


function draw() {
    let mainInnerHTML = "";
    for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
            if (playfield[y][x] === 1) {
            mainInnerHTML += '<div class="cell movingCell"></div>';
            } else if (playfield[y][x] === 2) {
            mainInnerHTML += '<div class="cell fixedCell"></div>';
            } else {
            mainInnerHTML += '<div class="cell"></div>';
            }
        }
    }
    main.innerHTML = mainInnerHTML;
}

function drawNextTetro() {
    let nextTetroInnerHTML = "";
    for (let y = 0; y < nextTetro.shape.length; y++) {
        for (let x = 0; x < nextTetro.shape[y].length; x++) {
            if (nextTetro.shape[y][x]){
                nextTetroInnerHTML += '<div class="cell movingCell"></div>';
            } else {
                nextTetroInnerHTML += '<div class="cell"></div>';
            }
        }
        nextTetroInnerHTML += '<br/>';
    }
    nextTetroElem.innerHTML = nextTetroInnerHTML;
}

function removePrevActiveTetro() {
    for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
            if(playfield[y][x] === 1){
            playfield[y][x] = 0;
            }
        }
    }
}

function addActiveTetro() {
    removePrevActiveTetro();
    for (let y = 0; y < activeTetro.shape.length; y++ ){
       for (let x = 0; x < activeTetro.shape[y].length; x++) {
           if(activeTetro.shape[y][x] === 1) {
               playfield[activeTetro.y + y][activeTetro.x + x] = 
               activeTetro.shape[y][x];
           }
       }
   }
}

function rotateTetro() {
    const prevTetroState = activeTetro.shape;

    activeTetro.shape = activeTetro.shape[0].map((val, index) =>
        activeTetro.shape.map((row) => row[index]).reverse()
    );

    if (hasCollisions()) {
    activeTetro.shape = prevTetroState;
    }
}

function hasCollision() {
    for (let y = 0; y < activeTetro.shape.length; y++ ){
        for (let x = 0; x < activeTetro.shape[y].length; x++) {
           if (
            activeTetro.shape[y][x] && 
            (playfield[activeTetro.y + y] === [undefined] ||
                playfield[activeTetro.y + y][activeTetro.x + x] === undefined || 
                playfield[activeTetro.y + y][activeTetro.x + x] === 2)
            ) {
                return true;
           }
        } 
    }
    return false;
}

function removeFullLines() {
    let canRemoveLine = true,
        filledLine = 0;

    for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
            if (playfield[y][x] !== 2) {
                canRemoveline = false;
                break;
            }
        }
        if (canRemoveLine) {
            playfield.splice(y, 1);
            playfield.splice(0, 0, [0, 0, 0, 0, 2, 2, 0, 0, 0, 0]);
            filledLine += 1;
        }
        canRemoveLine = true;
    }

    switch (filledLines) {
        case 1:
            score += possibleLevels[currentLevel].scorePerLine;
            break;
        case 2:
            score += possibleLevels[currentLevel].scorePerLine * 3;
            break;
        case 3:
            score += possibleLevels[currentLevel].scorePerLine * 6;
            break;
        case 4:
            score += possibleLevels[currentLevel].scorePerLine * 12;
            break;
    }
    scoreElem.innerHTML = score;

    if (score >= possibleLevels[currentLevel].nexLevelScore) {
        currentLevel++;
        levelElem.innerHTML = currentLevel;
    }
}

function getNewTetro() {
    const possibleFigures = "IOLJTSZ";
    const rand = Math.floor(Math.random() * 7);
    const newTetro = figures[possibleFigures[rand]];

    return {
        x: Math.floor((10 - newTetro[0].length) / 2),
        y: 0,
        shape: newTetro,
    }
}

function fixTetro() {
    for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
            if (playfield[y][x] === 1) {
                playfield[y][x] = 2;
            }
        }
    }
}

function moveTetroDown() {
    activeTetro.y += 1;
    if (hasCollisions()) {
         activeTetro.y -= 1;
        fixTetro();
         removeFullLines();
         activeTetro = nextTetro;
         if (hasCollisions()) {
         //alert("Game over");
         reset();
        }
        nextTetro = getNewTetro();
    }
}

function dropTetro() {
    for (let y = activeTetro.y; y < array.length; y++) {
        activeTetro.y += 1;
        if (hasCollisions()) {
            activeTetro.y -= 1;
            break;
        }
    }
}

function reset() {
    isPaused = true;
    clearTimeout(gameTimerID);
    playfield = Array(20).fill(Array(10).fill(0));
    draw();
    gameOver.style.display = "block";
}

document.onkeydown = function (e) {
    if (!isPaused) {
        // Move Left
        if (e.keyCode === 37) {
            activeTetro.x -= 1;
            if (hasCollisions()) {
            activeTetro.x += 1;
            }
            // Move Right
        } else if (e.keyCode === 39) {
            activeTetro.x += 1;
            if (hasCollisions()) {
            activeTetro.x -= 1;
            }
        } else if (e.keyCode === 40) {
            // Speed 
        moveTetroDown();
        } else if (e.keyCode === 38) {
            // Up
            rotateTetro();
        } else if (e.keyCode === 32) {
        dropTetro();
        }
        updateGameState();
    }
};

function updateGameState() {
    if (!isPaused) {
        addActiveTetro();
        draw();
        drawNextTetro();
    }
}

pauseBtm.addEventListener('click', (e) => {
   if (e.target.innerHTML === "Pause") {
       e.target.innerHTML = "Keep Playing...";
       clearTimeout(gameTimerID);
   } else {
    e.target.innerHTML = "Pause";
    gameTimerID =  setTimeout(startGame, possibleLevels[currentLevel].speed);
   }
   isPaused = !isPaused;
});

startBtm.addEventListener('click', (e) => {
    e.target.innerHTML = "Start again";
    isPaused = false;
    gameTimerID =  setTimeout(startGame, possibleLevels[currentLevel].speed);
    gameOver.style.display = "none";
});

scoreElem.innerHTML = score;
levelElem.innerHTML = currentLevel;

draw();

function startGame() {
    if (!isPaused) {
       updateGameState();
        gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
    }
}

//setTimeout(startGame, possibleLevels[currentLevel].speed);