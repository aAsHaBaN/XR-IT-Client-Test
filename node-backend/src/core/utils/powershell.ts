import { spawn } from "node:child_process";
import { SocketException } from "./SocketException";
import process from "node:process";
import { constants } from "./constants";
const { POWERSHELL_RETURN_START_DELIMITER } = constants;

// Helper function which executes a powershell script at a provided path
// Arguments for the script should be provided as a list of name, value pairings
const runPowershell = function (script_path: any, args: { name: any, val: any }[], timeout: number | undefined = undefined) {
  return new Promise<any>(function (resolve, reject) {
    var output = [process.cwd() + script_path];

    output.push("-Verb");
    output.push("RunAs");

    args.forEach((a: any) => {
      output.push("-" + a.name);
      output.push(a.val);
    });

    var child = timeout
      ? spawn("powershell.exe", output, { timeout: timeout })
      : spawn("powershell.exe", output);

    var response: any = undefined; 
    child.stdout.on("data", function (rawData) {
      let data = rawData.toString();
      if(data.startsWith(POWERSHELL_RETURN_START_DELIMITER)) {
        var lines = data.split('`n');
        lines.splice(0,1);
        response = JSON.parse(lines.join('`n'));  
      } else {
        console.log("POWERSHELL LOG: " + data);
      }
    });
    child.stderr.on("data", function (data) {
      throw new SocketException(data);
    });
    child.on("exit", function () {
      resolve(response);
    });
    child.stdin.end();
  });
};

export default runPowershell;