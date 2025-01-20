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

let paths = {};

/**
 * Calculates the paths of a map region.
 * @param {number} xMin - the inclusive start of the map region to calculate paths for. Defaults to `0`.
 * @param {number} xMax - the exclusive end of the map region to calculate paths for. Defaults to `Infinity`.
 */
function calculateMapPaths(xMin = 0, xMax = Infinity) {
	// calculate connections
	let store = [];
	for (let x = xMin; x < xMax && x < game.map.length; x++) {
		for (let y = 0; y < game.map[x].length; y++) {
			if (!game.map[x][y]) continue;
			if (x % 10 != 9 && game.map[x + 1]) {
				for (num = 0; num < game.map[x + 1].length; num++) {
					if (game.map[x + 1][y - num]) {
						store.push([x, y, x + 1, y - num]);
						break;
					} else if (game.map[x + 1][y + num]) {
						store.push([x, y, x + 1, y + num]);
						break;
					};
				};
			};
			if (x % 10 != 0) {
				for (num = 0; num < game.map[x - 1].length; num++) {
					if (game.map[x - 1][y - num]) {
						store.push([x, y, x - 1, y - num]);
						break;
					} else if (game.map[x - 1][y + num]) {
						store.push([x, y, x - 1, y + num]);
						break;
					};
				};
			};
		};
	};
	// create paths
	for (let index = 0; index < store.length; index++) {
		const coords = store[index];
		if (coords[2] > coords[0]) {
			if (!paths[coords[0]]) paths[coords[0]] = {};
			if (!paths[coords[0]][coords[1]]) paths[coords[0]][coords[1]] = [];
			if (!paths[coords[0]][coords[1]].some(location => location[0] === coords[2] && location[1] === coords[3])) {
				paths[coords[0]][coords[1]].push([coords[2], coords[3]]);
			};
		} else if (coords[0] > coords[2]) {
			if (!paths[coords[2]]) paths[coords[2]] = {};
			if (!paths[coords[2]][coords[3]]) paths[coords[2]][coords[3]] = [];
			if (!paths[coords[2]][coords[3]].some(location => location[0] === coords[0] && location[1] === coords[1])) {
				paths[coords[2]][coords[3]].push([coords[0], coords[1]]);
			};
		};
		if (coords[0] === 0) {
			if (!paths[-1]) paths[-1] = [];
			if (!paths[-1].some(location => location[0] === coords[0] && location[1] === coords[1])) {
				paths[-1].push([coords[0], coords[1]]);
			};
		} else if (coords[0] === 10) {
			if (!paths[9]) paths[9] = {};
			if (!paths[9][2]) paths[9][2] = [];
			if (!paths[9][2].some(location => location[0] === coords[0] && location[1] === coords[1])) {
				paths[9][2].push([coords[0], coords[1]]);
			};
		};
	};
	// sort paths
	for (const x in paths) {
		if (paths.hasOwnProperty(x)) {
			if (x == -1) {
				paths[x].sort();
			} else {
				for (const y in paths[x]) {
					if (paths[x].hasOwnProperty(y)) {
						paths[x][y].sort();
					};
				};
			};
		};
	};
};

const BIG_ENEMIES = [SLIME.BIG, SENTRY.BIG];
const SMALL_ENEMIES = [SLIME.SMALL, SENTRY.SMALL];
const PRIME_ENEMIES = [SLIME.PRIME, SENTRY.PRIME];
const BOSS_ENEMIES = [FRAGMENT, SINGULARITY];

/**
 * Generates a map and saves it.
 */
const generateMap = (() => {
	let mapProg = 0, mapTotal = 100, deathZones = 0, rowFalses = 0, rowNodes = 0, eventShift = 0, pathTypes = [];

	/**
	 * Gets a weaker small enemy in the map syntax.
	 * @param {number} row - the row the enemy will be contained in.
	 */
	function getWeakerSmallEnemy(row) {
		let area = get.area(row + 1);
		return [SMALL_ENEMIES[area], Math.round(((row - game.difficulty * 12 + (1 - area) * 10) * 0.05) * 100) / 100];
	};

	/**
	 * Gets the base gold reward for a room.
	 * @param {number} row - the row the room is in.
	 */
	function getGoldReward(row) {
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
		await new Promise(r => setTimeout(r));
	};

	/**
	 * Returns a map node.
	 * @param {number} row - the row of the map node.
	 * @param {number} attribute - the attribute of the map node, if any.
	 */
	async function getMapNode(row, attribute = -1) {
		let area = get.area(row + 1);
		if (attribute === MAP_NODE.FIRST) return [ROOM.BATTLE, 0, 0, [SMALL_ENEMIES[area]], getGoldReward(row), randomCardSet(5)];
		if (attribute === MAP_NODE.TREASURE) return [ROOM.TREASURE, randomInt(-5, 5), randomInt(-5, 5), false, getGoldReward(row) * 2, randomCardSet(5, 4/10)];
		if (attribute === MAP_NODE.PRIME) return [ROOM.PRIME, randomInt(-5, 5), randomInt(-5, 5), [getWeakerSmallEnemy(row), PRIME_ENEMIES[area], getWeakerSmallEnemy(row)], getGoldReward(row) * 2, randomCardSet(5, 9/10), randomArtifactSet(3)];
		if (attribute === MAP_NODE.EVENT) {
			let index = randomInt(0, EVENTS.any.length + EVENTS[area].length - 1);
			if (index >= EVENTS.any.length) index += 100 - EVENTS.any.length;
			return [ROOM.EVENT, randomInt(-5, 5), randomInt(-5, 5), index, getGoldReward(row), randomCardSet(5)];
		};
		await updateMapProg();
		if (attribute === MAP_NODE.ORB) return [ROOM.ORB, randomInt(-5, 5), randomInt(-5, 5)];
		if (attribute === MAP_NODE.BOSS) return [ROOM.BOSS, 0, 0, [BOSS_ENEMIES[area]], getGoldReward(row) * 4, randomCardSet(5, 9/10), randomArtifactSet(3)];
		let type = chance(3/5) ? ROOM.BATTLE : false;
		if (rowFalses >= 3 || (row % 10 == 0 && rowFalses >= 2) || (rowNodes + rowFalses == 2 && rowFalses == 2)) type = ROOM.BATTLE;
		if (type) rowNodes++;
		else rowFalses++;
		if (!type || rowNodes == 6) return false;
		let result = [type, randomInt(-5, 5), randomInt(-5, 5)];
		if (type === ROOM.BATTLE) {
			if (row % 10 >= 5) result.push(chance(1/3) ? [BIG_ENEMIES[area]] : (chance(2/3) ? [BIG_ENEMIES[area], getWeakerSmallEnemy(row)] : [SMALL_ENEMIES[area], SMALL_ENEMIES[area]]));
			else result.push(chance() ? [BIG_ENEMIES[area]] : [SMALL_ENEMIES[area], getWeakerSmallEnemy(row)]);
			result.push(getGoldReward(row), randomCardSet(5));
		};
		return result;
	};

	/**
	 * Returns a map row.
	 * @param {number} row - the row number.
	 */
	async function getMapRow(row) {
		rowFalses = 0;
		rowNodes = 0;
		if (row % 10 == 0) return [false, await getMapNode(row), await getMapNode(row), await getMapNode(row), await getMapNode(row), false];
		if (row % 10 == 8) {
			if (chance()) {
				if (chance()) return [await getMapNode(row, MAP_NODE.ORB), false, await getMapNode(row, MAP_NODE.ORB), false, false, await getMapNode(row, MAP_NODE.ORB)];
				else return [await getMapNode(row, MAP_NODE.ORB), false, await getMapNode(row, MAP_NODE.ORB), false, await getMapNode(row, MAP_NODE.ORB), false];
			} else {
				if (chance()) return [await getMapNode(row, MAP_NODE.ORB), false, false, await getMapNode(row, MAP_NODE.ORB), false, await getMapNode(row, MAP_NODE.ORB)];
				else return [false, await getMapNode(row, MAP_NODE.ORB), false, await getMapNode(row, MAP_NODE.ORB), false, await getMapNode(row, MAP_NODE.ORB)];
			};
		};
		if (row % 10 == 9) return [false, false, await getMapNode(row, MAP_NODE.BOSS), false, false, false];
		return [await getMapNode(row), await getMapNode(row), await getMapNode(row), await getMapNode(row), await getMapNode(row), await getMapNode(row)];
	};

	/**
	 * Calculates the path types of a map row.
	 * @param {number} row - the row number.
	 */
	function calculatePathTypes(row = pathTypes.length) {
		if (!game.map[row] || row > pathTypes.length) return;
		let arr = [];
		for (let num = 0; num < game.map[row].length; num++) {
			if (!game.map[row][num]) {
				arr.push([]);
				continue;
			};
			let types = [game.map[row][num][0]];
			if (row % 10 == 0) {
				if (row == 0 && !types.includes(ROOM.BATTLE)) types.push(ROOM.BATTLE); // this makes the initial battle count as a battle
				arr.push(types);
				continue;
			};
			const x = row - 1;
			for (const y in paths[x]) {
				if (paths[x].hasOwnProperty(y)) {
					if (paths[x][y].some(location => location[0] === row && location[1] === num)) {
						for (let index = 0; index < pathTypes[x][y].length; index++) {
							if (!types.includes(pathTypes[x][y][index])) types.push(pathTypes[x][y][index]);
						};
					};
				};
			};
			arr.push(types);
		};
		pathTypes[row] = arr;
	};

	/**
	 * Checks if a map path has any nodes of specified types.
	 * @param {number[]} coords - the coordinates of the node to start searching from.
	 * @param {number[]} types - an array of the node types to check for.
	 * @param {boolean} front - whether to seach the front instead of the back.
	 */
	function pathHasTypes(coords, types, front = false) {
		if (!front) {
			for (let index = 0; index < types.length; index++) {
				if (pathTypes[coords[0]][coords[1]].includes(types[index])) return true;
			};
			return false;
		};
		let locations = [coords];
		for (let index = 0; index < locations.length; index++) {
			const loc = locations[index];
			if (!game.map[loc[0]] || !game.map[loc[0]][loc[1]] || game.map[loc[0]][loc[1]][0] === ROOM.BOSS) {
				continue;
			};
			if (types.includes(game.map[loc[0]][loc[1]][0])) {
				return true;
			};
			let availableLocations = getAvailibleLocations(loc);
			for (let i2 = 0; i2 < availableLocations.length; i2++) {
				if (getAvailibleLocations(availableLocations[i2]).length) locations.push(availableLocations[i2]);
			};
		};
		return false;
	};

	/**
	 * Generates an area of the map.
	 * @param {number} area - the area number.
	 */
	async function generateArea(area) {
		let areaStartTime = Date.now();
		deathZones = 0;
		eventShift = randomInt(0, 1);
		for (let index = 0; index < 10; index++) {
			let rowStartTime = Date.now();
			let rowNum = index + area * 10;
			game.map.push(await getMapRow(rowNum));
			calculateMapPaths(Math.max(rowNum - 1, 0));
			calculatePathTypes(rowNum);
			if (rowNum % 10 > 0 && rowNum % 10 < 8) {
				let newRow = game.map[rowNum];
				// add treasure
				if (rowNum % 10 >= 2) {
					let available = [0, 1, 2, 3, 4, 5];
					let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
					while (true) {
						if (newRow[rand] && !pathHasTypes([rowNum, rand], [ROOM.TREASURE, ROOM.PRIME])) {
							newRow[rand] = await getMapNode(rowNum, MAP_NODE.TREASURE);
							break;
						} else if (available.length) {
							rand = available.splice(randomInt(0, available.length - 1), 1)[0];
						} else {
							break;
						};
					};
					calculatePathTypes(rowNum);
				};
				// add death zone
				if (rowNum % 10 >= 3 && deathZones < 2) {
					let available = [0, 1, 2, 3, 4, 5];
					let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
					while (true) {
						if (newRow[rand] && newRow[rand][0] !== ROOM.TREASURE && !pathHasTypes([rowNum, rand], [ROOM.TREASURE, ROOM.PRIME])) {
							newRow[rand] = await getMapNode(rowNum, MAP_NODE.PRIME);
							deathZones++;
							break;
						} else if (available.length) {
							rand = available.splice(randomInt(0, available.length - 1), 1)[0];
						} else {
							break;
						};
					};
					calculatePathTypes(rowNum);
				};
				// add event
				if (rowNum % 2 == eventShift && rowNum % 10 < 7) {
					let available = [0, 1, 2, 3, 4, 5];
					let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
					while (true) {
						if (newRow[rand] && newRow[rand][0] !== ROOM.TREASURE && newRow[rand][0] !== ROOM.PRIME && !pathHasTypes([rowNum, rand], [ROOM.EVENT])) {
							newRow[rand] = await getMapNode(rowNum, MAP_NODE.EVENT);
							break;
						} else if (available.length) {
							rand = available.splice(randomInt(0, available.length - 1), 1)[0];
						} else {
							break;
						};
					};
					calculatePathTypes(rowNum);
				};
			};
			console.log("row " + rowNum + " generated in " + (Date.now() - rowStartTime) + "ms");
		};
		// add death zone
		let row = 3 + area * 10;
		while (deathZones === 0) {
			let available = [0, 1, 2, 3, 4, 5];
			let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
			while (true) {
				if (game.map[row][rand] && (game.map[row][rand][0] === ROOM.TREASURE || (row % 10 == 2 && game.map[row][rand][0] === ROOM.BATTLE)) && !pathHasTypes([row, rand], [ROOM.TREASURE, ROOM.PRIME], true)) {
					game.map[row][rand] = await getMapNode(row, MAP_NODE.PRIME);
					deathZones++;
					break;
				} else if (available.length) {
					rand = available.splice(randomInt(0, available.length - 1), 1)[0];
				} else {
					break;
				};
			};
			if (row % 10 >= 7) row = 2 + area * 10;
			else if (row % 10 == 2) break;
			else row++;
		};
		// no calculatePathTypes needed here, as this is the last usage of pathHasTypes in this area and further areas do not need information from previous areas
		console.log("> area " + area + " generated in " + (Date.now() - areaStartTime) + "ms");
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

	return async () => {
		let mapStartTime = Date.now();
		await updateMapProg();
		game.firstRoom = await getMapNode(0, MAP_NODE.FIRST);
		console.log("first battle generated in " + (Date.now() - mapStartTime) + "ms");
		game.map = [];
		await generateArea(0);
		await generateArea(1);
		addScribbles();
		changeMusic();
		loaded = true;
		console.log("[map generated in " + (Date.now() - mapStartTime) + "ms]");
	};
})();
