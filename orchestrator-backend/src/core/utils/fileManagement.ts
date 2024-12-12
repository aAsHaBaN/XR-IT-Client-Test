import { readdirSync, readFileSync } from "fs";

export function readJSONFile(path: string) {
    const file_data = readFileSync(path);
    return JSON.parse(file_data.toString());
  }
  
export function generateUniqueFileName(directory_name: string, configuration_name: string): string {
    var file_name = configuration_name.trim().replace(/ /g, "_");
  
    while (readdirSync(directory_name).filter(file => file.toLocaleLowerCase() === (`${file_name}.json`).toLocaleLowerCase()).length > 0) {
      var count = 0;
  
      if (file_name.length >= 3 && file_name[file_name.length - 3] === "(" && !isNaN(parseInt(file_name[file_name.length - 2]!)) && file_name[file_name.length - 1] === ")") {
        count = Number(file_name[file_name.length - 2]) + 1;
        file_name = `${file_name.substring(0, file_name.length - 3)}(${count})`
      } else {
        file_name = `${file_name}(${count})`
      }
  
    }
  
    return `${file_name}.json`;
  }