#pragma once

#include <xrit_unreal/data/livelink.h>

#include "ILiveLinkClient.h"

// exported functions
extern "C"
{
    xrit_unreal::Guid XRITINTEGRATION_LIVELINKMVN_API CreateLiveLinkMvnSourceImpl(ILiveLinkClient& Client, xrit_unreal::LiveLinkMvnSourceSettings const& Settings);
}

// function pointers to the exported functions
using CreateLiveLinkMvnSourcePtr = xrit_unreal::Guid(*)(ILiveLinkClient&, xrit_unreal::LiveLinkMvnSourceSettings const&);

// storage for all function pointers
struct FXritIntegration_LiveLinkMvn
{
    CreateLiveLinkMvnSourcePtr CreateLiveLinkMvnSource = nullptr;
};

// inline function for loading all function pointers
inline void Load(void* Handle, FXritIntegration_LiveLinkMvn& Out)
{
    Out.CreateLiveLinkMvnSource = reinterpret_cast<CreateLiveLinkMvnSourcePtr>(FPlatformProcess::GetDllExport(Handle, TEXT("CreateLiveLinkMvnSourceImpl")));
}