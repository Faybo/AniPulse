"use client"
import { Button } from "@/components/ui/button"
import { useServerQuery, useServerMutation } from "@/api/client/requests"
import React, { useState } from "react"
import { toast } from "sonner"

interface ContactMessage {
    id: number
    email: string
    subject: string
    message: string
    ip: string
    read: boolean
    createdAt: string
}

export function ContactMessages() {
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

    const { data: messages, refetch } = useServerQuery<{messages: ContactMessage[]}>({
        endpoint: "/api/v1/contact/messages",
        method: "GET",
        queryKey: ["contact-messages"],
        enabled: true
    })

    const markAsRead = useServerMutation({
        endpoint: `/api/v1/contact/messages/${selectedMessage?.id}/read`,
        method: "PATCH"
    })

    const deleteMessage = useServerMutation({
        endpoint: `/api/v1/contact/messages/${selectedMessage?.id}`,
        method: "DELETE"
    })

    const handleMarkAsRead = async () => {
        if (!selectedMessage) return

        try {
            await markAsRead.mutateAsync()
            toast.success("Message marked as read")
            refetch()
        } catch (error) {
            toast.error("Failed to mark message as read")
        }
    }

    const handleDelete = async () => {
        if (!selectedMessage) return

        if (!confirm("Are you sure you want to delete this message?")) return

        try {
            await deleteMessage.mutateAsync()
            toast.success("Message deleted")
            setSelectedMessage(null)
            refetch()
        } catch (error) {
            toast.error("Failed to delete message")
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    const unreadCount = messages?.messages?.filter((msg: ContactMessage) => !msg.read).length || 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                    Contact Messages
                    {unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                            {unreadCount} unread
                        </span>
                    )}
                </h2>
                <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Messages List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">All Messages</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {messages?.messages?.map((message: ContactMessage) => (
                            <div
                                key={message.id}
                                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                                    message.read
                                        ? "bg-gray-800/50 border-gray-600"
                                        : "bg-blue-900/30 border-blue-500"
                                } ${
                                    selectedMessage?.id === message.id
                                        ? "ring-2 ring-blue-500"
                                        : ""
                                }`}
                                onClick={() => setSelectedMessage(message)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white truncate">
                                            {message.subject}
                                        </h4>
                                        <p className="text-sm text-gray-400 truncate">
                                            {message.email}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(message.createdAt)}
                                        </p>
                                    </div>
                                    {!message.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Message Details</h3>
                    {selectedMessage ? (
                        <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                            <div className="space-y-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-300">Subject</label>
                                    <p className="text-white">{selectedMessage.subject}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300">Email</label>
                                    <p className="text-white">{selectedMessage.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300">IP Address</label>
                                    <p className="text-white font-mono text-sm">{selectedMessage.ip}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300">Date</label>
                                    <p className="text-white">{formatDate(selectedMessage.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300">Status</label>
                                    <p className={`${selectedMessage.read ? "text-green-400" : "text-blue-400"}`}>
                                        {selectedMessage.read ? "Read" : "Unread"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300">Message</label>
                                <div className="mt-1 p-3 bg-gray-900/50 rounded border text-white whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {!selectedMessage.read && (
                                    <Button
                                        onClick={handleMarkAsRead}
                                        className="bg-green-600 hover:bg-green-700"
                                        size="sm"
                                    >
                                        Mark as Read
                                    </Button>
                                )}
                                <Button
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                    size="sm"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                            <p className="text-gray-400">Select a message to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
