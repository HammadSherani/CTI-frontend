/** The platform works only in Turkey; forms select it for the user. */
import { isTurkey } from "./sellerProfileRules";

export const findTurkey = (countries) => (countries || []).find((country) => isTurkey(country.name));
