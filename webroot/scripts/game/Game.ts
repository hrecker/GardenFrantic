import { hazardCreatedEvent, plantDestroyEvent, scoreUpdateEvent, weatherUpdateEvent } from "../events/EventMessenger";
import { config } from "../model/Config";
import { ActiveHazard, getNextHazardDurationMs, getRandomizedHazards, Hazard } from "./Hazard";
import { getNewId } from "./Id";
import { isFruitGrowthPaused, newPlant, harvestFruit, Plant, setFruitProgress, Status, updateStatusLevel, numWarningStatus, getFruitProgressRate, removeHazard } from "./Plant";
import * as tool from "./Tool";
import * as weather from "./Weather";
import { shuffleArray } from "../util/Util";

export type GardenGame = {
    /** Plants in the game */
    plants: { [id: number]: Plant };
    /** Active tools in the game, with a plant Id indicating which plant the tool is active for */
    activeTools: { [plantId: number]: tool.ActiveTool[] };
    /** Currently selected tool, or null if none selected */
    selectedTool: tool.Tool;
    /** Currently active weather */
    weather: weather.Weather;
    /** Upcoming weather */
    weatherQueue: weather.Weather[];
    /** How long the current weather has lasted */
    currentWeatherDurationMs: number;
    /** Active hazards */
    activeHazards: { [id: number]: ActiveHazard };
    /** How long ago the current hazard started */
    currentHazardDurationMs: number;
    /** Time until the next hazard should start */
    nextHazardDuration: number;
    /** Current score */
    score: number;
}

export function newGame(): GardenGame {
    let game: GardenGame = {
        plants: {},
        activeTools: {},
        selectedTool: tool.Tool.NoTool,
        weather: weather.getDefaultWeather(),
        weatherQueue: initialWeatherQueue(),
        currentWeatherDurationMs: 0,
        activeHazards: [],
        currentHazardDurationMs: 0,
        nextHazardDuration: getNextHazardDurationMs(),
        score: 0,
    };
    weatherUpdateEvent(game.weather, game.weatherQueue);
    return game;
}

function initialWeatherQueue(): weather.Weather[] {
    let queue = [];
    for (let i = 0; i < config()["weatherQueueLength"]; i++) {
        queue.push(weather.getRandomWeather());
    }
    return queue;
}

function advanceWeather(game: GardenGame) {
    game.weather = game.weatherQueue[0];
    for (let i = 0; i < game.weatherQueue.length - 1; i++) {
        game.weatherQueue[i] = game.weatherQueue[i + 1];
    }
    game.weatherQueue[game.weatherQueue.length - 1] = weather.getRandomWeather();
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
            updateStatusLevel(plant, Status.Health, -delta / 1000.0 * getHealthDecayRateForPlant(game, plant));
            if (! isFruitGrowthPaused(game, plant)) {
                setFruitProgress(plant, plant.fruitProgress + (delta / 1000.0) * getFruitProgressRate(plant))
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
        advanceWeather(game);
        weatherUpdateEvent(game.weather, game.weatherQueue);
    }

    // Hazard updates
    Object.keys(game.activeHazards).forEach(id => {
        let activeHazard: ActiveHazard = game.activeHazards[id];
        if (activeHazard.timeUntilActiveMs > 0) {
            activeHazard.timeUntilActiveMs -= delta;
        }
    });

    game.currentHazardDurationMs += delta;
    if (game.currentHazardDurationMs >= game.nextHazardDuration && Object.keys(game.plants).length > 0) {
        game.currentHazardDurationMs = 0;
        game.nextHazardDuration = getNextHazardDurationMs();
        let targetPlant = getRandomPlant(game).id;
        // Select a hazard that isn't already active for this plant
        // There is a chance that we select a plant that can't add any new hazards when another
        // plant could get a hazard. I'll just accept this as a feature for now - anyways if a plant
        // has every possible hazard things are likely pretty bad already for the player
        let possibleHazards = getRandomizedHazards();
        let chosenHazard: Hazard = null;
        let foundHazards: Hazard[] = [];
        // Build list of all hazards currently active for the chosen plant
        for (let i = 0; i < game.plants[targetPlant].activeHazardIds.length; i++) {
            foundHazards.push(game.activeHazards[game.plants[targetPlant].activeHazardIds[i]].hazard);
        }
        for (let i = 0; i < possibleHazards.length; i++) {
            let existingHazardFound = false;
            for (let j = 0; j < foundHazards.length; j++) {
                if (possibleHazards[i] == foundHazards[j]) {
                    existingHazardFound = true;
                    break;
                }
            }
            if (! existingHazardFound) {
                chosenHazard = possibleHazards[i];
                break;
            }
        }
        if (chosenHazard != null) {
            let activeHazard: ActiveHazard = {
                id: getNewId(),
                hazard: chosenHazard,
                timeUntilActiveMs: config()["hazardTimeToActiveMs"],
                targetPlantId: targetPlant,
            }
            game.activeHazards[activeHazard.id] = activeHazard;
            game.plants[targetPlant].activeHazardIds.push(activeHazard.id);
            hazardCreatedEvent(activeHazard.id);
        }
    }
}

function getRandomPlant(game: GardenGame): Plant {
    let ids = [];
    Object.keys(game.plants).forEach(id => {
        ids.push(id);
    });
    shuffleArray(ids);
    return game.plants[ids[0]];
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

function getHealthDecayRateForPlant(game: GardenGame, plant: Plant): number {
    let decayRate = config()["healthGrowthRate"] * -1;
    // If any status is at warning level, then health will decrease
    let numWarning = numWarningStatus(plant);
    if (numWarning > 0) {
        decayRate = config()["healthDecayRateBase"] * numWarning;
    }
    let hazardDecayRate = 0;
    for (let i = 0; i < plant.activeHazardIds.length; i++) {
        let hazard: ActiveHazard = game.activeHazards[plant.activeHazardIds[i]];
        if (hazard.timeUntilActiveMs <= 0) {
            hazardDecayRate += config()["hazards"][hazard.hazard.toString()]["healthDamageRate"];
        }
    }
    // If hazards are causing damage then don't let health increase
    if (hazardDecayRate > 0 && decayRate < 0) {
        decayRate = 0;
    }
    return decayRate + hazardDecayRate;
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
        case tool.Tool.Pesticide:
            removeHazard(game, plant, Hazard.Bugs);
            break;
        case tool.Tool.Scarecrow:
            removeHazard(game, plant, Hazard.Birds);
            break;
        case tool.Tool.Weedkiller:
            removeHazard(game, plant, Hazard.Weeds);
            break;
        default:
            // Nothing to do here
            break;
    }
}
