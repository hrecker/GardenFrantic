import { config } from "../model/Config";
import { isInWarningZone, Plant, Status } from "./Plant";

export type PlantStatusBar = {
    maxStatusBarWidth: number;
    waterStatusBar: Phaser.GameObjects.Rectangle;
    waterStatusBarBackground: Phaser.GameObjects.Image;
    waterIcon: Phaser.GameObjects.Image;
    lightStatusBar: Phaser.GameObjects.Rectangle;
    lightStatusBarBackground: Phaser.GameObjects.Image;
    lightIcon: Phaser.GameObjects.Image;
    fruitStatusBar: Phaser.GameObjects.Rectangle;
    fruitStatusBarBackground: Phaser.GameObjects.Image;
    fruitIcon: Phaser.GameObjects.Image;
}

export function updateStatusBars(statusBar: PlantStatusBar, plant: Plant) {
    statusBar.waterStatusBar.width = plant.levels[Status.Water] / 100.0 * statusBar.maxStatusBarWidth;
    statusBar.lightStatusBar.width = plant.levels[Status.Light] / 100.0 * statusBar.maxStatusBarWidth;
    statusBar.fruitStatusBar.width = plant.fruitProgress / 100.0 * statusBar.maxStatusBarWidth;
    let isWarning = updateStatusColor(statusBar.waterStatusBar, plant.levels[Status.Water]);
    isWarning = updateStatusColor(statusBar.lightStatusBar, plant.levels[Status.Light]) || isWarning;
    if (plant.isFruitAvailable) {
        setHighlightColor(statusBar.fruitStatusBar);
    } else if (isWarning) {
        setWarningColor(statusBar.fruitStatusBar);
    } else {
        setHealthyColor(statusBar.fruitStatusBar);
    }
}

/** Update the status bar color based on if it is in the warning range. If it is in the warning range, return true, false otherwise. */
function updateStatusColor(statusBar: Phaser.GameObjects.Rectangle, level: number): boolean {
    if (isInWarningZone(level)) {
        setWarningColor(statusBar);
        return true;
    } else {
        setHealthyColor(statusBar);
        return false;
    }
}

function setWarningColor(statusBar: Phaser.GameObjects.Rectangle) {
    setColor(statusBar, parseInt(config()["warningLevelColor"], 16));
}

function setHealthyColor(statusBar: Phaser.GameObjects.Rectangle) {
    setColor(statusBar, parseInt(config()["healthyLevelColor"], 16));
}

function setHighlightColor(statusBar: Phaser.GameObjects.Rectangle) {
    setColor(statusBar, parseInt(config()["highlightColor"], 16));
}

function setColor(statusBar: Phaser.GameObjects.Rectangle, color: number) {
    statusBar.fillColor = color;
}
