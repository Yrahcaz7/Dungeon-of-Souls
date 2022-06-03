const slime = new Image;

var slimeFrame = 0;

slime.src = "images/slime.png";

function spawnSlime(x, y) {
	if (slimeFrame >= 4) slimeFrame = 0;
	ctx.drawImage(slime, Math.floor(slimeFrame) * 64, 0, 64, 64, x, y, 64, 64);
	slimeFrame += 0.1;
};
