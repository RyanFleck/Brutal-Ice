import * as PIXI from 'pixi.js';

const Application = PIXI.Application;

class Engine {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.app = new Application(w, h, {
            antialias: false,
            transparent: false,
            roundPixels: true,
            resolution: window.devicePixelRatio || 1,
            backgroundColor: 0x222222,
        });
        this.app.view.style.display = 'block';
        this.app.view.id = 'brutal-ice';
        this.app.autoResize = true;
    }

    resize() {
        const scale = Math.min(
            window.innerWidth / this.w,
            window.innerHeight / this.h,
        );

        this.app.renderer.resize(
            Math.ceil(this.w * scale),
            Math.ceil(this.h * scale),
        );
        this.app.stage.scale.set(scale);
    }
}

export default Engine;
