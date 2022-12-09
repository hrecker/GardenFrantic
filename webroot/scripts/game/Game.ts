import { plantDestroyEvent, scoreUpdateEvent, weatherUpdateEvent } from "../events/EventMessenger";
import { config } from "../model/Config";
import { isFruitGrowthPaused, newPlant, harvestFruit, Plant, setFruitProgress, Status, updateStatusLevel } from "./Plant";
import * as tool from "./Tool";
import * as weather from "./Weather";

export type GardenGame = {
    /** Plants in the game */
    plants: { [id: number]: Plant };
    /** Active tools in the game, with a plant Id indicating which plant the tool is active for */
    activeTools: { [plantId: number]: tool.ActiveTool[] };
    /** Currently selected tool, or null if none selected */
    selectedTool: tool.Tool;
    /** Currently active weather */
    weather: weather.Weather;
    /** How long the current weather has lasted */
    currentWeatherDurationMs: number;
    /** Current score */
    score: number;
}

export function newGame(): GardenGame {
    let game: GardenGame = {
        plants: {},
        activeTools: {},
        selectedTool: tool.Tool.NoTool,
        weather: weather.getDefaultWeather(),
        currentWeatherDurationMs: 0,
        score: 0,
    };
    return game;
}

export function addPlant(game: GardenGame, plantGameObject: Phaser.GameObjects.Image): Plant {
    let plant = newPlant(plantGameObject);
    game.plants[plant.id] = plant;
    game.activeTools[plant.id] = [];
    return plant;
}

export function update(game: GardenGame, delta: number) {
    // Plant updates
    let toRemove: number[] = [];
    
    Object.keys(game.plants).forEach(id => {
        let plant: Plant = game.plants[id];
        if (plant.shouldDestroy) {
            plant.gameObject.destroy();
            // Destroy any active tools for the plant
            if (id in game.activeTools) {
                let activeTools: tool.ActiveTool[] = game.activeTools[id];
                activeTools.forEach(activeTool => {
                    activeTool.gameObject.destroy();
                });
            }
            plantDestroyEvent(plant);
            toRemove.push(parseInt(id));
        } else {
            updateStatusLevel(plant, Status.Light, -delta / 1000.0 * getLightDecayRateForPlant(game, plant));
            updateStatusLevel(plant, Status.Water, -delta / 1000.0 * getWaterDecayRateForPlant(game, plant));
            if (! isFruitGrowthPaused(plant)) {
                setFruitProgress(plant, plant.fruitProgress + (delta / 1000.0) * config()["fruitProgressRate"])
            }
        }
    });

    // Remove any plants that were destroyed, and remove corresponding active tools
    toRemove.forEach(id => {
        delete game.plants[id];
        delete game.activeTools[id];
    });

    // Weather updates
    game.currentWeatherDurationMs += delta;
    if (game.currentWeatherDurationMs >= config()["weatherDurationMs"]) {
        game.currentWeatherDurationMs = 0;
        game.weather = weather.getRandomWeather();
        weatherUpdateEvent(game.weather);
    }
}

function getLightDecayRateForPlant(game: GardenGame, plant: Plant) {
    let weatherRate = weather.getDecayRate(game.weather, Status.Light);
    let toolRate = 0;
    if (plant.id in game.activeTools) {
        let activeTools: tool.ActiveTool[] = game.activeTools[plant.id];
        for (let i = 0; i < activeTools.length; i++) {
            if (tool.isDecayPrevented(activeTools[i].tool, tool.ToolCategory.Light)) {
                // When prevented, use only this tool's rate
                weatherRate = 0;
                toolRate = tool.getDecayRate(activeTools[i].tool, tool.ToolCategory.Light);
                break;
            }
            toolRate += tool.getDecayRate(activeTools[i].tool, tool.ToolCategory.Light);
        }
    }
    return weatherRate + toolRate;
}

function getWaterDecayRateForPlant(game: GardenGame, plant: Plant) {
    let weatherRate = weather.getDecayRate(game.weather, Status.Water);
    let toolRate = 0;
    if (plant.id in game.activeTools) {
        let activeTools: tool.ActiveTool[] = game.activeTools[plant.id];
        for (let i = 0; i < activeTools.length; i++) {
            if (tool.isDecayPrevented(activeTools[i].tool, tool.ToolCategory.Water)) {
                // When prevented, use the tool rate only if the weather is going in the opposite direction
                toolRate = 0;
                //TODO may need updates as more preventive tools are added
                if (weatherRate <= 0) {
                    weatherRate = tool.getDecayRate(activeTools[i].tool, tool.ToolCategory.Water);
                }
                break;
            }
            toolRate += tool.getDecayRate(activeTools[i].tool, tool.ToolCategory.Water);
        }
    }
    return weatherRate + toolRate;
}

/** Remove an active tool from a plant. Returns true if the given tool was found and removed, false if it was not found. */
export function removeActiveTool(game: GardenGame, plant: Plant, category: tool.ToolCategory): tool.Tool {
    if (plant.id in game.activeTools) {
        let activeTools: tool.ActiveTool[] = game.activeTools[plant.id];
        let toRemove = -1;
        for (let i = 0; i < activeTools.length; i++) {
            if (tool.getCategory(activeTools[i].tool) == category) {
                toRemove = i;
                break;
            }
        }
        if (toRemove > -1) {
            let removed = activeTools[toRemove].tool;
            activeTools[toRemove].gameObject.destroy();
            activeTools.splice(toRemove, 1);
            return removed;
        }
    }
    return null;
}

/** Use the currently selected tool. If a new active tool is created, it will be returned. Otherwise, null is returned. */
export function useSelectedTool(game: GardenGame, plant: Plant): tool.ActiveTool {
    // If using a one time use tool, just use it
    if (game.selectedTool && tool.getCategory(game.selectedTool) == tool.ToolCategory.SingleUse) {
        useSingleUseTool(game, plant);
        return null;
    }

    // Remove the selected tool if one is active
    if (! game.selectedTool || removeActiveTool(game, plant, tool.getCategory(game.selectedTool)) == game.selectedTool) {
        return null;
    }

    // Otherwise, create the active tool
    let active: tool.ActiveTool = {
        tool: game.selectedTool,
        gameObject: null
    };
    game.activeTools[plant.id].push(active);
    return active;
}

export function numActiveTools(game: GardenGame, plant: Plant): number {
    if (plant.id in game.activeTools) {
        return game.activeTools[plant.id].length;
    }
    return 0;
}

function addScore(game: GardenGame, toAdd: number) {
    game.score += toAdd;
    scoreUpdateEvent(game.score);
}

function useSingleUseTool(game: GardenGame, plant: Plant) {
    switch (game.selectedTool) {
        case tool.Tool.Basket:
            if (plant.isFruitAvailable) {
                harvestFruit(plant);
                addScore(game, config()["fruitHarvestPoints"]);
            }
            break;
        default:
            // Nothing to do here
            break;
    }
}
