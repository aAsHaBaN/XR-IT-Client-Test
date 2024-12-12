#pragma once

#include <xrit_unreal/data/livelink.h>

#include "ILiveLinkClient.h"

// exported functions
extern "C"
{
	xrit_unreal::Guid XRITINTEGRATION_LIVELINKOPTITRACK_API CreateLiveLinkOptitrackSourceImpl(ILiveLinkClient& Client, xrit_unreal::LiveLinkOptitrackSourceSettings const& Settings);
}

// function pointers to the exported functions
using CreateLiveLinkOptitrackSourcePtr = xrit_unreal::Guid(*)(ILiveLinkClient&, xrit_unreal::LiveLinkOptitrackSourceSettings const&);

// storage for all function pointers
struct FXritIntegration_LiveLinkOptitrack
{
	CreateLiveLinkOptitrackSourcePtr CreateLiveLinkOptitrackSource = nullptr;
};

// inline function for loading all function pointers
inline void Load(void* Handle, FXritIntegration_LiveLinkOptitrack& Out)
{
	Out.CreateLiveLinkOptitrackSource = reinterpret_cast<CreateLiveLinkOptitrackSourcePtr>(FPlatformProcess::GetDllExport(Handle, TEXT("CreateLiveLinkOptitrackSourceImpl")));
}