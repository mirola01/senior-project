/**
 * @file Manages the loading, display, and manipulation of soccer team formations.
 * It interacts with FaunaDB to fetch and update formation data based on user interactions.
 */

import * as Auth from "./auth.js";
var faunadb = window.faunadb;
var q = faunadb.query;

// Global variables initialization
const accessToken = localStorage.getItem("accessToken");
const decodedJWT = jwt_decode(accessToken);
const fauna_key = Auth.getFaunaKey();
const client = new faunadb.Client({
  secret: fauna_key,
  domain: "db.us.fauna.com",
  port: 443,
  scheme: "https",
});
let positionsObject = {
  Goalkeeper: [],
  Defender: [],
  Midfield: [],
  Forward: []
};
let formationId;
/**
 * Loads a specific formation from FaunaDB on DOMContentLoaded event.
 * Attaches event listeners for formation selection and player drag-and-drop functionality.
 */
document.addEventListener("DOMContentLoaded", function () {
  renderPlayers();
  loadFormationFromFaunaDB();

  document.getElementById('formationSelector').addEventListener('change', function () {
    const selectedFormation = this.value;
    document.getElementById('starting_11').className = selectedFormation;
    updateFormation(selectedFormation);
    wc_team.dragDrap.init();
  });

});

async function loadFormationFromFaunaDB() {
  const params = new URLSearchParams(window.location.search);
  formationId = params.get('id');
  if (formationId) {
    try {
      let token = await client.query(q.CurrentToken());
      token = token.value.id;
      fetchFormation(token, formationId).then(formations => { // Pass the token here
        displayFormations(formations);
      });
      //wc_team.updateFormation(response.data); // Update the team formation with the data
    } catch (error) {
      console.error('Error fetching formation:', error);
    }
  }
}
/**
 * Fetches a specific formation's details from FaunaDB using the formation's unique ID.
 * 
 * @param {string} token - The FaunaDB access token for the current user.
 * @param {string} formationId - The unique identifier for the formation.
 * @returns {Promise<Object>} A promise that resolves with the formation data.
 */
async function fetchFormation(token, formationId) {
  let formations = await fetch("/.netlify/functions/formation_by_id", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      token, // Use the token here
      formationId: formationId
    }),
  });
  return await formations.json();
}
/**
 * Displays the formations on the user interface.
 * 
 * @param {Object} formationData - The data object containing details of the formation.
 */
function displayFormations(formationData) {
  const formationTitle = formationData.data.name;
  const formationName = formationData.data.formation;
  const players = formationData.data.players;
  const formationSelector = document.getElementById('formationSelector');

  // Find the option with the matching value
  const matchingOption = formationSelector.querySelector(`option[value="${formationName}"]`);
  if (matchingOption) {
    updateFormation(formationName);
    matchingOption.selected = true;
    document.getElementById('starting_11').className = formationName;
    renderPositions(players); // Call renderPositions here with the actual formation data
  }
}

const wc_team = {}; // Initialize wc_team if it doesn't exist
/**
 * A namespace for handling drag-and-drop functionality within the team's formation.
 * @namespace
 */
wc_team.dragDrap = (function () {

  let position;
  let dragSrc;

  const init = () => {
    console.log("Init called");
    const players = document.querySelectorAll(".positions ul");

    players.forEach(player => {
      player.addEventListener("dragstart", dragStart, true);
      player.addEventListener("dragend", dragEnd, false);
    });

    position = document.querySelectorAll('#starting_11 li');

    position.forEach(pos => {
      pos.addEventListener('drop', drop, false);
      pos.addEventListener('dragenter', cancel, false);
      pos.addEventListener('dragover', cancel, false);
    });
  };

  const dragStart = (e) => {
    dragSrc = e;
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.dropEffect = "copy";

    position.forEach(pos => {
      if (e.currentTarget.dataset.pos === pos.dataset.pos) {
        pos.classList.add("highlight");
      }
    });
  };

  const dragStartOver = (e) => {
    dragSrc = e;
    e.dataTransfer.setData("text/html", e.target.innerHTML);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";

    position.forEach(pos => {
      if (e.currentTarget.dataset.pos === pos.dataset.pos) {
        pos.classList.add("highlight");
      }
    });
  };

  const drop = (e) => {
    cancel(e);

    const data = e.dataTransfer.getData("text/html");
    const target = e.currentTarget;
    target.style.opacity = 1;
    if (target.innerHTML !== "") {
      dragReset(target.lastChild.dataset.player);
    }

    if (dragSrc.target.parentNode.id === 'starting_11') {
      const dragSrcClass = dragSrc.target.className;
      const targetClass = target.className;

      dragSrc.target.innerHTML = target.innerHTML;
      dragSrc.target.className = targetClass;

      target.innerHTML = data;
      target.className = dragSrcClass;
    } else {
      target.innerHTML = '<a class="remove"></a>' + data;
      target.classList.add('selected');
      dragSrc.target.draggable = false;
      target.lastChild.setAttribute('draggable', 'false');
    }

    dragEnd();
    target.addEventListener("dragstart", dragStartOver, false);
  };

  const dragEnd = () => {
    position.forEach(pos => {
      pos.classList.remove('highlight');
    });
  };

  const cancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const dragReset = (name) => {
    const player = document.querySelector(`.positions div[data-player="${name}"]`);
    player.draggable = true;
  };

  return {
    init
  };
})();

/**
 * Renders players on the UI based on the formation data.
 */
async function renderPlayers() {
  console.log("renderPositions triggered");
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const decodedJWT = jwt_decode(accessToken);

    const fauna_key = Auth.getFaunaKey();
    var client = new faunadb.Client({
      secret: fauna_key,
      domain: "db.us.fauna.com",
      port: 443,
      scheme: "https",
    });

    let token = await client.query(q.CurrentToken());
    token = token.value.id;

    let players = await fetch("/.netlify/functions/players_by_owner", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        token,
        userId: decodedJWT["sub"]
      }),
    });
    players = await players.json();

    players.data.forEach((player) => {
      const pos = player.data.position;
      if (positionsObject[pos]) {
        positionsObject[pos].push(player);
      }
    });
    const sectionElement = document.querySelector('section');
    Object.keys(positionsObject).forEach((key) => {
      const div = document.createElement('div');
      div.className = 'positions menu';
      div.innerHTML = `<a>${key.toUpperCase()}</a>`;

      const ul = document.createElement('ul');
      ul.setAttribute('data-pos', key);

      positionsObject[key].forEach((player) => {
        console.log("key", key, positionsObject[key]);
        const li = document.createElement('li');
        const ul2 = document.createElement('ul');
        const divPlayer = document.createElement('div');
        divPlayer.setAttribute('draggable', 'true');
        divPlayer.setAttribute('data-player', player.data.name);

        const img = document.createElement('img');
        img.setAttribute('draggable', 'false');
        const jerseyNumber = player.data.jersey;
        const playerImage = player.data.image || generateDefaultImage(jerseyNumber);
        img.setAttribute('src', playerImage);

        const p = document.createElement('p');
        p.textContent = player.data.name;
        ul2.style.display = "flex";
        ul2.style.flexDirection = "column";
        li.style.alignItems = "center";

        divPlayer.appendChild(img);
        li.appendChild(divPlayer);
        ul2.appendChild(li);
        ul2.appendChild(p);
        ul.appendChild(ul2);
      });

      div.appendChild(ul);
      sectionElement.appendChild(div);
    });
    wc_team.dragDrap.init();
  }
}
/**
 * Generates a default image for players using a canvas element.
 * 
 * @param {number} jerseyNumber - The jersey number to display on the default image.
 * @returns {string} - A data URL for the generated image.
 */
function generateDefaultImage(jerseyNumber) {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;

  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = 'gray';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  console.log("Jersey", jerseyNumber)
  ctx.fillText(jerseyNumber, canvas.width / 2, canvas.height / 2);

  // Convert to data URL
  const dataURL = canvas.toDataURL('image/png');

  return dataURL;
}

/**
 * Displays the player positions within a specific formation.
 * 
 * @param {Object} formationData - The data object containing players and their positions.
 */
function renderPositions(formationData) {
  Object.keys(formationData).forEach((positionGroup) => {
    const positionList = document.querySelector(`.${positionGroup}`);
    const playerNames = formationData[positionGroup];
    playerNames.forEach((playerName, index) => {
      const position = positionList.children[index];
      if (playerName !== 'NO_PLAYER') {
        console.log("renderPositions", playerName);
        const player = getPlayerByName(playerName);
        if (player) {
          const playerElement = createPlayerElement(player.data);
          position.innerHTML = ''; // Clear any existing content
          position.appendChild(playerElement);
          position.className = "selected";
          position.style.opacity = 1;

          // Make player non-draggable if they are in the starting 11
          const playerDiv = document.querySelector(`div[data-player="${playerName}"]`);
          if (playerDiv) {
            playerDiv.setAttribute('draggable', 'false');
            console.log(`Player ${playerName} set to not draggable.`);
          }
        }
      } else {
        // Clear any existing content if the player is "NO_PLAYER"
        position.innerHTML = '';
        position.draggable = true;
      }
    });
  });
}
/**
 * Creates an HTML element for a player with the provided data.
 * 
 * @param {Object} playerData - The data object containing the player's details.
 * @returns {HTMLElement} - The constructed player HTML element.
 */
function createPlayerElement(playerData) {
  const divPlayer = document.createElement('div');
  divPlayer.setAttribute('data-player', playerData.name);
  divPlayer.draggable = false; // Player in the formation should not be draggable
  console.log("playerData", playerData)
  const img = document.createElement('img');
  img.src = playerData.image || generateDefaultImage(playerData.jersey);
  img.alt = playerData.name;

  divPlayer.appendChild(img);
  return divPlayer;
}
/**
 * Retrieves player information by name from the positions object.
 * 
 * @param {string} playerName - The name of the player to retrieve.
 * @returns {Object|null} - The player object if found, otherwise null.
 */
function getPlayerByName(playerName) {
  const playerNameNormalized = playerName.trim().toLowerCase();
    console.log("PlayerNormalized", playerNameNormalized)
    for (const group in positionsObject) {
        console.log("PlayerNormalized", playerNameNormalized)
        // Find the player in the current group
        const player = positionsObject[group].find(p => p.data.name.trim().toLowerCase() === playerNameNormalized);
        console.log("player", player)
        // If a player is found, return it immediately
        if (player) {
            return player;
        }
    }
    
    // If no player is found in any group, return null
    return null;
}
/**
 * Updates the UI to reflect a new formation structure when a different formation is selected.
 * 
 * @param {string} formation - The selected formation structure, e.g., "4-4-2".
 */
function updateFormation(formation) {
  const defenders = document.querySelector('.df');
  const midfielders = document.querySelector('.md');
  const forwards = document.querySelector('.fw');

  while (defenders.firstChild) {
    defenders.removeChild(defenders.firstChild);
  }
  while (midfielders.firstChild) {
    midfielders.removeChild(midfielders.firstChild);
  }
  while (forwards.firstChild) {
    forwards.removeChild(forwards.firstChild);
  }

  let defCount, midCount, fwdCount;
  const formationNumbers = formation.split('-').slice(1).map(Number); // "4-4-2" becomes [4, 4, 2]

  [defCount, midCount, fwdCount] = formationNumbers;

  for (let i = 0; i < defCount; i++) {
    const li = document.createElement('li');
    li.id = `pos${i+2}`;
    li.draggable = true;
    defenders.appendChild(li);
  }

  for (let i = 0; i < midCount; i++) {
    const li = document.createElement('li');
    li.id = `pos${i+2+defCount}`;
    li.draggable = true;
    midfielders.appendChild(li);
  }

  for (let i = 0; i < fwdCount; i++) {
    const li = document.createElement('li');
    li.id = `pos${i+2+defCount+midCount}`;
    li.draggable = true;
    forwards.appendChild(li);
  }
  wc_team.dragDrap.init();
}

/**
 * Updates the current lineup in FaunaDB with the changes made on the UI.
 */
async function updateLineup() {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    const decodedJWT = jwt_decode(accessToken);
    const fauna_key = Auth.getFaunaKey();
    var client = new faunadb.Client({
      secret: fauna_key,
      domain: 'db.us.fauna.com',
      port: 443,
      scheme: 'https'
    });

    // Get selected formation from the dropdown
    const selectedFormation = document.querySelector('#formationSelector').value;

    // Initialize object to hold player positions based on the selected formation
    let playersInFormation = {};

    if (selectedFormation === 'formation-4-4-2') {
      playersInFormation = {
        "gk": ["NO_PLAYER"],
        "df": ["NO_PLAYER", "NO_PLAYER", "NO_PLAYER", "NO_PLAYER"],
        "md": ["NO_PLAYER", "NO_PLAYER", "NO_PLAYER", "NO_PLAYER"],
        "fw": ["NO_PLAYER", "NO_PLAYER"]
      };
    } else if (selectedFormation === 'formation-4-3-3') {
      playersInFormation = {
        "gk": ["NO_PLAYER"],
        "df": ["NO_PLAYER", "NO_PLAYER", "NO_PLAYER", "NO_PLAYER"],
        "md": ["NO_PLAYER", "NO_PLAYER", "NO_PLAYER"],
        "fw": ["NO_PLAYER", "NO_PLAYER", "NO_PLAYER"]
      };
    } else if (selectedFormation === 'formation-3-5-2') {
      playersInFormation = {
        "gk": ["NO_PLAYER"],
        "df": ["NO_PLAYER", "NO_PLAYER", "NO_PLAYER"],
        "md": ["NO_PLAYER", "NO_PLAYER", "NO_PLAYER", "NO_PLAYER", "NO_PLAYER"],
        "fw": ["NO_PLAYER", "NO_PLAYER"]
      };
    }
    try {
      // Extract players from the HTML
      const playerElements = document.querySelectorAll('li');
      playerElements.forEach((element) => {
        const position = element.parentNode.className; // Getting the class of the parent <ul>, which should indicate the position (gk, df, md, fw)
        const index = Array.from(element.parentNode.children).indexOf(element); // Getting the index of the li inside its parent ul
        const playerName = element.querySelector('div') ? element.querySelector('div').getAttribute('data-player') : "NO_PLAYER";
        if (playersInFormation[position]) {
          playersInFormation[position][index] = playerName;
        }
      });
      console.log("Formation", playersInFormation)

      let data = await client.query(
        q.Update(q.Ref(q.Collection('Formation'), formationId), {
          data: {
            name: document.querySelector('.titleFormation').textContent,
            formation: selectedFormation,
            players: playersInFormation, // Saving the players in each position
            owner: decodedJWT['sub']
          }
        })
      );

      console.log("Formation", data);
    } catch (err) {
      console.error('Error:', err);
    }
  }
}



/**
 * Clears the current lineup from the UI, resetting all positions to their default state.
 */
async function clearLineup() {
  // Select player slots within the 'starting_11' div
  const playerElements = document.querySelectorAll('#starting_11 li');

  // Clear the content of each player slot
  playerElements.forEach((element) => {
    element.innerHTML = ''; // Remove any inner HTML (e.g., player names, icons, etc.)

    if (element.classList.contains('selected')) {
      element.classList.remove('selected'); // Remove 'selected' class if present
    }
    element.style.opacity = 0.4;
  });
  // Select all player divs
  const playerDivs = document.querySelectorAll('.positions div');

  // Loop through each player div and set draggable to true
  playerDivs.forEach(div => {
    div.draggable = true;
  });

  wc_team.dragDrap.init();
}

// Event listeners for the 'Save Lineup' and 'Clear Lineup' buttons.
document.querySelector('.update-lineup').addEventListener('click', updateLineup);
document.querySelector('.clear-lineup').addEventListener('click', clearLineup);