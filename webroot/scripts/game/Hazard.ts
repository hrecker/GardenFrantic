import { config } from "../model/Config";
import { shuffleArray } from "../util/Util";
import { GardenGame } from "./Game";

export enum Hazard {
    Bugs = "bugs",
    Birds = "birds",
    Weeds = "weeds"
}

export enum HazardMotion {
    Walk = "walk",
    Swoop = "swoop",
    Grow = "grow"
}

export type ActiveHazard = {
    id: number;
    hazard: Hazard;
    timeUntilActiveMs: number;
    targetPlantId: number;
}

/** Get a duration before the next hazard appears, based on the range */
export function getNextHazardDurationMs(): number {
    let low = config()["hazardGapDurationMs"]["low"];
    let high = config()["hazardGapDurationMs"]["high"];
    let range = high - low;
    return Math.floor(Math.random() * range) + low;
}

/** Get a randomly ordered list of hazards */
export function getRandomizedHazards(): Hazard[] {
    let allHazards = [
        Hazard.Birds,
        Hazard.Bugs,
        Hazard.Weeds
    ];
    shuffleArray(allHazards);
    return allHazards;
}

export function getHazardMotion(hazard: Hazard): HazardMotion {
    return config()["hazards"][hazard.toString()]["motion"] as HazardMotion
}
