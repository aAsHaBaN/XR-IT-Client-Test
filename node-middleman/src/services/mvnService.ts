import dgram from "dgram";
import { networkInterfaces } from "os";
import { build_path } from "../utils/constants";
import runPowershell from "../utils/runPowershell";
import { MVNStreamingTarget } from "../models/MVN";
import xml2js from "xml2js";
import { SocketException } from "../utils/SocketException";

const MVN_LAUNCH_SCRIPT_PATH = build_path("/src/supported-services/utils/MVN/LaunchMVN.ps1");
const MVN_STATUS_SCRIPT_PATH = build_path("/src/supported-services/utils/MVN/GetMVNStatus.ps1");
const MVN_DEFAULT_REMOTE_COMMAND_PORT = 6004;
const MAX_UDP_TIMEOUTS = 3;

export async function isMVNRunning(): Promise<boolean> {
  const result = await runPowershell(MVN_STATUS_SCRIPT_PATH, []);
  return result.is_running as boolean;
}

export async function launchMVN() {
  return await runPowershell(MVN_LAUNCH_SCRIPT_PATH, []);
}

// Helper function to build XML requests
function buildXMLRequest(requestType: string, target: MVNStreamingTarget): string {
  const xml_builder = new xml2js.Builder();
  const request_data: any = {};
  request_data[requestType] = {
    $: { IpAddress: target.ip, PortNumber: target.port },
  };
  return xml_builder.buildObject(request_data);
}

// Helper function to handle socket communication
function sendSocketRequest(request_xml: string, responseKey: string): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    const socket = dgram.createSocket("udp4");
    const hostname = getHostInfo();
    let was_successful;

    socket.on("message", function (msg) {
      xml2js.parseString(msg, (err: any, res: any) => {
        if (err) {
          reject(new Error("Error parsing XML response: " + err.message));
          return;
        }

        was_successful = res[responseKey]["$"].Result;

        if (was_successful.trim().toLowerCase() === "true") {
          socket.close();
          resolve();
        } else {
          socket.close();
          reject(new Error(`MVN rejected the ${responseKey} request.`));
        }
      });
    });

    // There is some discrepency between time in which MVN opens and when it actually receives UDP commands. UDP packets may also drop unexpectedly.
    // Here, we will do a few retries, before assuming there is another issue.
    let timeouts = 0
    while(timeouts < MAX_UDP_TIMEOUTS) {
      socket.send(request_xml, hostname.port, hostname.ip, (error) => {
        if (error) {
          socket.close();
          reject(new Error("Error sending packet: " + error.message));
        }
      });

      const sleep = (ms: number) =>new Promise((resolve) => { setTimeout(resolve, ms); });
      await sleep(5000);

      if(was_successful) return;
      else {
        console.log('Message to MVN timed out, trying again.\n')
        timeouts++
      }
    }

    const error_message = `Max timeouts (${timeouts}) occured. MVN request failed.`;
    console.log(error_message + '\n');
    reject(new Error(error_message))
    return;
  });
}

// Main function to manage network streaming targets (add or remove)
async function manageNetworkStreamingTarget(
  target: MVNStreamingTarget,
  requestType: string,
  responseKey: string
): Promise<void> {
  const request_xml = buildXMLRequest(requestType, target);
  return await sendSocketRequest(request_xml, responseKey);
}

// Function to add a network streaming target
export async function addNetworkStreamingTarget(target: MVNStreamingTarget) {
  return manageNetworkStreamingTarget(target, "AddNetworkStreamingTargetReq", "AddNetworkStreamingTargetAck");
}

// Function to remove a network streaming target
export async function removeNetworkStreamingTarget(target: MVNStreamingTarget) {
  return manageNetworkStreamingTarget(target, "RemoveNetworkStreamingTargetReq", "RemoveNetworkStreamingTargetAck");
}

// Helper function to get the current machine's IP and port information
function getHostInfo() {
  const myIP = getMyIP();
  if (!myIP) throw new SocketException("Could not resolve your IP, please set manually.");

  return {
    ip: myIP,
    port: MVN_DEFAULT_REMOTE_COMMAND_PORT,
  };
}

// Helper function to retrieve the machine's IP address
function getMyIP() {
  const networks = networkInterfaces();
  let ipAddress = null;

  for (const name of Object.keys(networks)) {
    for (const net of networks[name]!) {
      if (net.family === "IPv4" && !net.internal) {
        ipAddress = net.address;
        break;
      }
    }
    if (ipAddress) break;
  }

  return ipAddress;
}