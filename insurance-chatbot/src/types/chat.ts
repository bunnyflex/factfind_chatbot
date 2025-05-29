export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isConnected: boolean;
}

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface MessageBubbleProps {
  message: Message;
}
