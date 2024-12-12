using UnrealBuildTool;
using System.IO;
using System;
using System.Collections.Generic;

public class XritCoreHeaders : ModuleRules
{
    public XritCoreHeaders(ReadOnlyTargetRules Target) : base(Target)
    {
        Type = ModuleType.External;
        
        string coreDirectory = Path.Combine(ModuleDirectory, "xrit_unreal_core");
        
        PublicIncludePaths.Add(Path.Combine(coreDirectory, "include"));
    }
}