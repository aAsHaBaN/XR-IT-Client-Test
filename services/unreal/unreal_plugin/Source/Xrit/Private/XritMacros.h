#pragma once

// this macro disables warning: C4706: assignment within conditional expression, which is used by simdjson
// Unreal treats warnings as errors, so we need to disable the warning in order to not make compilation fail


#if PLATFORM_WINDOWS
#define XRIT_DISABLE_WARNINGS __pragma(warning(disable:4706))
#define XRIT_ENABLE_WARNINGS __pragma(warning(default:4706))
#elif PLATFORM_MAC
#define XRIT_DISABLE_WARNINGS
#define XRIT_ENABLE_WARNINGS
#endif