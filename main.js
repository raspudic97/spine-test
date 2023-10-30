import * as PIXI from "pixi.js";
import { Spine } from "pixi-spine";
import { Sound } from "@pixi/sound";

const app = new PIXI.Application();
const mask = new PIXI.Graphics();
const container = new PIXI.Container();
const audioInstances = {};

let anchor;
let anchorAnimations;
let anchorEvents;
let symbolSpine;

setup();

async function setup() {
  document.getElementById("app").appendChild(app.view);
  app.stage.interactive = true;

  anchor = await loadAnchor();

  container.mask = mask;
  container.addChild(mask);

  mask.clear().beginFill(0x000000).drawRect(0, 0, 800, 310).endFill();
  mask.y = app.screen.height / 2 - mask.height / 2;

  anchorAnimations = anchor.spineData.animations;
  anchorEvents = anchor.spineData.events;

  let reelIndex = 0;
  let reelPositionIndex = 0;

  // Mock reels
  for (let i = 0; reelIndex < 5; i++) {
    for (let j = 0; reelPositionIndex < 10; j++) {
      const randomSymbol = reelIndex === 2 && reelPositionIndex === 2;
      const res = await PIXI.Assets.load(
        !randomSymbol ? "symbol/skeleton.json" : "symbol2/skeleton.json"
      );
      onAssetsLoaded(res, reelIndex, reelPositionIndex);
      reelPositionIndex += 1;
    }
    reelIndex += 1;
    reelPositionIndex = 0;
  }

  await loadAudio("sounds/bonus_hit.mp3");

  app.stage.on("pointerdown", () => {
    animateSpin();
  });

  app.stage.addChild(container);
}

async function animateSpin() {
  const allAnimations = ["animation_0", "animation_1", "animation_2"];
  const delayBetweenAnimations = 500;

  for (let j = 0; j < 5; j++) {
    for (let i = 10 * j; i < 10 * (j + 1); i++) {
      const animation = allAnimations[1];
      const spine = container.children[i + 1];

      setTimeout(() => {
        spine.state.setAnimation(0, animation, false);
      }, delayBetweenAnimations * j);
    }
  }
}

async function loadAnchor() {
  return await PIXI.Assets.load("anchor/anchor.json").then((json) => {
    return new Spine(json.spineData);
  });
}

async function loadAudio(audioPath) {
  const formatPath = audioPath.match("/([^/]+)$")[1];
  if (!audioInstances[formatPath]) {
    audioInstances[formatPath] = Sound.from({
      url: audioPath,
      preload: true,
    });
  }
}

async function onAssetsLoaded(res, reelIndex, reelPositionIndex) {
  symbolSpine = new Spine(res.spineData);

  symbolSpine.spineData.animations = [...anchorAnimations];
  symbolSpine.spineData.events = [...anchorEvents];

  symbolSpine.x = app.screen.width / 10 + (reelIndex + 1) * 100;
  symbolSpine.y =
    app.screen.y - app.screen.height / 2 + (reelPositionIndex + 1) * 100;

  symbolSpine.scale.set(0.475);

  if (symbolSpine.spineData.slots[0].attachmentName === "symbol_1") {
    registerSpineAudioEvent(symbolSpine, "bonus_hit");
  }

  container.addChild(symbolSpine);
}

function playAudio(spine, eventName) {
  const audioFileName = spine.spineData.events.find(
    (event) => event.name === eventName
  )?.audioPath;

  if (audioFileName) {
    if (audioInstances[audioFileName]) {
      audioInstances[audioFileName].play();
    }
  }
}

function registerSpineAudioEvent(spine, eventName) {
  spine.state.addListener({
    event: (trackIndex, event) => {
      if (event.data.name === eventName) {
        playAudio(spine, event.data.name);
      }
    },
  });
}
