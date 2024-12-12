const isHEX = (ch: String) => "0123456789abcdef".includes(ch.toLowerCase());

export const isGuidValid = (guid: string) => {
  guid = guid.replaceAll("-", "");
  return guid.length === 32 && [...guid].every(isHEX);
};

export const isValidPort = (port: number) => {
  // TODO: Specify valid port checking for TCP/UDP, etc.
  return Number.isInteger(port) && 1 <= port && port <= 65535;
};
