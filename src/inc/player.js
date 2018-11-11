import * as PIXI from 'pixi.js';

const Sprite = PIXI.Sprite;

class Player {
    constructor(resources, name) {
        this.name = name;
        this.sprite = new Sprite(resources.pv1.texture);
        this.w = this.sprite.width;
        this.h = this.sprite.height;
        this.sprite.pivot.set(this.w / 2, this.h / 2);
        this.x = 0;
        this.y = 0;
        this.x_speed = 0;
        this.y_speed = 0;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.sprite.x = x;
        this.sprite.y = y;
    }
}

export default Player;
