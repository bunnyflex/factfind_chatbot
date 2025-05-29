import { ChatContainer } from "@/components/chat";
import { ProgressIndicator } from "@/components/ProgressIndicator";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      {/* Chat Container with integrated progress */}
      <ChatContainer />
    </div>
  );
}
