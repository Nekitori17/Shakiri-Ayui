export const mongooseProperty = [
  // Core SchemaType Options
  "type",
  "required",
  "default",
  "select",
  "validate",
  "get",
  "set",
  "alias",
  "immutable",
  "transform",

  // Indexing Options
  "index",
  "unique",
  "sparse",
  
  // String Specific
  "lowercase",
  "uppercase",
  "trim",
  "match",
  "enum",
  "minLength",
  "maxLength",
  
  // Number Specific
  "min",
  "max",
  "exclusiveMin",
  "exclusiveMax",
  
  // Date Specific
  "min",
  "max",
  "expires",
  
  // ObjectId Specific
  "ref",
  "populate",
  
  // Array Specific
  "of",
  "maxItems",
  "minItems",
  "items",
  
  // Document/Subdocument Options
  "_id",
  "id",
  "strictPopulate",
  "versionKey",
  "timestamps",
  
  // Advanced Options
  "cast",
  "_cast",
  "autopopulate",
  "discriminator",
  "localField",
  "foreignField",
  "justOne",
  "strict",
  "strictQuery",
  
  // Additional Utility Options
  "select",
  "lean",
  "skipVersioning",
  "minimize",
  "toJSON",
  "toObject",
  "typeKey",
  "bufferCommands",
  "capped",
  "collection",
  "read",
  "shardKey",
  "timestamps",
  "retainKeyOrder"
];