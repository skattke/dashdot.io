let score = 0;
let timeLeft = 30;
let gameActive = false;
let timerInterval;
let dot = document.getElementById("dot");
let scoreDisplay = document.getElementById("score");
let timerDisplay = document.getElementById("timer");
let startBtn = document.getElementById("startBtn");
let restartBtn = document.getElementById("restartBtn");
let highScoreDisplay = document.getElementById("highScore");
let progressBar = document.getElementById("progress-bar");

let blackDots = [];
let blackDotCount = 0;
let blackDotLimit = 12;
let blackDotInterval;
let highScore = localStorage.getItem("highScore") || 0;
highScoreDisplay.textContent = "High Score: " + highScore;

let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

document.getElementById("submitUsernameBtn").addEventListener("click", () => {
  let username = document.getElementById("username").value;
  if (username) {
    localStorage.setItem("username", username);
    document.getElementById("username-container").style.display = "none";
    document.getElementById("game-container").style.display = "flex";
    updateLeaderboard();
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

function startGame() {
  score = 0;
  timeLeft = 30;
  blackDotCount = 0;
  gameActive = true;
  scoreDisplay.textContent = "Score: " + score;
  timerDisplay.textContent = "Time: " + timeLeft;
  startBtn.style.display = "none";
  restartBtn.style.display = "inline-block";
  dot.style.visibility = "visible";
  progressBar.style.width = "100%"; // Immediately reset progress bar to full
  blackDots.forEach(dot => dot.remove());
  blackDots = [];
  moveDot();
  spawnBlackDots();
  startTimer();
  playSound("startGameSound");
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      timerDisplay.textContent = "Time: " + timeLeft;
      progressBar.style.width = (timeLeft / 30) * 100 + "%";
    } else {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

dot.addEventListener("click", () => {
  if (gameActive) {
    score++;
    scoreDisplay.textContent = "Score: " + score;
    playSound("dotClickSound");
    moveDot();
  }
});

function moveDot() {
  const dotContainer = document.getElementById("dot-container");
  const maxX = dotContainer.offsetWidth - dot.offsetWidth;
  const maxY = dotContainer.offsetHeight - dot.offsetHeight - 30; // Avoid time bar area

  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;

  dot.style.left = randomX + "px";
  dot.style.top = randomY + "px";
  
  // Add a "pop" effect for the red dot
  dot.style.transform = "scale(1.2)";
  setTimeout(() => dot.style.transform = "scale(1)", 200);
}

function spawnBlackDots() {
  const dotContainer = document.getElementById("dot-container");

  // Function to check if two dots overlap
  function isOverlapping(newDot) {
    return blackDots.some(existingDot => {
      const existingRect = existingDot.getBoundingClientRect();
      const newDotRect = newDot.getBoundingClientRect();
      return !(existingRect.right < newDotRect.left ||
               existingRect.left > newDotRect.right ||
               existingRect.bottom < newDotRect.top ||
               existingRect.top > newDotRect.bottom);
    });
  }

  blackDotInterval = setInterval(() => {
    if (blackDotCount < blackDotLimit && gameActive) {
      let blackDot;
      let validPosition = false;
      
      while (!validPosition) {
        blackDot = document.createElement("div");
        blackDot.classList.add("black-dot");

        // Ensure black dots stay within the container, not overlapping time bar
        let randomX = Math.random() * (dotContainer.offsetWidth - 40);
        let randomY = Math.random() * (dotContainer.offsetHeight - 40 - 30); // Avoid time bar area

        blackDot.style.left = randomX + "px";
        blackDot.style.top = randomY + "px";

        // Check if the new black dot overlaps with existing ones
        if (!isOverlapping(blackDot)) {
          validPosition = true;
        }
      }

      blackDots.push(blackDot);
      dotContainer.appendChild(blackDot);

      blackDot.addEventListener("click", () => {
        endGame();
      });

      setTimeout(() => {
        blackDot.style.opacity = "0";
        setTimeout(() => {
          blackDot.remove();
          blackDotCount++;
        }, 500);
      }, 2000);
    }
  }, 2500);

  setTimeout(() => {
    clearInterval(blackDotInterval);
  }, 27000);
}

function endGame() {
  dot.style.visibility = "hidden";
  scoreDisplay.textContent = "Final Score: " + score;
  timerDisplay.textContent = "Time: 0";

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highScoreDisplay.textContent = "High Score: " + highScore;
  }

  leaderboard.push({ username: localStorage.getItem("username"), score: score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  updateLeaderboard();

  restartBtn.style.display = "none";
  startBtn.style.display = "inline-block";
  gameActive = false;
  playSound("gameOverSound");
  clearInterval(timerInterval);
  clearInterval(blackDotInterval);
  blackDots.forEach(dot => dot.remove());
  blackDots = [];
}

function restartGame() {
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = "Score: " + score;
  timerDisplay.textContent = "Time: " + timeLeft;
  
  // Immediately reset the progress bar to 100%
  progressBar.style.width = "100%";
  
  dot.style.visibility = "visible";
  blackDots.forEach(dot => dot.remove());
  blackDots = [];
  blackDotCount = 0;
  
  // Start game logic
  moveDot();
  clearInterval(blackDotInterval);
  spawnBlackDots();
  startTimer(); // Start the timer again
  
  // Show appropriate buttons
  restartBtn.style.display = "inline-block";
  startBtn
}

function updateLeaderboard() {
  const scoreList = document.getElementById("score-list");
  scoreList.innerHTML = ""; // Clear the leaderboard list

  leaderboard.forEach(entry => {
    const listItem = document.createElement("li");
    listItem.textContent = `${entry.username}: ${entry.score}`;
    scoreList.appendChild(listItem);
  });
}

function playSound(soundType) {
  let audio;
  if (soundType === "startGameSound") {
    audio = new Audio('sounds/startGameSound.mp3'); // Replace with the path to your sound
  } else if (soundType === "dotClickSound") {
    audio = new Audio('sounds/dotClickSound.mp3'); // Replace with the path to your sound
  } else if (soundType === "gameOverSound") {
    audio = new Audio('sounds/gameOverSound.mp3'); // Replace with the path to your sound
  }
  audio.play();
}