import 'phaser';

import { LoadingScene } from "./scenes/LoadingScene";
import { MainScene } from "./scenes/MainScene";
import { ToolbarScene } from './scenes/ToolbarScene';

var config: Phaser.Types.Core.GameConfig = {
    scale: {
        parent: "game-div",
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 640,
        height: 360,
    },
    // NOTE - With hardware acceleration disabled in Chrome, WEBGL causes enormous CPU usage on my desktop.
    type: Phaser.WEBGL,
    scene: [
        LoadingScene,
        MainScene,
        ToolbarScene
    ]
};

new Phaser.Game(config);
