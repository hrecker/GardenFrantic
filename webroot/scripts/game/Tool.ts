import { config } from "../model/Config";

export enum Tool {
    NoTool = "",
    Lamp = "lamp",
    BlackHole = "blackhole",
    Drain = "drain",
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

export function getAllTools(): Tool[] {
    return [
        Tool.Basket,
        Tool.Fertilizer,
        Tool.Drain,
        Tool.WateringCan,
        Tool.BlackHole,
        Tool.Lamp,
        Tool.Scarecrow,
        Tool.Weedkiller,
        Tool.Pesticide,
        Tool.Dog,
        Tool.Hammer,
        Tool.Missile,
    ];
}

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
        case Tool.BlackHole:
            return "Black Hole";
        case Tool.Drain:
            return "Drain";
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

export function getToolDescription(tool: Tool): string {
    switch (tool) {
        case Tool.Lamp:
            return "Increase plant's light level";
        case Tool.BlackHole:
            return "Decrease plant's light level";
        case Tool.Drain:
            return "Decrease plant's water level";
        case Tool.WateringCan:
            return "Increase plant's water level";
        case Tool.Basket:
            return "Harvest fruit when fully grown";
        case Tool.Scarecrow:
            return "Defeat Bird hazards";
        case Tool.Weedkiller:
            return "Defeat Weed hazards";
        case Tool.Pesticide:
            return "Defeat Bug hazards";
        case Tool.Fertilizer:
            return "Accelerate fruit growth";
        case Tool.Dog:
            return "Defeat Bunny hazards";
        case Tool.Missile:
            return "Defeat Meteor hazards";
        case Tool.Hammer:
            return "Defeat Mole hazards";
        default:
            return "";
    }
}
