import * as PIXI from 'pixi.js';
import { runInThisContext } from 'vm';

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
        this.actionqueue = [];

        // Limits and Statistics
        this.x_max_speed = 2; // 2
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
        this.scale = 1;

        /*
         *  EVERY. ANIMATION. HAS. THREE. FRAMES. HOT. DAMN.
         *    ...time to redo this class. Was a good experiment.
         */

        this.interweaveFrames(this.upFrames, this.animation.up, 'up');
        this.interweaveFrames(this.upRightFrames, this.animation.upRight, 'right-up');
        this.interweaveFrames(this.downRightFrames, this.animation.downRight, 'right-down');
        this.interweaveFrames(this.downFrames, this.animation.down, 'down');

        // right (abnormal)
        for (let x = 1; x <= 3; x++) {
            this.rightFrames.push(Tex.fromFrame(`right-0${x}.png`));
        }
        this.animation.right = new AnimSpr(this.rightFrames);
        this.setFramerate(this.animation.right);

        // Use new sprite.
        this.sprite = this.animation.right;
        this.sprite.isPlayer = true;
    }

    setFramerate(animObj) {
        animObj.anchor.set(0.5);
        animObj.animationSpeed = this.baseFrameRate;
        animObj.play();
    }

    interweaveFrames(frames, animation, prefix) {
        for (let x = 2; x <= 3; x++) {
            frames.push(Tex.fromFrame(`${prefix}-01.png`));
            frames.push(Tex.fromFrame(`${prefix}-0${x}.png`));
        }
        animation = new AnimSpr(frames);
        this.setFramerate(animation);
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
        if (this.actionqueue[0]) {
            const action = this.actionqueue[0];
            console.log(action.type);

            console.log(`
                A:(${this.x},${this.y})
                B:(${action.x},${action.y})
                Diff:${this.hyp({ x: this.x, y: this.y }, { x: action.x, y: action.y })}
                `);

            if (this.hyp({ x: this.x, y: this.y }, { x: action.x, y: action.y }) < 15) {
                this.actionqueue.shift();
                this.accelerating_x = false;
                this.accelerating_y = false;
            } else {
                this.accelerating_x = true;
                this.accelerating_y = true;

                if (this.x > action.x) {
                    this.x_speed -= this.acceleration_speed;
                }

                if (this.x < action.x) {
                    this.x_speed += this.acceleration_speed;
                }

                if (this.y > action.y) {
                    this.y_speed -= this.acceleration_speed;
                }

                if (this.y < action.y) {
                    this.y_speed += this.acceleration_speed;
                }
            }
        }

        this.limitSpeed();

        if (Math.abs(this.x_speed) > 0.05) {
            if (!this.accelerating_x) {
                this.x_speed = this.slow(this.x_speed);
            }
        } else {
            this.accelerating_x = false;
            this.x_speed = 0;
        }

        if (Math.abs(this.y_speed) > 0.05) {
            if (!this.accelerating_y) {
                this.y_speed = this.slow(this.y_speed);
            }
        } else {
            this.accelerating_y = false;
            this.y_speed = 0;
        }

        if (this.x_speed || this.y_speed) {
            this.move(this.x_speed, this.y_speed);
        }

        this.animate();
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
        if (this.x + dxNormalized < -30) {
            dxNormalized = -dxNormalized;
            this.x_speed = -this.x_speed / 2;
            this.x = -29;
            this.sprite.x = -29;
        }

        //  RIGHT
        if (this.x + dxNormalized > 617) {
            dxNormalized = -dxNormalized;
            this.x_speed = -this.x_speed / 2;
            this.x = 616;
            this.sprite.x = 616;
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
        console.log(`${this.name}: ${this.x},${this.y}`);

        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale.x = (dxNormalized >= 0) ? this.scale : -this.scale;
        this.sprite.scale.y = this.scale;
        // this.sprite.skew.x = -dxNormalized / 6;
        this.sprite.animationSpeed = this.baseFrameRate * (0.4 + (0.6 * Math.sqrt((dxNormalized * dxNormalized) + (dyNormalized * dyNormalized))));
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

    hyp(pointA, pointB) {
        const xlen = Math.abs(pointA.x - pointB.x);
        const ylen = Math.abs(pointA.y - pointB.y);
        return Math.sqrt((xlen * xlen) + (ylen * ylen));
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
        if (!this.npc) {
            if (this.input.right || this.input.left || this.input.up || this.input.down) {
                this.sprite.play();
            } else {
                this.sprite.gotoAndPlay(0);
                this.sprite.stop();
            }
        } else if (this.npc) {
            if (this.accelerating_x || this.accelerating_y) {
                this.sprite.play();
            } else {
                this.sprite.gotoAndPlay(0);
                this.sprite.stop();
            }
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
            this.currentTexture = texturename;
        }
    }
}

export default Player;
