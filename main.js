import * as PIXI from "pixi.js";
import { Spine } from "pixi-spine";

const app = new PIXI.Application();
const mask = new PIXI.Graphics();
const container = new PIXI.Container();

let baseAnimations;

setup();

async function setup() {
  document.getElementById("app").appendChild(app.view);
  app.stage.interactive = true;

  container.mask = mask;
  container.addChild(mask);

  mask.clear().beginFill(0x000000).drawRect(0, 0, 800, 310).endFill();

  mask.y = app.screen.height / 2 - mask.height / 2;

  baseAnimations = await loadBaseAnimation();

  let reelIndex = 0;
  let reelPositionIndex = 0;

  // Mock reels
  for (let i = 0; reelIndex < 5; i++) {
    for (let j = 0; reelPositionIndex < 10; j++) {
      await PIXI.Assets.load("symbol/skeleton.json").then((res) => {
        onAssetsLoaded(res, reelIndex, reelPositionIndex);
      });
      reelPositionIndex += 1;
    }
    reelIndex += 1;
    reelPositionIndex = 0;
  }

  animateSpin();

  app.stage.addChild(container);
}

function onAssetsLoaded(res, reelIndex, reelPositionIndex) {
  let symbolSpine = new Spine(res.spineData);

  symbolSpine.spineData.animations = [
    ...symbolSpine.spineData.animations,
    ...baseAnimations,
  ];

  symbolSpine.x = app.screen.width / 10 + (reelIndex + 1) * 100;
  symbolSpine.y =
    app.screen.y - app.screen.height / 2 + (reelPositionIndex + 1) * 100;

  symbolSpine.scale.set(0.475);

  container.addChild(symbolSpine);
  symbolSpine = undefined;
}

function animateSpin() {
  const allAnimations = ["animation_0", "animation_1", "animation_2"];

  let animation = allAnimations[0];

  app.stage.on("pointerdown", async () => {
    for (let j = 0; j < 5; j++) {
      setTimeout(function () {
        for (let i = 10 * j; i < 10 * (j + 1); i++) {
          container.children[i + 1].state.setAnimation(0, animation, false);
        }
      }, 500 * j);
    }
  });
}

async function loadBaseAnimation() {
  return await PIXI.Assets.load("anchor/anchor.json").then((json) => {
    return new Spine(json.spineData).spineData.animations;
  });
}
