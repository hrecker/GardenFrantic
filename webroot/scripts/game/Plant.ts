import { config } from "../model/Config"
import { getNewId } from "./Id"

export type Plant = {
    id: number;
    waterLevel: number;
    lightLevel: number;
    gameObject: Phaser.GameObjects.Image;
    // The game will handle destroying plants in its update loop.
    shouldDestroy?: boolean;
}

export function newPlant(gameObject: Phaser.GameObjects.Image): Plant {
    return {
        id: getNewId(),
        waterLevel: config()["defaultWaterLevel"],
        lightLevel: config()["defaultLightLevel"],
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
