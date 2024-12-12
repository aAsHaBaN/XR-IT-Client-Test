// Fill out your copyright notice in the Description page of Project Settings.


#include "XRIT_BP_Origin_Base.h"

// Sets default values
AXRIT_BP_Origin_Base::AXRIT_BP_Origin_Base()
{
 	// Set this actor to call Tick() every frame.  You can turn this off to improve performance if you don't need it.
	PrimaryActorTick.bCanEverTick = true;

}

// Called when the game starts or when spawned
void AXRIT_BP_Origin_Base::BeginPlay()
{
	Super::BeginPlay();
	
}

// Called every frame
void AXRIT_BP_Origin_Base::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

}

