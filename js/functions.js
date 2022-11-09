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

// prototype functions

String.prototype.title = function() {
	let result = "";
	for (let num = 0; num < this.length; num++) {
		if (num == 0 || this.charAt(num - 1) == " " || this.charAt(num - 1) == "\n") result += this.charAt(num).toUpperCase();
		else result += this.charAt(num);
	};
	return result;
};

// technical functions

function chance(chance = 0.5) {
	return Math.random()<chance;
};

function randomize(array) {
	let index = array.length, randomIndex;
	while (index != 0) {
		randomIndex = Math.floor(Math.random() * index);
		index--;
		[array[index], array[randomIndex]] = [array[randomIndex], array[index]];
	};
	return array;
};

// reset functions

function hardReset() {
	for (let index = 0; index < localStorage.length; index++) {
		const key = localStorage.key(index);
		if (key.startsWith("Yrahcaz7/Dungeon-of-Souls/save/")) {
			localStorage.removeItem(key);
		};
	};
	game = null;
	global = null;
	location.reload();
};

function restartRun() {
	localStorage.removeItem("Yrahcaz7/Dungeon-of-Souls/save/0");
	game = null;
	location.reload();
};

// gameplay functions

function shuffleDeck(...newCards) {
	if (newCards) {
		for (let card of newCards) {
			if (card instanceof Object) game.deckLocal.push(card);
			else game.deckLocal.push(new Card("" + card));
		};
	};
	game.deckLocal = randomize(game.deckLocal);
};

function drawHand() {
	let index = 0, len = game.deckLocal.length;
	if (game.deckLocal.length) {
		for (; index < game.handSize && index < len; index++) {
			game.hand.push(game.deckLocal[0]);
			game.deckLocal.splice(0, 1);
		};
	};
	if (index != game.handSize) {
		len = game.discard.length;
		for (let a = 0; a < len; a++) {
			game.deckLocal.push(game.discard[a]);
		};
		game.discard = [];
		shuffleDeck();
		len = game.deckLocal.length;
		for (; index < game.handSize && index < len; index++) {
			game.hand.push(game.deckLocal[0]);
			game.deckLocal.splice(0, 1);
		};
	};
};
