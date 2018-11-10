import * as PIXI from 'pixi.js';

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

const app = new Application(256, 240, {
    antialias: false,
    transparent: false,
    resolution: 4,
    backgroundColor: 0x090909,
});

function game() {
    console.log('running...');

    resize(app.renderer);
    app.view.style.display = 'block';
    app.autoResize = true;
    document.getElementById('loading').remove();
    document.body.appendChild(app.view);

    window.addEventListener('resize', () => {
        resize(app.renderer);
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
    sprite.x = window.innerWidth / 8;
    sprite.y = window.innerHeight / 8;
    app.stage.addChild(sprite);
    console.log('gotime.');
}

function resize(renderer) {
    console.log(`Resizing to ${window.innerWidth}, ${window.innerHeight}.`);
    renderer.resize(window.innerWidth, window.innerHeight);
}

function handleProgress(iloader, resource) {
    console.log(`Loading resources [${iloader.progress}%]: ${resource.url}`);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(game, 25);
});
