import BootScene from "./scenes/BootScene.js";
import MenuScene from "./scenes/MenuScene.js";
import PuzzleScene from "./scenes/PuzzleScene.js";

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#141b80",
  width: 720,
  height: 1280,              // портрет под мобилки
  pixelArt: true,            // резкие тайлы
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, PuzzleScene]
};

new Phaser.Game(config);
