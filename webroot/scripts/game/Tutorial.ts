import { config } from "../model/Config";
import { getAllHazards, Hazard } from "./Hazard";
import { getAllTools, Tool } from "./Tool"

export type TutorialState = {
    enabled: boolean;
    step: number;
}

export function getDisabledTutorial(): TutorialState {
    return {
        enabled: false,
        step: -1
    };
}

export function getEnabledTutorial(): TutorialState {
    return {
        enabled: true,
        step: 0
    };
}

export function advanceTutorial(tutorial: TutorialState) {
    tutorial.step += 1;
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

//TODO logic for specific hazards one at a time
export function getValidHazards(tutorialState: TutorialState): Hazard[] {
    if (! tutorialState.enabled) {
        return getAllHazards();
    }
    //TODO
    return [];
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
