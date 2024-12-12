#pragma once

#include <xrit_unreal/data/livelink.h>

#include "ILiveLinkClient.h"

// exported functions
extern "C"
{
    xrit_unreal::Guid XRITINTEGRATION_LIVELINKXR_API CreateLiveLinkXrSourceImpl(ILiveLinkClient& Client, xrit_unreal::LiveLinkXrSourceSettings const& Settings);
}

// function pointers to the exported functions
using CreateLiveLinkXrSourcePtr = xrit_unreal::Guid(*)(ILiveLinkClient&, xrit_unreal::LiveLinkXrSourceSettings const&);

// storage for all function pointers
struct FXritIntegration_LiveLinkXr
{
    CreateLiveLinkXrSourcePtr CreateLiveLinkXrSource = nullptr;
};

// inline function for loading all function pointers
inline void Load(void* Handle, FXritIntegration_LiveLinkXr& Out)
{
    Out.CreateLiveLinkXrSource = reinterpret_cast<CreateLiveLinkXrSourcePtr>(FPlatformProcess::GetDllExport(Handle, TEXT("CreateLiveLinkXrSourceImpl")));
}