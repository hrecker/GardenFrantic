import { config } from "../model/Config";

export enum Tool {
    NoTool = "",
    Lamp = "lamp",
    Shade = "shade",
    Umbrella = "umbrella",
    WateringCan = "wateringcan",
    Basket = "basket",
    Scarecrow = "scarecrow",
    Weedkiller = "weedkiller",
    Pesticide = "pesticide",
    Fertilizer = "fertilizer",
    Dog = "dog",
    Missile = "missile",
    Hammer = "hammer",
}

export enum ToolCategory {
    Water = "water",
    Light = "light",
    Growth = "growth",
    Harvest = "harvest",
    HazardRemoval = "hazardremoval"
}

export let startingTools = [
    Tool.Basket,
    Tool.Fertilizer,
    Tool.Shade,
    Tool.Lamp,
    Tool.Umbrella,
    Tool.WateringCan,
    Tool.Scarecrow,
    Tool.Weedkiller,
    Tool.Pesticide,
    Tool.Dog,
    Tool.Missile,
    Tool.Hammer,
];

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
        case Tool.Fertilizer:
            return "Fertilizer";
        case Tool.Dog:
            return "Dog";
        case Tool.Missile:
            return "Missile";
        case Tool.Hammer:
            return "Hammer";
        default:
            return "";
    }
}
