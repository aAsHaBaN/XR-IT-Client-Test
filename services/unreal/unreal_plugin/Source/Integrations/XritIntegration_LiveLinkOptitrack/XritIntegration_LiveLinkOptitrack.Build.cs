using UnrealBuildTool;

public class XritIntegration_LiveLinkOptitrack : ModuleRules
{
    public XritIntegration_LiveLinkOptitrack(ReadOnlyTargetRules Target) : base(Target)
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
                "OptitrackLiveLink"
            }
        );
    }
}