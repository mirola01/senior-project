import * as Auth from "./auth.js";
var faunadb = window.faunadb;
var q = faunadb.query;

window.onload = function() {
  console.log("window.onload triggered");
  renderPositions();
};

const wc_team = {}; // Initialize wc_team if it doesn't exist

wc_team.dragDrap = (function() {
  
  let position;
  let dragSrc;
  
  const init = () => {
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
      body: JSON.stringify({ token, userId: decodedJWT["sub"] }),
    });
    players = await players.json();

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

        divPlayer.appendChild(img);
        divPlayer.appendChild(p);
        li.appendChild(divPlayer);
        ul.appendChild(li);
      });

      div.appendChild(ul);
      console.log("div", div);
      sectionElement.appendChild(div);
    });
    console.log("final");
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