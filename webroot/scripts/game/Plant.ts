import { fruitGrowthEvent, fruitHarvestEvent } from "../events/EventMessenger";
import { config } from "../model/Config"
import { getNewId } from "./Id"

export type Plant = {
    id: number;
    levels: { [status: string] : number }
    fruitProgress: number;
    isFruitAvailable: boolean;
    gameObject: Phaser.GameObjects.Image;
    // The game will handle destroying plants in its update loop.
    shouldDestroy?: boolean;
}

export enum Status {
    Water = "water",
    Light = "light"
}

export function newPlant(gameObject: Phaser.GameObjects.Image): Plant {
    let levels: { [status: string] : number } = {};
    levels[Status.Water] = config()["defaultWaterLevel"];
    levels[Status.Light] = config()["defaultLightLevel"];
    
    return {
        id: getNewId(),
        levels: levels,
        fruitProgress: config()["minLevel"],
        isFruitAvailable: false,
        gameObject: gameObject
    }
}

export function updateStatusLevel(plant: Plant, status: Status, delta: number) {
    plant.levels[status] += delta;
    if (plant.levels[status]  <= config()["minLevel"]) {
        plant.levels[status] = config()["minLevel"];
        plant.shouldDestroy = true;
    } else if (plant.levels[status] >= config()["maxLevel"]) {
        plant.levels[status] = config()["maxLevel"];
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
    for (const status of Object.keys(plant.levels)) {
        if (isInWarningZone(plant.levels[status])) {
            return true;
        }
    }
    return plant.isFruitAvailable;
}

export function isInWarningZone(level: number) {
    return level <= config()["lowWarning"] || level >= config()["highWarning"];
}
