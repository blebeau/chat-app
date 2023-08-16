import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import ChatMembers from "./components/ChatMembers";
import MessageInput from "./components/MessageInput";
import MessageWindow from "./components/MessageWindow";
import { getDateTime } from "./helpers/date";
import "./index.css";

function App() {
  const socket = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [members, setMembers] = useState<string[]>([]);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<
    { author: string; text: string; time: string }[]
  >([]);
  const [me, setMe] = useState<string>("");

  useEffect(() => {
    return () => {
      socket.current?.close();
    };
  }, []);

  useEffect(() => {
    setUserName(userName);
  }, [connected]);

  const onSocketOpen = useCallback(
    (name: string) => () => {
      setConnected(true);

      socket.current?.send(
        JSON.stringify({
          action: "setName",
          name: name,
        })
      );
    },
    [userName]
  );

  const onSocketClose = useCallback(() => {
    setConnected(false);
  }, []);

  const onSocketMessage = useCallback((dataStr) => {
    const data = JSON.parse(dataStr);
    if (data.members) {
      setMembers(data.members);
    } else if (data.publicMessage) {
      const string = data.publicMessage;

      const messageSender = string.substring(0, string.indexOf(":"));
      const messageText = string.substring(string.indexOf(":") + 2);

      setMessages((prev) => [
        ...prev,
        { author: messageSender, text: messageText, time: getDateTime() },
      ]);
    } else if (data.privateMessage) {
      const string = data.privateMessage;

      const messageSender = string.substring(0, string.indexOf(":"));
      const messageText = string.substring(string.indexOf(":") + 2);

      setMessages((prev) => [
        ...prev,
        { author: messageSender, text: messageText, time: getDateTime() },
      ]);
    } else if (data.systemMessage) {
      const string = data.systemMessage;

      const messageText = string.substring(string.indexOf(":") + 2);
      setMessages((prev) => [
        ...prev,
        { author: "System Message", text: messageText, time: getDateTime() },
      ]);
    }
  }, []);

  const onConnect = useCallback(
    (name: string) => () => {
      if (socket.current?.readyState !== WebSocket.OPEN) {
        setMe(name);
        setTo(undefined);
        setUserName("");
        socket.current = new WebSocket(import.meta.env.VITE_SOCKET_URL);
        socket.current.addEventListener("open", onSocketOpen(name));
        socket.current.addEventListener("close", onSocketClose);
        socket.current.addEventListener("message", (event) => {
          onSocketMessage(event.data);
        });
      }
    },
    []
  );

  const onDisconnect = useCallback(() => {
    socket.current?.close();
  }, []);

  const onChangeUserName = (event: ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handleCallback = (member: string | undefined) => {
    setTo(member);
  };

  return (
    <div>
      {connected ? (
        <div
          style={{ minHeight: "100vh" }}
          className="w-full flex flex-col sm:flex-row flex-wrap sm:flex-nowrap py-4 flex-grow"
        >
          <div className="w-2/5 flex-grow pt-1 px-3">
            <div className="w-fixed w-full h-full flex-shrink flex-grow-0 px-4 bg-green-100 rounded-xl">
              <div className="w-full flex-grow pt-1 px-3 h-3/6">
                <h1 className="text-3xl font-bold underline pb-8 text-center">
                  {me}
                </h1>
                <ChatMembers
                  members={members}
                  to={to}
                  me={me}
                  callback={handleCallback}
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-16">
                <button
                  className="ml-10 rounded border-2 border-red-500 hover:border-red-900 hover:text-red-900 text-red-500 px-2 py-1 cursor-pointer"
                  onClick={onDisconnect}
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
          <main role="main" className="w-full flex-grow pt-1 px-3 h-screen">
            <div className="p-2 w-fixed w-full h-full flex-shrink flex-grow-0 px-4 bg-sky-100 rounded-xl">
              <div className="w-full flex-grow pt-1 px-3 h-3/5 overflow-y-auto">
                <h2 className="text-center">{to ? to : "Public"}</h2>
                <MessageWindow messages={messages} me={me} />
              </div>
              <div className="place-content-center p-5  h-1/5">
                <div className="absolute w-full bottom-10 center">
                  <MessageInput to={to} socket={socket} />
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div className="flex justify-center items-center bg-gradient-to-br from-sky-400 via-violet-400 to-lime-400 h-[100vh] w-full">
          <section className="w-full md:max-w-[500px] p-4 flex flex-col text-center items-center justify-center md:px-10 lg:p-24 h-full lg:h-[500px] bg-white bg-opacity-20 backdrop-blur-ls rounded drop-shadow-lg rounded text-zinc-700">
            <h1 className="text-3xl font-bold underline pb-8">Simple Chat</h1>
            <div>
              <input
                className="rounded-l-md px-2 py-1 rounded-1-md border-2 border-white"
                placeholder="User Name"
                value={userName}
                onChange={onChangeUserName}
              />
              <button
                className="rounded-r-md border-2 border-zinc-100 hover:border-zinc-500 hover:text-zinc-500 text-zinc-100 px-2 py-1 cursor-pointer"
                onClick={onConnect(userName)}
              >
                Connect
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
