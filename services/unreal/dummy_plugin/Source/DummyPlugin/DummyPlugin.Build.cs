// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class DummyPlugin : ModuleRules
{
	public DummyPlugin(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(
			new string[]
			{
				"Core",
				"LiveLink",
				"LiveLinkInterface"
			}
		);


		PrivateDependencyModuleNames.AddRange(
			new string[]
			{
				"Slate",
				"SlateCore",
				"CoreUObject",
			}
		);
	}
}