import * as Auth from "./auth.js";
var faunadb = window.faunadb;
var q = faunadb.query;
// Initialize variables
const accessToken = localStorage.getItem("accessToken");
const decodedJWT = jwt_decode(accessToken);
const fauna_key = Auth.getFaunaKey();
const client = new faunadb.Client({
  secret: fauna_key,
  domain: "db.us.fauna.com",
  port: 443,
  scheme: "https",
});
var loadedPlayers = [];
document.addEventListener("DOMContentLoaded", function () {
  loadFormationFromFaunaDB(); 
});

async function loadFormationFromFaunaDB() {
  const params = new URLSearchParams(window.location.search);
  const formationId = params.get('id');
  console.log("formationId", formationId)
  if (formationId) {
    try {
      let token = await client.query(q.CurrentToken());
      token = token.value.id;
      fetchFormation(token, formationId).then(formations => { // Pass the token here
        displayFormations(formations);
      });
      //wc_team.updateFormation(response.data); // Update the team formation with the data
      renderPlayers(); // Then render the positions
    } catch (error) {
      console.error('Error fetching formation:', error);
    }
  }
}
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

function displayFormations(formationData) {
  console.log("formationData", formationData)
  const formationTitle = formationData.data.name;
  const formationName = formationData.data.formation;
  const players = formationData.data.players;
  console.log("formationName", formationName)
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

wc_team.dragDrap = (function() {
  
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
      body: JSON.stringify({ token, userId: decodedJWT["sub"] }),
    });
    let playersData = await players.json();
    // Store the fetched players in the global variable
    loadedPlayers = playersData.data;
    const positions = { Goalkeeper: [], Defender: [], Midfield: [], Forward: [] };

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
      ul.setAttribute('data-pos', key);

      positions[key].forEach((player) => {
        console.log("key", key, positions[key]);
        const li = document.createElement('li');
        const ul2 = document.createElement('ul');
        const divPlayer = document.createElement('div');
        divPlayer.setAttribute('draggable', 'true');
        divPlayer.setAttribute('data-player', player.data.name);

        const img = document.createElement('img');
        img.setAttribute('draggable', 'false');
        const jerseyNumber = player.data.jersey;
        const playerImage = player.data.imageURL || generateDefaultImage(jerseyNumber);
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


  function renderPositions(formationData) {
    console.log("formationData", formationData);
  
    Object.keys(formationData).forEach((positionGroup) => {
      const positionList = document.querySelector(`.${positionGroup}`);
      const playerNames = formationData[positionGroup];
  
      playerNames.forEach((playerName, index) => {
        const position = positionList.children[index];
        if (playerName !== 'NO_PLAYER') {
          const player = getPlayerByName(playerName);
          if (player) {
            const playerElement = createPlayerElement(player.data);
            position.innerHTML = ''; // Clear any existing content
            position.appendChild(playerElement);
            position.draggable = false;
          }
        } else {
          // Clear any existing content if the player is "NO_PLAYER"
          position.innerHTML = '';
          position.draggable = true;
        }
      });
    });
  }
  function createPlayerElement(playerData) {
    const li = document.createElement('li');
    li.draggable = false; // Player in the formation should not be draggable
    
    const img = document.createElement('img');
    img.src = playerData.imageURL || generateDefaultImage(playerData.jersey);
    img.alt = playerData.name;
    img.draggable = false; // Image should not be draggable
    
    const playerName = document.createElement('p');
    playerName.textContent = playerData.name;
    
    li.appendChild(img);
    li.appendChild(playerName);
    
    return li;
  }
  
  function getPlayerByName(playerName) {
    // Assuming loadedPlayers is a globally accessible array containing player objects
    return loadedPlayers.find(player => player.data.name === playerName);
  }
  
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
