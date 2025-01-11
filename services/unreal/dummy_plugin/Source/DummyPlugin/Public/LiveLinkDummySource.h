#pragma once

#include "ILiveLinkSource.h"

#include "LiveLinkDummySourceSettings.h"

// this is a dummy / mock implementation for a LiveLink source
// to enable experimenting with how sources work and how to configure them
// from code

// it consists of the following parts:
// 1. Source settings
// 2. Source creation widget
// 3. Source factory
// 4. Source

namespace Xrit
{
	// dummy source
	// adapted from LiveLinkXRSource
	class DUMMYPLUGIN_API FLiveLinkDummySource final
		: public ILiveLinkSource,
		  public FRunnable,
		  public TSharedFromThis<FLiveLinkDummySource>
	{
	public:
		explicit FLiveLinkDummySource(FLiveLinkDummySourceSettings const& Settings);

		virtual ~FLiveLinkDummySource() override;

		// begin ILiveLinkSource interface

		virtual void ReceiveClient(ILiveLinkClient* InClient, FGuid InSourceGuid) override;
		virtual void InitializeSettings(ULiveLinkSourceSettings* Settings) override;
		virtual void Update() override;
		virtual bool IsSourceStillValid() const override;
		virtual bool RequestSourceShutdown() override;
		virtual FText GetSourceType() const override;
		virtual FText GetSourceMachineName() const override;
		virtual FText GetSourceStatus() const override;
		virtual TSubclassOf<ULiveLinkSourceSettings> GetSettingsClass() const override;

		// end ILiveLinkSource interface

		// begin FRunnable interface

		virtual bool Init() override;
		virtual uint32 Run() override;
		void Start();
		virtual void Stop() override;
		virtual void Exit() override;

		// end FRunnable interface
	
	private:
		ILiveLinkClient* Client = nullptr;

		FGuid SourceGuid; // live link identifier
		FText SourceType;
		FText SourceMachineName;
		FText SourceStatus;
		
		ULiveLinkSourceSettings* SourceSettings;
		
		FDelegateHandle OnSubjectAddedDelegate;
		
		std::atomic<bool> bStopping = false; // thread safe flag for terminating the main thread loop
		FRunnableThread* Thread = nullptr; // thread to update poses from
		FString ThreadName; // name of the update thread

		// The LiveLink API is stupid: setting static data has to be done in Run(),
		// but we don't want to set it each loop, so we need to track for which subjects
		// we have already set the static data
		TSet<FName> SubjectsWeHaveSetStaticDataFor; // See EncounteredSubjects in for example `LiveLinkFreeDSource.h`
	};
}
