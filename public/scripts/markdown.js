import * as markdown from "/scripts/markdown-wasm/markdown.es.js";
import DOMPurify from '/scripts/dompurify/purify.es.js';
await markdown.ready;

const bodyMarkDown = document.getElementById("body-md");
const bodyHTML = document.getElementById("body-html");
const bodyPreview = document.getElementById("body-preview");

bodyMarkDown.addEventListener("input", () => {
  let html = DOMPurify.sanitize(markdown.parse(bodyMarkDown.value));
  bodyHTML.value = html;
  bodyPreview.innerHTML = html;
})