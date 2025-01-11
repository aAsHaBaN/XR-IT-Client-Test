using UnrealBuildTool;
using System.IO;

public class XritIntegration_LiveLinkFreeD : ModuleRules
{
    public XritIntegration_LiveLinkFreeD(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(
            new string[]
            {
                "LiveLinkInterface",
                "XritConvert"
            }
        );

        PrivateIncludePaths.AddRange(new string[]
        {
            Path.Combine(GetModuleDirectory("LiveLinkFreeD"), "Private")
        });

        PrivateDependencyModuleNames.AddRange(
            new string[]
            {
                "Core",
                "CoreUObject",
                "LiveLinkFreeD",
                "Messaging",
                "MessagingCommon"
            }
        );
    }
}