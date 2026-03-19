import { spawn } from "node:child_process";
import type {
  InfraAdapter,
  ToolDefinition,
  ToolCallResult,
  ClusterState,
} from "../../types.js";

export class SystemAdapter implements InfraAdapter {
  name = "system";
  private _connected = false;

  async connect(): Promise<void> {
    this._connected = true;
  }

  async disconnect(): Promise<void> {
    this._connected = false;
  }

  isConnected(): boolean {
    return this._connected;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "ssh_exec",
        description:
          "Execute a command on a remote host via SSH. Use for post-deployment configuration, log retrieval, and service management.",
        tier: "risky_write",
        adapter: "system",
        params: [
          { name: "host", type: "string", required: true, description: "Target IP or hostname" },
          { name: "user", type: "string", required: false, description: "SSH user", default: "root" },
          { name: "command", type: "string", required: true, description: "Command to execute" },
          { name: "timeout_ms", type: "number", required: false, description: "Timeout in ms", default: 30000 },
        ],
        returns: "{ stdout, stderr, exitCode }",
      },
      {
        name: "local_exec",
        description:
          "Execute a command on the local machine. Use for local tool invocations or checks.",
        tier: "risky_write",
        adapter: "system",
        params: [
          { name: "command", type: "string", required: true, description: "Command to execute" },
          { name: "timeout_ms", type: "number", required: false, description: "Timeout in ms", default: 30000 },
        ],
        returns: "{ stdout, stderr, exitCode }",
      },
      {
        name: "ping",
        description: "Check if a host is reachable via ICMP ping.",
        tier: "read",
        adapter: "system",
        params: [
          { name: "host", type: "string", required: true, description: "Target IP or hostname" },
          { name: "count", type: "number", required: false, description: "Number of pings", default: 3 },
        ],
        returns: "{ reachable, latency_ms, packet_loss_pct }",
      },
    ];
  }

  async execute(
    tool: string,
    params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    switch (tool) {
      case "ssh_exec":
        return this.sshExec(params);
      case "local_exec":
        return this.localExec(params);
      case "ping":
        return this.ping(params);
      default:
        return { success: false, error: `Unknown system tool: ${tool}` };
    }
  }

  async getClusterState(): Promise<ClusterState> {
    return {
      adapter: "system",
      nodes: [],
      vms: [],
      containers: [],
      storage: [],
      timestamp: new Date().toISOString(),
    };
  }

  private async sshExec(
    params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    const host = params.host as string;
    const user = (params.user as string) || "root";
    const command = params.command as string;
    const timeout = (params.timeout_ms as number) || 30000;

    if (!host || !command) {
      return { success: false, error: "host and command are required" };
    }

    return this.runProcess(
      "ssh",
      [
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=/dev/null",
        "-o", `ConnectTimeout=${Math.ceil(timeout / 1000)}`,
        "-o", "LogLevel=ERROR",
        `${user}@${host}`,
        command,
      ],
      timeout
    );
  }

  private async localExec(
    params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    const command = params.command as string;
    const timeout = (params.timeout_ms as number) || 30000;

    if (!command) {
      return { success: false, error: "command is required" };
    }

    return this.runProcess("bash", ["-c", command], timeout);
  }

  private async ping(
    params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    const host = params.host as string;
    const count = (params.count as number) || 3;

    if (!host) {
      return { success: false, error: "host is required" };
    }

    const result = await this.runProcess(
      "ping",
      ["-c", String(count), "-W", "2", host],
      10000
    );

    if (!result.success) {
      return {
        success: true,
        data: { reachable: false, latency_ms: null, packet_loss_pct: 100 },
      };
    }

    const output = (result.data as { stdout: string }).stdout;
    const lossMatch = output.match(/(\d+(?:\.\d+)?)% packet loss/);
    const latencyMatch = output.match(/rtt min\/avg\/max\/mdev = [\d.]+\/([\d.]+)/);

    return {
      success: true,
      data: {
        reachable: true,
        latency_ms: latencyMatch ? parseFloat(latencyMatch[1]) : null,
        packet_loss_pct: lossMatch ? parseFloat(lossMatch[1]) : 0,
      },
    };
  }

  private runProcess(
    cmd: string,
    args: string[],
    timeout: number
  ): Promise<ToolCallResult> {
    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let killed = false;

      const proc = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });

      const timer = setTimeout(() => {
        killed = true;
        proc.kill("SIGTERM");
      }, timeout);

      proc.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
        if (stdout.length > 10240) {
          stdout = stdout.slice(0, 10240) + "\n...[truncated]";
          proc.kill("SIGTERM");
        }
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
        if (stderr.length > 5120) {
          stderr = stderr.slice(0, 5120) + "\n...[truncated]";
        }
      });

      proc.on("close", (code) => {
        clearTimeout(timer);
        if (killed) {
          resolve({
            success: false,
            error: `Command timed out after ${timeout}ms`,
            data: { stdout, stderr, exitCode: 124 },
          });
        } else {
          resolve({
            success: code === 0,
            data: { stdout, stderr, exitCode: code ?? 1 },
            error: code !== 0 ? `Exit code: ${code}` : undefined,
          });
        }
      });

      proc.on("error", (err) => {
        clearTimeout(timer);
        resolve({ success: false, error: err.message });
      });
    });
  }
}
