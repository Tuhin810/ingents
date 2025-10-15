export interface Chat {
  _id: string;           
  title: string;         
  lastMessage?: string;
  updatedAt?: string;
  active?: boolean;
}

export interface Message {
  _id: string;
  chatId: string;
  sender: "user" | "bot";
  content: string;
  createdAt: string;
  files?: FileInfo[];
}

export interface FileInfo {
  name: string;
  size: string;
}
