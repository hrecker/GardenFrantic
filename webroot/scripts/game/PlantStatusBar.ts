import { config } from "../model/Config";
import { GardenGame, getLightDecayRateForPlant, getWaterDecayRateForPlant, getHealthDecayRateForPlant } from "./Game";
import { FruitGrowthStage, isFruitGrowthPaused, isInWarningZone, Plant, Status } from "./Plant";
import { isFruitGrowthEnabled, isHealthStatusBarEnabled, isLightStatusBarEnabled, isWaterStatusBarEnabled, TutorialState } from "./Tutorial";

export type PlantStatusBar = {
    waterStatusBar: StatusBar;
    lightStatusBar: StatusBar;
    fruitStatusBar: StatusBar;
    healthStatusBar: StatusBar;
}

export type StatusBar = {
    statusBar: Phaser.GameObjects.Image;
    statusBarMask: Phaser.GameObjects.Graphics;
    statusBarBackground: Phaser.GameObjects.Image;
    icon: Phaser.GameObjects.Image;
    arrow: Phaser.GameObjects.Image;
}

export function updateStatusBars(statusBar: PlantStatusBar, game: GardenGame, plant: Plant, tutorialState: TutorialState) {
    let lightArrow = ArrowStatus.Hidden;
    let waterArrow = ArrowStatus.Hidden;
    let healthArrow = ArrowStatus.Hidden;
    let fruitArrow = ArrowStatus.Hidden;
    // Masks
    setStatusBarMask(statusBar.waterStatusBar.statusBarMask, statusBar.waterStatusBar.statusBarBackground, plant.levels[Status.Water] / 100.0);
    setStatusBarMask(statusBar.lightStatusBar.statusBarMask, statusBar.lightStatusBar.statusBarBackground, plant.levels[Status.Light] / 100.0);
    setStatusBarMask(statusBar.healthStatusBar.statusBarMask, statusBar.healthStatusBar.statusBarBackground, plant.levels[Status.Health] / 100.0);
    setStatusBarMask(statusBar.fruitStatusBar.statusBarMask, statusBar.fruitStatusBar.statusBarBackground, plant.fruitProgress / 100.0);
    // Colors
    let isWarning = updateStatusColor(statusBar.waterStatusBar.statusBar, plant.levels[Status.Water], Status.Water);
    isWarning = updateStatusColor(statusBar.lightStatusBar.statusBar, plant.levels[Status.Light], Status.Light) || isWarning;
    if (plant.fruitGrowthStage == FruitGrowthStage.FullyGrown) {
        setHighlightColor(statusBar.fruitStatusBar.statusBar);
    } else if (isFruitGrowthPaused(game, plant)) {
        setWarningColor(statusBar.fruitStatusBar.statusBar);
    } else {
        setHealthyColor(statusBar.fruitStatusBar.statusBar);
        if (isFruitGrowthEnabled(tutorialState)) {
            fruitArrow = ArrowStatus.Up;
        }
    }
    updateStatusColor(statusBar.healthStatusBar.statusBar, plant.levels[Status.Health], Status.Health);
    // Arrows
    if (getLightDecayRateForPlant(game, plant) > 0 && isLightStatusBarEnabled(tutorialState)) {
        lightArrow = ArrowStatus.Down;
    }
    if (getWaterDecayRateForPlant(game, plant) > 0 && isWaterStatusBarEnabled(tutorialState)) {
        waterArrow = ArrowStatus.Down;
    }
    if (plant.levels[Status.Health] == config()["maxLevel"]) {
        healthArrow = ArrowStatus.Hidden;
    } else if (getHealthDecayRateForPlant(game, plant) > 0 && isHealthStatusBarEnabled(tutorialState)) {
        healthArrow = ArrowStatus.Down;
    }
    setArrowTexture(statusBar.lightStatusBar, lightArrow);
    setArrowTexture(statusBar.waterStatusBar, waterArrow);
    setArrowTexture(statusBar.fruitStatusBar, fruitArrow);
    setArrowTexture(statusBar.healthStatusBar, healthArrow);
}

function setStatusBarMask(statusBarMask: Phaser.GameObjects.Graphics, statusBarBackground: Phaser.GameObjects.Image, percentage: number) {
    statusBarMask.clear();
    statusBarMask.fillRect(statusBarBackground.getTopLeft().x, statusBarBackground.getTopLeft().y,
        statusBarBackground.width * percentage, statusBarBackground.height)
}

/** Update the status bar color based on if it is in the warning range. If it is in the warning range, return true, false otherwise. */
function updateStatusColor(statusBar: Phaser.GameObjects.Image, level: number, status: Status): boolean {
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

function setWarningColor(statusBar: Phaser.GameObjects.Image) {
    setColor(statusBar, parseInt(config()["warningLevelColor"], 16));
}

function setHealthyColor(statusBar: Phaser.GameObjects.Image) {
    setColor(statusBar, parseInt(config()["healthyLevelColor"], 16));
}

function setHighlightColor(statusBar: Phaser.GameObjects.Image) {
    setColor(statusBar, parseInt(config()["highlightColor"], 16));
}

function setColor(statusBar: Phaser.GameObjects.Image, color: number) {
    statusBar.setTint(color);
}

enum ArrowStatus {
    Hidden,
    Up,
    Down
}

export function setArrowTexture(statusBar: StatusBar, arrowStatus: ArrowStatus) {
    if (arrowStatus == ArrowStatus.Hidden) {
        statusBar.arrow.alpha = 0;
        return;
    }
    statusBar.arrow.alpha = 1;
    if (arrowStatus == ArrowStatus.Up) {
        statusBar.arrow.setTexture("uparrow");
    } else {
        statusBar.arrow.setTexture("downarrow");
    }
}
