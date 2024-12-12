#include "LiveLinkDummySourceFactoryWidget.h"

#include "IStructureDetailsView.h"
#include "PropertyEditorModule.h"

#define LOCTEXT_NAMESPACE "Xrit"

namespace Xrit
{
	void SLiveLinkDummySourceFactory::Construct(FArguments const& Args)
	{
		OnSettingsAcceptedDelegate = Args._OnSettingsAccepted;

		FStructureDetailsViewArgs StructureViewArgs;
		FDetailsViewArgs DetailArgs;
		DetailArgs.bAllowSearch = false;
		DetailArgs.bShowScrollBar = false;

		FPropertyEditorModule& PropertyEditor = FModuleManager::Get().LoadModuleChecked<FPropertyEditorModule>(
			TEXT("PropertyEditor"));

		StructOnScope = MakeShared<FStructOnScope>(FLiveLinkDummySourceSettings::StaticStruct());
		CastChecked<UScriptStruct>(StructOnScope->GetStruct())->CopyScriptStruct(
			StructOnScope->GetStructMemory(), &DummySourceSettings);
		StructureDetailsView = PropertyEditor.CreateStructureDetailView(DetailArgs, StructureViewArgs, StructOnScope);

		ChildSlot
		[
			SNew(SVerticalBox)
			+ SVerticalBox::Slot()
			.FillHeight(1.f)
			[
				StructureDetailsView->GetWidget().ToSharedRef()
			]
			+ SVerticalBox::Slot()
			.HAlign(HAlign_Right)
			.AutoHeight()
			[
				SNew(SButton)
				.OnClicked(this, &SLiveLinkDummySourceFactory::OnSettingsAccepted)
				.Text(LOCTEXT("AddSource", "Add"))
			]
		];
	}

	FReply SLiveLinkDummySourceFactory::OnSettingsAccepted()
	{
		CastChecked<UScriptStruct>(StructOnScope->GetStruct())->CopyScriptStruct(
			&DummySourceSettings, StructOnScope->GetStructMemory());
		OnSettingsAcceptedDelegate.ExecuteIfBound(DummySourceSettings);
		return FReply::Handled();
	}
}

#undef LOCTEXT_NAMESPACE