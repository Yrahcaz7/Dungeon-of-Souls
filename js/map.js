/*  Dungeon of Souls
 *  Copyright (C) 2026 Yrahcaz7
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

/** @type {{}[]} */
let mapPathPoints = [];

/**
 * Generates the visual points of all paths in the map and saves them.
 */
const generateMapPathPoints = (() => {
	const PATH_SUBDIVISIONS = 32;
	/**
	 * Returns an array of points that represent the subdivided path of `points`.
	 * @param {number[][]} points - an array of points that represents a path.
	 */
	function getSubdividedPath(points = []) {
		const t = [];
		const tSquared = [];
		const tCubed = [];
		const increment = 1 / (PATH_SUBDIVISIONS + 1);
		for (let sub = 0; sub < PATH_SUBDIVISIONS; sub++) {
			t[sub] = (sub + 1) * increment;
			tSquared[sub] = t[sub] * t[sub];
			tCubed[sub] = tSquared[sub] * t[sub];
		};
		let pathPoints = [points[0]];
		for (let index = 1; index < points.length - 2; index++) {
			const subdivisionIndex = 1 + (index - 1) * (PATH_SUBDIVISIONS + 1);
			pathPoints[subdivisionIndex] = points[index];
			const p0 = points[index - 1];
			const p1 = points[index];
			const p2 = points[index + 1];
			const p3 = points[index + 2];
			let ax = -p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0];
			let ay = -p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1];
			let bx = 2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0];
			let by = 2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1];
			let cx = -p0[0] + p2[0];
			let cy = -p0[1] + p2[1];
			let dx = 2 * p1[0];
			let dy = 2 * p1[1];
			for (let sub = 0; sub < PATH_SUBDIVISIONS; sub++) {
				pathPoints[subdivisionIndex + sub + 1] = [];
				pathPoints[subdivisionIndex + sub + 1][0] = 0.5 * (ax * tCubed[sub] + bx * tSquared[sub] + cx * t[sub] + dx);
				pathPoints[subdivisionIndex + sub + 1][1] = 0.5 * (ay * tCubed[sub] + by * tSquared[sub] + cy * t[sub] + dy);
			};
		};
		pathPoints.push(points.at(-2));
		pathPoints.push(points.at(-1));
		return pathPoints;
	};
	/**
	 * Gets the visual map paths of an area.
	 * @param {number} area - the area to get the visual map paths of.
	 */
	async function getVisualMapPaths(area = get.area()) {
		// start the generation of paths from the start of the area.
		let arr = [[[area * 10, 0]]];
		// iterate through the area, generating all of the possible paths.
		for (let iteration = 0; iteration < 10; iteration++) {
			let nextArr = [];
			for (let path = 0; path < arr.length; path++) {
				const lastNode = arr[path].at(-1);
				for (let index = 0; index < game.paths[lastNode[0]][lastNode[1]].length; index++) {
					const node = game.paths[lastNode[0]][lastNode[1]][index];
					let innerArr = arr[path].slice();
					innerArr.push([lastNode[0] + 1, node]);
					nextArr.push(innerArr);
				};
			};
			arr = nextArr;
		};
		// calculate all possible visual paths for each node pair and log them in `mapPathPoints`.
		for (let path = 0; path < arr.length; path++) {
			let visualArr = [];
			for (let index = 0; index < arr[path].length; index++) {
				const node = game.map[arr[path][index][0]][arr[path][index][1]];
				if (index === 0) {
					const nextNode = game.map[arr[path][index + 1][0]][arr[path][index + 1][1]];
					visualArr.push([16, nextNode[2] + 8]);
					visualArr.push([17, nextNode[2] + 8]);
				} else if (node[0] === ROOM.BOSS) {
					visualArr.push([node[1] + 16, node[2] + 16]);
					visualArr.push([node[1] + 17, node[2] + 16]);
					visualArr.push([node[1] + 18, node[2] + 16]);
					break;
				} else {
					visualArr.push([node[1] + 8, node[2] + 8]);
				};
			};
			let pathPoints = getSubdividedPath(visualArr);
			for (let index = 1; index < visualArr.length - 3; index++) {
				const subdivisionIndex = 1 + (index - 1) * (PATH_SUBDIVISIONS + 1);
				if (!mapPathPoints[arr[path][index - 1][0]]) mapPathPoints[arr[path][index - 1][0]] = [];
				if (!mapPathPoints[arr[path][index - 1][0]][arr[path][index - 1][1]]) mapPathPoints[arr[path][index - 1][0]][arr[path][index - 1][1]] = {};
				const firstNode = mapPathPoints[arr[path][index - 1][0]][arr[path][index - 1][1]];
				if (!firstNode[arr[path][index][1]]) firstNode[arr[path][index][1]] = [];
				const nodePair = firstNode[arr[path][index][1]];
				for (let sub = 0; sub < PATH_SUBDIVISIONS + 2; sub++) {
					if (!nodePair[sub]) nodePair[sub] = [];
					nodePair[sub].push(pathPoints[subdivisionIndex + sub]);
				};
			};
		};
		// average the points in `mapPathPoints` for each subdivision for each node pair.
		for (let row1 = area * 10; row1 < (area + 1) * 10 && row1 < mapPathPoints.length; row1++) {
			for (const node1 in mapPathPoints[row1]) {
				for (const node2 in mapPathPoints[row1][node1]) {
					const nodePair = mapPathPoints[row1][node1][node2];
					let averagePath = [];
					for (let sub = 0; sub < nodePair.length; sub++) {
						let total = [0, 0];
						for (let index = 0; index < nodePair[sub].length; index++) {
							total[0] += nodePair[sub][index][0];
							total[1] += nodePair[sub][index][1];
						};
						averagePath.push([total[0] / nodePair[sub].length, total[1] / nodePair[sub].length]);
					};
					mapPathPoints[row1][node1][node2] = averagePath;
				};
			};
		};
	};
	return async () => {
		const startTime = performance.now();
		mapPathPoints = [];
		await Promise.all([getVisualMapPaths(0), getVisualMapPaths(1)]);
		console.log("[map visuals generated in " + (performance.now() - startTime) + "ms]");
	};
})();

const BIG_ENEMIES = [SLIME.BIG, SENTRY.BIG];
const SMALL_ENEMIES = [SLIME.SMALL, SENTRY.SMALL];
const PRIME_ENEMIES = [SLIME.PRIME, SENTRY.PRIME];
const SPECIAL_ENEMIES = [SLIME.STICKY, SENTRY.FLAMING];
const BOSS_ENEMIES = [FRAGMENT, SINGULARITY];

/**
 * Returns the type of a battle, or `-1` if the specified node is not a battle.
 * @param {(number | (number | number[])[])[]} node - the node to get the battle type of.
 */
function getBattleType(node) {
	if (node[0] === ROOM.BATTLE) {
		if (node[3].length === 1) {
			return (BIG_ENEMIES.includes(node[3][0]) ? 0 : 3);
		} else if (node[3].length === 2) {
			return (BIG_ENEMIES.includes(node[3][0]) ? 2 : 1);
		};
	};
	return -1;
};

/**
 * Generates a map and saves it.
 */
const generateMap = (() => {
	const GEN_STEPS = 20;
	let genProg = 0;
	const MAP_NODE_MIN_Y = 18 - 4;
	const MAP_NODE_MAX_Y = 18 + 160 + 4;
	const MAP_NODE_SPREAD = 32;
	/** @type {{}[][]} */
	let pathInfo = [];
	/**
	 * Gets a weaker small enemy in the map syntax.
	 * @param {number} row - the row the enemy will be contained in.
	 */
	function getWeakerSmallEnemy(row) {
		const area = get.area(row);
		return [SMALL_ENEMIES[area], Math.round(((row - 1 - game.difficulty * 12 + (1 - area) * 10) * 0.05) * 100) / 100];
	};
	/**
	 * Gets the base gold reward for a room.
	 * @param {number} row - the row the room is in.
	 */
	function getGoldReward(row) {
		return randomInt(25, 50) + (row - 1) * 2;
	};
	/**
	 * Updates the map generation progress.
	 */
	async function updateGenProg() {
		clearCanvas();
		if (genProg === GEN_STEPS) {
			draw.lore(200 - 2, 100 - 5.5 * 3, "Generating Map...\n\nrunning final checks...", {"color": "#fff", "text-align": DIR.CENTER});
			genProg = 0;
		} else {
			draw.lore(200 - 2, 100 - 5.5 * 3, "Generating Map...\n\n" + (genProg / GEN_STEPS * 100).toFixed(0) + "%", {"color": "#fff", "text-align": DIR.CENTER});
			genProg++;
		};
		await new Promise(resolve => setTimeout(resolve));
	};
	/**
	 * Returns a map node.
	 * @param {number} row - the row of the map node.
	 * @param {number} y - the y-coordinate of the map node.
	 * @param {number} attribute - the attribute of the map node, if any.
	 */
	function getMapNode(row, y, attribute = -1) {
		const area = get.area(row);
		if (attribute === MAP_NODE.FIRST) return [ROOM.BATTLE, 0, 0, [SMALL_ENEMIES[area]], getGoldReward(row), randomCardSet(5)];
		const x = ((row - area * 10) * 32) - 7 + randomInt(-5, 5);
		if (attribute === MAP_NODE.TREASURE) return [ROOM.TREASURE, x, y, [], getGoldReward(row) * 2, randomCardSet(5, 4/10)];
		if (attribute === MAP_NODE.PRIME) return [ROOM.PRIME, x, y, [getWeakerSmallEnemy(row), PRIME_ENEMIES[area], getWeakerSmallEnemy(row)], getGoldReward(row) * 2, randomCardSet(5, 9/10), randomArtifactSet(3)];
		if (attribute === MAP_NODE.EVENT) {
			let index = randomInt(0, EVENTS.any.length + EVENTS[area].length - 1);
			if (index >= EVENTS.any.length) index += 100 - EVENTS.any.length;
			return [ROOM.EVENT, x, y, index, getGoldReward(row), randomCardSet(5)];
		};
		if (attribute === MAP_NODE.ORB) return [ROOM.ORB, x, y];
		if (attribute === MAP_NODE.BOSS) return [ROOM.BOSS, ((row - area * 10) * 32) + 3, 90, [BOSS_ENEMIES[area]], getGoldReward(row) * 4, randomCardSet(5, 9/10), randomArtifactSet(3)];
		let node = [ROOM.BATTLE, x, y];
		if (row % 10 >= 6) {
			if (chance(1/3)) node.push([(chance() ? SPECIAL_ENEMIES : BIG_ENEMIES)[area]]);
			else if (chance()) node.push([BIG_ENEMIES[area], getWeakerSmallEnemy(row)]);
			else node.push([SMALL_ENEMIES[area], SMALL_ENEMIES[area]]);
		} else {
			if (chance()) node.push([(chance((row - 1) / 10 - area) ? SPECIAL_ENEMIES : BIG_ENEMIES)[area]]);
			else node.push([SMALL_ENEMIES[area], getWeakerSmallEnemy(row)]);
		};
		node.push(getGoldReward(row), randomCardSet(5));
		return node;
	};
	/**
	 * Adds the specified paths to `game.paths` if they do not already exist.
	 * @param {number} fromRow - The row that the paths start from.
	 * @param {number} fromIndex - The index of the node that the paths start from.
	 * @param {number[]} toIndexes - The indexes of the nodes that the paths end at.
	 */
	function addPaths(fromRow, fromIndex, toIndexes) {
		if (!game.paths[fromRow]) {
			game.paths[fromRow] = [];
		};
		if (!game.paths[fromRow][fromIndex]) {
			game.paths[fromRow][fromIndex] = [];
		};
		for (const index of toIndexes) {
			if (!game.paths[fromRow][fromIndex].includes(index)) {
				game.paths[fromRow][fromIndex].push(index);
			};
		};
		game.paths[fromRow][fromIndex].sort();
	};
	/**
	 * Returns a map row.
	 * @param {number} row - the row number.
	 */
	function generateMapRow(row) {
		if (row % 10 === 1) {
			game.map[row] = [32, randomInt(64, 96), 128].map(yOffset => getMapNode(row, 18 + yOffset + randomInt(-4, 4)));
			addPaths(row - 1, 0, Array.from({length: game.map[row].length}, (_, i) => i));
		} else if (row % 10 === 0) {
			game.map[row] = [getMapNode(row, 90, MAP_NODE.BOSS)];
			game.map[row - 1].forEach((node, index) => addPaths(row - 1, index, [0]));
		} else {
			game.map[row] = [];
			game.map[row - 1].forEach((prevNode, prevIndex) => {
				let newNodeIndexes = ["findLastIndex", "findIndex"].map((method, side) => {
					if (row % 10 === 9) side = 0.5;
					let index = game.map[row][method](node => node[2] - prevNode[2] >= MAP_NODE_SPREAD * (side - 1) && node[2] - prevNode[2] <= MAP_NODE_SPREAD * side);
					if (index === -1) {
						const min = Math.max(prevNode[2] + MAP_NODE_SPREAD * (side - 1), MAP_NODE_MIN_Y);
						const max = Math.min(prevNode[2] + MAP_NODE_SPREAD * side, MAP_NODE_MAX_Y);
						let y = randomInt(min, max);
						if (min < MAP_NODE_MIN_Y) {
							y += MAP_NODE_MIN_Y - min;
						} else if (max > MAP_NODE_MAX_Y) {
							y -= MAP_NODE_MAX_Y - max;
						};
						if (row % 10 === 9) y = Math.round((2 * y + 90) / 3);
						index = game.map[row][method](node => Math.abs(node[2] - y) <= MAP_NODE_SPREAD);
						if (index === -1) {
							game.map[row].push(getMapNode(row, y, (row % 10 === 9 ? MAP_NODE.ORB : -1)));
							index = game.map[row].length - 1;
						};
					};
					return index;
				});
				if (row % 10 < 9 && pathInfo[row - 1][prevIndex][ROOM.BRANCH_INFO] < row - 2 && newNodeIndexes[0] === newNodeIndexes[1]) {
					const y = game.map[row][newNodeIndexes[0]][2] + MAP_NODE_SPREAD + randomInt(-4, 4);
					if (y <= MAP_NODE_MAX_Y) {
						game.map[row].push(getMapNode(row, y));
						newNodeIndexes[1] = game.map[row].length - 1;
					};
				};
				addPaths(row - 1, prevIndex, newNodeIndexes);
			});
		};
		calculatePathInfo(row);
	};
	/**
	 * Calculates the path types and branch info of a map row.
	 * @param {number} row - the row number.
	 */
	function calculatePathInfo(row) {
		const area = get.area(row);
		pathInfo[row] = [];
		for (let index = 0; index < game.map[row].length; index++) {
			pathInfo[row][index] = {[game.map[row][index][0]]: row, [ROOM.BRANCH_INFO]: area * 10};
			const battleType = getBattleType(game.map[row][index]);
			if (battleType >= 0) pathInfo[row][index][ROOM.BATTLE_0 + battleType] = row;
			if (row % 10 <= 1) continue;
			const x = row - 1;
			game.paths[x].forEach((toIndexes, y) => {
				if (toIndexes.includes(index)) {
					for (const key in pathInfo[x][y]) {
						pathInfo[row][index][key] = Math.max(pathInfo[row][index][key], pathInfo[x][y][key]);
					};
					if (toIndexes.length > 1) pathInfo[row][index][ROOM.BRANCH_INFO] = row;
				};
			});
		};
	};
	/**
	 * Checks if a map path has any nodes of specified types.
	 * @param {number[]} coords - the coordinates of the node to start searching from.
	 * @param {number[]} types - an array of the node types to check for.
	 * @param {boolean} front - if true, searches from the front instead of the back.
	 */
	function pathHasTypes(coords, types, front = false) {
		if (!front) {
			for (let index = 0; index < types.length; index++) {
				if (pathInfo[coords[0]][coords[1]][types[index]] !== undefined) return true;
			};
			return false;
		};
		const locations = [coords];
		for (let index = 0; index < locations.length; index++) {
			const loc = locations[index];
			if (!game.map[loc[0]] || !game.map[loc[0]][loc[1]] || game.map[loc[0]][loc[1]][0] === ROOM.BOSS) {
				continue;
			};
			if (types.includes(game.map[loc[0]][loc[1]][0])) {
				return true;
			};
			let availableLocations = get.availableLocations(loc[0], loc[1]);
			for (let i2 = 0; i2 < availableLocations.length; i2++) {
				if (get.availableLocations(loc[0] + 1, availableLocations[i2]).length) locations.push([loc[0] + 1, availableLocations[i2]]);
			};
		};
		return false;
	};
	/**
	 * Generates an area of the map.
	 * @param {number} area - the area number.
	 */
	async function generateArea(area) {
		let deathZones = 0;
		const eventShift = randomInt(0, 1);
		for (let index = 1; index <= 10; index++) {
			const rowNum = index + area * 10;
			await generateMapRow(rowNum);
			if (rowNum % 10 > 1 && rowNum % 10 < 9) {
				let newRow = game.map[rowNum];
				// add treasure
				if (rowNum % 10 >= 3) {
					let available = [0, 1, 2, 3, 4, 5];
					let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
					while (true) {
						if (newRow[rand] && !pathHasTypes([rowNum, rand], [ROOM.TREASURE, ROOM.PRIME])) {
							newRow[rand] = getMapNode(rowNum, newRow[rand][2], MAP_NODE.TREASURE);
							calculatePathInfo(rowNum);
							break;
						} else if (available.length) {
							rand = available.splice(randomInt(0, available.length - 1), 1)[0];
						} else {
							break;
						};
					};
				};
				// add death zone
				if (rowNum % 10 >= 4 && deathZones < 2) {
					let available = [0, 1, 2, 3, 4, 5];
					let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
					while (true) {
						if (newRow[rand] && newRow[rand][0] !== ROOM.TREASURE && !pathHasTypes([rowNum, rand], [ROOM.TREASURE, ROOM.PRIME])) {
							newRow[rand] = getMapNode(rowNum, newRow[rand][2], MAP_NODE.PRIME);
							deathZones++;
							calculatePathInfo(rowNum);
							break;
						} else if (available.length) {
							rand = available.splice(randomInt(0, available.length - 1), 1)[0];
						} else {
							break;
						};
					};
				};
				// add event
				if (rowNum % 2 == eventShift && rowNum % 10 < 8) {
					let available = [0, 1, 2, 3, 4, 5];
					let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
					while (true) {
						if (newRow[rand] && newRow[rand][0] !== ROOM.TREASURE && newRow[rand][0] !== ROOM.PRIME && !pathHasTypes([rowNum, rand], [ROOM.EVENT])) {
							newRow[rand] = getMapNode(rowNum, newRow[rand][2], MAP_NODE.EVENT);
							calculatePathInfo(rowNum);
							break;
						} else if (available.length) {
							rand = available.splice(randomInt(0, available.length - 1), 1)[0];
						} else {
							break;
						};
					};
				};
			};
			await updateGenProg();
		};
		// add death zone (no `calculatePathTypes()` is needed after this, as this is the last usage of pathHasTypes in this area)
		let row = 4 + area * 10;
		while (deathZones === 0) {
			let available = [0, 1, 2, 3, 4, 5];
			let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
			while (true) {
				if (game.map[row][rand] && (game.map[row][rand][0] === ROOM.TREASURE || (row % 10 === 3 && game.map[row][rand][0] === ROOM.BATTLE)) && !pathHasTypes([row, rand], [ROOM.TREASURE, ROOM.PRIME], true)) {
					game.map[row][rand] = getMapNode(row, game.map[row][rand][2], MAP_NODE.PRIME);
					deathZones++;
					break;
				} else if (available.length) {
					rand = available.splice(randomInt(0, available.length - 1), 1)[0];
				} else {
					break;
				};
			};
			if (row % 10 >= 7) row = 3 + area * 10;
			else if (row % 10 === 3) break;
			else row++;
		};
	};
	/**
	 * Adds scribbles to the map.
	 */
	function addScribbles() {
		let available = [0, 1, 2, 3, 4];
		for (let index = 0; index < 2; index++) {
			if (chance()) {
				game.scribbles[index * 2] = available.splice(randomInt(0, available.length - 1), 1)[0];
				if (!available.length) available = [0, 1, 2, 3, 4];
				game.scribbles[index * 2 + 1] = available.splice(randomInt(0, available.length - 1), 1)[0];
				if (!available.length) available = [0, 1, 2, 3, 4];
			} else {
				game.scribbles[randomInt(index * 2, index * 2 + 1)] = available.splice(randomInt(0, available.length - 1), 1)[0];
				if (!available.length) available = [0, 1, 2, 3, 4];
			};
		};
	};
	return async () => {
		const startTime = performance.now();
		loaded = false;
		game.map = [];
		game.paths = [];
		game.scribbles = [-1, -1, -1, -1];
		await updateGenProg();
		game.map[0] = [getMapNode(0, 0, MAP_NODE.FIRST)];
		game.room = game.map[0][0];
		await generateArea(0);
		await generateArea(1);
		addScribbles();
		console.log("[map data generated in " + (performance.now() - startTime) + "ms]");
		await generateMapPathPoints();
		loaded = true;
	};
})();
