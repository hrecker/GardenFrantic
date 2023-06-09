import { addGameResetListener, addHazardCreatedListener, addHazardDestroyedListener } from "../events/EventMessenger";
import * as game from "../game/Game";
import { ActiveHazard } from "../game/Hazard";
import * as tool from "../game/Tool";
import { getEnabledTools, TutorialState } from "../game/Tutorial";
import { config } from "../model/Config";
import { createSwayAnimation } from "../util/Util";

const toolYAnchor = 75;
const toolMargin = 51;
const toolTextY = toolYAnchor - 50;
const scrollMaskY = toolTextY + 25;
const toolYScrollMargin = 29;
const scrollIndicatorWidth = 5;
const scrollIndicatorMargin = 3;
const scrollSpeedDecay = 1;
const scrollWheelSpeed = 0.4;
const toolScale = 0.9;
const toolbarShadowSize = 2;

/** Toolbar scene */
export class ToolbarScene extends Phaser.Scene {
    gardenGame: game.GardenGame;
    tutorialState: TutorialState;
    lastSelectedToolIndex: number;
    currentToolText: Phaser.GameObjects.BitmapText;
    toolIcons: Phaser.GameObjects.Sprite[];
    toolBoxes: Phaser.GameObjects.Image[];
    highlightedToolIndexes: Set<number>;
    toolbar: Phaser.GameObjects.Rectangle;
    toolbarShadow: Phaser.GameObjects.Rectangle;
    toolbarMask: Phaser.GameObjects.Graphics;
    scrollZone: Phaser.GameObjects.Zone;
    scrollIndicator: Phaser.GameObjects.Rectangle;

    canScroll: boolean;
    maxTopY: number;
    minBottomY: number;
    scrollIndicatorYRange: number;
    iconMoveRange: number;
    isScrolling: boolean;
    lastTopIconY: number;
    scrollSpeed: number;

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
        this.toolbarShadow.setPosition(toolbarX - toolbarShadowSize, this.game.renderer.height / 2);
        this.toolbarShadow.setSize(config()["toolbarWidth"], this.game.renderer.height);
        this.currentToolText.setPosition(toolbarX, toolTextY);

        for (let i = 0; i < tool.getAllTools().length; i++) {
            let x, y;
            if (i % 2 == 0) {
                x = toolbarX - toolMargin / 2;
            } else {
                x = toolbarX + toolMargin / 2;
            }
            y = toolYAnchor + (Math.floor(i / 2) * toolMargin);
            this.toolIcons[i].setPosition(x, y);
            this.toolBoxes[i].setPosition(x, y);
        }
        this.toolbarMask.fillRect(this.game.renderer.width - config()["toolbarWidth"], scrollMaskY,
            config()["toolbarWidth"], this.game.renderer.height);

        this.maxTopY = this.toolIcons[0].y;
        this.lastTopIconY = this.toolIcons[0].y;
        this.minBottomY = this.game.renderer.height - toolYScrollMargin;

        let viewableRange = this.minBottomY - this.maxTopY;
        this.iconMoveRange = this.toolIcons[this.toolIcons.length - 1].y - this.minBottomY;
        let percentage = viewableRange / (this.toolIcons[this.toolIcons.length - 1].y - this.maxTopY);
        if (percentage >= 1) {
            this.scrollIndicator.setVisible(false);
            this.canScroll = false;
        } else {
            this.scrollIndicator.setVisible(true);
            this.canScroll = true;
            let scrollIndicatorMaxHeight = this.game.renderer.height - scrollMaskY;
            let indicatorHeight = percentage * scrollIndicatorMaxHeight;
            this.scrollIndicatorYRange = scrollIndicatorMaxHeight - indicatorHeight - scrollIndicatorMargin;

            this.scrollIndicator.setPosition(this.game.renderer.width - scrollIndicatorWidth, scrollMaskY);
            this.scrollIndicator.setSize(scrollIndicatorWidth, indicatorHeight);
            this.updateScrollIndicatorPosition();
        }
    }

    updateScrollIndicatorPosition() {
        if (! this.canScroll) {
            return;
        }

        let totalYDiff = this.maxTopY - this.toolIcons[0].y;
        let percentage = totalYDiff / this.iconMoveRange;
        this.scrollIndicator.setPosition(this.game.renderer.width - scrollIndicatorWidth,
            scrollMaskY + (this.scrollIndicatorYRange * percentage));
    }

    scrollTools(yDiff: number) {
        if (yDiff == 0 || ! this.canScroll) {
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

        // Move the indicator
        this.updateScrollIndicatorPosition();
    }

    init(data) {
        this.gardenGame = data.gardenGame;
        this.tutorialState = data.tutorialState;
    }

    create() {
        // Allow events to pass through to make scrolling work
        this.highlightedToolIndexes = new Set();
        this.input.setTopOnly(false);
        this.toolbarShadow = this.add.rectangle(0, 0,
            config()["toolbarWidth"], 0, 0).setAlpha(0.5);
        this.toolbar = this.add.rectangle(0, 0,
            config()["toolbarWidth"], 0, parseInt(config()["toolbarColor"], 16));
        this.currentToolText = this.add.bitmapText(0, 0, "uiFont", "", 64).setOrigin(0.5);

        this.scrollZone = this.add.zone(this.game.renderer.width - config()["toolbarWidth"], toolYAnchor - toolMargin,
        config()["toolbarWidth"], this.game.renderer.height).setOrigin(0).setInteractive();
        this.scrollZone.on('pointermove', pointer => {
            if (pointer.isDown) {
                // Scroll
                this.scrollTools(pointer.position.y - pointer.prevPosition.y);
                this.isScrolling = true;
            }
        });
        this.scrollZone.on('pointerup', () => {
            this.isScrolling = false;
        });
        this.scrollZone.on('pointerout', () => {
            this.isScrolling = false;
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            this.scrollTools(-deltaY * scrollWheelSpeed);
        });

        this.toolIcons = [];
        this.toolBoxes = [];
        this.lastSelectedToolIndex = -1;
        let allTools = tool.getAllTools();
        for (let i = 0; i < allTools.length; i++) {
            createSwayAnimation(this, allTools[i] + "sway", [
                    { key: allTools[i] + '1' },
                    { key: allTools[i] + '2' },
                ]);
            let texture = allTools[i] + '1';
            let texturePath = "drawn/" + texture;
            let toolIcon = this.add.sprite(0, 0, texture).setScale(toolScale).setName(allTools[i]);
            this.toolIcons.push(toolIcon);
            // Add box background
            let toolbox = this.add.image(0, 0, "toolbox").setScale(toolScale);
            this.toolBoxes.push(toolbox);
            toolIcon.setInteractive();
            toolIcon.on("pointerdown", () => {
                let toolValue = allTools[i];
                if (this.gardenGame.selectedTool != toolValue) {
                    let enabledTools = getEnabledTools(this.tutorialState);
                    let enabled = false;
                    for (let j = 0; j < enabledTools.length; j++) {
                        if (enabledTools[j] == toolValue) {
                            enabled = true;
                            break;
                        }
                    }
                    if (enabled) {
                        this.gardenGame.selectedTool = toolValue;
                        let cursor = "url(assets/sprites/" + texturePath + ".png), pointer";
                        this.input.setDefaultCursor(cursor);
                        toolbox.setTexture("selectedToolbox");
                        if (this.lastSelectedToolIndex != -1) {
                            if (this.highlightedToolIndexes.has(this.lastSelectedToolIndex)) {
                                this.toolBoxes[this.lastSelectedToolIndex].setTexture("highlightedToolbox");
                            } else {
                                this.toolBoxes[this.lastSelectedToolIndex].setTexture("toolbox");
                            }
                            this.toolIcons[this.lastSelectedToolIndex].stop();
                        }
                        this.lastSelectedToolIndex = i;
                        let toolName = tool.getToolName(toolValue);
                        this.currentToolText.setText(toolName);
                        this.currentToolText.setFontSize(Math.min(44 - toolName.length, 40));
                        toolIcon.play(allTools[i] + "sway");
                    }
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

        this.scrollIndicator = this.add.rectangle(0, 0, 0, 0,
            parseInt(config()["toolbarScrollIndicatorColor"], 16)).setOrigin(0.5, 0);

        this.scrollSpeed = 0;

        addGameResetListener(this.resetGame, this);
        addHazardCreatedListener(this.handleHazardCreated, this);
        addHazardDestroyedListener(this.handleHazardDestroy, this);
        this.resize(true);
        this.scale.on("resize", this.resize, this);
    }

    deselectIcon(iconIndex: number) {
        this.input.setDefaultCursor("auto");
        if (this.highlightedToolIndexes.has(iconIndex)) {
            this.toolBoxes[iconIndex].setTexture("highlightedToolbox");
        } else {
            this.toolBoxes[iconIndex].setTexture("toolbox");
        }
        this.lastSelectedToolIndex = -1;
        this.currentToolText.setText("");
        this.toolIcons[iconIndex].stop();
    }

    resetGame(scene: ToolbarScene) {
        scene.highlightedToolIndexes.clear();
        for (let i = 0; i < scene.toolIcons.length; i++) {
            scene.deselectIcon(i);
        }
    }

    handleHazardCreated(scene: ToolbarScene, hazardId: number) {
        let activeHazard: ActiveHazard = scene.gardenGame.activeHazards[hazardId];
        let destroyTool = config()["hazards"][activeHazard.hazard.toString()]["destroyTool"];
        for (let i = 0; i < scene.toolIcons.length; i++) {
            if (scene.toolIcons[i].name == destroyTool) {
                scene.highlightedToolIndexes.add(i);
                if (scene.toolBoxes[i].texture.key != "selectedToolbox") {
                    scene.toolBoxes[i].setTexture("highlightedToolbox");
                }
                return;
            }
        }
    }

    handleHazardDestroy(scene: ToolbarScene, hazardId: number) {
        let activeHazard: ActiveHazard = scene.gardenGame.activeHazards[hazardId];
        let destroyTool = config()["hazards"][activeHazard.hazard.toString()]["destroyTool"];
        for (let i = 0; i < scene.toolIcons.length; i++) {
            if (scene.toolIcons[i].name == destroyTool) {
                scene.highlightedToolIndexes.delete(i);
                if (scene.toolBoxes[i].texture.key != "selectedToolbox") {
                    scene.toolBoxes[i].setTexture("toolbox");
                }
                return;
            }
        }
    }

    update() {
        if (this.canScroll) {
            if (this.isScrolling) {
                this.scrollSpeed = this.toolIcons[0].y - this.lastTopIconY;
            } else if (this.scrollSpeed != 0) {
                this.scrollTools(this.scrollSpeed);
                if (this.scrollSpeed > 0) {
                    this.scrollSpeed = Math.max(this.scrollSpeed - scrollSpeedDecay, 0);
                } else if (this.scrollSpeed < 0) {
                    this.scrollSpeed = Math.min(this.scrollSpeed + scrollSpeedDecay, 0);
                }
            }
            this.lastTopIconY = this.toolIcons[0].y;
        }
    }
}