#pragma once

#include <xrit_unreal/data/livelink.h>

#include "ILiveLinkClient.h"

// exported functions
extern "C"
{
    xrit_unreal::Guid XRITINTEGRATION_LIVELINKFREED_API CreateLiveLinkFreeDSourceImpl(ILiveLinkClient& Client, xrit_unreal::LiveLinkFreeDSourceSettings const& Settings);
}

// function pointers to the exported functions
using CreateLiveLinkFreeDSourcePtr = xrit_unreal::Guid(*)(ILiveLinkClient&, xrit_unreal::LiveLinkFreeDSourceSettings const&);

// storage for all function pointers
struct FXritIntegration_LiveLinkFreeD
{
    CreateLiveLinkFreeDSourcePtr CreateLiveLinkFreeDSource = nullptr;
};

// inline function for loading all function pointers
inline void Load(void* Handle, FXritIntegration_LiveLinkFreeD& Out)
{
    Out.CreateLiveLinkFreeDSource = reinterpret_cast<CreateLiveLinkFreeDSourcePtr>(FPlatformProcess::GetDllExport(Handle, TEXT("CreateLiveLinkFreeDSourceImpl")));
}