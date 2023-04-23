import { fruitGrowthEvent, fruitHarvestEvent, hazardDestroyedEvent, wrongToolEvent } from "../events/EventMessenger";
import { config } from "../model/Config"
import { GardenGame } from "./Game";
import { Hazard } from "./Hazard";
import { getNewId } from "./Id"

export type Plant = {
    id: number;
    levels: { [status: string] : number }
    fruitProgress: number;
    activeHazardIds: number[];
    gameObject: Phaser.GameObjects.Sprite;
    // The game will handle destroying plants in its update loop.
    shouldDestroy?: boolean;
    fruitGrowthStage: FruitGrowthStage;
    inactive: boolean;
}

export enum FruitGrowthStage {
    None = 0,
    Small = 1,
    Medium = 2,
    FullyGrown = 3
}

export enum Status {
    Water = "water",
    Light = "light",
    Health = "health"
}

function shouldWarnAtHighLevel(status: Status): boolean {
    return config()["statusProps"][status.toString()]["warnHigh"]
}

export function newPlant(gameObject: Phaser.GameObjects.Sprite): Plant {
    let levels: { [status: string] : number } = {};
    levels[Status.Water] = config()["defaultWaterLevel"];
    levels[Status.Light] = config()["defaultLightLevel"];
    levels[Status.Health] = config()["defaultHealthLevel"];
    
    return {
        id: getNewId(),
        levels: levels,
        fruitProgress: config()["minLevel"],
        activeHazardIds: [],
        gameObject: gameObject,
        fruitGrowthStage: FruitGrowthStage.None,
        inactive: true,
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
        plant.fruitGrowthStage = FruitGrowthStage.FullyGrown;
        fruitGrowthEvent(plant);
    } else if (plant.fruitProgress >= 0.66 * config()["maxLevel"]) {
        if (plant.fruitGrowthStage != FruitGrowthStage.Medium) {
            plant.fruitGrowthStage = FruitGrowthStage.Medium;
            fruitGrowthEvent(plant);
        }
    } else if (plant.fruitProgress >= 0.33 * config()["maxLevel"]) {
        if (plant.fruitGrowthStage != FruitGrowthStage.Small) {
            plant.fruitGrowthStage = FruitGrowthStage.Small;
            fruitGrowthEvent(plant);
        }
    }
}

export function harvestFruit(plant: Plant) {
    plant.fruitProgress = config()["minLevel"];
    plant.fruitGrowthStage = FruitGrowthStage.None;
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
    return numWarningStatus(plant) > 0 || plant.fruitGrowthStage == FruitGrowthStage.FullyGrown || hasActiveHazards(game, plant);
}

function hasActiveHazards(game: GardenGame, plant: Plant) {
    for (let i = 0; i < plant.activeHazardIds.length; i++) {
        if (game.activeHazards[plant.activeHazardIds[i]].timeUntilActiveMs <= 0) {
            return true;
        }
    }
    return false;
}

export function removeHazardByType(game: GardenGame, plant: Plant, type: Hazard): boolean {
    let toRemoveIndices = [];
    let numActiveHazards = 0;
    for (let i = 0; i < plant.activeHazardIds.length; i++) {
        let id = plant.activeHazardIds[i];
        let hazard = game.activeHazards[id];
        if (hazard.timeUntilActiveMs <= 0) {
            numActiveHazards++;
            if (hazard.hazard == type) {
                toRemoveIndices.push(i);
            }
        }
    }
    // Remove any destroyed hazards from the plant
    for (let i = toRemoveIndices.length - 1; i >= 0; i--) {
        let id = plant.activeHazardIds[toRemoveIndices[i]];
        hazardDestroyedEvent(id);
        plant.activeHazardIds.splice(toRemoveIndices[i], 1);
        delete game.activeHazards[id];
    }
    if (toRemoveIndices.length == 0 && numActiveHazards > 0) {
        // Wrong tool was used
        console.log("wrongtool remove by type")
        wrongToolEvent();
    }
    return toRemoveIndices.length > 0;
}

/** Return true if a hazard was removed for this plant, false otherwise. */
export function removeHazardById(game: GardenGame, plant: Plant, hazardId: number): boolean {
    let idIndex = -1;
    for (let i = 0; i < plant.activeHazardIds.length; i++) {
        if (plant.activeHazardIds[i] == hazardId) {
            idIndex = i;
            break;
        }
    }

    if (idIndex == -1) {
        return false;
    }
    
    hazardDestroyedEvent(hazardId);
    plant.activeHazardIds.splice(idIndex, 1);
    delete game.activeHazards[hazardId];
    return true;
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
