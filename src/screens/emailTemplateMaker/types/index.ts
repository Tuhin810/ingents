export interface EmailComponent {
  id: string;
  type: string;
  content: string;
  style: Record<string, any>;
}

export interface DragItem {
  type: string;
}

export interface ComponentItemProps {
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export interface EmailComponentProps {
  component: EmailComponent;
  index: number;
  onUpdate: (id: string, updates: Partial<EmailComponent>) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  isSelected: boolean;
}

export interface EmailCanvasProps {
  components: EmailComponent[];
  onDrop: (component: EmailComponent) => void;
  onUpdateComponent: (id: string, updates: Partial<EmailComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onReorderComponents: (dragIndex: number, hoverIndex: number) => void;
  selectedComponent: string | null;
  onSelectComponent: (id: string) => void;
  viewMode: "desktop" | "mobile";
}

export type ViewMode = "desktop" | "mobile";
export type ActiveTab = "contents" | "settings";
