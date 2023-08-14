import { MutableRefObject, useCallback, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface NewMessageInputProps {
  to: string | undefined;
  socket: MutableRefObject<WebSocket | null>;
}

export const MessageInput: React.FC<NewMessageInputProps> = ({
  to,
  socket,
}) => {
  const [message, setMessage] = useState<string>("");

  const onSendPrivateMessage = useCallback(() => {
    socket.current?.send(
      JSON.stringify({
        action: "sendPrivate",
        message: message,
        to: to,
      })
    );
  }, [message, socket, to]);

  const onSendPublicMessage = useCallback(() => {
    socket.current?.send(
      JSON.stringify({
        action: "sendPublic",
        message: message,
      })
    );
  }, [message, socket]);

  return (
    <div className="absolute w-full bottom-10 center">
      <TextareaAutosize
        className="rounded rounded-1-md border-zinc text-slate-900 w-3/5"
        value={message}
        minRows={5}
        maxRows={5}
        onChange={(e): void => {
          setMessage(e.target.value);
        }}
      />
      <button
        className="rounded-xl border-2 border-blue-400 hover:border-blue-700 hover:text-blue-700 text-blue-400 px-2 cursor-pointer w-3/5"
        onClick={() => {
          if (!to) {
            onSendPublicMessage();
          } else {
            onSendPrivateMessage();
          }
          setMessage("");
        }}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
