import { spawn, exec, ExecException } from 'child_process';

export interface Callback {
    (isOpen: boolean): void;
}

// Launches an application
export function launchApplication(exePath: string): void {
    spawn(exePath, { detached: true, stdio: 'ignore' }).unref();
    console.log(`Application launched: ${exePath}`);
}

// Kills an application by its name
export function killApplication(appName: string): void {
    const command = `taskkill /IM ${appName} /F`;
    exec(command, (error: ExecException | null) => {
        if (error) {
            console.error(`Failed to terminate ${appName}: ${error.message}`);
        } else {
            console.log(`${appName} terminated successfully.`);
        }
    });
}

// Checks if an application is running
export function isApplicationOpen(appName: string, callback: Callback): void {
    const command = `tasklist | findstr /I ${appName}`;
    exec(command, (error: ExecException | null, stdout: string) => {
        if (error) {
            callback(false);
        } else {
            callback(stdout.toLowerCase().includes(appName.toLowerCase()));
        }
    });
}