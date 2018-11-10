import * as PIXI from 'pixi.js';

/*
 * import pageNavigation from './inc/page-navigation';
 * import socketIOFunctions from './inc/socket-functions';
*/

function game() {
    console.log('running...');

    const renderer = PIXI.autoDetectRenderer(256, 256, {
        antialias: false,
        transparent: false,
        resolution: 1,
        backgroundColor: 0x090909,
    });

    renderer.view.style.width = `${window.innerWidth}px`;
    renderer.view.style.height = `${window.innerHeight}px`;
    renderer.view.style.display = 'block';
    document.getElementById('loading').remove();
    document.body.appendChild(renderer.view);

    window.addEventListener('resize', () => {
        console.log(`Resizing to ${window.innerWidth}, ${window.innerHeight}`);
        renderer.view.style.width = `${window.innerWidth}px`;
        renderer.view.style.height = `${window.innerHeight}px`;
    }, false);

    const stage = new PIXI.Container();
    renderer.render(stage);
}

document.addEventListener('DOMContentLoaded', () => {
    game();
});
