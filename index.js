// ==========================================================================
// Dicee Challenge - Interactive Game Logic
// Clean, readable Vanilla JavaScript for a student project
// ==========================================================================

// 1. Element References
var image1 = document.querySelectorAll("img")[0];
var image2 = document.querySelectorAll("img")[1];

var dice1 = document.getElementById("dice1");
var dice2 = document.getElementById("dice2");

var card1 = document.getElementById("card-player1");
var card2 = document.getElementById("card-player2");

var pill1 = document.getElementById("pill-player1");
var pill2 = document.getElementById("pill-player2");

var mainHeading = document.getElementById("main-heading");
var subtitleText = document.getElementById("subtitle-text");
var rollButton = document.getElementById("roll-button");

// Track rolling state to prevent spam clicking
var isRolling = false;

// --------------------------------------------------------------------------
// 2. Function to Update Dice Values (both CSS & Fallback images)
// --------------------------------------------------------------------------
function setDiceValues(val1, val2) {
  // Update Red CSS Dice via data-value attribute
  if (dice1) dice1.setAttribute("data-value", val1);
  if (dice2) dice2.setAttribute("data-value", val2);

  // Update fallback image elements for backward compatibility
  if (image1) image1.setAttribute("src", "images/dice" + val1 + ".png");
  if (image2) image2.setAttribute("src", "images/dice" + val2 + ".png");
}

// --------------------------------------------------------------------------
// 3. Main Roll Function: Generates random dice and determines the winner
// --------------------------------------------------------------------------
function rollDice() {
  // Generate random numbers between 1 and 6
  var randomNumber1 = Math.floor(Math.random() * 6) + 1;
  var randomNumber2 = Math.floor(Math.random() * 6) + 1;

  // Update dice elements
  setDiceValues(randomNumber1, randomNumber2);

  // Determine winner and update UI
  if (randomNumber1 > randomNumber2) {
    // Player 1 Wins
    mainHeading.innerHTML = "🚩 Player 1 Wins!";
    subtitleText.innerHTML = '<span class="sub-dash">―</span> Better luck next time, Player 2! <span class="sub-dash">―</span>';

    // Highlight Player 1 card
    card1.classList.add("winner-card");
    pill1.classList.add("winner-pill");

    card2.classList.remove("winner-card");
    pill2.classList.remove("winner-pill");
  } 
  else if (randomNumber2 > randomNumber1) {
    // Player 2 Wins
    mainHeading.innerHTML = "Player 2 Wins! 🚩";
    subtitleText.innerHTML = '<span class="sub-dash">―</span> Better luck next time, Player 1! <span class="sub-dash">―</span>';

    // Highlight Player 2 card
    card2.classList.add("winner-card");
    pill2.classList.add("winner-pill");

    card1.classList.remove("winner-card");
    pill1.classList.remove("winner-pill");
  } 
  else {
    // Draw
    mainHeading.innerHTML = "Draw! 🎲";
    subtitleText.innerHTML = '<span class="sub-dash">―</span> What a close match! Roll again to break the tie! <span class="sub-dash">―</span>';

    // Remove winner highlights on draw
    card1.classList.remove("winner-card");
    pill1.classList.remove("winner-pill");
    card2.classList.remove("winner-card");
    pill2.classList.remove("winner-pill");
  }
}

// --------------------------------------------------------------------------
// 4. Refresh / Roll Again Action: Handles roll animation and state
// --------------------------------------------------------------------------
function refresh() {
  // Prevent multiple clicks while animation is running
  if (isRolling) return;
  isRolling = true;

  // Add shaking/rolling animation classes
  if (dice1) dice1.classList.add("rolling");
  if (dice2) dice2.classList.add("rolling");

  if (rollButton) {
    rollButton.classList.add("is-rolling");
    rollButton.disabled = true;
  }

  // Temporary status during roll
  mainHeading.innerHTML = "Rolling... 🎲";
  subtitleText.innerHTML = '<span class="sub-dash">―</span> Tumbling the dice... <span class="sub-dash">―</span>';

  // Quick dice shuffle effect during roll
  var shuffleCount = 0;
  var shuffleInterval = setInterval(function() {
    var temp1 = Math.floor(Math.random() * 6) + 1;
    var temp2 = Math.floor(Math.random() * 6) + 1;
    setDiceValues(temp1, temp2);

    shuffleCount++;
    if (shuffleCount >= 5) {
      clearInterval(shuffleInterval);
    }
  }, 100);

  // Settle on final roll after brief animation (600ms)
  setTimeout(function() {
    // Stop rolling animation
    if (dice1) dice1.classList.remove("rolling");
    if (dice2) dice2.classList.remove("rolling");

    if (rollButton) {
      rollButton.classList.remove("is-rolling");
      rollButton.disabled = false;
    }

    // Determine final values and winner
    rollDice();

    isRolling = false;
  }, 650);
}

// --------------------------------------------------------------------------
// 5. Keyboard Accessibility: Allow rolling with Spacebar or Enter
// --------------------------------------------------------------------------
window.addEventListener("keydown", function(event) {
  if (event.code === "Space" && event.target.tagName !== "BUTTON" && event.target.tagName !== "A") {
    event.preventDefault();
    refresh();
  }
});
