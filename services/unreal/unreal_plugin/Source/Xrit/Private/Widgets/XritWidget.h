#pragma once

#include "XritWidgetContext.h"
#include "Widgets/SCompoundWidget.h"

// see https://docs.unrealengine.com/4.27/en-US/ProgrammingAndScripting/Slate/Architecture/
// for an explanation on how the Slate UI system works. Polling is the preferred method
// for keeping data and UI in sync. 

// responsible for specifying the UI of the Xrit panel
// does not contain any data
class SXritWidget final : public SCompoundWidget
{
public:
	SLATE_BEGIN_ARGS(SXritWidget) : _Context()
		{
		}

		SLATE_ARGUMENT(FXritWidgetContext, Context);
	SLATE_END_ARGS()

public:
	explicit SXritWidget();

	virtual ~SXritWidget() override;

	// required for slate widget
	void Construct(FArguments const& InArgs);

private:
	FXritWidgetContext Context;
};
