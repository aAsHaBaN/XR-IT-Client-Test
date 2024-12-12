Very basic overview of a possible XR-IT simple use case, using one instance of MVN Animate (XSens MoCap suit) and one instance of Unreal Engine.
### MVN Animate

Launch MVN Animate (live recording) via **Command Line Executable**.
[[MVN-Command-Line-Functions]]
	`“C:\Program Files\Xsens\Xsens MVN 2021.2\MVN Studio\mvn_studio64.exe” <commands>

The client user will then need to turn on, connect and calibrate the XSens suit. Then they should stand on the "stage centre" point.

Remote Control (**UDP**) MVN Animate to set *network streaming targets*, *move character to the origin*, and *reset coordinate axis*.
[[MVN-UPD-Remote-Control]]
```
5.1 IdentifyReq
5.2 StartMeasuringReq
5.13 AddNetworkStreamingTargetReq
5.16 MoveCharacterToOriginReq
5.17 ResetAxisReq
```

MVN Animate should now be streaming motion capture data to the target destination.


### Unreal Engine

Launch the Unreal Engine project via **Command Line Executable**. This project should already have all required plugins installed (LiveLink, OpenXR, MVN Animate, etc)
[Launch UE Via Command Line](https://dev.epicgames.com/documentation/en-us/unreal-engine/running-unreal-engine?application_version=5.3)
	From a command prompt, navigate to 
	`[LauncherInstall][VersionNumber]\Engine\Binaries\Win64 directory.
	Run the UEEditor.exe, passing it the path to your project.
	`UEEditor.exe "[ProjectPath][ProjectName].uproject"

Automate the setting up and applying of MVN Live Link preset.
[Live Link Documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/live-link-in-unreal-engine?application_version=5.3)
This should be receiving data according to what was set up in MVN Animate.

Build animation blueprints with Live Link data.
[Using Live Link Data](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-live-link-data-in-unreal-engine?application_version=5.3)

Apply animation blueprint to MVN Mannequin, and then 