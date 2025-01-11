using UnrealBuildTool;

public class XritIntegration_LiveLinkDummy : ModuleRules
{
    public XritIntegration_LiveLinkDummy(ReadOnlyTargetRules Target) : base(Target)
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
                "DummyPlugin"
            }
        );
    }
}