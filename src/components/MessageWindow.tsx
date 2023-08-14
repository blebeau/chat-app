type MessageProps = {
  messages: { author: string; text: string; time: string }[];
  me: string;
};

const MessageWindow = ({ messages, me }: MessageProps) => {
  return (
    <div className="space-y-5">
      {messages.map((message, index) => (
        <div
          key={`${message.author}-${index}`}
          className={
            me === message.author
              ? "border-2 w-4/5 rounded-xl justify-end float-right"
              : "border-2 w-4/5 rounded-xl justify-end float-left"
          }
        >
          <p className="underline ml-5">{message.author}</p>
          <div className=" p-2 margin rounded-xl">
            <p>{message.text}</p>
          </div>
          <p className="text-end mr-5 text-gray-500/25">{message.time}</p>
        </div>
      ))}
    </div>
  );
};

export default MessageWindow;
