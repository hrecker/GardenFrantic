import { config } from "../model/Config";

export enum Tool {
    NoTool = "",
    Lamp = "lamp",
    Shade = "shade",
    Umbrella = "umbrella",
    WateringCan = "wateringCan",
    Basket = "basket"
}

export enum ToolCategory {
    Water = "water",
    Light = "light",
    SingleUse = "singleuse"
}

export let startingTools = [Tool.Basket, Tool.Lamp, Tool.Shade, Tool.Umbrella, Tool.WateringCan];

export type ActiveTool = {
    tool: Tool;
    gameObject: Phaser.GameObjects.Image;
}

export function getCategory(tool: Tool): ToolCategory {
    return config()["tools"][tool]["category"];
}

export function isWaterDecayPrevented(tool: Tool): boolean {
    return getCategory(tool) == ToolCategory.Water &&
        config()["tools"][tool]["preventive"];
}

export function isLightDecayPrevented(tool: Tool): boolean {
    return getCategory(tool) == ToolCategory.Light &&
        config()["tools"][tool]["preventive"];
}

/** Get the water decay rate for a given tool */
export function getDecayRate(tool: Tool, category: ToolCategory): number {
    if (getCategory(tool) == category) {
        return config()["tools"][tool]["decayRate"];
    }
    return 0;
}
