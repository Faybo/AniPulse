"use client"
import { Button } from "@/components/ui/button"
import { TextInput } from "@/components/ui/text-input"
import { Textarea } from "@/components/ui/textarea"
import { useServerMutation } from "@/api/client/requests"
import React, { useState } from "react"
import { toast } from "sonner"

interface ContactFormData {
    email: string
    subject: string
    message: string
}

export function ContactForm() {
    const [formData, setFormData] = useState<ContactFormData>({
        email: "",
        subject: "",
        message: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submitContact = useServerMutation<{success: boolean, message: string}, ContactFormData>({
        endpoint: "/api/v1/contact",
        method: "POST"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await submitContact.mutateAsync({
                email: formData.email,
                subject: formData.subject,
                message: formData.message
            })

            toast.success("Mensagem enviada com sucesso!")
            setFormData({ email: "", subject: "", message: "" })
        } catch (error) {
            toast.error("Erro ao enviar mensagem. Tente novamente.")
            console.error("Contact form error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (field: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }))
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Contact Us
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                    </label>
                    <TextInput
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        placeholder="your.email@example.com"
                        required
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    />
                </div>

                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                        Subject
                    </label>
                    <TextInput
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange("subject")}
                        placeholder="What is this about?"
                        required
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    />
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                        Message
                    </label>
                    <Textarea
                        id="message"
                        value={formData.message}
                        onChange={handleChange("message")}
                        placeholder="Tell us what you need..."
                        rows={6}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none"
                    />
                </div>

                <div className="text-center">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                    Your message is encrypted and sent securely. We respect your privacy.
                </p>
            </div>
        </div>
    )
}
