import * as PIXI from 'pixi.js';

const Sprite = PIXI.Sprite;
const Tex = PIXI.Texture;
const AnimSpr = PIXI.extras.AnimatedSprite;

class Player {
    constructor(resources, name) {
        this.name = name;
        this.sprite = new Sprite(resources.pv2.texture);
        this.w = this.sprite.width;
        this.h = this.sprite.height;
        this.sprite.pivot.set(this.w / 2, this.h / 2);
        this.x = 0;
        this.y = 0;
        this.x_speed = 0;
        this.y_speed = 0;
        // x and y for animation. Refactor needed to trig-normalize x/y earlier.
        this.adx = 0.001;
        this.ady = 0.001;

        // Limits and Statistics
        this.x_max_speed = 2;
        this.y_max_speed = 2;
        this.min = 0.1;
        this.npc = true;
        this.haspuck = false;
        this.accelerating_x = false;
        this.accelerating_y = false;
        this.friction = (39 / 40);
        this.acceleration_speed = 0.08;

        // Prepare animation frames:
        this.upFrames = [];
        this.upRightFrames = [];
        this.rightFrames = [];
        this.downRightFrames = [];
        this.downFrames = [];
        this.animation = {};
        this.baseFrameRate = 0.1;
        this.currentTexture = this.rightFrames;

        /*
         *  EVERY. ANIMATION. HAS. THREE. FRAMES. HOT. DAMN.
         *    ...time to redo this class. Was a good experiment.
         */

        // up
        for (let x = 1; x <= 2; x++) {
            this.upFrames.push(Tex.fromFrame(`up-0${x}.png`));
        }
        this.animation.up = new AnimSpr(this.upFrames);
        this.setFramerate(this.animation.up);

        // up right
        for (let x = 1; x <= 2; x++) {
            this.upRightFrames.push(Tex.fromFrame(`right-up-0${x}.png`));
        }
        this.animation.upRight = new AnimSpr(this.upRightFrames);
        this.setFramerate(this.animation.upRight);

        // right
        for (let x = 1; x <= 3; x++) {
            this.rightFrames.push(Tex.fromFrame(`right-0${x}.png`));
        }
        this.animation.right = new AnimSpr(this.rightFrames);
        this.setFramerate(this.animation.right);

        // down right
        for (let x = 1; x <= 2; x++) {
            this.downRightFrames.push(Tex.fromFrame(`right-down-0${x}.png`));
        }
        this.animation.downRight = new AnimSpr(this.downRightFrames);
        this.setFramerate(this.animation.downRight);

        // down
        for (let x = 1; x <= 2; x++) {
            this.downFrames.push(Tex.fromFrame(`down-0${x}.png`));
        }
        this.animation.down = new AnimSpr(this.downFrames);
        this.setFramerate(this.animation.down);

        // this.animation.forEach(x => console.log(x));

        // Use new sprite.
        this.sprite = this.animation.downRight;
    }

    setFramerate(animObj) {
        animObj.anchor.set(0.5);
        animObj.animationSpeed = this.baseFrameRate;
        animObj.play();
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
            this.y_speed -= this.acceleration_speed;
        }
        if (this.input.down) {
            this.y_speed += this.acceleration_speed;
        }
        if (this.input.left) {
            this.x_speed -= this.acceleration_speed;
        }
        if (this.input.right) {
            this.x_speed += this.acceleration_speed;
        }
        if (this.input.primary) {
            console.log('PRIMARY Action. Shoot the puck.');
        }
        if (this.input.secondary) {
            console.log('SECONDARY Action. Pass the puck.');
        }

        this.limitSpeed();
        if (this.x_speed || this.y_speed) {
            this.move(this.x_speed, this.y_speed);
        }

        this.animate();
    }

    npcAction() {
        if (this.x < 200) {
            this.x_speed += 0.04;
        } else if (this.y < 100) {
            this.x_speed = this.slow(this.x_speed);
            this.y_speed = this.slow(this.y_speed);
        } else if (this.x > 220 && this.y > 0) {
            this.y_speed -= 0.04;
            this.x_speed = this.slow(this.x_speed);
        } else {
            this.x_speed = this.slow(this.x_speed);
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

        // Temp bump for boards.
        //  TOP
        if (this.y + dyNormalized < 40) {
            dyNormalized = -dyNormalized;
            this.y_speed = -this.y_speed / 2;
            this.y = 40;
            this.sprite.y = 40;
        }
        //  BOTTOM
        if (this.y + dyNormalized > 240) {
            dyNormalized = -dyNormalized;
            this.y_speed = -this.y_speed / 2;
            this.y = 239;
            this.sprite.y = 239;
        }
        //  LEFT
        if (this.x + dxNormalized < -20) {
            dxNormalized = -dxNormalized;
            this.x_speed = -this.x_speed / 2;
            this.x = -19;
            this.sprite.x = -19;
        }

        //  RIGHT
        if (this.x + dxNormalized > 270) {
            dxNormalized = -dxNormalized;
            this.x_speed = -this.x_speed / 2;
            this.x = 269;
            this.sprite.x = 269;
        }

        // Non-trig bits.
        this.x += dxNormalized;
        this.y += dyNormalized;
        this.adx = dxNormalized;
        this.ady = dyNormalized;
        /*
        console.log(`
        [${dx},${dy}] Moving player to ${this.x},${this.y}
        angle: ${angle}
        x: ${dx} => ${dxNormalized}
        y: ${dy} => ${dyNormalized}
        zi: ${this.sprite.zIndex}
        zo: ${this.sprite.zOrder}
        `);
        */
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale.x = (dxNormalized >= 0) ? 1 : -1;
        // this.sprite.skew.x = -dxNormalized / 6;
        this.sprite.zIndex = this.y;
        this.sprite.zOrder = this.y;
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

    animate() {
        const hyp = Math.sqrt((this.adx * this.adx) + (this.ady * this.ady));
        // trigtime
        const angle = Math.asin(this.ady / hyp);

        // dxNormalized = Math.abs(Math.cos(angle) * dx);
        // dyNormalized = Math.abs(Math.sin(angle) * dy);


        if (angle > 0.9) {
            this.updateTexture('down');
        } else if (angle > 0.3) {
            this.updateTexture('down-right');
        } else if (angle > -0.3) {
            this.updateTexture('right');
        } else if (angle > -0.9) {
            this.updateTexture('up-right');
        } else {
            this.updateTexture('up');
        }

        if (this.input.right || this.input.left || this.input.up || this.input.down) {
            this.sprite.play();
        } else {
            this.sprite.stop();
            this.sprite.goTo
        }
    }

    updateTexture(texturename) {
        if (this.currentTexture !== texturename) {
            switch (texturename) {
            case 'up':
                this.sprite.textures = this.upFrames;
                break;
            case 'up-right':
                this.sprite.textures = this.upRightFrames;
                break;
            case 'right':
                this.sprite.textures = this.rightFrames;
                break;
            case 'down-right':
                this.sprite.textures = this.downRightFrames;
                break;
            case 'down':
                this.sprite.textures = this.downFrames;
                break;
            default:
                this.sprite.textures = this.rightFrames;
                break;
            }
            this.sprite.animationSpeed = this.baseFrameRate;
            this.currentTexture = texturename;
        }
    }
}

export default Player;
