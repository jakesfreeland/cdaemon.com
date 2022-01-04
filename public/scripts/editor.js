import { init } from "./pell-1.0.6.js";

init ({
  element: document.getElementById("editor"),
  onChange: html => {
    document.getElementById("html-output").textContent = html
  }, 
})
