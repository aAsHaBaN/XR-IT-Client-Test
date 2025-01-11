#include "LiveLinkDummySourceFactory.h"

#include "LiveLinkDummySourceSettings.h"
#include "LiveLinkDummySourceFactoryWidget.h"
#include "LiveLinkDummySource.h"

#define LOCTEXT_NAMESPACE "Xrit"

FText ULiveLinkDummySourceFactory::GetSourceDisplayName() const
{
	return LOCTEXT("SourceDisplayName", "Dummy Source");
}

FText ULiveLinkDummySourceFactory::GetSourceTooltip() const
{
	return LOCTEXT("SourceTooltip", "Dummy source");
}

TSharedPtr<SWidget> ULiveLinkDummySourceFactory::BuildCreationPanel(
	FOnLiveLinkSourceCreated OnLiveLinkSourceCreated) const
{
	// 1. create widget
	auto Widget = SNew(Xrit::SLiveLinkDummySourceFactory)

		// 2. set delegate of widget to the function CreateSourceFromSettings
		.OnSettingsAccepted(Xrit::FOnLiveLinkDummySourceSettingsAccepted::CreateUObject(
			// CreateUObject creates a delegate instance, this contains Params which have to be added when calling the delegate via Execute() or ExecuteIfBound()
			this, // InUserObject (weak reference)
			&ULiveLinkDummySourceFactory::CreateSourceFromSettings, // InFunc (function that gets called)
			OnLiveLinkSourceCreated));
	// Vars (captured variables; delegate is a closure / lambda, similar to a C# delegate)

	// OnLiveLinkSourceCreated on its turn is a delegate that should be called inside the CreateSourceFromSettings function,
	// so that the LiveLink module can create the source 

	return Widget;
}

TSharedPtr<ILiveLinkSource> ULiveLinkDummySourceFactory::CreateSource(const FString& String) const
{
	FLiveLinkDummySourceSettings Settings;
	if (!String.IsEmpty())
	{
		// PPF = property exporting flags
		FLiveLinkDummySourceSettings::StaticStruct()->ImportText(*String, &Settings, nullptr, PPF_None, GLog,
		                                                         TEXT("ULiveLinkDummySourceFactory"));
	}
	return MakeShared<Xrit::FLiveLinkDummySource>(Settings);
}

void ULiveLinkDummySourceFactory::CreateSourceFromSettings(FLiveLinkDummySourceSettings Settings,
                                                           FOnLiveLinkSourceCreated OnSourceCreated) const
{
	FString String;
	FLiveLinkDummySourceSettings::StaticStruct()->ExportText(String, &Settings, nullptr, nullptr, PPF_None, nullptr);

	TSharedPtr<Xrit::FLiveLinkDummySource> Source = MakeShared<Xrit::FLiveLinkDummySource>(Settings);

	// OnSourceCreated takes two arguments: the created Source and the string that represents the settings
	OnSourceCreated.ExecuteIfBound(Source, MoveTemp(String));
}

#undef LOCTEXT_NAMESPACE