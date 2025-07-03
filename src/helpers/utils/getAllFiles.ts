import fs from "fs";
import path from "path";
import _ from "lodash";

/**
 * Reads directory and returns an array of file or folder paths,
 * optionally excluding some names.
 *
 * @param directory - Directory to read files/folders from.
 * @param folderOnly - If true, return only folders; if false, return only files.
 * @param exception - List of file/folder names to exclude from results.
 * @returns Array of full paths matching criteria.
 */
export default (
  directory: string,
  folderOnly: boolean = false,
  exception: string[] = []
)=> {
  // Read all entries (files and folders) in the directory
  const files = fs.readdirSync(directory, { withFileTypes: true });

  return _(files)
    // Filter entries by folderOnly flag: keep only directories or only files
    .filter((file) =>
      folderOnly ? file.isDirectory() : file.isFile()
    )
    // Exclude files/folders whose name is in exception list
    .filter((file) => !exception.includes(file.name))
    // Map each filtered entry to its full path string
    .map((file) => path.join(directory, file.name))
    // Unwrap lodash chain to an array
    .value();
};
