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

var death_zones = 0, rowFalses = 0, rowNodes = 0;

function weaker(row) {
	return ", " + Math.round(0.5 + (row * 0.05), 2);
};

function mapPiece(row, attribute = "none") {
	if (attribute == "1stbattle") return ["battle", 0, 0, ["slime_small"], randomInt(25 + (row * 1.5), 50 + (row * 2)), randomCardSet(5)];
	if (attribute == "treasure") return ["treasure", randomInt(-5, 5), randomInt(-5, 5), "closed", randomInt(25 + (row * 1.5), 50 + (row * 2)) * 2, randomCardSet(5)];
	if (attribute == "prime") return ["battle_prime", 0, 0, ["slime_small" + weaker(row), "slime_prime", "slime_small" + weaker(row)], randomInt(25 + (row * 1.5), 50 + (row * 2)) * 2, randomCardSet(5)];
	let type = chance(3/5)?"battle":false;
	if (rowFalses >= 4 || (row == 0 && rowFalses >= 2)) type = "battle";
	if (type) rowNodes++;
	else rowFalses++;
	if (!type || rowNodes == 6) return false;
	let result = [type, randomInt(-5, 5), randomInt(-5, 5)];
	if (type == "battle") {
		if (row >= 5) result.push(chance()?["slime_big"]:(chance(7/10)?["slime_big", "slime_small" + weaker(row)]:["slime_small", "slime_small"]));
		else result.push(chance()?["slime_big"]:["slime_small", "slime_small" + weaker(row)]);
		result.push(randomInt(25 + (row * 1.5), 50 + (row * 2)), randomCardSet(5));
	};
	return result;
};

function pathHasSpecial(coords = "", front = false) {
	const entries = Object.entries(game.paths);
	let boolean = false;
	const looping = front ? (location = "", first = false) => {
		let loc = location.split(", ");
		if (!first && game.map[loc[0]] && (game.map[loc[0]][loc[1]][0] == "treasure" || game.map[loc[0]][loc[1]][0] == "battle_prime")) {
			boolean = true;
			return;
		};
		for (let index = 0; index < game.paths[location].length; index++) {
			if (game.paths[game.paths[location][index]]) looping(game.paths[location][index]);
		};
	} : (location = "", first = false) => {
		let loc = location.split(", ");
		if (!first && game.map[loc[0]] && (game.map[loc[0]][loc[1]][0] == "treasure" || game.map[loc[0]][loc[1]][0] == "battle_prime")) {
			boolean = true;
			return;
		};
		for (let index = 0; index < location.length; index++) {
			for (let ind2 = 0; ind2 < entries.length; ind2++) {
				if (entries[ind2] && entries[ind2][1].includes(location)) looping(entries[ind2][0]);
			};
		};
	};
	looping(coords, true);
	return boolean;
};

function mapRow(row) {
	rowFalses = 0;
	rowNodes = 0;
	if (row === 0) return [false, mapPiece(0), mapPiece(0), mapPiece(0), mapPiece(0), false];
	let arr = [mapPiece(row), mapPiece(row), mapPiece(row), mapPiece(row), mapPiece(row), mapPiece(row)];
	if (row > 1) {
		game.map.push(arr);
		mapGraphics(true);
		game.map.pop();
		let rand = randomInt(0, 5), past = [];
		const setRand = () => {
			rand = randomInt(0, 5);
			if (past.includes(rand)) setRand();
		};
		while (past.length < 6) {
			if (arr[rand] && !pathHasSpecial(row + ", " + rand)) {
				arr[rand] = mapPiece(row, "treasure");
				break;
			} else {
				if (!past.includes(rand)) past.push(rand);
				if (past.length < 6) setRand();
			};
		};
		if (row >= 3 && death_zones < 2) {
			rand = randomInt(0, 5);
			past = [];
			while (past.length < 6) {
				if (arr[rand] && arr[rand][0] != "treasure" && !pathHasSpecial(row + ", " + rand)) {
					arr[rand] = mapPiece(row, "prime");
					death_zones++;
					break;
				} else {
					if (!past.includes(rand)) past.push(rand);
					if (past.length < 6) setRand();
				};
			};
		};
	};
	return arr;
};

function generateMap() {
	game.map = [];
	death_zones = 0;
	for (let index = 0; index < 8; index++) {
		game.map.push(mapRow(index));
	};
	if (death_zones === 0) {
		let rand = randomInt(0, 5), past = [];
		const setRand = () => {
			rand = randomInt(0, 5);
			if (past.includes(rand)) setRand();
		};
		while (past.length < 6) {
			if (game.map[2][rand] && game.map[2][rand][0] != "treasure" && !pathHasSpecial("2, " + rand, true)) {
				game.map[2][rand] = mapPiece(2, "prime");
				death_zones++;
				break;
			} else {
				if (!past.includes(rand)) past.push(rand);
				if (past.length < 6) setRand();
			};
		};
		if (death_zones === 0) {
			rand = randomInt(0, 5);
			past = [];
			while (past.length < 6) {
				if (game.map[3][rand] && game.map[3][rand][0] == "treasure" && !pathHasSpecial("3, " + rand, true)) {
					game.map[3][rand] = mapPiece(3, "prime");
					death_zones++;
					break;
				} else {
					if (!past.includes(rand)) past.push(rand);
					if (past.length < 6) setRand();
				};
			};
		};
	};
	mapGraphics(true);
};
