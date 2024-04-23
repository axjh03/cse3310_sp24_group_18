const socket = new WebSocket("ws://localhost:9180");

document.addEventListener("DOMContentLoaded", function() {
  setupEventListeners();
});
function setupEventListeners() {
  // Login form submission event
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
      loginForm.addEventListener("submit", function(event) {
          event.preventDefault(); // Prevent form submission
          const username = document.getElementById("username").value;
          connectWebSocket(username);
          updateGameTable([]);
          socket.send("section1");
      });
  }

  // Game reset event
  const resetGameButton = document.getElementById('resetGame');
  if (resetGameButton) {
      resetGameButton.addEventListener('click', function() {
          console.log("[RESETING ALL GAMES] \n Resetting the game");
          socket.send('reset_game:' + 'gameroom1');
          socket.send('reset_game:' + 'gameroom2');
          socket.send('reset_game:' + 'gameroom3');
          socket.send('reset_game:' + 'gameroom4');
          socket.send('reset_game:' + 'gameroom5');
      });
  }

  // Setup color pickers and grid cells for each game room
  setupColorPickersAndGrid();
}

function setupColorPickersAndGrid() {
  const gameRooms = ['gameroom1', 'gameroom2', 'gameroom3', 'gameroom4', 'gameroom5'];
  gameRooms.forEach(roomId => {
      const player1ColorPicker = document.getElementById(`player1-color-${roomId}`);
      const player2ColorPicker = document.getElementById(`player2-color-${roomId}`);
      const gridCells = document.querySelectorAll(`#${roomId} .game-grid td`);

      if (player1ColorPicker && player2ColorPicker && gridCells.length > 0) {
          let player1Color = player1ColorPicker.value;
          let player2Color = player2ColorPicker.value;

          player1ColorPicker.addEventListener("change", () => {
              player1Color = player1ColorPicker.value;
          });

          player2ColorPicker.addEventListener("change", () => {
              player2Color = player2ColorPicker.value;
          });

          gridCells.forEach(cell => {
              cell.addEventListener("click", function() {
                  // Placeholder for determining current player (you will need actual logic here)
                  const currentPlayer = determineCurrentPlayer();
                  if (currentPlayer === 1) {
                      this.style.backgroundColor = player1Color;
                  } else if (currentPlayer === 2) {
                      this.style.backgroundColor = player2Color;
                  }
                  this.classList.add('selected');
              });
          });
      }
  });
}

function updateGrid(roomId, gridJson) {
  let gridData = JSON.parse(gridJson);
  let gridHtml = formatGridHtml(gridData);
  document.getElementById(`${roomId}_grid`).innerHTML = gridHtml;
}

function formatGridHtml(grid) {
  let html = '<table class="game-grid">';
  grid.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
          html += `<td>${cell}</td>`;
      });
      html += '</tr>';
  });
  html += '</table>';
  return html;
}

function updatePlayerList(playerNamesJSON) {
  const playerNames = JSON.parse(playerNamesJSON);
  const playerList = document.getElementById("playerList");
  playerList.innerHTML = ""; // Clear previous entries

  playerNames.forEach((player) => {
    let playerItem = document.createElement("li");
    playerItem.textContent = player; // Set the text to the player's name
    playerList.appendChild(playerItem);
  });
}

// showGameRoom function to show the game room
function showGameRoom(roomId, player, opponent) {
  document.getElementById(roomId + "_player").textContent = player;
  document.getElementById(roomId + "_opponent").textContent = opponent;
  showSection(roomId); // Shows the appropriate game room

}



function updateGameTable(gameRooms) {
  const tbody = document.getElementById("gameTableBody");
  tbody.innerHTML = ""; // Clear existing content

  gameRooms.forEach((room) => {
    let row = tbody.insertRow();
    let cellRoom = row.insertCell(0);
    let cellPlayers = row.insertCell(1);
    let cellJoin = row.insertCell(2);

    cellRoom.textContent = room.name;
    cellPlayers.textContent = room.players;

    let joinButton = document.createElement("button");
    joinButton.textContent = "Join";
    joinButton.id = "join_" + room.name; // Unique ID for button
    joinButton.addEventListener("click", function () {
      socket.send("join_game:" + room.name);
    });
    cellJoin.appendChild(joinButton);
  });
}

// function toggleGridVisibility(roomId) {
//   const gridElement = document.getElementById(`${roomId}_grid`);
//   if (gridElement) {
//     gridElement.classList.toggle("hidden");
//   } else {
//     console.error("No grid element found for room ID:", roomId);
//   }
// }


function updateWords(roomId, words) {
  const wordsListHtml = words.map((word) => `<li>${word}</li>`).join("");
  const wordsElement = document.getElementById(`${roomId}_words`);
  if (wordsElement) {
    wordsElement.innerHTML = wordsListHtml;
  } else {
    console.error("No words element found for room ID:", roomId);
  }
}

function updateLoggedInUser(username) {
  // Query all elements that could contain the username and update them.
  document.querySelectorAll(".currentUsername").forEach(function (span) {
    span.textContent = username;
  });
  console.log("Logged in user updated: ", username);
}
// connect and send the username to the server
function connectWebSocket(username) {
  console.log("Attempting to add new player");
  // Send the username to the server
  try {
    socket.send("new_player:" + username);
    console.log("New player added: ", username);
  } catch (error) {
    console.log("Error adding new player: ", error);
  }
}

socket.onopen = function (event) {
  console.log("WebSocket connection established");
};



// CHAT

function sendChatMessage(roomId) {
  const input = document.getElementById(roomId + '_chat_input');
  const usernameSpan = document.querySelector('.currentUsername'); // Adjust selector as needed
  const username = usernameSpan.textContent; // Or use .value if it’s an input field
  const message = input.value.trim();

  if (message) {
      const fullMessage = username + ": " + message; // Combine username with message
      socket.send(`chat:${roomId}:${fullMessage}`);
      input.value = '';  // Clear the input after sending
  }
}

function updateChat(roomId, message) {
  const chatBox = document.getElementById(roomId + '_chat');
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  chatBox.appendChild(messageDiv);
}


function appendChatMessage(roomId, message) {
  const chatBox = document.getElementById(roomId + '_chat');
  if (chatBox) {
      const messageDiv = document.createElement('div');
      messageDiv.textContent = message; // Set the message text
      chatBox.appendChild(messageDiv); // Append the new div to the chat box
  } else {
      console.error("Chat box not found for room:", roomId);
  }
}


socket.onmessage = function (event) {
  const sectionToShow = event.data;
  // Use a switch case to determine which section to show

  console.log("Received message:", event.data);

  const data = event.data.split(":");
  const command = data[0];
  const content = data.slice(1).join(":"); // Ensure all content after the first colon is included

  switch (command) {
    case "update_grid":
            const roomId = data[1];
            const gridJson = data.slice(2).join(":"); // Assuming grid data is sent as JSON
            updateGrid(roomId, gridJson);
            break;

    case "chat_update":
      if (data.length >= 3) {
        const roomId = data[1];
        const message = data.slice(2).join(":");
        appendChatMessage(roomId, message);
      }
      break;

    case "update_players":
      const username = content;
      console.log("Updating player list with data:", content);
      updatePlayerList(username); // Handle updated player list
      console.log(
        "[switch: command (update_players)] Received data:",
        event.data
      );
      console.log(
        "[switch: command (update_players)] Received command:",
        command
      );
      break;

    case "update_gameRooms":
      console.log("RECIEVED GAMEROOM UPDATE REQUEST [update_gameRooms]");
      const gameRooms = JSON.parse(content);
      console.log("Updating game rooms with data:", gameRooms);
      updateGameTable(gameRooms);
      break;


      case "chat_update":
        if (data.length >= 3) {
            const roomId = data[1];
            const message = data[2];
            const chatBox = document.getElementById(roomId + '_chat');
            chatBox.innerHTML += '<div>' + message + '</div>'; // Append new message
        }
        break;

    case "update_words":
      if (data.length >= 3) {
        const roomId = data[1];
        const words = JSON.parse(data.slice(2).join(":")); // Joining back the rest of the message
        updateWords(roomId, words);
      }
      break;

    case "start_game":
      // Extracted room ID, player, and opponent names
      const room = data[1];
      const player = data[2];
      const opponent = data[3];
      // Show the game room with updated player and opponent info
      showGameRoom(room, player, opponent);
      // Additionally, show the grid and words for this game room
      showSection(room);
      break;

    case "player_added":
      try {
        const username = content;
        updateLoggedInUser(username);
      } catch (error) {
        console.log("Error updating logged in user: ", error);
        break;
      }

      break;
    default:
      console.log("no such command [update_players]", command);
      break;
  }

  switch (sectionToShow) {
    case "section0":
      showSection("section0");
      console.log("section0");
      break;
    case "section1":
      showSection("section1");
      console.log("From the switch case :section1");
      break;
    case "section2":
      showSection("section2");
      console.log("From the switch case :section2");
      // Add any additional logic for section2 button clicks here
      break;
    case "section3":
      showSection("section3");
      console.log("From the switch case :section3");
      // Add any additional logic for section3 button clicks here
      break;
    case "gameroom1":
      showSection("gameroom1");
      console.log("From the switch case :gameroom1");
      // Add any additional logic for gameroom1 button clicks here
      break;

    case "gameroom2":
      console.log("From the switch case :gameroom2");
      showSection("gameroom2");
      // Add any additional logic for gameroom2 button clicks here
      break;

    case "gameroom3":
      console.log("From the switch case :gameroom3");
      showSection("gameroom3");
      // Add any additional logic for gameroom3 button clicks here
      break;

    case "gameroom4":
      console.log("From the switch case :gameroom4");
      showSection("gameroom4");
      // Add any additional logic for gameroom4 button clicks here
      break;

    // if new player added then console.log player and username
    case "player_added":
      const player = event.data;
      console.log("New player added: ", player);
      break;
    case "player_not_added":
      console.log("Player not added");
      break;
    default:
      console.log("No such section exists", sectionToShow);
      break;
  }
};

socket.onerror = function (event) {
  console.error("WebSocket error observed:", event);
};

socket.onclose = function (event) {
  console.log("WebSocket connection closed", event.code, event.reason);
};


function showSection(sectionId) {
  console.log("Showing section:", sectionId); // Debug: Log which section is being shown
  // Hide all sections
  document
    .querySelectorAll("div[id^='section'], div[id^='gameroom']")
    .forEach((div) => {
      div.classList.add("hidden");
    });

  // Show the current section
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.remove("hidden");
  } else {
    console.error("No section found with ID:", sectionId);
  }

  // If the section is a game room, also remove the hidden class from its grid, word list, and chat area
  if (sectionId.startsWith("gameroom")) {
    const grid = document.getElementById(sectionId + "_grid");
    const words = document.getElementById(sectionId + "_words");
    const chatArea = document.getElementById(sectionId + "_chat");
    if (grid && words && chatArea) {
      grid.classList.remove("hidden");
      words.classList.remove("hidden");
      chatArea.classList.remove("hidden");
    }
  }
}