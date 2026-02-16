import _ from "lodash";

/**
 * Transforms a string to camelCase.
 * @param str The string to transform.
 * @returns The camelCased string.
 */
export const toCamelCase = (str: string) => {
  return _.camelCase(str);
};

/**
 * Transforms a string to PascalCase.
 * @param str The string to transform.
 * @returns The PascalCased string.
 */
export const toPascalCase = (str: string) => {
  return _.upperFirst(_.camelCase(str));
};

/**
 * Transforms a string to snake_case.
 * @param str The string to transform.
 * @returns The snake_cased string.
 */
export const toSnakeCase = (str: string) => {
  return _.snakeCase(str);
};

/**
 * Transforms a string to kebab-case.
 * @param str The string to transform.
 * @returns The kebab-cased string.
 */
export const toKebabCase = (str: string) => {
  return _.kebabCase(str);
};

/**
 * Transforms a string to UPPER_CASE.
 * @param str The string to transform.
 * @returns The UPPER_CASED string.
 */
export const toUpperCase = (str: string) => {
  return _.toUpper(_.snakeCase(str));
};

/**
 * Transforms a string to Sentence case.
 * @param str The string to transform.
 * @returns The sentence-cased string.
 */
export const toSentenceCase = (str: string) => {
  return _.upperFirst(_.lowerCase(str));
};

/**
 * Transforms a string to Title Case.
 * @param str The string to transform.
 * @returns The title-cased string.
 */
export const toTitleCase = (str: string) => {
  return _.startCase(_.camelCase(str));
};
