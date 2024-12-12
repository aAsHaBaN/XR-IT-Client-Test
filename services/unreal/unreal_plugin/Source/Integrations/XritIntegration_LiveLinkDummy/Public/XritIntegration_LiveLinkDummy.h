#pragma once

#include <xrit_unreal/data/livelink.h>

#include "ILiveLinkClient.h"

// exported functions
extern "C"
{
    xrit_unreal::Guid XRITINTEGRATION_LIVELINKDUMMY_API CreateLiveLinkDummySourceImpl(ILiveLinkClient& Client, xrit_unreal::LiveLinkDummySourceSettings const& Settings);
}

// function pointers to the exported functions
using CreateLiveLinkDummySourcePtr = xrit_unreal::Guid(*)(ILiveLinkClient&, xrit_unreal::LiveLinkDummySourceSettings const&);

// storage for all function pointers
struct FXritIntegration_LiveLinkDummy
{
    CreateLiveLinkDummySourcePtr CreateLiveLinkDummySource = nullptr;
};

// inline function for loading all function pointers
inline void Load(void* Handle, FXritIntegration_LiveLinkDummy& Out)
{
    Out.CreateLiveLinkDummySource = reinterpret_cast<CreateLiveLinkDummySourcePtr>(FPlatformProcess::GetDllExport(Handle, TEXT("CreateLiveLinkDummySourceImpl")));
    check(Out.CreateLiveLinkDummySource);
}