import { config } from "../model/Config";
import { Plant } from "./Plant";

export type PlantStatusBar = {
    maxStatusBarWidth: number;
    waterStatusBar: Phaser.GameObjects.Rectangle;
    waterStatusBarBackground: Phaser.GameObjects.Image;
    waterIcon: Phaser.GameObjects.Image;
    lightStatusBar: Phaser.GameObjects.Rectangle;
    lightStatusBarBackground: Phaser.GameObjects.Image;
    lightIcon: Phaser.GameObjects.Image;
}

export function updateStatusBars(statusBar: PlantStatusBar, plant: Plant) {
    statusBar.waterStatusBar.width = plant.waterLevel / 100.0 * statusBar.maxStatusBarWidth;
    statusBar.lightStatusBar.width = plant.lightLevel / 100.0 * statusBar.maxStatusBarWidth;
    updateStatusColor(statusBar.waterStatusBar, plant.waterLevel);
    updateStatusColor(statusBar.lightStatusBar, plant.lightLevel);
}

function updateStatusColor(statusBar: Phaser.GameObjects.Rectangle, level: number) {
    if (level <= config()["lowWarning"] || level >= config()["highWarning"]) {
        statusBar.fillColor = parseInt(config()["warningLevelColor"], 16);
    } else {
        statusBar.fillColor = parseInt(config()["healthyLevelColor"], 16);
    }
}