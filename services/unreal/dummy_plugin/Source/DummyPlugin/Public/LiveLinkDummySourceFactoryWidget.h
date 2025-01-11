#pragma once

#include "LiveLinkDummySourceSettings.h"

class IStructureDetailsView;

namespace Xrit
{
	using FOnLiveLinkDummySourceSettingsAccepted = TDelegate<void(FLiveLinkDummySourceSettings)>;

	// Source creation widget
	class SLiveLinkDummySourceFactory final : public SCompoundWidget
	{
		SLATE_BEGIN_ARGS(SLiveLinkDummySourceFactory)
		{
		}

		SLATE_EVENT(FOnLiveLinkDummySourceSettingsAccepted, OnSettingsAccepted)
	SLATE_END_ARGS()

	void Construct(FArguments const& Args);

	private:
		FLiveLinkDummySourceSettings DummySourceSettings;

		TSharedPtr<FStructOnScope> StructOnScope;
		// no idea why this is necessary, rather than owning our UStruct directly
		TSharedPtr<IStructureDetailsView> StructureDetailsView;

		FReply OnSettingsAccepted();
		FOnLiveLinkDummySourceSettingsAccepted OnSettingsAcceptedDelegate;
	};
}
