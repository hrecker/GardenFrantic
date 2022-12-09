import * as game from "../game/Game";
import * as tool from "../game/Tool";
import { config } from "../model/Config";

const toolYAnchor = 50;
const toolMargin = 75;

/** Toolbar scene */
export class ToolbarScene extends Phaser.Scene {
    gardenGame: game.GardenGame;

    constructor() {
        super({
            key: "ToolbarScene"
        });
    }

    init(data) {
        this.gardenGame = data.gardenGame;
    }

    create() {
        let toolbarX = this.game.renderer.width - (config()["toolbarWidth"] / 2);
        this.add.rectangle(toolbarX, this.game.renderer.height / 2,
            config()["toolbarWidth"], this.game.renderer.height, parseInt(config()["toolbarColor"], 16));
        
        for (let i = 0; i < tool.startingTools.length; i++) {
            let toolIcon = this.add.image(toolbarX, toolYAnchor + (i * toolMargin), tool.startingTools[i]);
            toolIcon.setInteractive();
            toolIcon.on("pointerdown", () => {
                let toolValue = toolIcon.texture.key as tool.Tool;
                if (this.gardenGame.selectedTool != toolValue) {
                    this.gardenGame.selectedTool = toolValue;
                    let cursor = "url(assets/sprites/" + toolIcon.texture.key + ".png), pointer";
                    this.input.setDefaultCursor(cursor);
                } else {
                    this.gardenGame.selectedTool = tool.Tool.NoTool;
                    this.input.setDefaultCursor("auto");
                }
            });
        }
    }
}