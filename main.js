import * as PIXI from "pixi.js";
import { Spine } from "pixi-spine";

let baseAnimations;
const app = new PIXI.Application();

setup();

async function setup() {
  document.getElementById("app").appendChild(app.view);
  app.stage.interactive = true;

  baseAnimations = await loadBaseAnimation();

  PIXI.Assets.load("assets/symbol/skeleton.json").then(onAssetsLoaded);
}

function onAssetsLoaded(res) {
  // create a spine boy
  const symbolSpine = new Spine(res.spineData);

  //Add base animations
  symbolSpine.spineData.animations = [
    ...symbolSpine.spineData.animations,
    ...baseAnimations,
  ];
  // set the position
  symbolSpine.x = app.screen.width / 2;
  symbolSpine.y = app.screen.height / 2;

  symbolSpine.scale.set(0.5);

  app.stage.addChild(symbolSpine);

  const allAnimations = [];

  for (let animation of symbolSpine.spineData.animations) {
    allAnimations.push(animation.name);
  }

  // Press the screen to play a random animation
  app.stage.on("pointerdown", () => {
    let animation = allAnimations[1];

    symbolSpine.state.setAnimation(0, animation, false);
  });
}

async function loadBaseAnimation() {
  return await PIXI.Assets.load("assets/anchor/anchor.json").then((json) => {
    return new Spine(json.spineData).spineData.animations;
  });
}
