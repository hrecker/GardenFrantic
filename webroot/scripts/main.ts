import 'phaser';
import { BackgroundScene } from './scenes/BackgroundScene';

import { LoadingScene } from "./scenes/LoadingScene";
import { MainScene } from "./scenes/MainScene";
import { MenuScene } from './scenes/MenuScene';
import { ToolbarScene } from './scenes/ToolbarScene';
import { UIScene } from './scenes/UIScene';

var config: Phaser.Types.Core.GameConfig = {
    scale: {
        parent: "game-div",
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // NOTE - With hardware acceleration disabled in Chrome, WEBGL causes enormous CPU usage on my desktop.
    type: Phaser.WEBGL,
    scene: [
        LoadingScene,
        BackgroundScene,
        MenuScene,
        MainScene,
        ToolbarScene,
        UIScene,
    ]
};

new Phaser.Game(config);
