# Brutal-Ice

Brutal Ice will be my *very first (usable) public game.*

Remake of the NES Classic "Blades of Steel" in Pixi.JS with NodeJS/Express/Socket.IO multiplayer engine. Beta will be available soon at <https://ryanfleck.github.io/experiments/brutal-ice>

Render dimensions have been set to reflect the constraints of the NES: `256 x 240`.

(Looks like web-packed Pixi.JS is **>1.4 mb!** Beware loading on mobile phones.)

To run on local machine:
1. Clone or download repo.
2. `npm i -g http-server`
3. `npm i` (wait) `npm run build`
4. Open a terminal in the project dir and run `http-server`.
4. Browse to `localhost:8080` and the game will run.

Resources:
1. Lots of best practices and initial setup =>  <https://github.com/kittykatattack/learningPixi#settingup>
