import {
  FiType,
  FiImage,
  FiVideo,
  FiSquare,
  FiMinus,
  FiMessageSquare,
} from "react-icons/fi";
import { BiTable, BiPen } from "react-icons/bi";

export const textMediaComponents = [
  { type: "title", icon: FiType, label: "Title" },
  { type: "text", icon: FiType, label: "Text" },
  { type: "photo", icon: FiImage, label: "Photos" },
  { type: "video", icon: FiVideo, label: "Videos" },
];

export const buttonQuoteComponents = [
  { type: "button", icon: FiSquare, label: "Button" },
  { type: "table", icon: BiTable, label: "Table" },
  { type: "quote", icon: FiMessageSquare, label: "Quote" },
];

export const dividerSignatureComponents = [
  { type: "divider", icon: FiMinus, label: "Divider" },
  { type: "signature", icon: BiPen, label: "Signature" },
];
