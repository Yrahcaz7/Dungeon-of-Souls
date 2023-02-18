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

const FIRSTBATTLE = 000, TREASURE = 001, PRIME = 002, ORB = 003, BOSS = 004;

const BATTLEROOM = 100, TREASUREROOM = 101, PRIMEROOM = 102, ORBROOM = 103, BOSSROOM = 104;

var mapProg = 0, mapTotal = 10, death_zones = 0, rowFalses = 0, rowNodes = 0, twoRow = false;

function weakerSmallSlime(row) {
	return SLIME.SMALL + ", " + (Math.round((0.5 + (row * 0.05)) * 100) / 100);
};

function mapPiece(row, attribute = -1) {
	if (attribute === FIRSTBATTLE) return [BATTLEROOM, 0, 0, [SLIME.SMALL], randomInt(25 + (row * 1.5), 50 + (row * 2)), randomCardSet(5)];
	if (attribute === TREASURE) return [TREASUREROOM, randomInt(-5, 5), randomInt(-5, 5), false, randomInt(25 + (row * 1.5), 50 + (row * 2)) * 2, randomCardSet(5)];
	if (attribute === PRIME) return [PRIMEROOM, randomInt(-5, 5), randomInt(-5, 5), [weakerSmallSlime(row), SLIME.PRIME, weakerSmallSlime(row)], randomInt(25 + (row * 1.5), 50 + (row * 2)) * 2, randomCardSet(5), randomArtifactSet(3)];
	if (attribute === ORB) return [ORBROOM, randomInt(-5, 5), randomInt(-5, 5)];
	if (attribute === BOSS) return [BOSSROOM, 0, 0, [FRAGMENT], randomInt(25 + (row * 1.5), 50 + (row * 2)) * 3, randomCardSet(5)];
	let type = chance(3/5) ? BATTLEROOM : false;
	if (rowFalses >= 4 || (twoRow && rowFalses >= 3) || (row === 0 && rowFalses >= 2)) type = BATTLEROOM;
	if (type) rowNodes++;
	else rowFalses++;
	if (!type || rowNodes == 6) return false;
	let result = [type, randomInt(-5, 5), randomInt(-5, 5)];
	if (type === BATTLEROOM) {
		if (row >= 5) result.push(chance(1/3) ? [SLIME.BIG] : (chance(2/3) ? [SLIME.BIG, weakerSmallSlime(row)] : [SLIME.SMALL, SLIME.SMALL]));
		else result.push(chance() ? [SLIME.BIG] : [SLIME.SMALL, weakerSmallSlime(row)]);
		result.push(randomInt(25 + (row * 1.5), 50 + (row * 2)), randomCardSet(5));
	};
	return result;
};

function pathHasSpecial(coords = "", front = false) {
	const entries = Object.entries(paths);
	let boolean = false;
	const looping = front ? (location = "", first = false) => {
		let loc = location.split(", ");
		if (!first && game.map[loc[0]] && (game.map[loc[0]][loc[1]][0] === TREASUREROOM || game.map[loc[0]][loc[1]][0] === PRIMEROOM)) {
			boolean = true;
			return;
		};
		for (let index = 0; index < paths[location].length; index++) {
			if (paths[paths[location][index]]) looping(paths[location][index]);
		};
	} : (location = "", first = false) => {
		let loc = location.split(", ");
		if (!first && game.map[loc[0]] && (game.map[loc[0]][loc[1]][0] === TREASUREROOM || game.map[loc[0]][loc[1]][0] === PRIMEROOM)) {
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
	if (row === 8) {
		if (chance()) return [mapPiece(8, ORB), false, mapPiece(8, ORB), false, mapPiece(8, ORB), false];
		else return [false, mapPiece(8, ORB), false, mapPiece(8, ORB), false, mapPiece(8, ORB)];
	};
	if (row === 9) return [false, false, mapPiece(9, BOSS), false, false, false];
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
				arr[rand] = mapPiece(row, TREASURE);
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
				if (arr[rand] && arr[rand][0] !== TREASUREROOM && !pathHasSpecial(row + ", " + rand)) {
					arr[rand] = mapPiece(row, PRIME);
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

function updateMapProg() {
	clearCanvas();
	if (mapProg === mapTotal) draw.lore(200 - 2, 100, "Generating Map...\nrunning final checks...", {"color": "white", "text-align": CENTER});
	else draw.lore(200 - 2, 100, "Generating Map...\n" + (mapProg / mapTotal * 100).toFixed(1) + "%", {"color": "white", "text-align": CENTER});
};

async function generateMap() {
	game.firstRoom = mapPiece(0, FIRSTBATTLE);
	game.map = [];
	death_zones = 0;
	for (let index = 0; index < 10; index++) {
		game.map.push(mapRow(index));
		mapProg++;
		updateMapProg();
		await new Promise(r => setTimeout(r, 0));
		if (rowNodes == 2) twoRow = true;
	};
	if (death_zones === 0) {
		let rand = randomInt(0, 5), past = [];
		const setRand = () => {
			rand = randomInt(0, 5);
			if (past.includes(rand)) setRand();
		};
		while (past.length < 6) {
			if (game.map[2][rand] && game.map[2][rand][0] !== TREASUREROOM && !pathHasSpecial("2, " + rand, true)) {
				game.map[2][rand] = mapPiece(2, PRIME);
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
				if (game.map[3][rand] && game.map[3][rand][0] === TREASUREROOM && !pathHasSpecial("3, " + rand, true)) {
					game.map[3][rand] = mapPiece(3, PRIME);
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
	musicPopup();
	updateVisuals();
	loaded = true;
};
