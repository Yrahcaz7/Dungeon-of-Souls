/*  Dungeon of Souls
 *  Copyright (C) 2024 Yrahcaz7
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

const FIRSTBATTLE = 0, TREASURE = 1, PRIME = 2, ORB = 3, BOSS = 4, EVENT = 5;

const ROOM = {BATTLE: 100, TREASURE: 101, PRIME: 102, ORB: 103, BOSS: 104, EVENT: 105};

let mapProg = 0, mapTotal = 100, death_zones = 0, rowFalses = 0, rowNodes = 0, eventShift = 0;

/**
 * Gets a weaker small enemy in the map syntax.
 * @param {number} row - the row the enemy will be contained in.
 */
function weakerSmallEnemy(row) {
	return [SLIME.SMALL, SENTRY.SMALL][get.area(row - 1)] + ", " + (Math.round((0.5 + (row * 0.05)) * 100) / 100);
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
	await new Promise(r => setTimeout(r));
};

/**
 * Returns a map piece.
 * @param {number} row - the row of the map piece.
 * @param {number} num - the number of map pieces in the row so far.
 * @param {FIRSTBATTLE | TREASURE | PRIME | ORB | BOSS} attribute - the attribute of the map piece, if any.
 */
async function mapPiece(row, num, attribute = -1) {
	let area = get.area(row + 1);
	if (attribute === FIRSTBATTLE) return [ROOM.BATTLE, 0, 0, [[SLIME.SMALL, SENTRY.SMALL][area]], goldReward(row), randomCardSet(5)];
	if (attribute === TREASURE) return [ROOM.TREASURE, randomInt(-5, 5), randomInt(-5, 5), false, goldReward(row) * 2, randomCardSet(5)];
	if (attribute === PRIME) return [ROOM.PRIME, randomInt(-5, 5), randomInt(-5, 5), [weakerSmallEnemy(row), [SLIME.PRIME, SENTRY.PRIME][area], weakerSmallEnemy(row)], goldReward(row) * 2, randomCardSet(5), randomArtifactSet(3)];
	if (attribute === EVENT) {
		let index = randomInt(0, EVENTS.any.length + EVENTS[area].length - 1);
		if (index >= EVENTS.any.length) index += 100 - EVENTS.any.length;
		return [ROOM.EVENT, randomInt(-5, 5), randomInt(-5, 5), index, goldReward(row), randomCardSet(5)];
	};
	await updateMapProg();
	if (attribute === ORB) return [ROOM.ORB, randomInt(-5, 5), randomInt(-5, 5)];
	if (attribute === BOSS) return [ROOM.BOSS, 0, 0, [[FRAGMENT, ACT2BOSS][area]], goldReward(row) * 4, randomCardSet(5), randomArtifactSet(3)];
	let type = chance(3/5) ? ROOM.BATTLE : false;
	if (rowFalses >= 3 || (row % 10 == 0 && rowFalses >= 2) || (num == 2 && rowFalses == 2)) type = ROOM.BATTLE;
	if (type) rowNodes++;
	else rowFalses++;
	if (!type || rowNodes == 6) return false;
	let result = [type, randomInt(-5, 5), randomInt(-5, 5)];
	if (type === ROOM.BATTLE) {
		if (row % 10 >= 5) result.push(chance(1/3) ? [[SLIME.BIG, SENTRY.BIG][area]] : (chance(2/3) ? [[SLIME.BIG, SENTRY.BIG][area], weakerSmallEnemy(row)] : [[SLIME.SMALL, SENTRY.SMALL][area], [SLIME.SMALL, SENTRY.SMALL][area]]));
		else result.push(chance() ? [[SLIME.BIG, SENTRY.BIG][area]] : [[SLIME.SMALL, SENTRY.SMALL][area], weakerSmallEnemy(row)]);
		result.push(goldReward(row), randomCardSet(5));
	};
	return result;
};

let pathEntries = [];

/**
 * Checks if a map path has any nodes of specified types.
 * @param {string} coords - the coordinates of the node to start searching from.
 * @param {Array<number>} types - an array of the node types to check for.
 * @param {boolean} front - whether to seach the front instead of the back.
 */
function pathHasTypes(coords, types = [], front = false) {
	let locations = [coords];
	for (let a = 0; a < locations.length; a++) {
		const loc = locations[a].split(", ");
		if (game.map[loc[0]] && game.map[loc[0]][loc[1]][0] === ROOM.BOSS) {
			continue;
		};
		if (a > 0 && game.map[loc[0]] && types.includes(game.map[loc[0]][loc[1]][0])) {
			return true;
		};
		if (front) {
			for (let b = 0; b < paths[locations[a]].length; b++) {
				if (paths[paths[locations[a]][b]]) locations.push(paths[locations[a]][b]);
			};
		} else {
			for (let b = 0; b < pathEntries.length; b++) {
				if (pathEntries[b][1].includes(locations[a])) locations.push(pathEntries[b][0]);
			};
		};
	};
	return false;
};

/**
 * Returns a map row.
 * @param {number} row - the row number.
 */
async function mapRow(row) {
	rowFalses = 0;
	rowNodes = 0;
	if (row % 10 == 0) return [false, await mapPiece(row, 0), await mapPiece(row, 1), await mapPiece(row, 2), await mapPiece(row, 3), false];
	if (row % 10 == 8) {
		if (chance()) {
			if (chance()) return [await mapPiece(row, 0, ORB), false, await mapPiece(row, 1, ORB), false, false, await mapPiece(row, 2, ORB)];
			else return [await mapPiece(row, 0, ORB), false, await mapPiece(row, 1, ORB), false, await mapPiece(row, 2, ORB), false];
		} else {
			if (chance()) return [await mapPiece(row, 0, ORB), false, false, await mapPiece(row, 1, ORB), false, await mapPiece(row, 2, ORB)];
			else return [false, await mapPiece(row, 0, ORB), false, await mapPiece(row, 1, ORB), false, await mapPiece(row, 2, ORB)];
		};
	};
	if (row % 10 == 9) return [false, false, await mapPiece(row, 0, BOSS), false, false, false];
	let arr = [await mapPiece(row, 0), await mapPiece(row, 1), await mapPiece(row, 2), await mapPiece(row, 3), await mapPiece(row, 4), await mapPiece(row, 5)];
	if (row % 10 > 0) {
		game.map.push(arr);
		graphics.map(true, get.area(row + 1));
		game.map.pop();
		pathEntries = Object.entries(paths);
		if (row % 10 > 1) {
			let available = [0, 1, 2, 3, 4, 5];
			let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
			while (true) {
				if (arr[rand] && !pathHasTypes(row + ", " + rand, [ROOM.TREASURE, ROOM.PRIME])) {
					arr[rand] = await mapPiece(row, rand, TREASURE);
					break;
				} else if (available.length) {
					rand = available.splice(randomInt(0, available.length - 1), 1)[0];
				} else {
					break;
				};
			};
		};
		if (row % 10 >= 3 && death_zones < 2) {
			let available = [0, 1, 2, 3, 4, 5];
			let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
			while (true) {
				if (arr[rand] && arr[rand][0] !== ROOM.TREASURE && !pathHasTypes(row + ", " + rand, [ROOM.TREASURE, ROOM.PRIME])) {
					arr[rand] = await mapPiece(row, rand, PRIME);
					death_zones++;
					break;
				} else if (available.length) {
					rand = available.splice(randomInt(0, available.length - 1), 1)[0];
				} else {
					break;
				};
			};
		};
		if (row % 2 == eventShift && row % 10 < 7) {
			let available = [0, 1, 2, 3, 4, 5];
			let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
			while (true) {
				if (arr[rand] && arr[rand][0] !== ROOM.TREASURE && arr[rand][0] !== ROOM.PRIME && !pathHasTypes(row + ", " + rand, [ROOM.EVENT])) {
					arr[rand] = await mapPiece(row, rand, EVENT);
					break;
				} else if (available.length) {
					rand = available.splice(randomInt(0, available.length - 1), 1)[0];
				} else {
					break;
				};
			};
		};
	};
	return arr;
};

/**
 * Generates an area of the map.
 * @param {number} num - the area number.
 */
async function generateArea(num) {
	death_zones = 0;
	eventShift = randomInt(0, 1);
	for (let index = 0; index < 10; index++) {
		game.map.push(await mapRow(index + num * 10));
	};
	pathEntries = Object.entries(paths);
	let row = 3 + num * 10;
	while (death_zones === 0) {
		let available = [0, 1, 2, 3, 4, 5];
		let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
		while (true) {
			if (game.map[row][rand] && (game.map[row][rand][0] === ROOM.TREASURE || (row % 10 == 2 && game.map[row][rand][0] === ROOM.BATTLE)) && !pathHasTypes(row + ", " + rand, [ROOM.TREASURE, ROOM.PRIME], true)) {
				game.map[row][rand] = await mapPiece(row, rand, PRIME);
				death_zones++;
				break;
			} else if (available.length) {
				rand = available.splice(randomInt(0, available.length - 1), 1)[0];
			} else {
				break;
			};
		};
		if (row % 10 >= 7) row = 2 + num * 10;
		else if (row % 10 == 2) break;
		else row++;
	};
};

/**
 * Returns a boolean indicating whether the map has a node at the respective coordinates.
 * @param {number} x - the x-coordinate to check for a node at.
 * @param {number} y - the y-coordinate to check for a node at.
 */
function mapHasNode(x, y) {
	return typeof game.map[x][y] == "object" || (typeof game.map[x][y - 1] == "object" && game.map[x][y - 1][0] === ROOM.BOSS);
};

/**
 * Adds scribbles to the map.
 */
function addScribbles() {
	let available = [0, 1, 2, 3];
	for (let x = 0; x < game.map.length - 1; x++) {
		const offset = (x % 10 == 0 ? 1 : 0);
		for (let y = offset; y < game.map[x].length - (offset + 1); y++) {
			if (typeof game.map[x][y] != "boolean"
				|| typeof game.map[x + 1][y] != "boolean"
				|| typeof game.map[x][y + 1] != "boolean"
				|| typeof game.map[x + 1][y + 1] != "boolean"
				|| (!mapHasNode(x, y - 1) && !mapHasNode(x, y - 2) && mapHasNode(x + 1, y - 1))
				|| (!mapHasNode(x + 1, y - 1) && !mapHasNode(x + 1, y - 2) && mapHasNode(x, y - 1))
				|| (!mapHasNode(x, y + 2) && !mapHasNode(x, y + 3) && mapHasNode(x + 1, y + 2))
				|| (!mapHasNode(x + 1, y + 2) && !mapHasNode(x + 1, y + 3) && mapHasNode(x, y + 2))
				|| (game.map[x - 1] && typeof game.map[x - 1][y] == "number")
				|| typeof game.map[x][y - 1] == "number"
				|| typeof game.map[x][y + 1] == "number"
				|| typeof game.map[x + 1][y] == "number"
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
	await generateArea(0);
	await generateArea(1);
	addScribbles();
	graphics.map(true);
	changeMusic();
	loaded = true;
};
