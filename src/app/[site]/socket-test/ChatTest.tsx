// "use client";

// import { initSocket } from "@/lib/socket/socket";
// import { useEffect, useState } from "react";


// export default function ChatTest() {
//   const [messages, setMessages] = useState<string[]>([]);
//   const [input, setInput] = useState("");

//   useEffect(() => {
//     const socket = initSocket();

//     socket.on("connect", () => {
//       console.log("✅ Connected to socket:", socket.id);
//       socket.emit("joinRoom", "general");
//     });

//     socket.on("message", (data) => {
//       setMessages((prev) => [...prev, `${data.from}: ${data.msg}`]);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const sendMessage = () => {
//     const socket = initSocket();
//     socket.emit("sendMessage", { room: "general", msg: input });
//     setInput("");
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold">Socket.IO Test</h1>

//       <div className="my-4 space-y-2">
//         {messages.map((m, i) => (
//           <div key={i} className="rounded bg-gray-100 p-2">
//             {m}
//           </div>
//         ))}
//       </div>

//       <div className="flex gap-2">
//         <input
//           className="border p-2 flex-1"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type message..."
//         />
//         <button
//           onClick={sendMessage}
//           className="rounded bg-blue-600 px-4 py-2 text-white"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }
