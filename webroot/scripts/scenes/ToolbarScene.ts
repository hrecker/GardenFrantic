import { addGameResetListener } from "../events/EventMessenger";
import * as game from "../game/Game";
import * as tool from "../game/Tool";
import { config } from "../model/Config";

const toolYAnchor = 75;
const toolMargin = 60;
const toolTextY = toolYAnchor - 50;
const scrollMaskY = toolTextY + 25;
const toolYScrollMargin = 45;

/** Toolbar scene */
export class ToolbarScene extends Phaser.Scene {
    gardenGame: game.GardenGame;
    lastSelectedToolbox: Phaser.GameObjects.Image;
    currentToolText: Phaser.GameObjects.BitmapText;
    toolIcons: Phaser.GameObjects.Image[];
    toolBoxes: Phaser.GameObjects.Image[];
    toolbar: Phaser.GameObjects.Rectangle;
    toolbarMask: Phaser.GameObjects.Graphics;
    scrollZone: Phaser.GameObjects.Zone;

    maxTopY: number;
    minBottomY: number;

    constructor() {
        super({
            key: "ToolbarScene"
        });
    }

    /** Adjust any UI elements that need to change position based on the canvas size */
    resize(force?: boolean) {
        if (! this.scene.isActive() && ! force) {
            return;
        }
        
        let toolbarX = this.game.renderer.width - (config()["toolbarWidth"] / 2);
        this.toolbar.setPosition(toolbarX, this.game.renderer.height / 2);
        this.toolbar.setSize(config()["toolbarWidth"], this.game.renderer.height);
        this.currentToolText.setPosition(toolbarX, toolTextY);

        for (let i = 0; i < tool.startingTools.length; i++) {
            let x, y;
            //TODO add this back later when not testing scrollbar
            /*if (i % 2 == 0) {
                x = toolbarX - toolMargin / 2;
            } else {
                x = toolbarX + toolMargin / 2;
            }
            y = toolYAnchor + (Math.floor(i / 2) * toolMargin);*/
            x = toolbarX;
            y = toolYAnchor + (i * toolMargin)
            this.toolIcons[i].setPosition(x, y);
            this.toolBoxes[i].setPosition(x, y);
        }
        this.toolbarMask.fillRect(this.game.renderer.width - config()["toolbarWidth"], scrollMaskY,
            config()["toolbarWidth"], this.game.renderer.height);

        this.maxTopY = this.toolIcons[0].y;
        this.minBottomY = this.game.renderer.height - toolYScrollMargin;
    }

    scrollTools(yDiff: number) {
        if (yDiff == 0) {
            return;
        }

        let finalTopY = this.toolIcons[0].y + yDiff;
        let finalBottomY = this.toolIcons[this.toolIcons.length - 1].y + yDiff;
        if (yDiff < 0 && finalBottomY < this.minBottomY) {
            yDiff = this.minBottomY - this.toolIcons[this.toolIcons.length - 1].y;
        } else if (yDiff > 0 && finalTopY > this.maxTopY) {
            yDiff = this.maxTopY - this.toolIcons[0].y;
        }

        // Move the icons and boxes
        this.toolIcons.forEach(icon => {
            icon.y += yDiff;
        });
        this.toolBoxes.forEach(box => {
            box.y += yDiff;
        });
    }

    init(data) {
        this.gardenGame = data.gardenGame;
    }

    create() {
        // Allow events to pass through to make scrolling work
        this.input.setTopOnly(false);
        this.toolbar = this.add.rectangle(0, 0,
            config()["toolbarWidth"], 0, parseInt(config()["toolbarColor"], 16));
        this.currentToolText = this.add.bitmapText(0, 0, "uiFont", "", 48).setOrigin(0.5);

        this.scrollZone = this.add.zone(this.game.renderer.width - config()["toolbarWidth"], toolYAnchor - toolMargin,
        config()["toolbarWidth"], this.game.renderer.height).setOrigin(0).setInteractive();
        this.scrollZone.on('pointermove', pointer => {
            if (pointer.isDown) {
                // Scroll
                this.scrollTools(pointer.position.y - pointer.prevPosition.y);
            }
        });

        this.toolIcons = [];
        this.toolBoxes = [];
        for (let i = 0; i < tool.startingTools.length; i++) {
            let toolIcon = this.add.image(0, 0, tool.startingTools[i]);
            this.toolIcons.push(toolIcon);
            // Add box background
            let toolbox = this.add.image(0, 0, "toolbox");
            this.toolBoxes.push(toolbox);
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
                    this.deselectIcon(i);
                }
            });
        }

        this.toolbarMask = this.add.graphics().setAlpha(0);
        let mask = new Phaser.Display.Masks.GeometryMask(this, this.toolbarMask);
        this.toolIcons.forEach(icon => {
            icon.setMask(mask);
        });
        this.toolBoxes.forEach(box => {
            box.setMask(mask);
        });

        addGameResetListener(this.resetGame, this);
        this.resize(true);
        this.scale.on("resize", this.resize, this);
    }

    deselectIcon(iconIndex: number) {
        this.input.setDefaultCursor("auto");
        this.toolBoxes[iconIndex].setTexture("toolbox");
        this.lastSelectedToolbox = null;
        this.currentToolText.setText("");
    }

    resetGame(scene: ToolbarScene) {
        for (let i = 0; i < scene.toolIcons.length; i++) {
            scene.deselectIcon(i);
        }
    }
}