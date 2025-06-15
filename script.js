function printt() {
  window.print();
}

/**
 * provides a popup notification alert type of thing
 */
/**
 * Creates and displays a temporary alert popup on the page
 * @function alert
 * @description Creates a div element with class 'abs-popup' that serves as an alert popup.
 * The popup includes a close button and automatically disappears after a set duration.
 * If an alert popup already exists, the function does nothing to prevent multiple popups.
 * @example
 * alert();
 * @returns {void}
 */
function alert() {
  const timing = 4000;
  const existingPopup = document.getElementById("alert-popup");
  if (existingPopup) return;

  const popup = document.createElement("div");
  popup.id = "alert-popup";
  popup.className = "abs-popup";
  popup.style.animationDuration = `${timing}ms`;
  popup.innerHTML = `
    alert for 2 sec
    <span class="closeButton" onclick="deletepopup()">+</span>
  `;

  document.getElementById("main").appendChild(popup);
  setTimeout(deletepopup, timing - 300);
}
function deletepopup() {
  if (document.getElementById("alert-popup")) {
    document.getElementById("alert-popup").remove();
  }
}

function removeElem(event) {
  console.log(event.target);
}

function afterLoad() {
  // let elem = document.getElementsByTagName("tbody");
  // console.log(elem[0].children);
  // elem[0].children.forEach((element) => {
  //   element.addEventListener("click", (event) => {
  //     console.log(event.target);
  //   });
  // });
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    afterLoad();
  },
  false
);

function showAddTaskForm() {
  let popup = document.getElementById("popup");
  popup.style.display = "block";
}

function hideAddTaskForm() {
  let popup = document.getElementById("popup");
  popup.style.display = "none";
}
