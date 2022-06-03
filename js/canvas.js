var canvas;
var ctx;

function retrieveCanvasData() {
	let canv = document.getElementById("canvas");
	if (canv === undefined || canv === null) return false;
	canvas = canv;
	ctx = canvas.getContext("2d");
	return true;
};
