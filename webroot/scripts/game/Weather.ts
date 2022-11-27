import { config } from "../model/Config";

/** Types of weather in the game */
export enum Weather {
    PartlyCloudy = "partlyCloudy",
    Cloudy = "cloudy",
    Heat = "heat",
    Rain = "rain"
}

/** Get a random Weather condition */
export function getRandomWeather(): Weather {
    let rand = Math.random();
    if (rand < 0.25) {
        return Weather.PartlyCloudy;
    } else if (rand < 0.5) {
        return Weather.Cloudy;
    } else if (rand < 0.75) {
        return Weather.Heat;
    } else {
        return Weather.Rain;
    }
}

/** Get the default weather for the game */
export function getDefaultWeather(): Weather {
    return config()["defaultWeather"];
}

/** Get the current water decay rate for the weather */
export function getWaterDecayRate(weather: Weather): number {
    return config()["weatherDecayRates"][weather]["water"];
}

/** Get the current light decay rate for the weather */
export function getLightDecayRate(weather: Weather): number {
    return config()["weatherDecayRates"][weather]["light"];
}
