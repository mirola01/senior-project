import * as Auth from "./auth.js";

var faunadb = window.faunadb;
var q = faunadb.query;

export async function updateUI() {
  const auth0 = Auth.getAuth0();
  const isAuthenticated = await auth0.isAuthenticated();
  if (isAuthenticated) {
    const accessToken = await auth0.getTokenSilently();
    const decodedJWT = jwt_decode(accessToken);
    /**
     * Fetch players
     */
    const fauna_key = Auth.getFaunaKey();
    var client = new faunadb.Client({
      secret: fauna_key,
      domain: "db.us.fauna.com",
      port: 443,
      scheme: "https",
    });
    /**
     * Check the role
     */
    let token = await client.query(q.CurrentToken());
    token = token.value.id;

    console.log("token", token);
    let user_role = decodedJWT["https://db.fauna.com/roles"][0];
    console.log("user_role", user_role);

    if (user_role === "user") {
      document.querySelector("#add-new-btn").style.display = "block";

      let players = await fetch("/.netlify/functions/players_by_owner", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ token, userId: decodedJWT["sub"] }),
      });
      console.log("token+userId", token, decodedJWT["sub"])
      players = await players.json();

      const tableBody = document.getElementById("player-table");
      var htmlText = players["data"].map(function (o) {
        /**
         * Create a checkbox input element
         */
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "delete-checkbox"; // Add a class for identification
        checkbox.setAttribute("data-id", o.ref.id); // Set the data-id attribute

        const jerseyNumber = o.data.jersey;
        const playerImage = o.data.imageURL || generateDefaultImage(jerseyNumber);

        /**
         * Create a label element for the checkbox
         */
        const label = document.createElement("label");
        label.htmlFor = o.ref.id; // Match the 'for' attribute to the checkbox's ID
        label.textContent = "Checkbox Label"; // You can customize the label text
        return `
      <tr>
          <td>${o.data.image}</td>
          <td>${o.data.name}</td>
          <td>${o.data.age}</td>
          <td>${o.data.position}</td>
          <td>${o.data.jersey}</td>
          <td><img src="${playerImage}" alt="Player Image" width="50"></td> 
      </tr>`;
      });
      console.log("tableBody:", tableBody);
      tableBody.innerHTML = htmlText.join("");

    } else {
      document.querySelector("#add-new-btn").style.display = "none";
      document.querySelector("#search-bar").style.display = "none";
      let players = await fetch("/.netlify/functions/allPlayers", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      players = await players.json();

      const tableBody = document.querySelector("#player-table");
      var htmlText = players["data"].map(function (o) {
        return `
                    <tr>
                    <td>${o.data.name}</td>
                    <td>${o.data.age}</td>
                    <td>${o.data.position}</td>
                    </tr>`;
      });
      tableBody.innerHTML = htmlText.join("");

    }
  } else {
    console.log("not auth");
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


export function setupTabs() {
  $(".tactical-guide")
    .find("input, textarea")
    .on("keyup blur focus", function (e) {
      var $this = $(this),
        label = $this.prev("label");

      if (e.type === "keyup") {
        if ($this.val() === "") {
          label.removeClass("active-tac highlight");
        } else {
          label.addClass("active-tac highlight");
        }
      } else if (e.type === "blur") {
        if ($this.val() === "") {
          label.removeClass("active-tac highlight");
        } else {
          label.removeClass("highlight");
        }
      } else if (e.type === "focus") {
        if ($this.val() === "") {
          label.removeClass("highlight");
        } else if ($this.val() !== "") {
          label.addClass("highlight");
        }
      }
    });

  $(".tab a").on("click", function (e) {
    e.preventDefault();

    $(this).parent().addClass("active-tac");
    $(this).parent().siblings().removeClass("active-tac");

    target = $(this).attr("href");

    $(".tab-content > div").not(target).hide();

    $(target).fadeIn(600);
  });
}
