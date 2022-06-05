var canvas;
var ctx;

function canvasData() {
	let canv = document.getElementById("canvas");
	if (canv === undefined || canv === null) return false;
	canvas = canv;
	width = canvas.width;
	height = canvas.height;
	ctx = canvas.getContext("2d");
	return true;
};
