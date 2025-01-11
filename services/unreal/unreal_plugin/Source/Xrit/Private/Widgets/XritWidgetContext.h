#pragma once

struct FXritWidgetContext
{
    std::atomic<bool>* bReconnect = nullptr;
    std::atomic<bool>* bShouldAutoSpawnActors = nullptr;
};
