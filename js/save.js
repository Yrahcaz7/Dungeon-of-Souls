/*
    Dungeon of Souls
    Copyright (C) 2022 Yrahcaz7

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

const id = "Yrahcaz7/Dungeon-of-Souls/save";

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
	const txt = document.createElement("textarea");
	txt.value = str;
	document.body.appendChild(txt);
	txt.focus();
    txt.select();
	document.execCommand("copy");
	document.body.removeChild(txt);
};

function importSave() {
	Object.assign(game, JSON.parse(atob(prompt("Paste your save here:"))));
	save();
	window.location.reload();
};

window.onbeforeunload = () => {save()};
