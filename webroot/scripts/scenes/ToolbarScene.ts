import * as game from "../game/Game";
import * as tool from "../game/Tool";
import { config } from "../model/Config";

const toolYAnchor = 75;
const toolMargin = 65;

/** Toolbar scene */
export class ToolbarScene extends Phaser.Scene {
    gardenGame: game.GardenGame;
    lastSelectedToolbox: Phaser.GameObjects.Image;
    currentToolText: Phaser.GameObjects.BitmapText;

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

        //this.currentToolText = this.add.text(toolbarX, toolYAnchor - 50, "").setOrigin(0.5).setColor("black").setFontSize(24);
        this.currentToolText = this.add.bitmapText(toolbarX, toolYAnchor - 50, "uiFont", "", 48).setOrigin(0.5);
        
        for (let i = 0; i < tool.startingTools.length; i++) {
            let toolIcon = this.add.image(toolbarX, toolYAnchor + (i * toolMargin), tool.startingTools[i]);
            // Add box background
            let toolbox = this.add.image(toolbarX, toolYAnchor + (i * toolMargin), "toolbox");
            toolIcon.setInteractive();
            toolIcon.on("pointerdown", () => {
                let toolValue = toolIcon.texture.key as tool.Tool;
                if (this.gardenGame.selectedTool != toolValue) {
                    this.gardenGame.selectedTool = toolValue;
                    let cursor = "url(assets/sprites/" + toolIcon.texture.key + ".png), pointer";
                    this.input.setDefaultCursor(cursor);
                    toolbox.setTexture("selectedToolbox");
                    if (this.lastSelectedToolbox != null) {
                        this.lastSelectedToolbox.setTexture("toolbox");
                    }
                    this.lastSelectedToolbox = toolbox;
                    let toolName = tool.getToolName(toolValue);
                    this.currentToolText.setText(toolName);
                    this.currentToolText.setFontSize(Math.min(30 - toolName.length, 26));
                } else {
                    this.gardenGame.selectedTool = tool.Tool.NoTool;
                    this.input.setDefaultCursor("auto");
                    toolbox.setTexture("toolbox");
                    this.lastSelectedToolbox = null;
                    this.currentToolText.setText("");
                }
            });
        }
    }
}