using UnrealBuildTool;
using System.IO;

public class Xrit : ModuleRules
{
    public Xrit(ReadOnlyTargetRules Target) : base(Target)
    {

        var OptionalIntegrations = new string[]
        {
            "XritIntegration_LiveLinkDummy",
            "XritIntegration_LiveLinkMvn",
            "XritIntegration_LiveLinkOptitrack",
            "XritIntegration_LiveLinkXr",
            "XritIntegration_LiveLinkFreeD",
        };
        PrivateIncludePathModuleNames.AddRange(OptionalIntegrations);
        DynamicallyLoadedModuleNames.AddRange(OptionalIntegrations);

        PrivateDependencyModuleNames.AddRange(
            new string[]
            {
                "Core",
                "CoreUObject",
                "Engine",
                "UdpMessaging",
                "LiveLink",
                "LiveLinkComponents",
                "LiveLinkInterface",
                "SlateCore",
                "InputCore",
                "Slate",
                "Projects",
                "XritCore",
                "XritConvert"
            }
        );
    }
}