import * as PIXI from 'pixi.js';
import * as Stats from 'stats.js';

/*
 * Game components are stored in the inc/ directory.
 *  - Engine -> Instantiates PIXI application.
 *  - Player -> The primary player logic/sprite control.
 */
import Engine from './inc/engine';
import Player from './inc/player';
import Input from './inc/input';

const stats = new Stats();
stats.showPanel(0);

// Constants
const gameWidth = 256;
const gameHeight = 240;

// PIXI Config
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// PIXI Aliases as noted in README resources.
const loader = PIXI.loader;
const resources = PIXI.loader.resources;
const Sprite = PIXI.Sprite;

// Important Game Elements
const engine = new Engine(gameWidth, gameHeight);
let sam = null; // Player test.
let npc = null;
let rink = null;
const players = [];
let playerSprites = null;
const playerInput = new Input();
const rootTwoOverTwo = Math.sqrt(2) / 2;

window.addEventListener('resize', () => {
    engine.resize();
}, false);

function game() {
    console.log('running...');

    engine.resize();

    document.getElementById('loading').remove();
    document.body.appendChild(engine.app.view);
    document.body.appendChild(stats.dom);

    loader
        .add('sprites/player/spritesheet.json') // Must be HASH not ARRAY.
        .add('backdrop', 'sprites/backdrop.png')
        .add('pv1', 'sprites/player-v1.png')
        .add('pv2', 'sprites/player-v2.png')
        .on('progress', handleProgress)
        .load(setup);
}

/*
 * Setup runs after all resources have been loaded as textures.
 */
function setup() {
    rink = new Sprite(resources.backdrop.texture);
    rink.x = -100;
    rink.y = -5;

    sam = new Player(resources, 'sam');
    sam.useInput(playerInput);
    players.push(sam);


    npc = new Player(resources, 'npc');
    npc.useAI();
    players.push(npc);

    sam.moveTo(gameWidth / 2, gameHeight / 2);
    npc.moveTo(gameWidth / 2 + 16, gameHeight / 2 + 16);

    engine.app.stage.addChild(rink);
    engine.app.stage.addChild(sam.sprite);
    engine.app.stage.addChild(npc.sprite);
    refreshPlayerSprites(); // Call when new players added.
    console.log('gotime.');
    animate();
}

function animate() {
    stats.begin();

    sam.action();
    npc.action();

    // *slap staples brand (tm) easy button after trying hard earlier. Egh.
    // Organize so players render in y-order.
    engine.app.stage.children.sort((a, b) => a.y - b.y);

    // Player collisions:
    for (let x = 0; x < players.length; x++) {
        for (let y = x + 1; y < players.length; y++) {
            // console.log(`Checking ${x} vs ${y}`);
            const a = players[x];
            const b = players[y];

            const leftbound = (b.x - (b.w / 3));
            const rightbound = (b.x + (b.w / 3));
            const lowerbound = (b.y - (b.h / 4));
            const upperbound = (b.y + (b.h / 4));

            // console.log(`${a.x} is between ${(b.x - (b.w / 2))} ${(b.x + (b.w / 2))}`);
            if (a.x > leftbound
                && a.x < rightbound
                && a.y > lowerbound
                && a.y < upperbound) {
                // console.log('collision');
                bump(a, b, leftbound, rightbound, lowerbound, upperbound);
            }
            // console.log(`Checking ${a.x.toFixed(2)},${a.y.toFixed(2)} vs ${b.x.toFixed(2)},${b.y.toFixed(2)}`);

        }
    }

    stats.end();

    requestAnimationFrame(animate);
}
// a and b are player objects, x and y are booleans.
function bump(a, b, lb, rb, lob, upb) {
    // Update speeds
    const xavg = (a.x_speed + b.x_speed) / 2;
    b.x_speed = xavg + (-b.x_speed / 2);
    a.x_speed = xavg + (-a.x_speed / 2);

    const yavg = (a.y_speed + b.y_speed) / 2;
    a.y_speed = yavg + (-a.y_speed / 2);
    b.y_speed = yavg + (-b.y_speed / 2);

    // Update positions
    const xpos = (a.x > b.x);
    const ypos = (a.y > b.y);
    const xlen = Math.abs(a.x - b.x);
    const ylen = Math.abs(a.y - b.y);
    const hyp = Math.sqrt((xlen * xlen) + (ylen * ylen));
    const angle = Math.acos(xlen / hyp);
    console.log(`Collision angle: ${Math.cos(angle)}.`);
    if (Math.cos(angle) > rootTwoOverTwo) {
        console.log('SIDE');
        if (xpos) {
            a.x = rb + 1;
        } else {
            a.x = lb - 1;
        }
    } else {
        console.log('TOP');
        if (ypos) {
            a.y = upb + 1;
        } else {
            a.y = lob - 1;
        }
    }

}

function refreshPlayerSprites() {
    playerSprites = engine.app.stage.children.filter(x => x.isPlayer);
}

function handleProgress(iloader, resource) {
    console.log(`Loading resources [${iloader.progress}%]: ${resource.url}`);
}

document.addEventListener('DOMContentLoaded', () => {
    // setTimeout(game, 25);
    game();
});
