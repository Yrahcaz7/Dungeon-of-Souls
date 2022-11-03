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

function mapPiece(row, attribute = "none") {
	if (attribute == "1stbattle") return ["battle", 0, 0, ["slime_small"], randomInt(25 + (row * 1.5), 50 + (row * 2)), randomCardSet(5)];
	if (attribute == "treasure") return ["treasure", randomInt(-5, 5), randomInt(-5, 5), "closed", randomInt(25 + (row * 1.5), 50 + (row * 2)) * 2, randomCardSet(5)];
	let type = chance()?"battle":false;
	let result = [type, randomInt(-5, 5), randomInt(-5, 5)];
	if (!type) return false;
	if (type == "battle") {
		if (row >= 5) result.push(chance()?["slime_big"]:(chance(7/10)?["slime_big", "slime_small, " + round(0.5 + (row * 0.05), 2)]:["slime_small", "slime_small, " + round(0.75 + (row * 0.05), 2)]));
		else result.push(chance()?["slime_big"]:["slime_small", "slime_small, " + round(0.75 + (row * 0.05), 2)]);
		result.push(randomInt(25 + (row * 1.5), 50 + (row * 2)), randomCardSet(5));
	};
	return result;
};

function pathHasTreasure(coords = "") {
	mapGraphics(true);
	const entries = Object.entries(game.paths);
	let treasure = false;
	const looping = (location = "", first = false) => {
		let loc = location.split(", ");
		if (!first && game.map[loc[0]] && game.map[loc[0]][loc[1]][0] == "treasure") {
			treasure = true;
			return;
		};
		for (let index = 0; index < location.length; index++) {
			for (let ind2 = 0; ind2 < entries.length; ind2++) {
				if (entries[ind2] && entries[ind2][1].includes(location)) looping(entries[ind2][0]);
			};
		};
	};
	looping(coords, true);
	return treasure;
};

function mapRow(row) {
	if (row === 0) return [false, mapPiece(1), mapPiece(1), mapPiece(1), mapPiece(1), false];
	let arr = [mapPiece(row), mapPiece(row), mapPiece(row), mapPiece(row), mapPiece(row), mapPiece(row)];
	if (row > 1) {
		let rand = randomInt(0, 5), past = [];
		while (!(past.includes(0) && past.includes(1) && past.includes(2) && past.includes(3) && past.includes(4) && past.includes(5))) {
			if (pathHasTreasure(row + ", " + rand)) console.log("located treasure at: " + row + ", " + rand);
			if (arr[rand] && !pathHasTreasure(row + ", " + rand)) {
				arr[rand] = mapPiece(row, "treasure");
				break;
			} else {
				if (!past.includes(rand)) past.push(rand);
				rand = randomInt(0, 5);
			};
		};
	};
	return arr;
};
