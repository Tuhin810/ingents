export const ComponentTypes = {
  TITLE: "title",
  TEXT: "text",
  PHOTO: "photo",
  VIDEO: "video",
  BUTTON: "button",
  TABLE: "table",
  QUOTE: "quote",
  DIVIDER: "divider",
  SIGNATURE: "signature",
  REORDER: "reorder",
} as const;

export const DEFAULT_COMPONENT_CONTENT = {
  TITLE: "Welcome to Artifflow!",
  TEXT: "Hey [NAME], Greeting! We are really happy to have you, and we are also delighted to collaborate with you our next projects",
  BUTTON: "Join Now",
  QUOTE: "This is a quote block",
  SIGNATURE: `
    <p><strong>Best regards,</strong></p>
    <p>John Doe<br/>
    Marketing Manager<br/>
    Artifflow<br/>
    john@artifflow.com<br/>
    +1 (555) 123-4567</p>
  `,
} as const;

export const DEFAULT_STYLES = {
  TITLE_COLOR: "#1f2937",
  TEXT_COLOR: "#6b7280",
  BUTTON_BG: "#3b82f6",
  BUTTON_COLOR: "#ffffff",
  DIVIDER_COLOR: "#e5e7eb",
  PHOTO_WIDTH: "100%",
  PHOTO_HEIGHT: "300px",
} as const;
