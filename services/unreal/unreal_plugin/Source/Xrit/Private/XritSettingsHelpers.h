#pragma once

#include <ISettingsCategory.h>
#include <ISettingsContainer.h>
#include <ISettingsModule.h>
#include <ISettingsSection.h>

[[nodiscard]] UObject* GetSettingsObject(FName ContainerName, FName CategoryName, FName SectionName)
{
	ISettingsModule& SettingsModule = FModuleManager::LoadModuleChecked<ISettingsModule>("Settings");
	TSharedPtr<ISettingsContainer> Container = SettingsModule.GetContainer(ContainerName);
	check(Container.IsValid());
	TSharedPtr<ISettingsCategory> Category = Container->GetCategory(CategoryName);
	check(Category.IsValid());
	TSharedPtr<ISettingsSection> Section = Category->GetSection(SectionName);
	check(Section.IsValid());
	TWeakObjectPtr<> Object = Section->GetSettingsObject();
	check(Object.IsValid());
	return Object.Get();
}

template <typename Type>
[[nodiscard]] Type* GetSettingsObjectTyped(FName const ContainerName, FName const CategoryName, FName const SectionName)
{
	UObject* Object = GetSettingsObject(ContainerName, CategoryName, SectionName);
	return static_cast<Type*>(Object);
	// dynamic_cast is a macro in Unreal, which calls a checked cast, which depends on GetPrivateStaticClass, which is unavailable between API boundaries
}