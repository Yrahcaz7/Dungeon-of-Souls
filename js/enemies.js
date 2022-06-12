class Enemy {
    constructor(type, power) {
        if (type == "slime_small") power--;
        this.type = type;
        this.maxHealth = Math.round(((Math.random() / 4) + 0.875) * ((power * 10) + 20));
        this.health = this.maxHealth;
        this.maxShield = Math.round(((Math.random() / 4) + 0.875) * ((power * 5) + 10));
        this.shield = 0;
        this.attackPower =  Math.round(((power / 2) + 1) * 5);
    };
};
