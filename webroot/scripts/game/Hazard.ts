import { config } from "../model/Config";
import { randomInRange, shuffleArray } from "../util/Util";

export enum Hazard {
    Bugs = "bugs",
    Bird = "bird",
    Weeds = "weeds",
    Bunny = "bunny",
    Meteor = "meteor",
    Mole = "mole",
}

export enum HazardMotion {
    Walk = "walk",
    Swoop = "swoop",
    Grow = "grow"
}

export enum HazardType {
    Constant = "constant",
    Impact = "impact"
}

export type ActiveHazard = {
    id: number;
    hazard: Hazard;
    timeUntilActiveMs: number;
    targetPlantId: number;
}

export type HazardPath = {
    start: Phaser.Types.Math.Vector2Like;
    end: Phaser.Types.Math.Vector2Like;
}

/** Get a duration before the next hazard appears, based on the range */
export function getNextHazardDurationMs(numHazardsDefeated: number): number {
    let gapFactor = Math.pow(config()["hazardGapMultiplier"], numHazardsDefeated);
    let min = Math.max(config()["hazardGapDurationMs"]["base"]["low"] * gapFactor, config()["hazardGapDurationMs"]["minimum"]["low"]);
    let max = Math.max(config()["hazardGapDurationMs"]["base"]["high"] * gapFactor, config()["hazardGapDurationMs"]["minimum"]["high"]);
    console.log("Hazard range: (" + min + ", " + max + ")");
    return randomInRange(min, max);
}

/** Get a randomly ordered list of hazards */
export function getRandomizedHazards(): Hazard[] {
    let allHazards = [
        Hazard.Bird,
        Hazard.Bugs,
        Hazard.Weeds,
        Hazard.Bunny,
        Hazard.Meteor,
        Hazard.Mole,
    ];
    shuffleArray(allHazards);
    return allHazards;
}

export function getHazardMotion(hazard: Hazard): HazardMotion {
    return config()["hazards"][hazard.toString()]["motion"] as HazardMotion
}

export function getHazardTimeToActive(hazard: Hazard): number {
    return config()["hazards"][hazard.toString()]["timeToActive"]
}

export function getHazardType(hazard: Hazard): HazardType {
    return config()["hazards"][hazard.toString()]["type"] as HazardType
}

export function hasApproachAnimation(hazard: Hazard): boolean {
    return config()["hazards"][hazard.toString()]["hasApproachAnimation"];
}

export function getHazardPath(plant: Phaser.GameObjects.Image, motion: HazardMotion): HazardPath {
    let path: HazardPath = {
        start: {
            x: 0,
            y: 0
        },
        end: {
            x: plant.x,
            y: plant.y
        }
    }
    let randomHigh = config()["hazardPositionRange"] / 2;
    let randomLow = -randomHigh;
    switch(motion) {
        case HazardMotion.Walk:
            path.start.y = plant.y + randomInRange(randomLow, randomHigh);
            path.end.y = path.start.y;
            path.end.x = plant.x + randomInRange(randomLow, randomHigh);
            break;
        case HazardMotion.Swoop:
            path.end.y = plant.getTopCenter().y;
            path.end.x = plant.x + randomInRange(randomLow, randomHigh);
            break;
        case HazardMotion.Grow:
            path.start.x = plant.x + randomInRange(randomLow, randomHigh);
            path.end.x = path.start.x;
            path.start.y = plant.getBottomCenter().y + 100;
            path.end.y = plant.getBottomCenter().y - 30;
            break;
    }
    return path;
}
