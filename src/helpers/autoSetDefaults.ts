import { SchemaDefinitionProperty } from "mongoose";
import { mongooseProperty } from "../constants/mongooseProperty";

export default function (schema: SchemaDefinitionProperty) {
  const skipProperty = mongooseProperty;
  const defaults: { [key: string]: any } = {};

  for (const [key, value] of Object.entries(schema)) {
    if (skipProperty.includes(key)) {
      if (typeof value === "object") {
        if ("default" in value) {
          defaults[key] = value.default;
        } else {
          defaults[key] = value;
        }
      } else {
        defaults[key] = value;
      }
    }

    if (value && typeof value === "object" && "default" in value) {
      defaults[key] = value.default;
    } else {
      defaults[key] = value;
    }
  }
  return defaults;
}
