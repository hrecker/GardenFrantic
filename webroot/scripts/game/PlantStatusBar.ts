import { config } from "../model/Config";
import { Plant } from "./Plant";

//TODO eventually if the plants can move, will want to move the status bars here too
// Will have to store all aspects off the status bar here in that case, including the icon
// and the background object
export type PlantStatusBar = {
    maxStatusBarWidth: number;
    waterStatusBar: Phaser.GameObjects.Rectangle;
    lightStatusBar: Phaser.GameObjects.Rectangle;
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