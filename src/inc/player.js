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

        // Limits and Statistics
        this.x_max_speed = 1;
        this.y_max_speed = 1;
        this.min = 0.1;
        this.npc = true;
        this.haspuck = false;
        this.accelerating_x = false;
        this.accelerating_y = false;
        this.friction = (39 / 40);
        this.acceleration_speed = 0.05;
    }

    /*
     * action() is called with every animation frame.
     */

    inputAction() {
        if (this.input.right || this.input.left) {
            this.accelerating_x = true;
        } else {
            this.accelerating_x = false;
            this.x_speed = this.slow(this.x_speed);
        }

        if (this.input.up || this.input.down) {
            this.accelerating_y = true;
        } else {
            this.accelerating_y = false;
            this.y_speed = this.slow(this.y_speed);
        }

        if (this.input.up) {
            console.log('UP Action. Move up.');
            this.y_speed -= this.acceleration_speed;
        }
        if (this.input.down) {
            console.log('DOWN Action. Move down.');
            this.y_speed += this.acceleration_speed;
        }
        if (this.input.left) {
            console.log('LEFT Action. Move left.');
            this.x_speed -= this.acceleration_speed;
        }
        if (this.input.right) {
            console.log('RIGHT Action. Move right.');
            this.x_speed += this.acceleration_speed;
        }
        if (this.input.primary) {
            console.log('PRIMARY Action. Shoot the puck.');
        }
        if (this.input.secondary) {
            console.log('RIGHT Action. Pass the puck.');
        }

        this.limitSpeed();
        if (this.x_speed || this.y_speed) {
            this.move(this.x_speed, this.y_speed);
        }
    }

    npcAction() {
        if (this.x < 200) {
            this.x_speed += 0.04;
        }else {
            this.x_speed = this.slow(this.x_speed, this.friction, this.min);
        }
        this.limitSpeed();
        if (this.x_speed || this.y_speed) {
            this.move(this.x_speed, this.y_speed);
        }
    }

    moveTo(x, y) {
        console.log(`Moving player to ${x},${y}`);
        this.x = x;
        this.y = y;
        this.sprite.x = x;
        this.sprite.y = y;
    }

    move(dx, dy) {
        // Trig bits will need to be fixed the moment x and y max speed are not the same.
        // Normalize dx and dy:

        let angle = 0;
        let dxNormalized = dx; // Math.acos(angle);
        let dyNormalized = dy; // Math.asin(angle);

        if (dx && dy) {
            angle = Math.atan(dy / dx);
            dxNormalized = Math.abs(Math.cos(angle) * dx);
            dyNormalized = Math.abs(Math.sin(angle) * dy);

            dxNormalized *= ((dx >= 0) ? 1 : -1);
            dyNormalized *= ((dy >= 0) ? 1 : -1);
        }

        // Non-trig bits.
        this.x += dxNormalized;
        this.y += dyNormalized;
        console.log(`
        [${dx},${dy}] Moving player to ${this.x},${this.y}
        angle: ${angle}
        x: ${dx} => ${dxNormalized}
        y: ${dy} => ${dyNormalized}
        `);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale.x = (dxNormalized <= 0) ? 1 : -1;
        this.sprite.skew.x = -dxNormalized / 5;
    }

    limitSpeed() {
        if (this.x_speed > this.x_max_speed) {
            this.x_speed = this.x_max_speed;
        }
        if (this.y_speed > this.y_max_speed) {
            this.y_speed = this.y_max_speed;
        }

        if (this.x_speed < -this.x_max_speed) {
            this.x_speed = -this.x_max_speed;
        }
        if (this.y_speed < -this.y_max_speed) {
            this.y_speed = -this.y_max_speed;
        }
    }

    slow(speed) {
        if (speed > 0 && speed < this.min) {
            return 0;
        }

        if (speed < 0 && speed > -this.min) {
            return 0;
        }

        return Number((speed * this.friction).toFixed(4));
    }

    useInput(input) {
        this.input = input;
        this.npc = false;
        this.action = this.inputAction;
    }

    useAI() {
        this.npc = true;
        this.action = this.npcAction;
    }
}

export default Player;
