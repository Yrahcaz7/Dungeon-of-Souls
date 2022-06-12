class Enemy {
    constructor(type, power) {
        this.type = type;
        this.maxHealth = Math.round(((Math.random() / 2) + 0.75) * ((power * 10) + 20));
        this.health = this.maxHealth;
        this.maxShield = Math.round(((Math.random() / 2) + 0.75) * ((power * 5) + 10));
        this.shield = 0;
        this.attackPower =  Math.round(((power / 2) + 1) * 5);
    };
};
