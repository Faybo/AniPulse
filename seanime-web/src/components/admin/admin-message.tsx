"use client"
import { cn } from "@/components/ui/core/styling"
import { useState, useEffect } from "react"

interface AdminMessage {
    id: string
    title: string
    content: string
    type: "info" | "warning" | "success" | "error"
    createdAt: string
    isActive: boolean
}

interface AdminMessageProps {
    className?: string
}

export function AdminMessage({ className }: AdminMessageProps) {
    const [messages, setMessages] = useState<AdminMessage[]>([])

    // Load messages from localStorage
    useEffect(() => {
        const savedMessages = localStorage.getItem("admin-messages")
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages) as AdminMessage[]
                setMessages(parsed)
            } catch (error) {
                console.error("Error loading admin messages:", error)
            }
        }
    }, [])

    const getMessageStyles = (type: AdminMessage["type"]) => {
        switch (type) {
            case "info":
                return "bg-blue-100 border-blue-400 text-blue-800"
            case "warning":
                return "bg-yellow-100 border-yellow-400 text-yellow-800"
            case "success":
                return "bg-green-100 border-green-400 text-green-800"
            case "error":
                return "bg-red-100 border-red-400 text-red-800"
            default:
                return "bg-gray-50 border-gray-200 text-gray-800"
        }
    }

    const activeMessages = messages.filter(msg => msg.isActive)

    // Se não há mensagens ativas, não mostra nada
    if (activeMessages.length === 0) {
        return null
    }

    return (
        <div className={cn("space-y-4", className)}>
            {activeMessages.map((message) => (
                <div
                    key={message.id}
                    className={cn(
                        "p-4 rounded-lg border-l-4 shadow-sm",
                        getMessageStyles(message.type)
                    )}
                >
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                            {message.title}
                        </h3>
                        <p className="text-sm leading-relaxed">
                            {message.content}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}