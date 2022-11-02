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
	let proxy = btoa(JSON.stringify(game)), globalProxy = btoa(JSON.stringify(global));
	localStorage.setItem(id + "/" + game.saveNum, proxy);
	localStorage.setItem(id + "/master", globalProxy);
};

function load(saveNum = 0) {
	let get = localStorage.getItem(id + "/" + saveNum);
	if (get) {
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
	};
	get = localStorage.getItem(id + "/master");
	if (get) {
		get = JSON.parse(atob(get));
		if (typeof get.options.music != "boolean") get.options.music = true;
		if (typeof get.options.stickyCards != "boolean") get.options.stickyCards = false;
		if (typeof get.charStage.knight != "number") get.charStage.knight = +get.charStage.knight;
		Object.assign(global, get);
	};
};

window.onbeforeunload = () => {
	save();
};
