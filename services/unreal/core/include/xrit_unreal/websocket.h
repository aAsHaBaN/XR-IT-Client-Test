#ifndef XRIT_UNREAL_WEBSOCKET_H
#define XRIT_UNREAL_WEBSOCKET_H

#include <memory>
#include <queue>
#include <string>

namespace xrit_unreal
{
class WebSocket;

struct IWebSocketListener
{
    virtual void onDisconnected(WebSocket *caller) = 0;

    virtual void onConnected(WebSocket *caller) = 0;

    virtual void onMessage(WebSocket *caller, std::string message) = 0;
};

struct WebSocketConfiguration
{
    std::string url;
    int port;
    size_t maxBytesPerFrame;
    bool server;
    int secondsBeforeValidityCheck = 300;
};

struct WebSocketImplementation;

enum class WebSocketStatus
{
    Success = 0,
    Error
};

// simple wrapper for libwebsockets to send and receive text messages
class WebSocket
{
  public:
    explicit WebSocket(WebSocketConfiguration config);

    ~WebSocket();

    void sendMessage(std::string const &message) const;

    // call like this:
    // while (webSocket.poll() == WebSocketStatus::Success) {}
    [[nodiscard]] WebSocketStatus poll() const;

    // this is a blocking call, which simply calls poll() in a while loop
    void run() const;

    // try to reconnect as a client (only valid if instance of WebSocket is a client)
    void reconnect();

    // start websocket
    void start();

    // stop websocket
    void stop() const;

    IWebSocketListener *listener = nullptr;
    WebSocketConfiguration const config;
    std::unique_ptr<WebSocketImplementation> implementation; // pimpl idiom
};
} // namespace xrit_unreal

#endif // XRIT_UNREAL_WEBSOCKET_H