import { networkInterfaces } from "os";
import { SocketException } from "./SocketException";
import { constants } from "./constants";

const { IP_MIN, IP_MAX } = constants;

export function getMyIP() {
    const networks = networkInterfaces();

    if (networks["eth0"]) {
        return networks["eth0"]![0]!["address"];
    } else if (networks["en0"]) {
        return networks["en0"]![0]!["address"];
    }

    return null;
}

export function ipToInt(ip: string): number {
    const parts = ip.split('.').map(Number);
    if (parts && parts.length == 4 && parts[0] && parts[1] && parts[2] && parts[3]) {
        return (
            (parts[0] << 24) +
            (parts[1]! << 16) +
            (parts[2]! << 8) +
            parts[3]!
        ) >>> 0;
    }

    throw new SocketException(`Invalid IPv4 provided: ${ip}`)
}

export function intToIp(int: number): string {
    return (
        ((int >>> 24) & 0xFF) + '.' +
        ((int >>> 16) & 0xFF) + '.' +
        ((int >>> 8) & 0xFF) + '.' +
        (int & 0xFF)
    );
}

/*
  Using the min and max IP address for this Orchestrator (in the future this will be user defined),
  this function searches for the lowest IP address that is not already assigned to another Node.
*/
export function partitionIP(used_ips: string[]) {
    var current = ipToInt(IP_MIN);
    const int_max = ipToInt(IP_MAX);

    while (current <= int_max) {
        const current_ip = intToIp(current);
        if (!used_ips.includes(current_ip)) return current_ip

        current++;
    }

    throw new SocketException(`No IPs remain on this machine.`)
}
