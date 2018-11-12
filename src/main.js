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
const playerInput = new Input();

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
    sam.sprite.zOrder = 4;

    npc = new Player(resources, 'npc');
    npc.useAI();
    players.push(npc);
    npc.sprite.zOrder = -4;

    console.log(`
    Sprite size: ${sam.sprite.width},${sam.sprite.height}
    `);

    sam.moveTo(gameWidth / 2, gameHeight / 2);
    npc.moveTo(gameWidth / 2 + 16, gameHeight / 2 + 16);

    engine.app.stage.addChild(rink);
    engine.app.stage.addChild(sam.sprite);
    engine.app.stage.addChild(npc.sprite);
    console.log('gotime.');
    animate();
}

function animate() {
    stats.begin();

    sam.action();
    npc.action();

    /*
    let z = 1;

    console.log('\nOrder:');

    players.sort((a, b) => a.y - b.y).forEach((p) => {
        p.sprite.zOrder = z;
        z++;
        console.log(`${p.name} z: ${z} z:${p.sprite.zOrder} y:${p.y}`);
    });

    /*
    sam.sprite.rotation += 0.02;
    const scale = 1 + Math.sin(sam.sprite.rotation * 2) / 3;
    sam.sprite.scale.set(scale, scale);
    */


    stats.end();

    requestAnimationFrame(animate);
}

function handleProgress(iloader, resource) {
    console.log(`Loading resources [${iloader.progress}%]: ${resource.url}`);
}

document.addEventListener('DOMContentLoaded', () => {
    // setTimeout(game, 25);
    game();
});
