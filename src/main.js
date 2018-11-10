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

    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.view.style.display = 'block';
    app.autoResize = true;
    document.getElementById('loading').remove();
    document.body.appendChild(app.view);

    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    }, false);

    loader
        .add('sprites/player-v1.png')
        .load(setup);
}

function setup() {
    const sprite = new Sprite(resources['sprites/player-v1.png'].texture);
    app.stage.addChild(sprite);
    console.log('gotime.');
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(game, 25);
});
