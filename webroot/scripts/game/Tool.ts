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
    Harvest = "harvest",
    HazardRemoval = "hazardremoval"
}

export let startingTools = [Tool.Basket, Tool.Lamp, Tool.Shade, Tool.Umbrella, Tool.WateringCan, Tool.Scarecrow, Tool.Weedkiller, Tool.Pesticide];

export function getCategory(tool: Tool): ToolCategory {
    return config()["tools"][tool]["category"];
}

/** Get the delta in status for a given tool */
export function getDelta(tool: Tool): number {
    return config()["tools"][tool]["delta"];
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
