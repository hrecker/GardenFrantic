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
        step: 1
    };
}

//TODO completing tutorial
export function advanceTutorial(tutorial: TutorialState) {
    tutorial.step += 1;
}

export function getEnabledTools(tutorialState: TutorialState): Tool[] {
    if (! tutorialState.enabled) {
        return getAllTools();
    }
    //TODO
    return [];
}

export function isWaterStatusBarEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    //TODO
    return false;
}

export function isLightStatusBarEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    //TODO
    return false;
}

export function isFruitGrowthEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    //TODO
    return false;
}

export function isHealthStatusBarEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    //TODO
    return false;
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
    //TODO
    return false;
}

export function isScoreEnabled(tutorialState: TutorialState): boolean {
    if (! tutorialState.enabled) {
        return true;
    }
    //TODO
    return false;
}
