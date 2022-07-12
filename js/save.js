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
	let proxy = btoa(JSON.stringify(game)), globalProxy = btoa(JSON.stringify(global));
	localStorage.setItem(id + "/" + game.saveNum, proxy);
	localStorage.setItem(id + "/master", globalProxy);
};

function load(saveNum = 0) {
	let get = localStorage.getItem(id + "/" + saveNum);
	if (get) {
		if (typeof get.character != "string") get.character = "" + get.character;
		if (typeof get.health != "number") get.health = +get.health;
		if (typeof get.maxHealth != "number") get.maxHealth = +get.maxHealth;
		if (typeof get.shield != "number") get.shield = +get.shield;
		if (typeof get.maxShield != "number") get.maxShield = +get.maxShield;
		if (typeof get.floor != "number") get.floor = +get.floor;
		if (typeof get.location != "string") get.location = "" + get.location;
		if (typeof get.state != "string") get.state = "" + get.state;
		if (typeof get.turn != "string") get.turn = "" + get.turn;
		if (typeof get.mapSelect != "string") get.mapSelect = "" + get.mapSelect;
		if (typeof get.mapOn != "number") get.mapOn = +get.mapOn;
		if (typeof get.enemyAtt != "string" && !(get.enemyAtt instanceof Object)) get.enemyAtt = "none";
		if (typeof get.enemyAttSel != "number") get.enemyAttSel = +get.enemyAttSel;
		if (typeof get.enemyAttFin != "boolean") get.enemyAttFin = false;
		if (typeof get.energy != "number") get.energy = +get.energy;
		if (typeof get.maxEnergy != "number") get.maxEnergy = +get.maxEnergy;
		if (typeof get.enemyIndex != "number") get.enemyIndex = +get.enemyIndex;
		if (typeof get.enemyNum != "number") get.enemyNum = +get.enemyNum;
		if (typeof get.enemyStage != "string") get.enemyStage = "" + get.enemyStage;
		if (typeof get.deckProxy != "string") get.deckProxy = JSON.stringify(game.deckLocal);
		if (typeof get.deckPos != "number") get.deckPos = +get.deckPos;
		if (typeof get.deckMove != "string") get.deckMove = "" + get.deckMove;
		if (typeof get.handSize != "number") get.handSize = +get.handSize;
		if (typeof get.prevCard != "number") get.prevCard = +get.prevCard;
		if (typeof get.activeCard != "number") get.activeCard = +get.activeCard;
		if (typeof get.discardProxy != "string") get.discardProxy = JSON.stringify(game.discard);
		if (typeof get.auraBlades != "number") get.auraBlades = +get.auraBlades;
		if (typeof get.reinforces != "number") get.reinforces = +get.reinforces;
		if (typeof get.attackEffect != "string") get.attackEffect = "" + get.attackEffect;
		if (typeof get.saveNum != "number") get.saveNum = +get.saveNum;
		Object.assign(game, JSON.parse(atob(get)));
		if (saveNum !== 0) {
			localStorage.setItem(id + "/" + game.saveNum, localStorage.getItem(id + "/0"));
			game.saveNum = 0;
			save();
		};
	};
	get = localStorage.getItem(id + "/master");
	if (get) {
		if (typeof get.options.music != "boolean") get.options.music = true;
		if (typeof get.options.stickyCards != "boolean") get.options.stickyCards = false;
		if (typeof get.charStage.knight != "number") get.charStage.knight = +get.charStage.knight;
		Object.assign(global, JSON.parse(atob(get)));
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

window.onbeforeunload = () => {
	save();
};
