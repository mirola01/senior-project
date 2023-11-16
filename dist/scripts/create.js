/**
 * @file This module handles the user interactions for creating and managing a soccer team formation.
 * It allows users to drag and drop players into positions, save their lineup, and clear it.
 * It uses Auth0 for authentication and FaunaDB as the backend service.
 */

import * as Auth from "./auth.js";
var faunadb = window.faunadb;
var q = faunadb.query;

/**
 * Initializes drag and drop functionality and renders positions on DOMContentLoaded.
 */
document.addEventListener("DOMContentLoaded", function () {
  renderPositions();
  const formationSelector = document.getElementById("formationSelector");
  const startingEleven = document.getElementById("starting_11");

  document.getElementById('formationSelector').addEventListener('change', function () {
    const selectedFormation = this.value;
    document.getElementById('starting_11').className = selectedFormation;
    updateFormation(selectedFormation);
    makePlayersDraggable();
    wc_team.dragDrap.init();
  });

  /**
   * Updates the field with player positions according to the selected formation.
   * It first clears the current player positions and then creates new positions
   * based on the formation chosen. Each position is represented by a list item
   * (`<li>`) element that is made draggable.
   * 
   * @param {string} formation - The selected formation in a 'X-X-X' string format, 
   * where X indicates the number of players in each row on the field.
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
  }
  wc_team.dragDrap.init();

});

/**
 * A namespace for handling drag and drop functionality of the team's formation.
 * @namespace
 */
const wc_team = {}; // Initialize wc_team if it doesn't exist

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
 * Makes player divs draggable.
 */
function makePlayersDraggable() {
  // Select all player divs
  const playerDivs = document.querySelectorAll('.positions div');

  // Loop through each player div and set draggable to true
  playerDivs.forEach(div => {
    div.draggable = true;
  });
}

async function renderPositions() {
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



    const positions = {
      Goalkeeper: [],
      Defender: [],
      Midfield: [],
      Forward: []
    };

    players.data.forEach((player) => {
      const pos = player.data.position;
      if (positions[pos]) {
        positions[pos].push(player);
      }
    });
    console.log(positions)
    const sectionElement = document.querySelector('section');
    Object.keys(positions).forEach((key) => {
      const div = document.createElement('div');
      div.className = 'positions menu';
      div.innerHTML = `<a>${key.toUpperCase()}</a>`;
  
      const ul = document.createElement('ul');
      ul.className = 'scrollable-menu'; // Add a class for styling
      ul.setAttribute('data-pos', key);
  
      positions[key].forEach((player) => {
        const li = document.createElement('li');
        const divPlayer = document.createElement('div');
        divPlayer.className = 'player-container'; // Add a class for styling
        divPlayer.setAttribute('draggable', 'true');
        divPlayer.setAttribute('data-player', player.data.name);
  
        const img = document.createElement('img');
        img.setAttribute('src', player.data.image || generateDefaultImage(player.data.jersey));
        img.setAttribute('draggable', 'false');
  
        const p = document.createElement('p');
        p.className = 'player-name'; // Add a class for styling
        p.textContent = player.data.name;
  
        divPlayer.appendChild(img);
        divPlayer.appendChild(p); // Append p inside divPlayer
        li.appendChild(divPlayer);
        ul.appendChild(li);
      });
  
      div.appendChild(ul);
      sectionElement.appendChild(div);
    });
    wc_team.dragDrap.init();
  }
}
/**
 * Generates a default image for a player using their jersey number.
 * @param {number} jerseyNumber - The jersey number of the player.
 * @returns {string} The data URL of the generated image.
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
 * Saves the current lineup into the FaunaDB.
 * This function captures the current formation and player positions from the UI and persists it in the database.
 */
async function saveLineup() {
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
        q.Create(q.Collection('Formation'), {
          data: {
            name: document.querySelector('.titleFormation').textContent,
            formation: selectedFormation,
            players: playersInFormation, // Saving the players in each position
            owner: decodedJWT['sub']
          }
        })
      ).then((ret) => console.log(ret))
      .catch((err) => console.error('Error:', err));
  }
}

/**
 * Clears the current lineup from the UI.
 * This function removes all players from their positions and resets the lineup.
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

  makePlayersDraggable();
  wc_team.dragDrap.init();
}


// Event listener for the 'Save Lineup' and 'Clear Lineup' buttons.
document.querySelector('.save-lineup').addEventListener('click', saveLineup);
document.querySelector('.clear-lineup').addEventListener('click', clearLineup);