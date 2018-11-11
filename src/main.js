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
        .add('pv1', 'sprites/player-v1.png')
        .on('progress', handleProgress)
        .load(setup);
}

/*
 * Setup runs after all resources have been loaded as textures.
 */
function setup() {
    sam = new Player(resources, 'sam');
    sam.useInput(playerInput);

    npc = new Player(resources, 'npc');
    npc.useAI();

    console.log(`
    Sprite size: ${sam.sprite.width},${sam.sprite.height}
    `);

    sam.moveTo(gameWidth / 2, gameHeight / 2);
    npc.moveTo(gameWidth / 2 + 16, gameHeight / 2 + 16);

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
