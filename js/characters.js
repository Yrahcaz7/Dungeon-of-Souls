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

const characters = {
	"!": [
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[],
		[],
		[0, 0, 1],
	], '"': [
		[1, 1, 0, 1, 1],
		[1, 0, 0, 1],
	], "#": [
		[0, 1, 0, 1],
		[0, 1, 0, 1],
		[1, 1, 1, 1, 1],
		[0, 1, 0, 1],
		[0, 1, 0, 1],
		[1, 1, 1, 1, 1],
		[0, 1, 0, 1],
		[0, 1, 0, 1],
	], "$": [
		[0, 0, 1],
		[0, 1, 1, 1, 1],
		[1, 0, 1],
		[0, 1, 1, 1],
		[0, 0, 1, 0, 1],
		[0, 0, 1, 0, 1],
		[1, 1, 1, 1],
		[0, 0, 1],
	], "%": [
		[0, 1],
		[1, 0, 1],
		[0, 1],
		[0, 0, 0, 1, 1],
		[1, 1, 1],
		[0, 0, 0, 1],
		[0, 0, 1, 0, 1],
		[0, 0, 0, 1],
	], "&": [
		[],
		[],
		[0, 0, 1, 1],
		[0, 1],
		[0, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 0, 1],
		[0, 1, 1, 0, 1],
	], "'": [
		[0, 0, 1],
		[0, 0, 1],
	], "(": [
		[0, 0, 0, 1],
		[0, 0, 1],
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 0, 1],
		[0, 0, 0, 1],
	], ")": [
		[0, 1],
		[0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 1],
		[0, 1],
	], "*": [
		[0, 0, 1],
		[1, 1, 1, 1, 1],
		[0, 0, 1],
		[0, 1, 0, 1],
		[0, 1, 0, 1],
	], "+": [
		[],
		[0, 0, 1],
		[0, 0, 1],
		[1, 1, 1, 1, 1],
		[0, 0, 1],
		[0, 0, 1],
	], ",": [
		[],
		[],
		[],
		[],
		[],
		[],
		[0, 1, 1],
		[0, 1, 1],
		[0, 0, 1],
		[0, 1],
	], "-": [
		[],
		[],
		[],
		[1, 1, 1, 1, 1],
	], ".": [
		[],
		[],
		[],
		[],
		[],
		[],
		[0, 1, 1],
		[0, 1, 1],
	], "/": [
		[0, 0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 1],
		[0, 1],
		[1],
	], "0": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "1": [
		[0, 0, 1],
		[0, 1, 1],
		[1, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[1, 1, 1, 1, 1],
	], "2": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 1, 1, 1],
		[1],
		[1],
		[1, 1, 1, 1, 1],
	], "3": [
		[1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[1, 1, 1, 1],
	], "4": [
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
	], "5": [
		[1, 1, 1, 1, 1],
		[1],
		[1],
		[0, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[1, 1, 1, 1],
	], "6": [
		[0, 1, 1, 1, 1],
		[1],
		[1],
		[1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "7": [
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
	], "8": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "9": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], ":": [
		[],
		[0, 1, 1],
		[0, 1, 1],
		[],
		[],
		[],
		[0, 1, 1],
		[0, 1, 1],
	], ";": [
		[],
		[0, 1, 1],
		[0, 1, 1],
		[],
		[],
		[],
		[0, 1, 1],
		[1, 1],
		[1],
	], "<": [
		[0, 0, 0, 1, 1],
		[0, 0, 1],
		[0, 1],
		[1],
		[0, 1],
		[0, 0, 1],
		[0, 0, 0, 1, 1],
	], "=": [
		[],
		[],
		[1, 1, 1, 1, 1],
		[],
		[1, 1, 1, 1, 1],
	], ">": [
		[1, 1],
		[0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 1],
		[1, 1],
	], "?": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[],
		[0, 0, 1],
	], "@": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 1, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 0, 1, 1],
		[1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "A": [
		[0, 0, 1],
		[0, 1, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
	], "B": [
		[1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1],
	], "C": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1],
		[1],
		[1],
		[1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "D": [
		[1, 1, 1],
		[1, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 1],
		[1, 1, 1],
	], "E": [
		[1, 1, 1, 1, 1],
		[1],
		[1],
		[1, 1, 1, 1],
		[1],
		[1],
		[1],
		[1, 1, 1, 1, 1],
	], "F": [
		[1, 1, 1, 1, 1],
		[1],
		[1],
		[1, 1, 1, 1],
		[1],
		[1],
		[1],
		[1],
	], "G": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1],
		[1],
		[1, 0, 0, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "H": [
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
	], "I": [
		[1, 1, 1, 1, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[1, 1, 1, 1, 1],
	], "J": [
		[1, 1, 1, 1, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[1, 0, 1],
		[1, 0, 1],
		[0, 1, 1],
	], "K": [
		[1, 0, 0, 0, 1],
		[1, 0, 0, 1],
		[1, 0, 1],
		[1, 1],
		[1, 1],
		[1, 0, 1],
		[1, 0, 0, 1],
		[1, 0, 0, 0, 1],
	], "L": [
		[1],
		[1],
		[1],
		[1],
		[1],
		[1],
		[1],
		[1, 1, 1, 1, 1],
	], "M": [
		[1, 0, 0, 0, 1],
		[1, 1, 0, 1, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
	], "N": [
		[1, 1, 0, 0, 1],
		[1, 1, 0, 0, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 0, 1, 1],
		[1, 0, 0, 1, 1],
	], "O": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "P": [
		[1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1],
		[1],
		[1],
		[1],
	], "Q": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
		[0, 0, 1, 1, 1],
	], "R": [
		[1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1],
		[1, 0, 1],
		[1, 0, 0, 1],
		[1, 0, 0, 0, 1],
	], "S": [
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1],
		[0, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "T": [
		[1, 1, 1, 1, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
	], "U": [
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "V": [
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 0, 1],
		[0, 1, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
	], "W": [
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1],
		[0, 1, 0, 1],
	], "X": [
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 1, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
	], "Y": [
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
	], "Z": [
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 1],
		[1],
		[1, 1, 1, 1, 1],
	], "[": [
		[0, 1, 1, 1],
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 1, 1, 1],
	], "\\": [
		[1],
		[0, 1],
		[0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 0, 1],
	], "]": [
		[0, 1, 1, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 1, 1, 1],
	], "^": [
		[0, 0, 1],
		[0, 1, 0, 1],
		[1, 0, 0, 0, 1],
	], "_": [
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[1, 1, 1, 1, 1],
	], "`": [
		[0, 0, 1],
		[0, 0, 0, 1],
	], "a": [
		[],
		[],
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1, 1],
	], "b": [
		[1],
		[1],
		[1],
		[1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1],
	], "c": [
		[0],
		[0],
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1],
		[1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "d": [
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1, 1],
	], "e": [
		[0],
		[0],
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
		[1],
		[1],
		[0, 1, 1, 1, 1],
	], "f": [
		[0, 0, 1, 1, 1],
		[0, 1],
		[1, 1, 1, 1],
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 1],
	], "g": [
		[],
		[],
		[],
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "h": [
		[1],
		[1],
		[1],
		[1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
	], "i": [
		[0, 0, 1],
		[],
		[],
		[0, 1, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 1, 1, 1],
	], "j": [
		[0, 0, 1],
		[],
		[],
		[0, 1, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[1, 1],
	], "k": [
		[1],
		[1],
		[1],
		[1, 0, 0, 1],
		[1, 0, 1],
		[1, 1],
		[1, 0, 1],
		[1, 0, 0, 1],
	], "l": [
		[0, 1, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[1, 1, 1, 1, 1],
	], "m": [
		[],
		[],
		[],
		[1, 1, 1, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1],
	], "n": [
		[],
		[],
		[],
		[1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
	], "o": [
		[],
		[],
		[],
		[0, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1],
	], "p": [
		[],
		[],
		[],
		[1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1],
		[1],
		[1],
	], "q": [
		[],
		[],
		[],
		[0, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
	], "r": [
		[],
		[],
		[],
		[1, 0, 1, 1],
		[1, 1],
		[1],
		[1],
		[1],
	], "s": [
		[],
		[],
		[],
		[0, 1, 1, 1, 1],
		[1],
		[0, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[1, 1, 1, 1],
	], "t": [
		[],
		[],
		[0, 1],
		[1, 1, 1, 1],
		[0, 1],
		[0, 1],
		[0, 1, 0, 0, 1],
		[0, 0, 1, 1],
	], "u": [
		[],
		[],
		[],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1, 1],
	], "v": [
		[],
		[],
		[],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 0, 1],
		[0, 0, 1],
	], "w": [
		[],
		[],
		[],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1],
		[0, 1, 0, 1],
	], "x": [
		[],
		[],
		[],
		[1, 0, 0, 0, 1],
		[0, 1, 0, 1],
		[0, 0, 1],
		[0, 1, 0, 1],
		[1, 0, 0, 0, 1],
	], "y": [
		[],
		[],
		[],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[1, 1],
	], "z": [
		[],
		[],
		[],
		[1, 1, 1, 1, 1],
		[0, 0, 0, 1],
		[0, 0, 1],
		[0, 1],
		[1, 1, 1, 1, 1],
	], "{": [
		[0, 0, 1, 1],
		[0, 1],
		[0, 1],
		[1, 1],
		[1, 1],
		[0, 1],
		[0, 1],
		[0, 0, 1, 1],
	], "|": [
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
	], "}": [
		[0, 1, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1, 1],
		[0, 0, 0, 1, 1],
		[0, 0, 0, 1],
		[0, 0, 0, 1],
		[0, 1, 1],
	], "~": [
		[],
		[],
		[],
		[0, 1, 0, 0, 1],
		[1, 0, 1, 1],
	],
};
