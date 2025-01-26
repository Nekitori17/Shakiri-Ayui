export default <T>(path: string, customId: string) => {
  console.log(customId)
  const category = parserPart(customId.split("_")[0]);
  const action = parserPart(customId.split("_")[1]);

  return require(`${path}/${category}/${action}`).default as T;
};

function parserPart(str: string): string {
  console.log(str)
  if (!str.includes("-")) return str;

  const parts = str.split("-");
  const pascalCase = parts
    .slice(1)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join("");
  return parts[0].toLowerCase() + pascalCase;
}
