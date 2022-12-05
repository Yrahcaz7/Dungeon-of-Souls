/*  Dungeon of Souls
 *  Copyright (C) 2022 Yrahcaz7
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const id = "Yrahcaz7/Dungeon-of-Souls/save";

function save() {
	if (game) localStorage.setItem(id + "/" + game.saveNum, btoa(JSON.stringify(game)));
	if (global) localStorage.setItem(id + "/master", btoa(JSON.stringify(global)));
};

function load(saveNum = 0) {
	if (saveNum !== 0 && !loaded) {
		console.log("game not finished loading. please wait and try again.");
		return;
	};
	let get = localStorage.getItem(id + "/" + saveNum), reSave = false;
	if (get && atob(get) && JSON.parse(atob(get))) {
		let obj = JSON.parse(atob(get));
		for (let index = 0; index < obj.enemies.length; index++) {
			obj.enemies[index] = new Enemy(undefined, undefined, obj.enemies[index]);
		};
		for (let index = 0; index < obj.deck.length; index++) {
			obj.deck[index] = new Card(obj.deck[index].id, obj.deck[index].level);
		};
		for (let index = 0; index < obj.deckLocal.length; index++) {
			obj.deckLocal[index] = new Card(obj.deckLocal[index].id, obj.deckLocal[index].level);
		};
		for (let index = 0; index < obj.hand.length; index++) {
			obj.hand[index] = new Card(obj.hand[index].id, obj.hand[index].level);
		};
		for (let index = 0; index < obj.discard.length; index++) {
			obj.discard[index] = new Card(obj.discard[index].id, obj.discard[index].level);
		};
		for (let index = 0; index < obj.void.length; index++) {
			obj.void[index] = new Card(obj.void[index].id, obj.void[index].level);
		};
		Object.assign(game, obj);
		if (saveNum !== 0) {
			localStorage.setItem(id + "/" + game.saveNum, localStorage.getItem(id + "/0"));
			game.saveNum = 0;
			save();
		};
	} else if (!get && game) {
		console.log("no local save found. creating new save...");
		reSave = true;
	} else {
		console.warn("the following is not a valid local save: " + get);
		console.log("terminating process.");
	};
	get = localStorage.getItem(id + "/master");
	if (get && atob(get) && JSON.parse(atob(get))) {
		get = JSON.parse(atob(get));
		Object.assign(global, get);
	} else if (!get && global) {
		console.log("no global save found. creating new save...");
		reSave = true;
	} else {
		console.warn("the following is not a valid global save: " + get);
		console.log("terminating process.");
	};
	if (reSave) save();
};

window.onbeforeunload = () => {
	if (loaded) save();
};
