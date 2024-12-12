#define NOMINMAX
#include "websocket.h"

#include <algorithm>
#include <cassert>
#include <iostream>
#include <libwebsockets.h>
#include <limits>
#include <queue>
#include <utility>

/*
This WebSocket implementation uses libwebsockets, which, because it is a c library,
has a lot of abbreviations and some peculiarities regarding usage. See the following notes for
some guidance:

## Acronyms
- lws = libwebsockets
- ss = secure streams
- ACK = acknowledgment in a communications protocol
- lwsl = libwebsockets log (logging)
- rx = reception / receive
- tx = transmission / transmit
- ssi = secure stream info
- wsi = web socket instance
- constate = connection state
- sul = sorted usec list
- usec = number of microseconds before the callback will be called
- LWSSSCS = Lib WebSockets Secure Stream Connection State
- cb = callback
- smd = system message distribution
- tsi = service thread index
- OTA = Over-the-air (for firmware updates)
- if = interface
- ifname = interface name
- ads = address

## Secure streams
Secure Streams is a way to separate payload data
from websocket specific metadata, this API should
be used, as otherwise using libwebsockets is very
low level and verbose.

https://libwebsockets.org/git/libwebsockets/tree/lib/secure-streams

The secure stream to is defined in the policy in the `s` array:

```json
"s": [
  {
      "custom_stream_name": {
          "port": 81,
          "protocol": "ws",
          "tls": false,
          "retry": "default"
      }
  }
]
```

and then referred to here:

```cpp
LWS_SS_INFO("custom_stream_name", ServerSecureStreamInfo)
      .rx = receiveCallback,
      .tx = transmitCallback,
      .state = stateCallback,
  };
```

By default, a vhost is created with name `_ss_default`

More information about secure streams: https://warmcat.com/2020/03/15//libwebsockets-secure-streams.html

Sink: https://en.wikipedia.org/wiki/Sink_(computing)
Opaque types: a type you can keep a pointer to, but not edit directly. e.g. `FILE`
*/

namespace xrit_unreal
{
struct OutMessage
{
    std::string content;
    size_t bytesSent;
};

// per-stream data
LWS_SS_USER_TYPEDEF
WebSocket *webSocket;
}

WebSocketSecureStreamInfo;

struct WebSocketImplementation
{
    lws_context *context = nullptr;

    // libwebsockets configuration (the config does not get copied by libwebsockets on initialization,
    // so we need to store it ourselves)
    uint32_t retryTable[3] = {1000, 1000, 3000};

    lws_retry_bo retry{.retry_ms_table = retryTable,
                       .retry_ms_table_count = 3,
                       .conceal_count = std::numeric_limits<uint16_t>::max(),
                       .jitter_percent = 20};

    lws_ss_policy policy{};

    // messaging
    std::queue<OutMessage> messages;
    bool canSendMessages = false;
    std::string incomingMessage;

    // cached secure stream information
    WebSocketSecureStreamInfo *cachedSecureStreamInfo = nullptr;
};

// static means it's private to this compilation unit
static lws_ss_state_return_t receiveCallback(void *userData, uint8_t const *in, size_t length, int flags)
{
    auto *info = (WebSocketSecureStreamInfo *)userData;
    WebSocket *webSocket = info->webSocket;
    assert(webSocket);
    WebSocketImplementation *impl = webSocket->implementation.get();
    IWebSocketListener *listener = webSocket->listener;

    std::cout << "received " << length << ", flags: " << flags << std::endl;

    // make sure the incoming message is empty
    if ((flags & LWSSS_FLAG_SOM) != 0)
    {
        assert(impl->incomingMessage.empty());
    }

    // add the latest received data to the string
    std::string_view incoming((char const *)in, length);
    impl->incomingMessage += incoming;

    if ((flags & LWSSS_FLAG_EOM) != 0)
    {
        if (listener)
        {
            listener->onMessage(webSocket, impl->incomingMessage);
        }
        impl->incomingMessage.clear();
    }

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
static lws_ss_state_return_t transmitCallback(void *userData, lws_ss_tx_ordinal_t ordinal,
                                              uint8_t *buffer, // buffer we should write to
                                              size_t *length,  // dictates how many bytes we can send
                                              int *flags)      // set flags for whether we are finished
{
    auto *info = (WebSocketSecureStreamInfo *)userData;
    WebSocket *webSocket = info->webSocket;
    assert(webSocket);
    WebSocketImplementation *impl = webSocket->implementation.get();

    if (!impl->canSendMessages || impl->messages.empty())
    {
        return LWSSSSRET_TX_DONT_SEND;
    }

    OutMessage *message = &impl->messages.front();
    std::string *content = &message->content;
    assert(!content->empty()); // message should not be empty

    size_t size = content->size(); // size in bytes of string
    size_t offset = message->bytesSent;

    // start of message
    if (offset == 0)
    {
        *flags |= LWSSS_FLAG_SOM;
    }

    size_t realLength = std::min<size_t>(size - offset, webSocket->config.maxBytesPerFrame);
    *length = realLength;

    std::cout << "bytes sent: " << realLength << std::endl;

    memcpy(buffer, content->data() + offset, realLength);
    message->bytesSent += realLength;

    // if entire string has been sent
    if (message->bytesSent == size)
    {
        *flags |= LWSSS_FLAG_EOM;
        std::cout << "sent message: " << message->content << std::endl;
        impl->messages.pop();
    }

    if (!impl->messages.empty())
    {
        int result = lws_ss_request_tx(info->ss);
        assert(result == 0);
    }

    return LWSSSSRET_OK;
}

static lws_ss_state_return_t stateCallback(void *userData, void *h_src,
                                           // new handle source when creating a "sink" (when creating streams of the
                                           // same streamtype, they all get routed to one stream) we don't need that now
                                           lws_ss_constate_t state, lws_ss_tx_ordinal_t ack)
{
    auto *info = (WebSocketSecureStreamInfo *)userData;
    WebSocket *webSocket = info->webSocket;
    IWebSocketListener *listener = webSocket ? webSocket->listener : nullptr;

    switch (state)
    {
    case LWSSSCS_CREATING: {
        info->webSocket = (WebSocket *)info->opaque_data;
        info->webSocket->implementation->canSendMessages = true;

        if (!info->webSocket->config.server)
        {
            // upgrades the connection to websockets
            int result = lws_ss_request_tx(info->ss);
            assert(result == 0);
        }
        return LWSSSSRET_OK;
    }
    case LWSSSCS_SERVER_UPGRADE: {
        std::cout << "upgraded to websockets" << std::endl;
        break;
    }
    case LWSSSCS_CONNECTED: {
        assert(webSocket);
        assert(webSocket->implementation);
        webSocket->implementation->cachedSecureStreamInfo = info;

        if (listener)
        {
            listener->onConnected(webSocket);
        }
        return LWSSSSRET_OK;
    }
    case LWSSSCS_DISCONNECTED: {
        assert(webSocket);
        assert(webSocket->implementation);
        webSocket->implementation->cachedSecureStreamInfo = nullptr;

        if (listener)
        {
            listener->onDisconnected(webSocket);
        }
        lws_default_loop_exit(lws_ss_get_context(info->ss));
        break;
    }
    default:
        break;
    }

    return LWSSSSRET_OK;
}

const lws_ss_info_t ssi_WebSocketSecureStreamInfo = {.streamtype = "xrit_websocket_streamtype",
                                                     .user_alloc = sizeof(WebSocketSecureStreamInfo),
                                                     .handle_offset = offsetof(WebSocketSecureStreamInfo, ss),
                                                     .opaque_user_data_offset =
                                                         offsetof(WebSocketSecureStreamInfo, opaque_data),

                                                     .rx = receiveCallback,
                                                     .tx = transmitCallback,
                                                     .state = stateCallback};

// original:
// I had to inline the macro because the designator order does not match the declaration order when using the macro,
// and using clang this is a warning, but using MSVC this is an error.
//
// LWS_SS_INFO("xrit_websocket_streamtype", WebSocketSecureStreamInfo)
//        .rx = receiveCallback,
//        .tx = transmitCallback,
//        .state = stateCallback,
//    };

WebSocket::WebSocket(WebSocketConfiguration config_)
    : config(std::move(config_)), implementation(std::make_unique<WebSocketImplementation>())
{
    start();
}

WebSocket::~WebSocket()
{
    stop();
};

WebSocketStatus WebSocket::poll() const
{
    return lws_service(implementation->context, 0) >= 0 ? WebSocketStatus::Success : WebSocketStatus::Error;
}

void WebSocket::run() const
{
    while (poll() == WebSocketStatus::Success)
    {
    }
}

void WebSocket::sendMessage(std::string const &message) const
{
    WebSocketSecureStreamInfo *info = implementation->cachedSecureStreamInfo;
    assert(info);

    implementation->messages.push({.content = message, .bytesSent = 0});
    int result = lws_ss_request_tx(info->ss);
    assert(result == 0);
}

void WebSocket::reconnect()
{
    assert(!config.server);
    stop();
    start();
}

void WebSocket::start()
{
    lws_set_log_level(LLL_ERR | LLL_WARN | LLL_NOTICE |
                          // LLL_INFO |
                          // LLL_DEBUG |
                          // LLL_PARSER |
                          LLL_HEADER | LLL_EXT | LLL_CLIENT | LLL_LATENCY | LLL_USER,
                      nullptr);

    // create secure stream policy
    implementation->policy = lws_ss_policy{
        .streamtype = "xrit_websocket_streamtype",
        .endpoint = config.url.c_str(),
        .retry_bo = &implementation->retry,
        .flags = (uint32_t)(config.server ? LWSSSPOLF_SERVER : 0), // LWSSSPOLF_TLS for tls
        .port = (uint16_t)config.port,
        .protocol = LWSSSP_WS,
    };

    // for doing validity checks (see "setting validity timer" and "scheduling validity check" in libwebsockets logs)
    if (config.server)
    {
        lws_retry_bo *r = &implementation->retry;
        r->secs_since_valid_ping = config.secondsBeforeValidityCheck;
        r->secs_since_valid_hangup = r->secs_since_valid_ping + 5;
        // how many seconds since last valid ping before we disconnect
    }

    // create context
    lws_context_creation_info info{};
    lws_context_info_defaults(&info, nullptr /* default policy */);
    info.pss_policies = &implementation->policy; // linked list
    info.retry_and_idle_policy = &implementation->retry;
    implementation->context = lws_create_context(&info);
    assert(implementation->context && "failed to create libwebsockets context");

    // create secure stream
    lws_ss_handle *secureStreamHandle;
    int result = lws_ss_create(implementation->context, 0,           /*tsi*/
                               &ssi_WebSocketSecureStreamInfo, this, /*opaque_user_data*/
                               &secureStreamHandle, nullptr,         /*reserved*/
                               nullptr /*ppayload_fmt*/);
    assert(result == 0 && "failed to create secure stream");
}

void WebSocket::stop() const
{
    lws_context_destroy(implementation->context);
}
}