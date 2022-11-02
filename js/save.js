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
	let get = localStorage.getItem(id + "/" + saveNum);
	if (get && atob(get) && JSON.parse(atob(get))) {
		let obj = JSON.parse(atob(get));
		for (let index = 0; index < obj.enemies.length; index++) {
			obj.enemies[index] = new Enemy(undefined, undefined, obj.enemies[index]);
		};
		Object.assign(game, obj);
		if (saveNum !== 0) {
			localStorage.setItem(id + "/" + game.saveNum, localStorage.getItem(id + "/0"));
			game.saveNum = 0;
			save();
		};
	} else {
		console.warn("the following is not a valid local save: " + get);
		console.log("terminating process.");
	};
	get = localStorage.getItem(id + "/master");
	if (get && atob(get) && JSON.parse(atob(get))) {
		get = JSON.parse(atob(get));
		Object.assign(global, get);
	} else {
		console.warn("the following is not a valid global save: " + get);
		console.log("terminating process.");
	};
};

window.onbeforeunload = () => {
	save();
};
