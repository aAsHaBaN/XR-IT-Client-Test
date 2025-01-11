using UnrealBuildTool;

public class XritIntegration_LiveLinkMvn : ModuleRules
{
    public XritIntegration_LiveLinkMvn(ReadOnlyTargetRules Target) : base(Target)
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
                "LiveLinkMvnPlugin"
            }
        );
    }
}