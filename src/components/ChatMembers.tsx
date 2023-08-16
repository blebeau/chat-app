type ChatMembersProps = {
  members: string[];
  to: string | undefined;
  me: string;
  callback: (member: string | undefined) => void;
};

const ChatMembers = ({ members, callback, to, me }: ChatMembersProps) => {
  return (
    <section className="space-y-5">
      {members &&
        members
          .filter((member) => member !== me)
          .map((member, index) => (
            <button
              className="border-2 rounded p-2 margin h-full rounded-xl w-full"
              key={`${member}-${index}`}
              onClick={() => {
                if (to === member) {
                  callback(undefined);
                } else {
                  callback(member);
                }
              }}
            >
              {member}
            </button>
          ))}
    </section>
  );
};

export default ChatMembers;
