import { config } from "../model/Config";

export enum Tool {
    NoTool = "",
    Lamp = "lamp",
    WateringCan = "wateringCan"
}

export let startingTools = [Tool.Lamp, Tool.WateringCan];

export type ActiveTool = {
    tool: Tool;
    gameObject: Phaser.GameObjects.Image;
}

/** Get the water decay rate for a given tool */
export function getWaterDecayRate(tool: Tool): number {
    return config()["toolDecayRates"][tool]["water"];
}

/** Get the light decay rate for a given tool */
export function getLightDecayRate(tool: Tool): number {
    return config()["toolDecayRates"][tool]["light"];
}
