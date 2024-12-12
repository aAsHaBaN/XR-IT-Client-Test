#include "LiveLinkDummySource.h"

#include "ILiveLinkClient.h"
#include "Roles/LiveLinkTransformRole.h"
#include "Roles/LiveLinkTransformTypes.h"

#define LOCTEXT_NAMESPACE "Xrit"

namespace Xrit
{
	FLiveLinkDummySource::FLiveLinkDummySource(FLiveLinkDummySourceSettings const& Settings)
	{
		SourceStatus = LOCTEXT("SourceStatus_NoData", "No data");
		SourceType = LOCTEXT("SourceType_Dummy", "Dummy Source");
		SourceMachineName = LOCTEXT("DummySourceMachineName", "Dummy Machine");
		
		Start();
	}

	FLiveLinkDummySource::~FLiveLinkDummySource()
	{
		Stop();

		// destroy thread
		if (Thread != nullptr)
		{
			Thread->WaitForCompletion();
			delete Thread;
			Thread = nullptr;
		}
	}

	// begin ILiveLinkSource interface

	void FLiveLinkDummySource::ReceiveClient(ILiveLinkClient* InClient, FGuid InSourceGuid)
	{
		Client = InClient;
		SourceGuid = InSourceGuid;
	}

	void FLiveLinkDummySource::InitializeSettings(ULiveLinkSourceSettings* Settings)
	{
		SourceSettings = Settings;
	}

	void FLiveLinkDummySource::Update()
	{
	}

	bool FLiveLinkDummySource::IsSourceStillValid() const
	{
		// Source is valid if we have a valid thread
		const bool bIsSourceValid = !bStopping && (Thread != nullptr);
		return bIsSourceValid;
	}

	bool FLiveLinkDummySource::RequestSourceShutdown()
	{
		Stop();
		return true;
	}

	FText FLiveLinkDummySource::GetSourceType() const
	{
		return SourceType;
	}

	FText FLiveLinkDummySource::GetSourceMachineName() const
	{
		return SourceMachineName;
	}

	FText FLiveLinkDummySource::GetSourceStatus() const
	{
		return SourceStatus;
	}

	TSubclassOf<ULiveLinkSourceSettings> FLiveLinkDummySource::GetSettingsClass() const
	{
		return ULiveLinkSourceSettings::StaticClass();
	}

	// end ILiveLinkSource interface

	// begin FRunnable interface

	bool FLiveLinkDummySource::Init()
	{
		return true;
	}

	uint32 FLiveLinkDummySource::Run()
	{
		while (!bStopping)
		{
			for (int i = 0; i < 10; i++)
			{
				FLiveLinkFrameDataStruct FrameData(FLiveLinkTransformFrameData::StaticStruct());
				FLiveLinkTransformFrameData* TransformFrameData = FrameData.Cast<FLiveLinkTransformFrameData>();

				TransformFrameData->Transform = FTransform{
					UE::Math::TQuat<double>::Identity,
					UE::Math::TVector<double>{1.0, 2.0, 3.0},
					UE::Math::TVector<double>{1.0, 1.0, 1.0}
				};
				
				FName SubjectName = FName(FString::Printf(TEXT("%s_%d"), *FString("Dummy Subject"), i));
				
				TransformFrameData->MetaData.StringMetaData.Add(FName(TEXT("DeviceControlId")), SubjectName.ToString());
			
				if (!bStopping && (Client != nullptr))
				{
					if (!SubjectsWeHaveSetStaticDataFor.Contains(SubjectName))
					{
						FLiveLinkStaticDataStruct StaticData(FLiveLinkTransformStaticData::StaticStruct());
						FLiveLinkTransformStaticData& TransformData = *StaticData.Cast<FLiveLinkTransformStaticData>();
						TransformData.bIsLocationSupported = true;
						TransformData.bIsRotationSupported = true;
						TransformData.bIsScaleSupported = true;
						Client->PushSubjectStaticData_AnyThread({SourceGuid, SubjectName}, ULiveLinkTransformRole::StaticClass(), MoveTemp(StaticData));
						SubjectsWeHaveSetStaticDataFor.Add(SubjectName);
					}
				
					Client->PushSubjectFrameData_AnyThread({SourceGuid, SubjectName}, MoveTemp(FrameData));
				}
			}
			
			FPlatformProcess::Sleep(0.01f);
		}
		
		return 0;
	}

	void FLiveLinkDummySource::Start()
	{
		SourceStatus = LOCTEXT("SourceStatus_Receiving", "Receiving");
		ThreadName = "DummySource Receiver";
		Thread = FRunnableThread::Create(this, *ThreadName, 128 * 1024, TPri_AboveNormal,
		                                 FPlatformAffinity::GetPoolThreadMask());
	}

	void FLiveLinkDummySource::Stop()
	{
		bStopping = true;
	}

	void FLiveLinkDummySource::Exit()
	{
	}

	// end FRunnable interface

}

#undef LOCTEXT_NAMESPACE
