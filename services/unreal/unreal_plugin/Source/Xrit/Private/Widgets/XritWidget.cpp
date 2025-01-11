#include "XritWidget.h"

#include "LogCategory.h"
#include "Logging/StructuredLog.h"
#include "Shared/UdpMessagingSettings.h"

#define LOCTEXT_NAMESPACE "Xrit"

SXritWidget::SXritWidget()
{
}

SXritWidget::~SXritWidget() = default;

void SXritWidget::Construct(FArguments const& InArgs)
{
    Context = InArgs._Context;

    ChildSlot
    [
        SNew(SVerticalBox)
        + SVerticalBox::Slot().AutoHeight()
        [
            SNew(SButton)
            .OnClicked_Lambda([C = Context]() -> FReply
            {
                *C.bReconnect = true;
                UE_LOGFMT(XritModule, Display, "Initiated attempt to reconnect with Xrit Node");
                return FReply::Handled();
            })
            [
                SNew(STextBlock).Text(LOCTEXT("Xrit_ReconnectButton", "Reconnect to Xrit Node"))
            ]
        ]
        + SVerticalBox::Slot().AutoHeight()
        [
            SNew(SCheckBox)
            .IsChecked(ECheckBoxState::Checked)
            .OnCheckStateChanged_Lambda([C = Context](ECheckBoxState NewState)
            {
                *C.bShouldAutoSpawnActors = (NewState == ECheckBoxState::Checked);
                UE_LOGFMT(XritModule, Display, "Should Auto Manage Actors state changed to {0}", *UEnum::GetValueAsString(NewState));
            })
            [
                SNew(STextBlock).Text(LOCTEXT("Xrit_AutoManageActorsCheckbox", "Automatically Spawn LiveLink Actors"))
            ]
        ]
    ];
}
