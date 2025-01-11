#include "libwebsockets.h"
#include <csignal>
#include <cassert>
#include <iostream>

LWS_SS_USER_TYPEDEF
    /* Your per-stream instantiation members go here */
} ServerSecureStreamInfo;

static lws_context* context = nullptr;

static void
sigint_handler(int sig)
{
    lws_default_loop_exit(context);
}

static lws_ss_state_return_t receiveCallback(
    void* userData,
    uint8_t const* in,
    size_t length,
    int flags)
{
    auto* info = (ServerSecureStreamInfo*)userData;

    if ((flags & LWSSS_FLAG_SOM) != 0)
    {
        std::cout << "start of message" << std::endl;
    }

    std::string_view view((char const*)in, length);

    std::cout << "  received " << length << " bytes: " << view << std::endl;

    if ((flags & LWSSS_FLAG_EOM) != 0)
    {
        std::cout << "end of message" << std::endl;
    }

    return LWSSSSRET_OK;
}

static lws_ss_state_return_t transmitCallback(
    void* userData,
    lws_ss_tx_ordinal_t ordinal,
    uint8_t* buffer,
    size_t* length,
    int* flags)
{
    auto* info = (ServerSecureStreamInfo*)userData;
    return LWSSSSRET_OK;
}

static lws_ss_state_return_t stateCallback(
    void* userData,
    void* h_src, // new handle source when creating a "sink" (when creating streams of the same streamtype, they all get routed to one stream) we don't need that now
    lws_ss_constate_t state,
    lws_ss_tx_ordinal_t ack)
{
    auto* info = (ServerSecureStreamInfo*)userData;

    switch (state)
    {
        case LWSSSCS_CREATING:
        {
            std::cout << "creating" << std::endl;
            break;
        }
        case LWSSSCS_SERVER_UPGRADE:
        {
            std::cout << "upgraded to websockets" << std::endl;
            break;
        }
        default:break;
    }

    return LWSSSSRET_OK;
}

LWS_SS_INFO("xrit_server_streamtype", ServerSecureStreamInfo)
        .rx = receiveCallback,
        .tx = transmitCallback,
        .state = stateCallback,
    };

int main(int argc, char const** argv)
{
    lws_set_log_level(
        LLL_ERR |
        LLL_WARN |
        LLL_NOTICE |
        // LLL_INFO |
        // LLL_DEBUG |
        // LLL_PARSER |
        LLL_HEADER |
        LLL_EXT |
        LLL_CLIENT |
        LLL_LATENCY |
        LLL_USER,
        nullptr);

    // create secure stream policy
    uint32_t retryTable[] = {1000, 2000, 3000, 4000, 5000};

    lws_retry_bo retry{
        .retry_ms_table = retryTable,
        .retry_ms_table_count = 5,
        .conceal_count = 5,
        .jitter_percent = 20
    };

    lws_ss_policy p{
        .streamtype = "xrit_server_streamtype",
        .endpoint = "127.0.0.1",
        .retry_bo = &retry,
        .flags = LWSSSPOLF_SERVER, // LWSSSPOLF_TLS for tls
        .port = 5432,
        .protocol = LWSSSP_WS
    };

    // create context
    lws_context_creation_info info{};
    lws_context_info_defaults(&info, nullptr);
    signal(SIGINT, sigint_handler);
    info.pss_policies = &p;
    context = lws_create_context(&info);
    assert(context && "failed to create libwebsockets context");

    // create secure stream
    lws_ss_handle* secureStreamHandle;
    int result = lws_ss_create(
        context,
        0,
        &ssi_ServerSecureStreamInfo,
        nullptr, /*opaque_user_data*/
        &secureStreamHandle, /*secure stream handle*/
        nullptr, /*reserved*/
        nullptr /*ppayload_fmt*/);
    assert(result == 0 && "failed to create secure stream");

    lws_context_default_loop_run_destroy(context);

    return 0;
}