export type Folder = {
  id: string;
  name: string;
  items: number;
  size: string;
  color?: string;
};

export type RecentFile = {
  id: string;
  name: string;
  date: string;
  size: string;
  type: string;
  color?: string;
  preview?: string; // optional preview URL (remote or object URL)
  isLocal?: boolean; // true when created from local File() and uses object URL
};
