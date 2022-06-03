const slime = new Image;

const healthBar = new Image;

var slimeFrame = 0;

slime.src = "images/slime.png";

healthBar.src = "images/healthBar.png";

function spawnSlime(x, y) {
	if (slimeFrame >= 4) slimeFrame = 0;
	ctx.drawImage(slime, Math.floor(slimeFrame) * 64, 0, 64, 64, x, y, 64, 64);
	slimeFrame += 0.1;
};

function drawHealth(x, y, percentage) {
	if (percentage < 0) frame = 0;
	else if (percentage > 100) frame = 62;
	else frame = percentage * 0.62;
	ctx.drawImage(healthBar, 0, Math.round(frame) * 12, 64, 13, x, y, 64, 13);
};
