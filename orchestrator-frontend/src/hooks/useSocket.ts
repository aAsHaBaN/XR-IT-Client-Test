import { disconnect, getSocket } from "@/services/socket";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

let socket: Socket | null = getSocket();

function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [transport, setTransport] = useState("N/A");
  const [_, setCounter] = useState(1);

  useEffect(() => {
    socket = getSocket();

    if (socket?.connected) {
      onConnect();
    }

    function onConnect() {
      if (!socket) return;
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", function onUpgrade(transport) {
        setTransport(transport.name);
      });
    }

    function onConnectError() {
      setCounter(function updateCounterAndSetError(counter) {
        if (counter === 100) {
          // reconnectionAttempts option
          setError("Can't connect to the server.");
        }
        return counter + 1;
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket?.on("connect", onConnect);
    socket?.on("connect_error", onConnectError);
    socket?.on("disconnect", onDisconnect);

    return () => {
      if (!socket) return;
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  function resetSocket() {
    disconnect();
    socket = getSocket();
  }

  function emit(event: string, ...data: any) {
    if (!socket?.connected) {
      return;
    }

    socket.emit(event, ...data);
  }

  function listen(event: string, callback: (...args: any[]) => void) {
    if (!socket?.connected) {
      return;
    }

    socket.on(event, callback);
  }

  function off(event: string, callback?: (...args: any[]) => void) {
    if (!socket?.connected) {
      return;
    }

    socket.off(event, callback);
  }

  return { isConnected, transport, error, resetSocket, emit, listen, off };
}

export default useSocket;
