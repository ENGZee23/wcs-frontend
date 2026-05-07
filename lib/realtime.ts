export type TransactionUpdatedEvent = {
  messageType: "RTREQ" | "RTRSP" | "RTCNF";
  msgId: number;
  updatedAt: string;
};

type TransactionUpdatedHandler = (
  event: TransactionUpdatedEvent
) => void;

type StatusHandler = () => void;

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://localhost:7299";

const recordSeparator = String.fromCharCode(0x1e);

export function createTransactionConnection() {
  let socket: WebSocket | null = null;
  let stopped = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const transactionHandlers = new Set<TransactionUpdatedHandler>();
  const reconnectingHandlers = new Set<StatusHandler>();
  const reconnectedHandlers = new Set<StatusHandler>();
  const closeHandlers = new Set<StatusHandler>();

  function getHubUrl() {
    const url = new URL("/hubs/transactions", apiBaseUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

    return url.toString();
  }

  function notify(handlers: Set<StatusHandler>) {
    for (const handler of handlers) {
      handler();
    }
  }

  function connect(isReconnect: boolean) {
    return new Promise<void>((resolve, reject) => {
      socket = new WebSocket(getHubUrl());

      socket.addEventListener("open", () => {
        socket?.send(
          JSON.stringify({
            protocol: "json",
            version: 1,
          }) + recordSeparator
        );

        if (isReconnect) {
          notify(reconnectedHandlers);
        }

        resolve();
      });

      socket.addEventListener("message", (event) => {
        if (typeof event.data !== "string") return;

        const messages = event.data
          .split(recordSeparator)
          .filter(Boolean);

        for (const message of messages) {
          const parsed = JSON.parse(message);

          if (
            parsed.type === 1 &&
            parsed.target === "TransactionUpdated" &&
            parsed.arguments?.[0]
          ) {
            for (const handler of transactionHandlers) {
              handler(parsed.arguments[0]);
            }
          }
        }
      });

      socket.addEventListener("error", () => {
        reject(new Error("SignalR WebSocket connection failed"));
      });

      socket.addEventListener("close", () => {
        if (stopped) {
          notify(closeHandlers);
          return;
        }

        notify(reconnectingHandlers);

        reconnectTimer = setTimeout(() => {
          void connect(true).catch(() => {
            notify(closeHandlers);
          });
        }, 3000);
      });
    });
  }

  return {
    on(eventName: "TransactionUpdated", handler: TransactionUpdatedHandler) {
      if (eventName === "TransactionUpdated") {
        transactionHandlers.add(handler);
      }
    },

    off(eventName: "TransactionUpdated") {
      if (eventName === "TransactionUpdated") {
        transactionHandlers.clear();
      }
    },

    onreconnecting(handler: StatusHandler) {
      reconnectingHandlers.add(handler);
    },

    onreconnected(handler: StatusHandler) {
      reconnectedHandlers.add(handler);
    },

    onclose(handler: StatusHandler) {
      closeHandlers.add(handler);
    },

    start() {
      stopped = false;

      return connect(false);
    },

    stop() {
      stopped = true;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      socket?.close();

      return Promise.resolve();
    },
  };
}
