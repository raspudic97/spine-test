import * as PIXI from "pixi.js";
import { Spine } from "pixi-spine";

let baseAnimations;
const app = new PIXI.Application();

setup();

async function setup() {
  document.getElementById("app").appendChild(app.view);
  app.stage.interactive = true;

  baseAnimations = await loadBaseAnimation();

  PIXI.Assets.load("symbol/skeleton.json").then(onAssetsLoaded);
}

function onAssetsLoaded(res) {
  const symbolSpine = new Spine(res.spineData);

  symbolSpine.spineData.animations = [
    ...symbolSpine.spineData.animations,
    ...baseAnimations,
  ];

  symbolSpine.x = app.screen.width / 2;
  symbolSpine.y = app.screen.height / 2;

  symbolSpine.scale.set(0.5);

  app.stage.addChild(symbolSpine);

  const allAnimations = [];

  for (let animation of symbolSpine.spineData.animations) {
    allAnimations.push(animation.name);
  }

  app.stage.on("pointerdown", () => {
    let animation = allAnimations[1];

    symbolSpine.state.setAnimation(0, animation, false);
  });
}

async function loadBaseAnimation() {
  return await PIXI.Assets.load("anchor/anchor.json").then((json) => {
    return new Spine(json.spineData).spineData.animations;
  });
}
