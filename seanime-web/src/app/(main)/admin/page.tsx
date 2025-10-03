"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { cn } from "@/components/ui/core/styling"
import { IoClose, IoCreate, IoTrash, IoEye, IoEyeOff } from "react-icons/io5"
import { ContactMessages } from "@/components/admin/contact-messages"
import Image from "next/image"
import { getServerBaseUrl } from "@/api/client/server-url"
import { isAdmin, setAdminCode } from "@/lib/admin/admin-auth"

interface AdminMessage {
    id: string
    title: string
    content: string
    type: "info" | "warning" | "success" | "error"
    createdAt: string
    isActive: boolean
}

type AdminStats = {
    totalVisitors: number
    uniqueVisitors: number
    pageViews: number
    avgSession: number
}

type TopVisitor = { ip: string, count: number, country?: string, country_code?: string }
type TopCountry = { country: string, country_code: string, count: number }
type VisitorLog = {
    ip_address: string
    user_agent: string
    page_visited: string
    visit_time: string
    session_duration: number
    country?: string
    city?: string
    referrer?: string
}

export default function AdminPage() {
    // Verificar se usuário é admin
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [messages, setMessages] = useState<AdminMessage[]>([])
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingMessage, setEditingMessage] = useState<AdminMessage | null>(null)
    const [newMessage, setNewMessage] = useState<{
        title: string
        content: string
        type: AdminMessage["type"]
        isActive: boolean
    }>({
        title: "",
        content: "",
        type: "info",
        isActive: true,
    })
    const [error, setError] = useState("")
    // Analytics
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [topVisitors, setTopVisitors] = useState<TopVisitor[]>([])
    const [topCountries, setTopCountries] = useState<TopCountry[]>([])
    const [ipLogsOpen, setIpLogsOpen] = useState(false)
    const [ipLogsTitle, setIpLogsTitle] = useState("")
    const [ipLogsData, setIpLogsData] = useState<{ ip: string, total: number, country?: string, country_code?: string, city?: string, active?: boolean, visitors: VisitorLog[] } | null>(null)
    const [activeTab, setActiveTab] = useState<"messages" | "contact">("messages")
    const router = useRouter()

    // Verificar autenticação admin
    useEffect(() => {
        setIsAuthenticated(isAdmin())
    }, [])

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

    // Save messages to localStorage
    const saveMessages = (newMessages: AdminMessage[]) => {
        setMessages(newMessages)
        localStorage.setItem("admin-messages", JSON.stringify(newMessages))
    }

    const handleLogin = () => {
        if (password.trim()) {
            const success = setAdminCode(password)
            if (success) {
                setIsAuthenticated(true)
                setPassword("")
                setError("")
                // Recarregar página para aplicar mudanças
                window.location.reload()
            } else {
                setError("Código inválido!")
            }
        }
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
        setPassword("")
        setError("")
    }

    const handleAddMessage = () => {
        if (newMessage.title && newMessage.content) {
            const messageToAdd: AdminMessage = {
                id: crypto.randomUUID(),
                title: newMessage.title,
                content: newMessage.content,
                type: newMessage.type,
                createdAt: new Date().toISOString(),
                isActive: newMessage.isActive,
            }
            saveMessages([...messages, messageToAdd])
            setNewMessage({ title: "", content: "", type: "info", isActive: true })
            setIsEditModalOpen(false)
        }
    }

    const handleEditMessage = () => {
        if (editingMessage && editingMessage.title && editingMessage.content) {
            const updatedMessages = messages.map((msg) =>
                msg.id === editingMessage.id ? editingMessage : msg
            )
            saveMessages(updatedMessages)
            setEditingMessage(null)
            setIsEditModalOpen(false)
        }
    }

    const deleteMessage = (id: string) => {
        const updatedMessages = messages.filter((msg) => msg.id !== id)
        saveMessages(updatedMessages)
    }

    const toggleMessageActive = (id: string) => {
        const updatedMessages = messages.map((msg) =>
            msg.id === id ? { ...msg, isActive: !msg.isActive } : msg
        )
        saveMessages(updatedMessages)
    }

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

    // --- Admin analytics loaders ---
    async function j<T = any>(path: string): Promise<T> {
        const base = getServerBaseUrl()
        const url = path.startsWith("/") ? base + path : base + "/" + path
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return (await res.json()) as T
    }

    useEffect(() => {
        // carregar estatísticas e tops + polling leve para "tempo real"
        const load = () => {
            j<AdminStats>("/api/admin/stats").then(setStats).catch(() => {})
            j<TopVisitor[]>("/api/admin/top-visitors").then(setTopVisitors).catch(() => {})
            j<TopCountry[]>("/api/admin/top-countries").then(setTopCountries).catch(() => {})
        }
        load()
        const id = setInterval(load, 5000)
        return () => clearInterval(id)
    }, [])

    async function openIp(ip: string) {
        try {
            const data = await j<any>(`/api/admin/visitors/by-ip?ip=${encodeURIComponent(ip)}`)
            setIpLogsData(data)
            setIpLogsTitle(`${data.ip} ${data.country ? `• ${data.country}` : ""} ${data.city ? `• ${data.city}` : ""}`)
            setIpLogsOpen(true)
        } catch (e) { /* noop */ }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                🔐 Admin Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Acesso restrito - código necessário
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Código de Acesso
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="Digite o código de acesso"
                                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <IoEyeOff /> : <IoEye />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleLogin}
                                disabled={!password.trim()}
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                            >
                                Entrar
                            </Button>

                            <div className="text-center">
                                <Button
                                    onClick={() => router.push("/")}
                                    intent="gray-subtle"
                                    className="text-sm"
                                >
                                    ← Voltar ao Site
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                🎛️ Admin Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Gerir mensagens e configurações do site
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => router.push("/")}
                                intent="gray-subtle"
                            >
                                Ver Site
                            </Button>
                            <Button
                                onClick={handleLogout}
                                intent="gray-subtle"
                            >
                                Sair
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Site Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-blue-600">
                            {stats?.uniqueVisitors ?? 0}
                        </div>
                        <div className="text-sm text-gray-600">Visitas únicas</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-pink-600">
                            {stats?.pageViews ?? 0}
                        </div>
                        <div className="text-sm text-gray-600">Visitas gerais (page views)</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-green-600">
                            {Math.round(stats?.avgSession ?? 0)}s
                        </div>
                        <div className="text-sm text-gray-600">Sessão média</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-purple-600">
                            {topVisitors?.[0]?.count ?? 0}
                        </div>
                        <div className="text-sm text-gray-600">Top visitas (maior IP)</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top Visitors */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-semibold mb-3">Top Visitors (IP)</h3>
                        <div className="overflow-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500">
                                        <th className="p-2">IP</th>
                                        <th className="p-2">Country</th>
                                        <th className="p-2">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topVisitors.map(v => (
                                        <tr key={v.ip} className="border-t hover:bg-gray-50">
                                            <td className="p-2">
                                                <button className="text-blue-600 underline" onClick={() => openIp(v.ip)}>
                                                    {v.ip}
                                                </button>
                                            </td>
                                            <td className="p-2 flex items-center gap-2">
                                                {!!v.country_code && (
                                                    <Image src={`https://flagcdn.com/24x18/${(v.country_code || "").toLowerCase()}.png`} alt={v.country || v.country_code || ""} width={24} height={18} />
                                                )}
                                                <span>{v.country || v.country_code || ""}</span>
                                            </td>
                                            <td className="p-2">{v.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Countries */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-semibold mb-3">Top Países</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {topCountries.map(c => (
                                <div key={c.country + c.country_code} className="flex items-center justify-between p-2 rounded border">
                                    <div className="flex items-center gap-2">
                                        {!!c.country_code && (
                                            <Image src={`https://flagcdn.com/24x18/${(c.country_code || "").toLowerCase()}.png`} alt={c.country || c.country_code} width={24} height={18} />
                                        )}
                                        <span>{c.country || c.country_code}</span>
                                    </div>
                                    <div className="text-sm font-semibold">{c.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mensagens - métricas locais (mantido) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-pink-600">{messages.length}</div>
                        <div className="text-sm text-gray-600">Total de Mensagens</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-green-600">{messages.filter(m => m.isActive).length}</div>
                        <div className="text-sm text-gray-600">Mensagens Ativas</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-yellow-600">{messages.filter(m => !m.isActive).length}</div>
                        <div className="text-sm text-gray-600">Mensagens Inativas</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-blue-600">{messages.filter(m => m.type === "info").length}</div>
                        <div className="text-sm text-gray-600">Mensagens Info</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab("messages")}
                            className={cn(
                                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                                activeTab === "messages"
                                    ? "bg-white text-pink-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Site Messages
                        </button>
                        <button
                            onClick={() => setActiveTab("contact")}
                            className={cn(
                                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                                activeTab === "contact"
                                    ? "bg-white text-pink-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Contact Messages
                        </button>
                    </div>
                </div>

                {/* Add Message Button - Only show for messages tab */}
                {activeTab === "messages" && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <Button
                            onClick={() => {
                                setEditingMessage(null)
                                setNewMessage({ title: "", content: "", type: "info", isActive: true })
                                setIsEditModalOpen(true)
                            }}
                            className="bg-pink-600 hover:bg-pink-700 text-white"
                        >
                            + Adicionar Nova Mensagem
                        </Button>
                    </div>
                )}

                {/* Content based on active tab */}
                {activeTab === "messages" ? (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Mensagens do Site
                        </h2>
                    
                    {messages.length > 0 ? (
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "p-4 rounded-lg border-l-4 shadow-sm",
                                        getMessageStyles(message.type)
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-2">
                                                {message.title}
                                                {!message.isActive && (
                                                    <span className="ml-2 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
                                                        Inativo
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm leading-relaxed mb-2">
                                                {message.content}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {new Date(message.createdAt).toLocaleString('pt-PT')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                size="sm"
                                                intent="gray-subtle"
                                                onClick={() => toggleMessageActive(message.id)}
                                            >
                                                {message.isActive ? "Desativar" : "Ativar"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                intent="gray-subtle"
                                                onClick={() => {
                                                    setEditingMessage(message)
                                                    setIsEditModalOpen(true)
                                                }}
                                            >
                                                <IoCreate className="text-sm" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                intent="gray-subtle"
                                                onClick={() => deleteMessage(message.id)}
                                            >
                                                <IoTrash className="text-sm" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>Nenhuma mensagem criada ainda.</p>
                            <p className="text-sm">Clica em "+ Adicionar Nova Mensagem" para criar uma.</p>
                        </div>
                    )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <ContactMessages />
                    </div>
                )}

                {/* IP Logs Modal */}
                <Modal open={ipLogsOpen} onOpenChange={setIpLogsOpen} title={`Logs • ${ipLogsTitle}`}>
                    <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                            {ipLogsData?.active ? <span className="text-green-600">Ativo agora</span> : <span className="text-gray-500">Inativo</span>} • Total: {ipLogsData?.total ?? 0}
                        </div>
                        <div className="max-h-[60vh] overflow-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500">
                                        <th className="p-2">Quando</th>
                                        <th className="p-2">Página</th>
                                        <th className="p-2">Referrer</th>
                                        <th className="p-2">User-Agent</th>
                                        <th className="p-2">Local</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(ipLogsData?.visitors || []).map((x, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-2">{new Date(x.visit_time).toLocaleString("pt-PT")}</td>
                                            <td className="p-2">{x.page_visited}</td>
                                            <td className="p-2">{x.referrer || ""}</td>
                                            <td className="p-2">{(x.user_agent || "").slice(0, 100)}{(x.user_agent || "").length > 100 ? "..." : ""}</td>
                                            <td className="p-2">{[x.country || "", x.city || ""].filter(Boolean).join(" / ")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>

                {/* Edit/Add Message Modal */}
                <Modal
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    title={editingMessage ? "Editar Mensagem" : "Adicionar Nova Mensagem"}
                >
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Título
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={editingMessage ? editingMessage.title : newMessage.title}
                                onChange={(e) => {
                                    if (editingMessage) {
                                        setEditingMessage({ ...editingMessage, title: e.target.value })
                                    } else {
                                        setNewMessage({ ...newMessage, title: e.target.value })
                                    }
                                }}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                Conteúdo
                            </label>
                            <textarea
                                id="content"
                                value={editingMessage ? editingMessage.content : newMessage.content}
                                onChange={(e) => {
                                    if (editingMessage) {
                                        setEditingMessage({ ...editingMessage, content: e.target.value })
                                    } else {
                                        setNewMessage({ ...newMessage, content: e.target.value })
                                    }
                                }}
                                rows={4}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                Tipo
                            </label>
                            <select
                                id="type"
                                value={editingMessage ? editingMessage.type : newMessage.type}
                                onChange={(e) => {
                                    if (editingMessage) {
                                        setEditingMessage({ ...editingMessage, type: e.target.value as AdminMessage["type"] })
                                    } else {
                                        setNewMessage({ ...newMessage, type: e.target.value as AdminMessage["type"] })
                                    }
                                }}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="info">Info</option>
                                <option value="warning">Aviso</option>
                                <option value="success">Sucesso</option>
                                <option value="error">Erro</option>
                            </select>
                        </div>
                        {editingMessage && (
                            <div>
                                <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={editingMessage.isActive}
                                        onChange={(e) => setEditingMessage({ ...editingMessage, isActive: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Ativo
                                </label>
                            </div>
                        )}
                        <Button 
                            onClick={editingMessage ? handleEditMessage : handleAddMessage} 
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                        >
                            {editingMessage ? "Guardar Alterações" : "Adicionar Mensagem"}
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    )
}
