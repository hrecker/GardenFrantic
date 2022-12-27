import { fruitGrowthEvent, fruitHarvestEvent } from "../events/EventMessenger";
import { config } from "../model/Config"
import { GardenGame } from "./Game";
import { getNewId } from "./Id"

export type Plant = {
    id: number;
    levels: { [status: string] : number }
    fruitProgress: number;
    isFruitAvailable: boolean;
    activeHazardIds: number[];
    gameObject: Phaser.GameObjects.Image;
    // The game will handle destroying plants in its update loop.
    shouldDestroy?: boolean;
}

export enum Status {
    Water = "water",
    Light = "light",
    Health = "health"
}

function shouldWarnAtHighLevel(status: Status): boolean {
    return config()["statusProps"][status.toString()]["warnHigh"]
}

export function newPlant(gameObject: Phaser.GameObjects.Image): Plant {
    let levels: { [status: string] : number } = {};
    levels[Status.Water] = config()["defaultWaterLevel"];
    levels[Status.Light] = config()["defaultLightLevel"];
    levels[Status.Health] = config()["defaultHealthLevel"];
    
    return {
        id: getNewId(),
        levels: levels,
        fruitProgress: config()["minLevel"],
        isFruitAvailable: false,
        activeHazardIds: [],
        gameObject: gameObject
    }
}

export function updateStatusLevel(plant: Plant, status: Status, delta: number) {
    plant.levels[status] += delta;
    if (plant.levels[status]  <= config()["minLevel"]) {
        plant.levels[status] = config()["minLevel"];
        if (status == Status.Health) {
            plant.shouldDestroy = true;
        }
    } else if (plant.levels[status] >= config()["maxLevel"]) {
        plant.levels[status] = config()["maxLevel"];
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

export function numWarningStatus(plant: Plant): number {
    let numWarning = 0;
    for (const status of Object.keys(plant.levels)) {
        // Health doesn't count as a warning status
        if (status != Status.Health && isInWarningZone(status as Status, plant.levels[status])) {
            numWarning++;
        }
    }
    return numWarning;
}

export function isFruitGrowthPaused(game: GardenGame, plant: Plant) {
    return numWarningStatus(plant) > 0 || plant.isFruitAvailable || hasActiveHazards(game, plant);
}

function hasActiveHazards(game: GardenGame, plant: Plant) {
    for (let i = 0; i < plant.activeHazardIds.length; i++) {
        if (game.activeHazards[plant.activeHazardIds[i]].timeUntilActiveMs <= 0) {
            return true;
        }
    }
    return false;
}

export function isInWarningZone(status: Status, level: number) {
    return level <= config()["lowWarning"] ||
        (shouldWarnAtHighLevel(status) && level >= config()["highWarning"]);
}

export function getFruitProgressRate(plant: Plant) {
    let rate = config()["fruitProgressRate"];
    if (plant.levels[Status.Health] == config()["maxLevel"]) {
        rate *= 2;
    }
    return rate;
}
