import configDevelopment from "./configs/config.development";
import configProduction from "./configs/config.production";

const config = process.env.NODE_ENV === "production" ? configProduction : configDevelopment;

export default config