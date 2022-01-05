import snarkdown from "/scripts/snarkdown-2.0.0.es.js";

let $ = document.querySelector.bind(document);

function run() {
	let html = snarkdown($('#body-md').value);
	$('#body-preview').innerHTML = html;
	$('#body-html').textContent = html;
}

$('#body-md').oninput = run;

run();
