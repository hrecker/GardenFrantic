import { config } from "../model/Config";

export enum Tool {
    NoTool = "",
    Lamp = "lamp",
    Shade = "shade",
    Umbrella = "umbrella",
    WateringCan = "wateringCan",
    Basket = "basket",
    Scarecrow = "scarecrow",
    Weedkiller = "weedkiller",
    Pesticide = "pesticide"
}

export enum ToolCategory {
    Water = "water",
    Light = "light",
    SingleUse = "singleuse"
}

export let startingTools = [Tool.Basket, Tool.Lamp, Tool.Shade, Tool.Umbrella, Tool.WateringCan, Tool.Scarecrow, Tool.Weedkiller, Tool.Pesticide];

export type ActiveTool = {
    tool: Tool;
    gameObject: Phaser.GameObjects.Image;
}

export function getCategory(tool: Tool): ToolCategory {
    return config()["tools"][tool]["category"];
}

export function isDecayPrevented(tool: Tool, category: ToolCategory): boolean {
    return getCategory(tool) == category &&
        config()["tools"][tool]["preventive"];
}

/** Get the water decay rate for a given tool */
export function getDecayRate(tool: Tool, category: ToolCategory): number {
    if (getCategory(tool) == category) {
        return config()["tools"][tool]["decayRate"];
    }
    return 0;
}

export function getToolName(tool: Tool): string {
    switch (tool) {
        case Tool.Lamp:
            return "Lamp";
        case Tool.Shade:
            return "Shade";
        case Tool.Umbrella:
            return "Umbrella";
        case Tool.WateringCan:
            return "Watering Can";
        case Tool.Basket:
            return "Basket";
        case Tool.Scarecrow:
            return "Scarecrow";
        case Tool.Weedkiller:
            return "Weedkiller";
        case Tool.Pesticide:
            return "Pesticide";
        default:
            return "";
    }
}
