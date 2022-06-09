var canvas;
var ctx;

function canvasData() {
	document.body.style.cursor = "none";
	let canv = document.getElementById("canvas");
	if (canv === undefined || canv === null) return false;
	canvas = canv;
	width = canvas.width;
	height = canvas.height;
	centerY = height / 2 - 50;
	ctx = canvas.getContext("2d");
	return true;
};
