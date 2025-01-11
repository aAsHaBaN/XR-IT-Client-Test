using UnrealBuildTool;

public class XritIntegration_LiveLinkXr : ModuleRules
{
    public XritIntegration_LiveLinkXr(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(
            new string[]
            {
                "LiveLinkInterface",
                "XritConvert"
            }
        );

        PrivateDependencyModuleNames.AddRange(
            new string[]
            {
                "Core",
                "CoreUObject",
                "LiveLinkXR",
                "HeadMountedDisplay",
                "InputCore",
                "Engine"
            }
        );
    }
}