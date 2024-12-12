#include <iostream>
#include "libwebsockets.h"
#include <csignal>
#include <cassert>
#include <queue>
#include <algorithm>

static size_t maxBytesPerFrame = 128;

struct Message
{
    std::string content;
    size_t bytesSent = 0;
};

enum class State
{
    Idle = 0,
    ShouldSend
};

struct Messaging
{
    std::queue<Message> messages;
    State state = State::Idle;
};

LWS_SS_USER_TYPEDEF
    /* Your per-stream instantiation members go here */
    Messaging* client;
} ClientSecureStreamInfo;

void sendMessage(ClientSecureStreamInfo* info, std::string&& string);

// static means it's private to this compilation unit
static lws_ss_state_return_t receiveCallback(
    void* userData,
    uint8_t const* in,
    size_t length,
    int flags)
{
    auto* info = (ClientSecureStreamInfo*)userData;
    lws_ss_handle* handle = info->ss;

    std::cout << "received " << length << ", flags: " << flags << std::endl;

    return LWSSSSRET_OK;
}

/*
 * Usage:
 *
 * set flags:
 * LWSSS_FLAG_SOM: start of message
 * LWSSS_FLAG_EOM: end of message
 *
 * return:
 * LWSSSSRET_OK or LWSSSSRET_TX_DONT_SEND
 */
static lws_ss_state_return_t transmitCallback(
    void* userData,
    lws_ss_tx_ordinal_t ordinal,
    uint8_t* buffer, // buffer we should write to
    size_t* length, // dictates how many bytes we can send
    int* flags) // set flags for whether we are finished
{
    auto* info = (ClientSecureStreamInfo*)userData;
    Messaging* client = info->client;

    if (client->state != State::ShouldSend)
    {
        return LWSSSSRET_TX_DONT_SEND;
    }

    Message* message = &client->messages.front();
    std::string* content = &message->content;
    assert(!content->empty()); // message should not be empty

    size_t size = content->size(); // size in bytes of string
    size_t offset = message->bytesSent;

    // start of message
    if (offset == 0)
    {
        *flags |= LWSSS_FLAG_SOM;
    }

    size_t realLength = std::min(size - offset, maxBytesPerFrame);
    *length = realLength;

    std::cout << "bytes sent: " << realLength << std::endl;

    memcpy(buffer, content->data() + offset, realLength);
    message->bytesSent += realLength;

    // if entire string has been sent
    if (message->bytesSent == size)
    {
        *flags |= LWSSS_FLAG_EOM;
        client->messages.pop();
    }

    if (!client->messages.empty())
    {
        int result = lws_ss_request_tx(info->ss);
        assert(result == 0);
    }

    return LWSSSSRET_OK;
}

static lws_ss_state_return_t stateCallback(
    void* userData,
    void* h_src, // new handle source when creating a "sink" (when creating streams of the same streamtype, they all get routed to one stream) we don't need that now
    lws_ss_constate_t state,
    lws_ss_tx_ordinal_t ack)
{
    auto* info = (ClientSecureStreamInfo*)userData;

    switch (state)
    {
        case LWSSSCS_CREATING:
        {
            info->client = (Messaging*)info->opaque_data;

            // upgrades the connection to websockets
            int result = lws_ss_request_tx(info->ss);
            assert(result == 0);
            return LWSSSSRET_OK;
        }
        case LWSSSCS_CONNECTED:
        {
            // when connected, we want to send something to the server
            sendMessage(info, "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mattis sollicitudin dui vel dignissim. Phasellus tempor blandit lacus quis luctus. Nunc elit justo, finibus sed auctor in, porttitor in dolor. Nulla vitae elementum nibh. Vivamus mattis sem ac tristique feugiat. Integer convallis nisl tortor, at scelerisque metus ultricies vitae. Morbi quis porta nisl. Aenean felis diam, imperdiet ac porttitor vel, elementum ac tortor. Morbi maximus aliquet leo, vitae commodo sapien malesuada eu. Duis metus dui, commodo quis condimentum et, suscipit eu sem. Ut auctor feugiat arcu non dictum. Maecenas placerat justo justo, non eleifend sapien iaculis vitae. Donec tempus magna et tortor lacinia, vitae vulputate purus lacinia. Duis malesuada iaculis malesuada. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer et metus luctus, porta mauris sit amet, eleifend nibh.\n"
                              "\n"
                              "Suspendisse convallis molestie lectus id semper. Vivamus feugiat enim felis, ac luctus tellus cursus at. Donec nec augue sem. Sed non nisl a nibh interdum luctus. Sed mollis leo risus, vel consequat arcu euismod eu. Morbi sollicitudin pharetra leo, ut posuere ipsum scelerisque ut. Nunc hendrerit neque nec lectus tempor, non tempor lacus finibus. Aliquam non arcu quis ligula convallis faucibus eu vel nibh. Pellentesque pharetra nisl eget diam laoreet facilisis.\n"
                              "\n"
                              "Etiam odio sem, ullamcorper rhoncus dolor ut, vulputate faucibus sapien. Aliquam erat volutpat. Morbi nisi est, luctus elementum enim id, vulputate commodo orci. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris scelerisque, libero et tristique luctus, ligula est semper est, ac porttitor odio sem ac massa. Nulla auctor in est et scelerisque. Maecenas eros mauris, sodales sit amet convallis quis, sagittis et ipsum. Etiam molestie lacus sit amet tellus facilisis tempor. Nam rhoncus metus nec sem finibus, at hendrerit tortor tristique. In pellentesque diam vel diam pharetra, eu auctor velit sagittis. Mauris nec felis sed lacus lobortis consectetur at vitae felis.\n"
                              "\n"
                              "Sed pretium, eros et volutpat ultrices, lacus lorem tempor orci, ut euismod orci libero nec nisi. Quisque a ornare nibh, eu sagittis sem. Aliquam faucibus risus sit amet velit eleifend, et consequat sem accumsan. Proin iaculis condimentum mi pulvinar auctor. Suspendisse eu purus ac erat condimentum dignissim quis vel enim. Maecenas sit amet venenatis orci, et sodales justo. Praesent scelerisque, lorem ac hendrerit fringilla, neque metus malesuada felis, eget fermentum risus nisi sit amet lacus. Integer posuere dolor massa, non egestas nulla sollicitudin nec. Morbi egestas, sem et viverra tincidunt, nisi lacus fringilla ipsum, et molestie dui mauris a orci. Nulla eu risus sit amet lorem egestas dictum eu in tortor. In et rhoncus metus, vel viverra nisi.\n"
                              "\n"
                              "Quisque venenatis neque vel ornare cursus. In vestibulum nunc nec neque pretium efficitur. Fusce placerat at purus sed facilisis. Sed porta felis at lectus volutpat, quis egestas dui pharetra. Phasellus eget diam in eros interdum consectetur. Quisque ac dolor quis mauris mattis hendrerit. Duis rutrum risus eu euismod egestas. Vestibulum lacinia ex risus, a viverra enim gravida id. Vestibulum nec imperdiet arcu. Nam eget felis velit. Aliquam vitae pellentesque mi, vitae pharetra sem.");
            sendMessage(info, "second message");
            sendMessage(info, "third message");

            return LWSSSSRET_OK;
        }
        case LWSSSCS_DISCONNECTED:
        {
            lws_default_loop_exit(lws_ss_get_context(info->ss));
            break;
        }
        default:break;
    }

    return LWSSSSRET_OK;

}

LWS_SS_INFO("xrit_client_streamtype", ClientSecureStreamInfo)
        .rx = receiveCallback,
        .tx = transmitCallback,
        .state = stateCallback,
    };

void sendMessage(ClientSecureStreamInfo* info, std::string&& string)
{
    assert(info);
    Messaging* client = info->client;
    assert(client);

    client->messages.push({.content = std::move(string), .bytesSent = 0});
    client->state = State::ShouldSend;
    int result = lws_ss_request_tx(info->ss);
    assert(result == 0);
}

static lws_context* context = nullptr;

static void
sigint_handler(int sig)
{
    lws_default_loop_exit(context);
}

int main(int argc, char const** argv)
{
    // create client
    Messaging client;

    lws_set_log_level(
        LLL_ERR |
        LLL_WARN |
        LLL_NOTICE |
        // LL_INFO |
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
        .streamtype = "xrit_client_streamtype",
        .endpoint = "127.0.0.1",
        .retry_bo = &retry,
        .flags = 0,//LWSSSPOLF_SERVER, // LWSSSPOLF_TLS for tls
        .port = 5432,
        .protocol = LWSSSP_WS
    };

    // create context
    lws_context_creation_info info{};
    lws_context_info_defaults(&info, nullptr /* default policy */);
    signal(SIGINT, sigint_handler);
    info.pss_policies = &p;
    context = lws_create_context(&info);
    assert(context && "failed to create libwebsockets context");

    // create secure stream
    lws_ss_handle* secureStreamHandle;
    int result = lws_ss_create(
        context,
        0, /*tsi*/
        &ssi_ClientSecureStreamInfo,
        &client, /*opaque_user_data*/
        &secureStreamHandle,
        nullptr, /*reserved*/
        nullptr /*ppayload_fmt*/);
    assert(result == 0 && "failed to create secure stream");

    lws_context_default_loop_run_destroy(context);

    return 0;
}