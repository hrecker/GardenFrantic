import { config } from "../model/Config";
import { shuffleArray } from "../util/Util";
import { Status } from "./Plant";

/** Types of weather in the game */
export enum Weather {
    PartlyCloudy = "partlyCloudy",
    Cloudy = "cloudy",
    Heat = "heat",
    Rain = "rain"
}

/** Get a random Weather condition */
export function getRandomWeather(invalidWeather?: Weather): Weather {
    let possibleWeathers = [Weather.PartlyCloudy, Weather.Cloudy, Weather.Heat, Weather.Rain];
    if (invalidWeather) {
        possibleWeathers.splice(possibleWeathers.indexOf(invalidWeather), 1);
    }
    shuffleArray(possibleWeathers);
    return possibleWeathers[0];
}

/** Get the default weather for the game */
export function getDefaultWeather(): Weather {
    return config()["defaultWeather"];
}

/** Get the current status decay rate for the weather */
export function getDecayRate(weather: Weather, status: Status) {
    return config()["weatherDecayRates"][weather][status]
}
