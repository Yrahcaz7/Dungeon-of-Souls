const id = 'Yrahcaz7/Dungeon-of-Souls/save';

function save() {
	localStorage.setItem(id, btoa(JSON.stringify(game)));
};

function load() {
	let get = localStorage.getItem(id);
	if (get !== null || get !== undefined) {
		Object.assign(game, JSON.parse(atob(get)));
	};
};

function exportSave() {
	let str = btoa(JSON.stringify(game));
	const txt = document.createElement('textarea');
	txt.value = str;
	document.body.appendChild(txt);
	txt.focus();
    txt.select();
	document.execCommand('copy');
	document.body.removeChild(txt);
};

function importSave() {
	Object.assign(game, JSON.parse(atob(prompt('Paste your save here:'))));
	save();
	window.location.reload();
};

window.onbeforeunload = () => {save()};
