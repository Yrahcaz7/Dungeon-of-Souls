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

const FIRSTBATTLE = 0, TREASURE = 1, PRIME = 2, ORB = 3, BOSS = 4;

const ROOM = {BATTLE: 100, TREASURE: 101, PRIME: 102, ORB: 103, BOSS: 104};

let mapProg = 0, mapTotal = 50, death_zones = 0, rowFalses = 0, rowNodes = 0;

/**
 * Gets a weaker small slime in the map syntax.
 * @param {number} row - the row the enemy will be contained in.
 */
function weakerSmallSlime(row) {
	return SLIME.SMALL + ", " + (Math.round((0.5 + (row * 0.05)) * 100) / 100);
};

/**
 * Gets the base gold reward for a room.
 * @param {number} row - the row the room is in.
 */
function goldReward(row) {
	return randomInt(25, 50) + (row * 2);
};

/**
 * Updates the map generation progress.
 */
async function updateMapProg() {
	clearCanvas();
	if (mapProg === mapTotal) draw.lore(200 - 2, 100 - 5.5 * 3, "Generating Map...\n\nrunning final checks...", {"color": "#fff", "text-align": CENTER});
	else draw.lore(200 - 2, 100 - 5.5 * 3, "Generating Map...\n\n" + (mapProg / mapTotal * 100).toFixed(0) + "%", {"color": "#fff", "text-align": CENTER});
	mapProg++;
	if (mapProg > mapTotal) mapProg = 0;
	await new Promise(r => setTimeout(r, 0));
};

/**
 * Returns a map piece.
 * @param {number} row - the row of the map piece.
 * @param {number} num - the number map pieces in the row so far.
 * @param {FIRSTBATTLE | TREASURE | PRIME | ORB | BOSS} attribute - the attribute of the map piece, if any.
 */
async function mapPiece(row, num, attribute = -1) {
	if (attribute === FIRSTBATTLE) return [ROOM.BATTLE, 0, 0, [SLIME.SMALL], goldReward(row), randomCardSet(5)];
	if (attribute === TREASURE) return [ROOM.TREASURE, randomInt(-5, 5), randomInt(-5, 5), false, goldReward(row) * 2, randomCardSet(5)];
	if (attribute === PRIME) return [ROOM.PRIME, randomInt(-5, 5), randomInt(-5, 5), [weakerSmallSlime(row), SLIME.PRIME, weakerSmallSlime(row)], goldReward(row) * 2, randomCardSet(5), randomArtifactSet(3)];
	await updateMapProg();
	if (attribute === ORB) return [ROOM.ORB, randomInt(-5, 5), randomInt(-5, 5)];
	if (attribute === BOSS) return [ROOM.BOSS, 0, 0, [FRAGMENT], goldReward(row) * 4, randomCardSet(5), randomArtifactSet(3)];
	let type = chance(3/5) ? ROOM.BATTLE : false;
	if (rowFalses >= 3 || (row === 0 && rowFalses >= 2) || (num == 2 && rowFalses == 2)) type = ROOM.BATTLE;
	if (type) rowNodes++;
	else rowFalses++;
	if (!type || rowNodes == 6) return false;
	let result = [type, randomInt(-5, 5), randomInt(-5, 5)];
	if (type === ROOM.BATTLE) {
		if (row >= 5) result.push(chance(1/3) ? [SLIME.BIG] : (chance(2/3) ? [SLIME.BIG, weakerSmallSlime(row)] : [SLIME.SMALL, SLIME.SMALL]));
		else result.push(chance() ? [SLIME.BIG] : [SLIME.SMALL, weakerSmallSlime(row)]);
		result.push(goldReward(row), randomCardSet(5));
	};
	return result;
};

/**
 * Checks if a map path has a special node.
 * @param {string} coords - the coordinates of the node to start searching from.
 * @param {boolean} front - whether to seach the front instead of the back.
 */
function pathHasSpecial(coords, front = false) {
	const entries = Object.entries(paths);
	let boolean = false;
	const looping = front ? (location = "", first = false) => {
		let loc = location.split(", ");
		if (!first && game.map[loc[0]] && (game.map[loc[0]][loc[1]][0] === ROOM.TREASURE || game.map[loc[0]][loc[1]][0] === ROOM.PRIME)) {
			boolean = true;
			return;
		};
		for (let index = 0; index < paths[location].length; index++) {
			if (paths[paths[location][index]]) looping(paths[location][index]);
		};
	} : (location = "", first = false) => {
		let loc = location.split(", ");
		if (!first && game.map[loc[0]] && (game.map[loc[0]][loc[1]][0] === ROOM.TREASURE || game.map[loc[0]][loc[1]][0] === ROOM.PRIME)) {
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

/**
 * Returns a map row.
 * @param {number} row - the row number.
 */
async function mapRow(row) {
	rowFalses = 0;
	rowNodes = 0;
	if (row === 0) return [false, await mapPiece(0, 0), await mapPiece(0, 1), await mapPiece(0, 2), await mapPiece(0, 3), false];
	if (row === 8) {
		if (chance()) {
			if (chance()) return [await mapPiece(8, 0, ORB), false, await mapPiece(8, 1, ORB), false, false, await mapPiece(8, 2, ORB)];
			else return [await mapPiece(8, 0, ORB), false, await mapPiece(8, 1, ORB), false, await mapPiece(8, 2, ORB), false];
		} else {
			if (chance()) return [await mapPiece(8, 0, ORB), false, false, await mapPiece(8, 1, ORB), false, await mapPiece(8, 2, ORB)];
			else return [false, await mapPiece(8, 0, ORB), false, await mapPiece(8, 1, ORB), false, await mapPiece(8, 2, ORB)];
		};
	};
	if (row === 9) return [false, false, await mapPiece(9, 0, BOSS), false, false, false];
	let arr = [await mapPiece(row, 0), await mapPiece(row, 1), await mapPiece(row, 2), await mapPiece(row, 3), await mapPiece(row, 4), await mapPiece(row, 5)];
	if (row > 1) {
		game.map.push(arr);
		graphics.map(true);
		game.map.pop();
		let rand = randomInt(0, 5), past = [];
		const setRand = () => {
			rand = randomInt(0, 5);
			if (past.includes(rand)) setRand();
		};
		while (past.length < 6) {
			if (arr[rand] && !pathHasSpecial(row + ", " + rand)) {
				arr[rand] = await mapPiece(row, rand, TREASURE);
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
				if (arr[rand] && arr[rand][0] !== ROOM.TREASURE && !pathHasSpecial(row + ", " + rand)) {
					arr[rand] = await mapPiece(row, rand, PRIME);
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

/**
 * Adds scribbles to the map.
 */
function addScribbles() {
	let available = [0, 1, 2, 3];
	for (let x = 0; x < game.map.length - 1; x++) {
		const offset = (x == 0 ? 1 : 0);
		for (let y = offset; y < game.map[x].length - (offset + 1); y++) {
			if (typeof game.map[x][y] != "boolean" ||
				typeof game.map[x + 1][y] != "boolean" ||
				typeof game.map[x][y + 1] != "boolean" ||
				typeof game.map[x + 1][y + 1] != "boolean" ||
				(typeof game.map[x][y - 1] != "object" && typeof game.map[x][y - 2] != "object" && typeof game.map[x + 1][y - 1] == "object") ||
				(typeof game.map[x + 1][y - 1] != "object" && typeof game.map[x + 1][y - 2] != "object" && typeof game.map[x][y - 1] == "object") ||
				(typeof game.map[x][y + 2] != "object" && typeof game.map[x][y + 3] != "object" && typeof game.map[x + 1][y + 2] == "object") ||
				(typeof game.map[x + 1][y + 2] != "object" && typeof game.map[x + 1][y + 3] != "object" && typeof game.map[x][y + 2] == "object") ||
				(game.map[x - 1] && typeof game.map[x - 1][y] == "number") ||
				typeof game.map[x][y - 1] == "number" ||
				typeof game.map[x][y + 1] == "number" ||
				typeof game.map[x + 1][y] == "number"
			) continue;
			game.map[x][y] = available.splice(randomInt(0, available.length - 1), 1)[0];
			if (available.length == 0) available = [0, 1, 2, 3];
		};
	};
};

/**
 * Generates a map and saves it.
 */
async function generateMap() {
	await updateMapProg();
	game.firstRoom = await mapPiece(0, 0, FIRSTBATTLE);
	game.map = [];
	death_zones = 0;
	for (let index = 0; index < 10; index++) {
		game.map.push(await mapRow(index));
	};
	if (death_zones === 0) {
		let rand = randomInt(0, 5), past = [];
		const setRand = () => {
			rand = randomInt(0, 5);
			if (past.includes(rand)) setRand();
		};
		while (past.length < 6) {
			if (game.map[2][rand] && game.map[2][rand][0] !== ROOM.TREASURE && !pathHasSpecial("2, " + rand, true)) {
				game.map[2][rand] = await mapPiece(2, rand, PRIME);
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
				if (game.map[3][rand] && game.map[3][rand][0] === ROOM.TREASURE && !pathHasSpecial("3, " + rand, true)) {
					game.map[3][rand] = await mapPiece(3, rand, PRIME);
					death_zones++;
					break;
				} else {
					if (!past.includes(rand)) past.push(rand);
					if (past.length < 6) setRand();
				};
			};
		};
	};
	addScribbles();
	graphics.map(true);
	musicPopup();
	updateVisuals();
	loaded = true;
};
