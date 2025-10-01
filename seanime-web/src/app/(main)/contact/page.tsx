"use client"
import { ContactForm } from "@/components/shared/contact-form"
import { AppLayoutStack } from "@/components/ui/app-layout"
import React from "react"

export default function ContactPage() {
    return (
        <AppLayoutStack className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white">
                    Contact Us
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Have a question, suggestion, or need help? We'd love to hear from you. 
                    Send us a message and we'll get back to you as soon as possible.
                </p>
            </div>

            <ContactForm />

            <div className="max-w-2xl mx-auto text-center space-y-4">
                <h3 className="text-xl font-semibold text-white">
                    Other Ways to Reach Us
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Support</h4>
                        <p className="text-sm">For technical issues and general support</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Feedback</h4>
                        <p className="text-sm">Share your thoughts and suggestions</p>
                    </div>
                </div>
            </div>
        </AppLayoutStack>
    )
}
