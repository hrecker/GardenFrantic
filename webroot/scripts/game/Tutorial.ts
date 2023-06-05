import { config } from "../model/Config";
import { getAllHazards, Hazard } from "./Hazard";
import { getAllTools, Tool } from "./Tool"

export type TutorialState = {
    enabled: boolean;
    step: number;
    hazardSpawned: boolean;
}

export function getDisabledTutorial(): TutorialState {
    return {
        enabled: false,
        step: -1,
        hazardSpawned: false
    };
}

export function getEnabledTutorial(): TutorialState {
    return {
        enabled: true,
        step: 0,
        hazardSpawned: false
    };
}

export function advanceTutorial(tutorial: TutorialState) {
    tutorial.step += 1;
    tutorial.hazardSpawned = false;
}

export function getEnabledTools(tutorialState: TutorialState): Tool[] {
    if (! tutorialState.enabled || tutorialState.step >= config()["tutorialStartPoints"]["tools"]) {
        return getAllTools();
    }
    return [];
}

export function isWaterStatusBarEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    return tutorialState.step >= config()["tutorialStartPoints"]["water"];
}

export function isLightStatusBarEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    return tutorialState.step >= config()["tutorialStartPoints"]["light"];
}

export function isFruitGrowthEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    return tutorialState.step >= config()["tutorialStartPoints"]["fruit"];
}

export function isHealthStatusBarEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    return tutorialState.step >= config()["tutorialStartPoints"]["health"];
}

export function getTutorialHazard(tutorialState: TutorialState): Hazard {
    if (! tutorialState.enabled || tutorialState.hazardSpawned) {
        return null;
    }
    if (tutorialState.step == config()["tutorialStartPoints"]["birdHazard"]) {
        tutorialState.hazardSpawned = true;
        return Hazard.Bird;
    }
    if (tutorialState.step == config()["tutorialStartPoints"]["weedHazard"]) {
        tutorialState.hazardSpawned = true;
        return Hazard.Weeds;
    }
    if (tutorialState.step == config()["tutorialStartPoints"]["bugHazard"]) {
        tutorialState.hazardSpawned = true;
        return Hazard.Bugs;
    }
    if (tutorialState.step == config()["tutorialStartPoints"]["bunnyHazard"]) {
        tutorialState.hazardSpawned = true;
        return Hazard.Bunny;
    }
    if (tutorialState.step == config()["tutorialStartPoints"]["moleHazard"]) {
        tutorialState.hazardSpawned = true;
        return Hazard.Mole;
    }
    if (tutorialState.step == config()["tutorialStartPoints"]["meteorHazard"]) {
        tutorialState.hazardSpawned = true;
        return Hazard.Meteor;
    }
    return null;
}

export function isWeatherEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    return tutorialState.step >= config()["tutorialStartPoints"]["weather"];
}

export function isScoreEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    return tutorialState.step >= config()["tutorialStartPoints"]["score"];
}
