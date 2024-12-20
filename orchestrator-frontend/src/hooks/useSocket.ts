import { disconnect, getSocket } from "@/services/socket";
import { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [transport, setTransport] = useState("N/A");
  const [_, setCounter] = useState(1);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    setSocket(getSocket());
  }, []);

  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    } else {
      onDisconnect();
    }

    setListeners();
    return () => {
      unsetListeners();
    };
  }, [socket]);

  const onConnect = useCallback(() => {
    if (!socket) return;
    setIsConnected(true);
    setTransport(socket.io.engine.transport.name);

    socket.io.engine.on("upgrade", function onUpgrade(transport) {
      setTransport(transport.name);
    });
  }, [socket]);

  const onConnectError = useCallback(() => {
    setIsConnected(false);
    setCounter(function updateCounterAndSetError(counter) {
      if (counter === 100) {
        // reconnectionAttempts option
        setError("Can't connect to the server.");
      }
      return counter + 1;
    });
  }, [socket]);

  const onDisconnect = useCallback(() => {
    setIsConnected(false);
    setTransport("N/A");
  }, [socket]);

  const setListeners = useCallback(() => {
    socket?.on("connect", onConnect);
    socket?.on("connect_error", onConnectError);
    socket?.on("disconnect", onDisconnect);
  }, [onConnect, onConnectError, onDisconnect]);

  const unsetListeners = useCallback(() => {
    socket?.off("connect", onConnect);
    socket?.off("connect_error", onConnectError);
    socket?.off("disconnect", onDisconnect);
  }, [onConnect, onConnectError, onDisconnect]);

  const resetSocket = useCallback(() => {
    disconnect();
    setSocket(getSocket());
  }, [socket]);

  const emit = useCallback(
    (event: string, ...data: any) => {
      if (!socket?.connected) {
        return;
      }

      socket.emit(event, ...data);
    },
    [socket],
  );

  const listen = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (!socket?.connected) {
        return;
      }

      socket.on(event, callback);
    },
    [socket],
  );

  const off = useCallback(
    (event: string, callback?: (...args: any[]) => void) => {
      if (!socket?.connected) {
        return;
      }

      socket.off(event, callback);
    },
    [socket],
  );

  return { isConnected, transport, error, resetSocket, emit, listen, off };
}

export default useSocket;
