import { config } from "../model/Config";
import { Status } from "./Plant";

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

/** Get the current status decay rate for the weather */
export function getDecayRate(weather: Weather, status: Status) {
    return config()["weatherDecayRates"][weather][status]
}