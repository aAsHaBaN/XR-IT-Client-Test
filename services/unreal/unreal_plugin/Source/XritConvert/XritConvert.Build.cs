using UnrealBuildTool;

public class XritConvert : ModuleRules
{
    public XritConvert(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(
            new string[]
            {
                "Core",
                "LiveLinkInterface",
            }
        );
        
        PublicDependencyModuleNames.Add("XritCoreHeaders");
    }
}