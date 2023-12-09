const DEBUG = true;
const API_KEY = "AIzaSyBTRdLtPBljKgNWRsPxJsRe9UoZ02QoUW4";
const PROJECT_ID = "galeria-casamiento";
const FOLDER_ID = "1JyB8CK8gBLgJvQy3i8qwkFGHGHvFRCMi";
const UNLIMITED = 999999999;
const CLIENT_ID =
  "821093500667-fasde3gmgsig80ntcja8iqvrrg0jjuh7.apps.googleusercontent.com";
const SERVICE_MAIL = "galeriaapp@galeria-casamiento.iam.gserviceaccount.com";

let photos = [];
let PageToken = null;

async function Authenticate() {
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredential,
  });
  google.accounts.id.renderButton(document.getElementById("auth_button"), {
    theme: "outline",
    size: "large",
  });
}

function handleCredential(response) {
  const credential = response.credential;
  if (credential) gapi.load("client", InitializeGapi);
  else console.log("No credentials found", response);
}

async function InitializeGapi() {
  gapi.client
    .init({
      apiKey: API_KEY,
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      ],
    })
    .then(
      (response) => {
        GetPhotos();
      },
      (err) => {
        console.log(err);
      }
    );
}

async function GetPhotos(pageToken) {
  gapi.client.load("drive", "v3", () => {
    const files = gapi.client.drive.files.list({
      q: `"${FOLDER_ID}" in parents`,
      fields: "*",
      pageToken: pageToken,
    });
    files.execute((response) => {
      // FlipBook(response.files);
      const grid = document.getElementById("grid");
      for (const file of response.files) {
        let video = false;
        if (file.fullFileExtension === "MOV") {
          video = true;
        }

        let grid_item = document.createElement("div");
        grid_item.className = "grid-item";

        let element = null;

        if (!video) {
          element = document.createElement("img");
          element.src = `https://drive.google.com/uc?id=${file.id}`;
        } else {
          element = document.createElement("video");
          element.src = `https://drive.google.com/uc?id=${file.id}`;
          element.autoplay = true;
          element.muted = true;
          element.loop = true;
        }

        grid_item.appendChild(element);
        grid.appendChild(grid_item);
      }

      if (response.nextPageToken) {
        document
          .getElementById("loader")
          ?.setAttribute("class", "loader-enabled");
        PageToken = response.nextPageToken;
      } else {
        document
          .getElementById("loader")
          ?.setAttribute("class", "loader-disabled");
        PageToken = null;
      }
    });
  });
}

function FlipBook(files) {
  const flipbook = document.getElementById("flipbook");
  for (const file of files) {
    let page = document.createElement("div");
    page.setAttribute(
      "style",
      `background-image: url(https://drive.google.com/uc?id=${file.id})`
    );
    flipbook.appendChild(page);
  }

  $("#flipbook").turn({
    display: "single",
    acceleration: true,
    gradients: !$.isTouch,
    elevation: 50,
    when: {
      turned: function (e, page) {
        /*console.log('Current view: ', $(this).turn('view'));*/
      },
    },
  });

  $(window).bind("keydown", function (e) {
    if (e.keyCode == 37) $("#flipbook").turn("previous");
    else if (e.keyCode == 39) $("#flipbook").turn("next");
  });
}

window.onload = () => {
  document.getElementById("loader").addEventListener("click", () => {
    if (PageToken != null) GetPhotos(PageToken);
  });
  Authenticate();
};
