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

function randomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	if ((!min && min !== 0) || (!max && max !== 0)) return NaN;
	if (min > max) [min, max] = [max, min];
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

function chance(chance = 0.5) {
	return Math.random()<chance;
};

function round(number, places = 0) {
	places = 10 ** places;
	return Math.round(number * places) / places;
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
	localStorage.removeItem("Yrahcaz7/Dungeon-of-Souls/save/0");
	game = null;
	location.reload();
};
