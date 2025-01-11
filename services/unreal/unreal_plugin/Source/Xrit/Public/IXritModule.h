// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleInterface.h"
#include "Modules/ModuleManager.h"

#include "FXritContext.h"

struct IXritModule : IModuleInterface
{
public:
	static inline IXritModule& Get()
	{
		return FModuleManager::LoadModuleChecked<IXritModule>("Xrit");
	}

	static inline bool IsAvailable()
	{
		return FModuleManager::Get().IsModuleLoaded("Xrit");
	}

	virtual FXritContext& GetContext() = 0;
};
