/*  Dungeon of Souls
 *  Copyright (C) 2025 Yrahcaz7
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

let mapProg = 0, mapTotal = 100, death_zones = 0, rowFalses = 0, rowNodes = 0, eventShift = 0;

/**
 * Gets a weaker small enemy in the map syntax.
 * @param {number} row - the row the enemy will be contained in.
 */
function weakerSmallEnemy(row) {
	let area = get.area(row + 1);
	return [SLIME.SMALL, SENTRY.SMALL][area] + ", " + (Math.round(((row - game.difficulty * 5 + (1 - area) * 10) * 0.05) * 100) / 100);
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
	if (mapProg === mapTotal) draw.lore(200 - 2, 100 - 5.5 * 3, "Generating Map...\n\nrunning final checks...", {"color": "#fff", "text-align": DIR.CENTER});
	else draw.lore(200 - 2, 100 - 5.5 * 3, "Generating Map...\n\n" + (mapProg / mapTotal * 100).toFixed(0) + "%", {"color": "#fff", "text-align": DIR.CENTER});
	mapProg++;
	if (mapProg > mapTotal) mapProg = 0;
	await new Promise(r => setTimeout(r));
};

/**
 * Returns a map piece.
 * @param {number} row - the row of the map piece.
 * @param {number} num - the number of map pieces in the row so far.
 * @param {number} attribute - the attribute of the map piece, if any.
 */
async function mapPiece(row, num, attribute = -1) {
	let area = get.area(row + 1);
	if (attribute === MAP_PIECE.FIRST) return [ROOM.BATTLE, 0, 0, [[SLIME.SMALL, SENTRY.SMALL][area]], goldReward(row), randomCardSet(5)];
	if (attribute === MAP_PIECE.TREASURE) return [ROOM.TREASURE, randomInt(-5, 5), randomInt(-5, 5), false, goldReward(row) * 2, randomCardSet(5, 4/10)];
	if (attribute === MAP_PIECE.PRIME) return [ROOM.PRIME, randomInt(-5, 5), randomInt(-5, 5), [weakerSmallEnemy(row), [SLIME.PRIME, SENTRY.PRIME][area], weakerSmallEnemy(row)], goldReward(row) * 2, randomCardSet(5, 9/10), randomArtifactSet(3)];
	if (attribute === MAP_PIECE.EVENT) {
		let index = randomInt(0, EVENTS.any.length + EVENTS[area].length - 1);
		if (index >= EVENTS.any.length) index += 100 - EVENTS.any.length;
		return [ROOM.EVENT, randomInt(-5, 5), randomInt(-5, 5), index, goldReward(row), randomCardSet(5)];
	};
	await updateMapProg();
	if (attribute === MAP_PIECE.ORB) return [ROOM.ORB, randomInt(-5, 5), randomInt(-5, 5)];
	if (attribute === MAP_PIECE.BOSS) return [ROOM.BOSS, 0, 0, [[FRAGMENT, SINGULARITY][area]], goldReward(row) * 4, randomCardSet(5, 9/10), randomArtifactSet(3)];
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

/**
 * Checks if a map path has any nodes of specified types.
 * @param {number[]} coords - the coordinates of the node to start searching from.
 * @param {number[]} types - an array of the node types to check for.
 * @param {boolean} front - whether to seach the front instead of the back.
 */
function pathHasTypes(coords, types = [], front = false) {
	let locations = [coords];
	for (let index = 0; index < locations.length; index++) {
		const loc = locations[index];
		if (!game.map[loc[0]] || !game.map[loc[0]][loc[1]] || game.map[loc[0]][loc[1]][0] === ROOM.BOSS) {
			continue;
		};
		if (types.includes(game.map[loc[0]][loc[1]][0])) {
			return true;
		};
		if (front) {
			let availableLocations = getAvailibleLocations(loc);
			for (let i2 = 0; i2 < availableLocations.length; i2++) {
				if (getAvailibleLocations(availableLocations[i2]).length) locations.push(availableLocations[i2]);
			};
		} else {
			for (const x in paths) {
				if (paths.hasOwnProperty(x)) {
					if (x == -1) continue;
					for (const y in paths[x]) {
						if (paths[x].hasOwnProperty(y)) {
							if (paths[x][y].some(location => location[0] === loc[0] && location[1] === loc[1])) locations.push([+x, +y]);
						};
					};
				};
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
			if (chance()) return [await mapPiece(row, 0, MAP_PIECE.ORB), false, await mapPiece(row, 1, MAP_PIECE.ORB), false, false, await mapPiece(row, 2, MAP_PIECE.ORB)];
			else return [await mapPiece(row, 0, MAP_PIECE.ORB), false, await mapPiece(row, 1, MAP_PIECE.ORB), false, await mapPiece(row, 2, MAP_PIECE.ORB), false];
		} else {
			if (chance()) return [await mapPiece(row, 0, MAP_PIECE.ORB), false, false, await mapPiece(row, 1, MAP_PIECE.ORB), false, await mapPiece(row, 2, MAP_PIECE.ORB)];
			else return [false, await mapPiece(row, 0, MAP_PIECE.ORB), false, await mapPiece(row, 1, MAP_PIECE.ORB), false, await mapPiece(row, 2, MAP_PIECE.ORB)];
		};
	};
	if (row % 10 == 9) return [false, false, await mapPiece(row, 0, MAP_PIECE.BOSS), false, false, false];
	let arr = [await mapPiece(row, 0), await mapPiece(row, 1), await mapPiece(row, 2), await mapPiece(row, 3), await mapPiece(row, 4), await mapPiece(row, 5)];
	if (row % 10 > 0) {
		game.map.push(arr);
		graphics.map(true, get.area(row + 1));
		if (row % 10 > 1) {
			let available = [0, 1, 2, 3, 4, 5];
			let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
			while (true) {
				if (arr[rand] && !pathHasTypes([row, rand], [ROOM.TREASURE, ROOM.PRIME])) {
					arr[rand] = await mapPiece(row, rand, MAP_PIECE.TREASURE);
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
				if (arr[rand] && arr[rand][0] !== ROOM.TREASURE && !pathHasTypes([row, rand], [ROOM.TREASURE, ROOM.PRIME])) {
					arr[rand] = await mapPiece(row, rand, MAP_PIECE.PRIME);
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
				if (arr[rand] && arr[rand][0] !== ROOM.TREASURE && arr[rand][0] !== ROOM.PRIME && !pathHasTypes([row, rand], [ROOM.EVENT])) {
					arr[rand] = await mapPiece(row, rand, MAP_PIECE.EVENT);
					break;
				} else if (available.length) {
					rand = available.splice(randomInt(0, available.length - 1), 1)[0];
				} else {
					break;
				};
			};
		};
		game.map.pop();
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
	let row = 3 + num * 10;
	while (death_zones === 0) {
		let available = [0, 1, 2, 3, 4, 5];
		let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
		while (true) {
			if (game.map[row][rand] && (game.map[row][rand][0] === ROOM.TREASURE || (row % 10 == 2 && game.map[row][rand][0] === ROOM.BATTLE)) && !pathHasTypes([row, rand], [ROOM.TREASURE, ROOM.PRIME], true)) {
				game.map[row][rand] = await mapPiece(row, rand, MAP_PIECE.PRIME);
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
 * @param {boolean} loose - if true, considers anything a node.
 */
function mapHasNode(x, y, loose = false) {
	if (loose) return typeof game.map[x][y] != "boolean" || (typeof game.map[x][y - 1] == "object" && game.map[x][y - 1][0] === ROOM.BOSS);
	return typeof game.map[x][y] == "object" || (typeof game.map[x][y - 1] == "object" && game.map[x][y - 1][0] === ROOM.BOSS);
};

/**
 * Adds scribbles to the map.
 */
function addScribbles() {
	let available = [0, 1, 2, 3, 4];
	for (let x = 0; x < game.map.length - 1; x++) {
		const offset = (x % 10 == 0 ? 1 : 0);
		for (let y = offset; y < game.map[x].length - (offset + 1); y++) {
			if (mapHasNode(x, y, true)
				|| mapHasNode(x + 1, y, true)
				|| mapHasNode(x, y + 1, true)
				|| mapHasNode(x + 1, y + 1, true)
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
			if (available.length == 0) available = [0, 1, 2, 3, 4];
		};
	};
};

/**
 * Generates a map and saves it.
 */
async function generateMap() {
	await updateMapProg();
	game.firstRoom = await mapPiece(0, 0, MAP_PIECE.FIRST);
	game.map = [];
	await generateArea(0);
	await generateArea(1);
	addScribbles();
	graphics.map(true);
	changeMusic();
	loaded = true;
};
