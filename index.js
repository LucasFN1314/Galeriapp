import { FILES } from "./files.js";

const PER_PAGE = 50;
const LOADER = document.getElementById("loader");
const GRID = document.getElementById("grid");

let INDEX = 0;
let processed = 0;

async function Load() {
  LOADER.classList = ["loader-disabled"];
  processed = 0;
  LOADER.setAttribute("class", "loader-disabled");
  await AddPlaceholders();
  AddElements();
}

function AddPlaceholders() {
  return new Promise((resolve) => {
    for (let index = 0; index < PER_PAGE; index++) {
      let element = document.createElement("div");
      element.classList = ["grid-item placeholder"];
      GRID.appendChild(element);
    }
    resolve();
  });
}

async function AddElements() {
  for (let index = 0; index < PER_PAGE; index++) {
    let image = new Image();
    image.src = FILES[INDEX];

    let video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;

    image.onload = () => {
      processed++;
      Append(image);
    };

    image.onerror = () => {
      video.src = FILES[INDEX];
      video.onloadeddata = () => {
        Append(video);
      };
      video.onerror = () => {
        processed++;
        Verify();
      };
    };

    function Append(element) {
      let placeholder = document.getElementsByClassName("placeholder")?.[0];
      placeholder.classList = ["grid-item"];
      placeholder.appendChild(element);
      Verify();
    }

    INDEX++;
  }
}

function Verify() {
  if (processed === PER_PAGE) {
    console.log("All processed");
    let placeholders = document.getElementsByClassName("placeholder");
    for (const placeholder of placeholders) {
      placeholder.remove();
    }

    if (INDEX < FILES.length) LOADER.classList = ["loader-enabled"];
  }
}

window.onload = () => {
  LOADER.addEventListener("click", () => {
    Load();
  });
  Load();
};
