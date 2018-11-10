import * as PIXI from 'pixi.js';

// Constants
const gameWidth = 256;
const gameHeight = 240;

// PIXI Config
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// PIXI Aliases as noted in README resources.
const Application = PIXI.Application;
const loader = PIXI.loader;
const resources = PIXI.loader.resources;
const Sprite = PIXI.Sprite;

/*
 * import pageNavigation from './inc/page-navigation';
 * import socketIOFunctions from './inc/socket-functions';
*/

const app = new Application(gameWidth, gameHeight, {
    antialias: false,
    transparent: false,
    roundPixels: true,
    resolution: window.devicePixelRatio || 1,
    backgroundColor: 0x222222,
});

function game() {
    console.log('running...');

    resize();
    app.view.style.display = 'block';
    app.view.id = 'brutal-ice';
    app.autoResize = true;
    document.getElementById('loading').remove();
    document.body.appendChild(app.view);

    window.addEventListener('resize', () => {
        resize();
    }, false);

    loader
        .add('pv1', 'sprites/player-v1.png')
        .on('progress', handleProgress)
        .load(setup);
}

/*
 * Setup runs after all resources have been loaded as textures.
 */
function setup() {
    const sprite = new Sprite(resources.pv1.texture);
    console.log(`
    Sprite size: ${sprite.width},${sprite.height}
    `);

    sprite.pivot.set(sprite.width / 2, sprite.height / 2);
    sprite.x = gameWidth / 2;
    sprite.y = gameHeight / 2;

    app.stage.addChild(sprite);
    console.log('gotime.');
}

function resize() {
    const scale = Math.min(
        window.innerWidth / gameWidth,
        window.innerHeight / gameHeight,
    );

    console.log(`Resizing to ${window.innerWidth}, ${window.innerHeight}. Scale ${scale}.`);
    app.renderer.resize(Math.ceil(gameWidth * scale), Math.ceil(gameHeight * scale));
    app.stage.scale.set(scale);
}

function handleProgress(iloader, resource) {
    console.log(`Loading resources [${iloader.progress}%]: ${resource.url}`);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(game, 25);
});
