import { config } from "../model/Config";
import { GardenGame } from "./Game";
import { FruitGrowthStage, isFruitGrowthPaused, isInWarningZone, Plant, Status } from "./Plant";

export type PlantStatusBar = {
    maxStatusBarWidth: number;
    waterStatusBar: StatusBar;
    lightStatusBar: StatusBar;
    fruitStatusBar: StatusBar;
    healthStatusBar: StatusBar;
}

export type StatusBar = {
    statusBar: Phaser.GameObjects.Rectangle;
    statusBarBackground: Phaser.GameObjects.Image;
    icon: Phaser.GameObjects.Image;
}

export function updateStatusBars(statusBar: PlantStatusBar, game: GardenGame, plant: Plant) {
    // Always display at least one for light/water so the bar never disappears completely
    statusBar.waterStatusBar.statusBar.width = Math.max(plant.levels[Status.Water], 1) / 100.0 * statusBar.maxStatusBarWidth;
    statusBar.lightStatusBar.statusBar.width = Math.max(plant.levels[Status.Light], 1) / 100.0 * statusBar.maxStatusBarWidth;
    statusBar.healthStatusBar.statusBar.width = plant.levels[Status.Health] / 100.0 * statusBar.maxStatusBarWidth;
    statusBar.fruitStatusBar.statusBar.width = plant.fruitProgress / 100.0 * statusBar.maxStatusBarWidth;
    let isWarning = updateStatusColor(statusBar.waterStatusBar.statusBar, plant.levels[Status.Water], Status.Water);
    isWarning = updateStatusColor(statusBar.lightStatusBar.statusBar, plant.levels[Status.Light], Status.Light) || isWarning;
    if (plant.fruitGrowthStage == FruitGrowthStage.FullyGrown) {
        setHighlightColor(statusBar.fruitStatusBar.statusBar);
    } else if (isFruitGrowthPaused(game, plant)) {
        setWarningColor(statusBar.fruitStatusBar.statusBar);
    } else {
        setHealthyColor(statusBar.fruitStatusBar.statusBar);
    }
    updateStatusColor(statusBar.healthStatusBar.statusBar, plant.levels[Status.Health], Status.Health);
}

/** Update the status bar color based on if it is in the warning range. If it is in the warning range, return true, false otherwise. */
function updateStatusColor(statusBar: Phaser.GameObjects.Rectangle, level: number, status: Status): boolean {
    if (isInWarningZone(status, level)) {
        setWarningColor(statusBar);
        return true;
    } else {
        if (status == Status.Health && level >= config()["maxLevel"]) {
            setHighlightColor(statusBar);
        } else {
            setHealthyColor(statusBar);
        }
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
