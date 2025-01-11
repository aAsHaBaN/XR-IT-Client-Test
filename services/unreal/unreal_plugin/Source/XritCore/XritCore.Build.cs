using UnrealBuildTool;
using System.IO;
using System;
using System.Collections.Generic;

public class XritCore : ModuleRules
{
    public XritCore(ReadOnlyTargetRules Target) : base(Target)
    {
        Type = ModuleType.External;
        
        string coreDirectory = Path.Combine(ModuleDirectory, "xrit_unreal_core");
        
        List<string> staticLibraries = new List<string>();
        
        if (Target.Platform == UnrealTargetPlatform.Win64)
        {
            staticLibraries.Add("xrit_unreal.lib");
            staticLibraries.Add("simdjson.lib");
            staticLibraries.Add("websockets_static.lib");
        }
        else
        {
            staticLibraries.Add("libxrit_unreal.a");
            staticLibraries.Add("libsimdjson.a");
            staticLibraries.Add("libwebsockets.a");
        }
        
        foreach (string staticLibrary in staticLibraries)
        {
            PublicAdditionalLibraries.Add(Path.Combine(coreDirectory, "lib", staticLibrary));            
        }
        
        PrivateDefinitions.Add("XRIT_UNREAL_CORE_API_IMPORT");
        
        PublicDependencyModuleNames.Add("XritCoreHeaders");
    }
}