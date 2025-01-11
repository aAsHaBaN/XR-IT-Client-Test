#pragma once

#include "LiveLinkSourceFactory.h"
#include "LiveLinkDummySourceSettings.h"

#include "LiveLinkDummySourceFactory.generated.h"

// source factory
UCLASS()
class ULiveLinkDummySourceFactory final : public ULiveLinkSourceFactory
{
public:
	GENERATED_BODY()

	virtual FText GetSourceDisplayName() const override;
	virtual FText GetSourceTooltip() const override;

	virtual EMenuType GetMenuType() const override { return EMenuType::SubPanel; }
	virtual TSharedPtr<SWidget> BuildCreationPanel(FOnLiveLinkSourceCreated OnLiveLinkSourceCreated) const override;

	// create source from settings string (called by the LiveLink module itself)
	virtual TSharedPtr<ILiveLinkSource> CreateSource(const FString& String) const override;

private:
	// create source ourselves from the widget
	void CreateSourceFromSettings(FLiveLinkDummySourceSettings Settings,
								  FOnLiveLinkSourceCreated OnSourceCreated) const;
};