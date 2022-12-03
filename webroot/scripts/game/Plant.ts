import { fruitGrowthEvent, fruitHarvestEvent } from "../events/EventMessenger";
import { config } from "../model/Config"
import { getNewId } from "./Id"

export type Plant = {
    id: number;
    waterLevel: number;
    lightLevel: number;
    fruitProgress: number;
    isFruitAvailable: boolean;
    gameObject: Phaser.GameObjects.Image;
    // The game will handle destroying plants in its update loop.
    shouldDestroy?: boolean;
}

export function newPlant(gameObject: Phaser.GameObjects.Image): Plant {
    return {
        id: getNewId(),
        waterLevel: config()["defaultWaterLevel"],
        lightLevel: config()["defaultLightLevel"],
        fruitProgress: config()["minLevel"],
        isFruitAvailable: false,
        gameObject: gameObject
    }
}

export function setLightLevel(plant: Plant, lightLevel: number) {
    plant.lightLevel = lightLevel;
    if (plant.lightLevel <= config()["minLevel"]) {
        plant.lightLevel = config()["minLevel"];
        plant.shouldDestroy = true;
    } else if (plant.lightLevel >= config()["maxLevel"]) {
        plant.lightLevel = config()["maxLevel"];
        plant.shouldDestroy = true;
    }
}

export function setWaterLevel(plant: Plant, waterLevel: number) {
    plant.waterLevel = waterLevel;
    if (plant.waterLevel <= config()["minLevel"]) {
        plant.waterLevel = config()["minLevel"];
        plant.shouldDestroy = true;
    } else if (plant.waterLevel >= config()["maxLevel"]) {
        plant.waterLevel = config()["maxLevel"];
        plant.shouldDestroy = true;
    }
}

export function setFruitProgress(plant: Plant, fruitProgress: number) {
    plant.fruitProgress = fruitProgress;
    if (plant.fruitProgress >= config()["maxLevel"]) {
        plant.fruitProgress = config()["maxLevel"];
        plant.isFruitAvailable = true;
        fruitGrowthEvent(plant);
    }
}

export function harvestFruit(plant: Plant) {
    plant.fruitProgress = config()["minLevel"];
    plant.isFruitAvailable = false;
    fruitHarvestEvent(plant);
}

export function isFruitGrowthPaused(plant: Plant) {
    return plant.isFruitAvailable || isInWarningZone(plant.lightLevel) || isInWarningZone(plant.waterLevel);
}

export function isInWarningZone(level: number) {
    return level <= config()["lowWarning"] || level >= config()["highWarning"];
}
