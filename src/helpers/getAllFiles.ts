import fs from "fs";
import path from "path";

export default (
  directory: string,
  folderOnly: boolean = false,
  exception?: string[]
): string[] => {
  const fileNames: string[] = [];

  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath: string = path.join(directory, file.name);

    if (folderOnly) {
      if (file.isDirectory() && !exception?.includes(file.name)) {
        fileNames.push(filePath);
      }
    } else {
      if (file.isFile() && !exception?.includes(file.name)) {
        fileNames.push(filePath);
      }
    }
  }

  return fileNames;
};
