"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Send, Loader2 } from "lucide-react"
import MarkDownRenderer from "./components/ui/markdownRenderer"
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ChatInterface({
  messages,
  loading,
  onSendMessage,
  isPostItinerary,
  onStartNewChat,
  onResetChat,
}) {
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [])

  const markdownRef = useRef();
  const exportToPDF = async () => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "800px";
    tempDiv.style.padding = "20px";
    tempDiv.style.fontFamily = "Arial, sans-serif";
    tempDiv.style.background = "#fff";

    document.body.appendChild(tempDiv);
    tempDiv.innerHTML = markdownRef.current.innerHTML;

    await new Promise((resolve) => setTimeout(resolve, 100)); // Ensure content is fully loaded

    html2canvas(tempDiv, { scale: 2 }).then((canvas) => {
      document.body.removeChild(tempDiv);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("itirenary.pdf");
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault()
    const message = inputRef.current.value
    if (message.trim()) {
      onSendMessage(message)
      inputRef.current.value = ""
    }
  }

  return (
    <Card className="max-w-2xl mx-auto h-[80vh] flex flex-col">
      <CardContent className="flex-grow overflow-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.sender === "bot" ? "text-left" : "text-right"}`}>
            <div
              className={`inline-block p-3 rounded-lg ${message.sender === "bot" ? "bg-blue-100 text-blue-900" : "bg-green-100 text-green-900"
                }`}
            >
              {message.sender === "bot" ? (
                <div ref={markdownRef}>
                  <MarkDownRenderer message={message.content} />
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin inline-block" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input ref={inputRef} type="text" placeholder="Type your message..." className="flex-grow" />
          <Button type="submit" disabled={loading}>
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </form>
        {isPostItinerary && (
          <div className="mt-4 flex space-x-2">
            <Button onClick={onStartNewChat} variant="outline" className="flex-grow">
              Start New Chat
            </Button>
            <Button onClick={onResetChat} variant="outline" className="flex-grow">
              Reset Chat
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="flex-grow">
              Download itinerary
            </Button>
          </div>
        )}

      </div>

    </Card>
  )
}

