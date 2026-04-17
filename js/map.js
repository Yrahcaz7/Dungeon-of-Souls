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

let paths = {};

/**
 * Calculates the paths of a map region.
 * @param {number} xMin - the inclusive start of the map region to calculate paths for. Defaults to `0`.
 * @param {number} xMax - the exclusive end of the map region to calculate paths for. Defaults to `Infinity`.
 */
function calculateMapPaths(xMin = 0, xMax = Infinity) {
	// calculate connections
	let store = [];
	for (let x = Math.max(xMin, 0); x < xMax && x < game.map.length; x++) {
		const bossRow = (x > 0 && x % 10 === 0);
		for (let y = 0; y < (bossRow ? 1 : game.map[x].length); y++) {
			if (!bossRow && !(game.map[x][y] instanceof Object)) continue;
			const posY = (bossRow ? 90 : game.map[x][y][2]);
			for (const row of [x - 1, x + 1]) {
				if (!game.map[row]) continue;
				let nodeIndexes = getSortedIndexes(game.map[row], (a, b) => Math.abs(a[2] - posY) - Math.abs(b[2] - posY))
				for (let num = 0; num < nodeIndexes.length; num++) {
					if (game.map[row][nodeIndexes[num]] instanceof Object) {
						store.push([x, y, row, nodeIndexes[num]]);
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
			if (!paths[coords[0]][coords[1]].some(location => location === coords[1])) {
				paths[coords[0]][coords[1]].push(coords[3]);
			};
		} else if (coords[0] > coords[2]) {
			if (!paths[coords[2]]) paths[coords[2]] = {};
			if (!paths[coords[2]][coords[3]]) paths[coords[2]][coords[3]] = [];
			if (!paths[coords[2]][coords[3]].some(location => location === coords[1])) {
				paths[coords[2]][coords[3]].push(coords[1]);
			};
		};
		if (coords[0] > 1 && coords[0] % 10 === 1) {
			if (!paths[coords[0] - 1]) paths[coords[0] - 1] = {};
			if (!paths[coords[0] - 1][0]) paths[coords[0] - 1][0] = [];
			if (!paths[coords[0] - 1][0].some(location => location === coords[1])) {
				paths[coords[0] - 1][0].push(coords[1]);
			};
		};
	};
	// sort paths
	for (const x in paths) {
		for (const y in paths[x]) {
			paths[x][y].sort();
		};
	};
};

/** @type {{}[]} */
let mapPathPoints = [];

/**
 * Generates the visual points of all paths in the map and saves them.
 */
const generateMapPathPoints = (() => {
	const MAP_PATH_SUBDIVISIONS = 32;
	/**
	 * Returns an array of points that represent the subdivided path of `points`.
	 * @param {number[][]} points - an array of points that represents a path.
	 */
	function getSubdividedPath(points = []) {
		const t = [];
		const tSquared = [];
		const tCubed = [];
		const increment = 1 / (MAP_PATH_SUBDIVISIONS + 1);
		for (let sub = 0; sub < MAP_PATH_SUBDIVISIONS; sub++) {
			t[sub] = (sub + 1) * increment;
			tSquared[sub] = t[sub] * t[sub];
			tCubed[sub] = tSquared[sub] * t[sub];
		};
		let pathPoints = [points[0]];
		for (let index = 1; index < points.length - 2; index++) {
			const subdivisionIndex = 1 + (index - 1) * (MAP_PATH_SUBDIVISIONS + 1);
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
			for (let sub = 0; sub < MAP_PATH_SUBDIVISIONS; sub++) {
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
		const startRow = area * 10;
		const start = paths[startRow][0];
		let arr = [];
		for (let index = 0; index < start.length; index++) {
			arr.push([[startRow + 1, start[index]], [startRow + 1, start[index]]]);
		};
		// iterate through the area, generating all of the possible paths.
		for (let iteration = 0; iteration < 9; iteration++) {
			let nextArr = [];
			for (let path = 0; path < arr.length; path++) {
				const lastNode = arr[path].at(-1);
				for (let index = 0; index < paths[lastNode[0]][lastNode[1]].length; index++) {
					const node = paths[lastNode[0]][lastNode[1]][index];
					let innerArr = arr[path].slice();
					innerArr.push([lastNode[0] + 1, node]);
					nextArr.push(innerArr);
				};
			};
			arr = nextArr;
		};
		// calculate all possible visual paths for each node pair and log them in `nodePaths`.
		for (let path = 0; path < arr.length; path++) {
			let visualArr = [];
			for (let index = 0; index < arr[path].length; index++) {
				const x = arr[path][index][0];
				const y = arr[path][index][1];
				const node = game.map[x][y];
				if (node[0] === ROOM.BOSS) {
					visualArr.push([node[1] + 16, node[2] + 16]);
					visualArr.push([node[1] + 17, node[2] + 16]);
					visualArr.push([node[1] + 18, node[2] + 16]);
					break;
				} else if (index === 0) {
					visualArr.push([16, node[2] + 8]);
					visualArr.push([17, node[2] + 8]);
				} else {
					visualArr.push([node[1] + 8, node[2] + 8]);
				};
			};
			let pathPoints = getSubdividedPath(visualArr);
			for (let index = 1; index < visualArr.length - 3; index++) {
				const subdivisionIndex = 1 + (index - 1) * (MAP_PATH_SUBDIVISIONS + 1);
				if (!mapPathPoints[arr[path][index - 1][0]]) mapPathPoints[arr[path][index - 1][0]] = {};
				if (!mapPathPoints[arr[path][index - 1][0]][arr[path][index - 1][1]]) mapPathPoints[arr[path][index - 1][0]][arr[path][index - 1][1]] = {};
				const firstNode = mapPathPoints[arr[path][index - 1][0]][arr[path][index - 1][1]];
				if (!firstNode[arr[path][index][0]]) firstNode[arr[path][index][0]] = {};
				if (!firstNode[arr[path][index][0]][arr[path][index][1]]) firstNode[arr[path][index][0]][arr[path][index][1]] = [];
				const nodePair = firstNode[arr[path][index][0]][arr[path][index][1]];
				for (let sub = 0; sub < MAP_PATH_SUBDIVISIONS + 2; sub++) {
					if (!nodePair[sub]) nodePair[sub] = [];
					nodePair[sub].push(pathPoints[subdivisionIndex + sub]);
				};
			};
		};
		// average the points in `nodePaths` for each subdivision for each node pair.
		for (let row1 = area * 10 + 1; row1 <= (area + 1) * 10 && row1 < mapPathPoints.length; row1++) {
			for (const node1 in mapPathPoints[row1]) {
				for (const row2 in mapPathPoints[row1][node1]) {
					for (const node2 in mapPathPoints[row1][node1][row2]) {
						const nodePair = mapPathPoints[row1][node1][row2][node2];
						let averagePath = [];
						for (let sub = 0; sub < nodePair.length; sub++) {
							let total = [0, 0];
							for (let index = 0; index < nodePair[sub].length; index++) {
								total[0] += nodePair[sub][index][0];
								total[1] += nodePair[sub][index][1];
							};
							averagePath.push([total[0] / nodePair[sub].length, total[1] / nodePair[sub].length]);
						};
						mapPathPoints[row1][node1][row2][node2] = averagePath;
					};
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
 * Generates a map and saves it.
 */
const generateMap = (() => {
	const GEN_STEPS = 20;
	let genProg = 0;
	let rowFalses = [0, 0];
	let rowNodes = [0, 0];
	let pathTypes = [];
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
		const x = ((row - area * 10) * 32) - 7 + randomInt(-5, 5);
		if (attribute === MAP_NODE.FIRST) return [ROOM.BATTLE, 0, 0, [SMALL_ENEMIES[area]], getGoldReward(row), randomCardSet(5)];
		if (attribute === MAP_NODE.TREASURE) return [ROOM.TREASURE, x, y, [], getGoldReward(row) * 2, randomCardSet(5, 4/10)];
		if (attribute === MAP_NODE.PRIME) return [ROOM.PRIME, x, y, [getWeakerSmallEnemy(row), PRIME_ENEMIES[area], getWeakerSmallEnemy(row)], getGoldReward(row) * 2, randomCardSet(5, 9/10), randomArtifactSet(3)];
		if (attribute === MAP_NODE.EVENT) {
			let index = randomInt(0, EVENTS.any.length + EVENTS[area].length - 1);
			if (index >= EVENTS.any.length) index += 100 - EVENTS.any.length;
			return [ROOM.EVENT, x, y, index, getGoldReward(row), randomCardSet(5)];
		};
		if (attribute === MAP_NODE.ORB) return [ROOM.ORB, x, y];
		if (attribute === MAP_NODE.BOSS) return [ROOM.BOSS, ((row - area * 10) * 32) + 3, 90, [BOSS_ENEMIES[area]], getGoldReward(row) * 4, randomCardSet(5, 9/10), randomArtifactSet(3)];
		let type = (attribute === MAP_NODE.BATTLE || chance(3/5) ? ROOM.BATTLE : false);
		if (rowFalses[area] >= 3 || (rowNodes[area] + rowFalses[area] === 2 && rowFalses[area] === 2)) type = ROOM.BATTLE;
		if (type) rowNodes[area]++;
		else rowFalses[area]++;
		if (!type || rowNodes[area] === 6) return false;
		let result = [type, x, y];
		if (type === ROOM.BATTLE) {
			if (row % 10 >= 6) result.push(chance(1/3) ? [(chance() ? SPECIAL_ENEMIES : BIG_ENEMIES)[area]] : (chance() ? [BIG_ENEMIES[area], getWeakerSmallEnemy(row)] : [SMALL_ENEMIES[area], SMALL_ENEMIES[area]]));
			else result.push(chance() ? [(chance((row - 1) / 10 - area) ? SPECIAL_ENEMIES : BIG_ENEMIES)[area]] : [SMALL_ENEMIES[area], getWeakerSmallEnemy(row)]);
			result.push(getGoldReward(row), randomCardSet(5));
		};
		return result;
	};
	/**
	 * Returns a map row.
	 * @param {number} row - the row number.
	 */
	function getMapRow(row) {
		const area = get.area(row);
		rowFalses[area] = 0;
		rowNodes[area] = 0;
		let nodes = [];
		if (row % 10 === 1) {
			nodes.push(...[randomInt(1, 2), randomInt(3, 4)].map(col => getMapNode(row, 18 + (col * 32) + randomInt(-5, 5), MAP_NODE.BATTLE)));
			//paths[row - 1][0] = [0, 1];
		} else if (row % 10 === 9) {
			if (chance()) {
				nodes.push(...[0, 2, (chance() ? 4 : 5)].map(col => getMapNode(row, 18 + (col * 32) + randomInt(-5, 5), MAP_NODE.ORB)));
			} else {
				nodes.push(...[(chance() ? 0 : 1), 3, 5].map(col => getMapNode(row, 18 + (col * 32) + randomInt(-5, 5), MAP_NODE.ORB)));
			};
		} else if (row % 10 === 0) {
			nodes.push(getMapNode(row, 90, MAP_NODE.BOSS));
		} else {
			for (let index = 0; index < 6; index++) {
				const node = getMapNode(row, 18 + (index * 32) + randomInt(-5, 5));
				if (node) nodes.push(node);
			};
		};
		return nodes;
	};
	/**
	 * Calculates the path types of a map row.
	 * @param {number} row - the row number. Defaults to `pathTypes.length`.
	 */
	function calculatePathTypes(row = pathTypes.length) {
		if (!game.map[row]) return;
		const arr = [];
		for (let num = 0; num < game.map[row].length; num++) {
			if (!game.map[row][num]) {
				arr.push([]);
				continue;
			};
			const types = [game.map[row][num][0]];
			if (row % 10 > 1) {
				const x = row - 1;
				for (const y in paths[x]) {
					if (paths[x][y].some(location => location === num)) {
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
	 * @param {boolean} front - if true, searches from the front instead of the back.
	 */
	function pathHasTypes(coords, types, front = false) {
		if (!front) {
			for (let index = 0; index < types.length; index++) {
				if (pathTypes[coords[0]][coords[1]].includes(types[index])) return true;
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
			game.map[rowNum] = await getMapRow(rowNum);
			calculateMapPaths(rowNum - 1, rowNum + 1);
			calculatePathTypes(rowNum);
			if (rowNum % 10 > 1 && rowNum % 10 < 9) {
				let newRow = game.map[rowNum];
				// add treasure
				if (rowNum % 10 >= 3) {
					let available = [0, 1, 2, 3, 4, 5];
					let rand = available.splice(randomInt(0, available.length - 1), 1)[0];
					while (true) {
						if (newRow[rand] && !pathHasTypes([rowNum, rand], [ROOM.TREASURE, ROOM.PRIME])) {
							newRow[rand] = getMapNode(rowNum, newRow[rand][2], MAP_NODE.TREASURE);
							calculatePathTypes(rowNum);
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
							calculatePathTypes(rowNum);
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
							calculatePathTypes(rowNum);
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
		paths = {};
		game.map = [];
		game.scribbles = [-1, -1, -1, -1];
		await updateGenProg();
		game.map[0] = [getMapNode(0, 0, MAP_NODE.FIRST)];
		game.room = game.map[0][0];
		await Promise.all([generateArea(0), generateArea(1)]);
		addScribbles();
		console.log("[map data generated in " + (performance.now() - startTime) + "ms]");
		await generateMapPathPoints();
		loaded = true;
	};
})();
