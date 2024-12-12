class PortManager {
  private static instance: PortManager;
  private assignedPorts: Map<string, Set<number>>;
  private startingPort: number;

  private constructor() {
    this.assignedPorts = new Map();
    this.startingPort = parseInt(
      process.env.NEXT_PUBLIC_UNREAL_DEFAULT_PORT ?? "8764",
    );
  }

  public static getInstance(): PortManager {
    if (!PortManager.instance) {
      PortManager.instance = new PortManager();
    }
    return PortManager.instance;
  }

  public assignPort(serviceName: string, port?: number): number {
    if (!this.assignedPorts.has(serviceName)) {
      this.assignedPorts.set(serviceName, new Set());
    }

    const assigned = this.assignedPorts.get(serviceName)!;
    if (port) {
      assigned.add(port);
      return port;
    }

    let nextPort = this.startingPort;

    while (assigned.has(nextPort)) {
      nextPort++;
    }

    assigned.add(nextPort);
    return nextPort;
  }

  public releasePort(serviceName: string, port: number): void {
    if (this.assignedPorts.has(serviceName)) {
      this.assignedPorts.get(serviceName)!.delete(port);
    }
  }
}

export default PortManager;
