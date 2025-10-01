"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/components/ui/core/styling"

interface AdConfig {
    enabled: boolean
    frequency: number
    positions: {
        top: boolean
        bottom: boolean
        sidebar: boolean
        inline: boolean
    }
    types: {
        banner: boolean
        native: boolean
        video: boolean
    }
    networks: {
        google: boolean
        facebook: boolean
        custom: boolean
    }
}

const ADMIN_PASSWORD = "FabioDragon3!"

export default function AdsPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState("")
    const [config, setConfig] = useState<AdConfig>({
        enabled: true,
        frequency: 3,
        positions: {
            top: true,
            bottom: true,
            sidebar: true,
            inline: true
        },
        types: {
            banner: true,
            native: true,
            video: false
        },
        networks: {
            google: false,
            facebook: false,
            custom: true
        }
    })

    useEffect(() => {
        // Carregar configuração salva
        const savedConfig = localStorage.getItem("ad-config")
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig) as AdConfig
                setConfig(parsedConfig)
            } catch (error) {
                console.error("Error loading ad config:", error)
            }
        }
    }, [])

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true)
        }
    }

    const updateConfig = (newConfig: Partial<AdConfig>) => {
        const updatedConfig = { ...config, ...newConfig }
        setConfig(updatedConfig)
        localStorage.setItem("ad-config", JSON.stringify(updatedConfig))
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="p-8 w-full max-w-md">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            🔐 Admin - Anúncios
                        </h1>
                        <p className="text-gray-600">
                            Acesso restrito ao administrador
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Senha de Administrador
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="Digite a senha de administrador"
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        <Button 
                            onClick={handleLogin}
                            className="w-full"
                        >
                            Entrar
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        📊 Gerenciamento de Anúncios
                    </h1>
                    <p className="text-gray-600">
                        Configure e gerencie os anúncios do site
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Configurações Gerais */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Configurações Gerais</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Anúncios Ativados</label>
                                <Switch
                                    value={config.enabled}
                                    onValueChange={(checked) => updateConfig({ enabled: checked })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-2">
                                    Frequência: A cada {config.frequency} visualizações
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={config.frequency}
                                    onChange={(e) => updateConfig({ frequency: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1</span>
                                    <span>10</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Posições dos Anúncios */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Posições dos Anúncios</h2>
                        <div className="space-y-3">
                            {Object.entries(config.positions).map(([position, enabled]) => (
                                <div key={position} className="flex items-center justify-between">
                                    <label className="text-sm font-medium capitalize">
                                        {position === "top" && "Topo da página"}
                                        {position === "bottom" && "Rodapé da página"}
                                        {position === "sidebar" && "Barra lateral"}
                                        {position === "inline" && "Entre conteúdo"}
                                    </label>
                                    <Switch
                                        value={enabled}
                                        onValueChange={(checked) => 
                                            updateConfig({ 
                                                positions: { 
                                                    ...config.positions, 
                                                    [position]: checked 
                                                } 
                                            })
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Tipos de Anúncios */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Tipos de Anúncios</h2>
                        <div className="space-y-3">
                            {Object.entries(config.types).map(([type, enabled]) => (
                                <div key={type} className="flex items-center justify-between">
                                    <label className="text-sm font-medium capitalize">
                                        {type === "banner" && "Banners"}
                                        {type === "native" && "Anúncios Nativos"}
                                        {type === "video" && "Anúncios de Vídeo"}
                                    </label>
                                    <Switch
                                        value={enabled}
                                        onValueChange={(checked) => 
                                            updateConfig({ 
                                                types: { 
                                                    ...config.types, 
                                                    [type]: checked 
                                                } 
                                            })
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Redes de Anúncios */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Redes de Anúncios</h2>
                        <div className="space-y-3">
                            {Object.entries(config.networks).map(([network, enabled]) => (
                                <div key={network} className="flex items-center justify-between">
                                    <label className="text-sm font-medium capitalize">
                                        {network === "google" && "Google AdSense"}
                                        {network === "facebook" && "Facebook Ads"}
                                        {network === "custom" && "Anúncios Personalizados"}
                                    </label>
                                    <Switch
                                        value={enabled}
                                        onValueChange={(checked) => 
                                            updateConfig({ 
                                                networks: { 
                                                    ...config.networks, 
                                                    [network]: checked 
                                                } 
                                            })
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Estatísticas */}
                <Card className="p-6 mt-6">
                    <h2 className="text-xl font-semibold mb-4">Estatísticas de Anúncios</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {localStorage.getItem("ad-view-count") || "0"}
                            </div>
                            <div className="text-sm text-blue-800">Visualizações</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {Math.floor(parseInt(localStorage.getItem("ad-view-count") || "0") / config.frequency)}
                            </div>
                            <div className="text-sm text-green-800">Anúncios Exibidos</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {config.enabled ? "Ativo" : "Inativo"}
                            </div>
                            <div className="text-sm text-purple-800">Status</div>
                        </div>
                    </div>
                </Card>

                {/* Ideias de Monetização */}
                <Card className="p-6 mt-6">
                    <h2 className="text-xl font-semibold mb-4">💡 Ideias de Monetização</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <h3 className="font-semibold text-yellow-800 mb-2">Google AdSense</h3>
                            <p className="text-sm text-yellow-700">
                                Integre Google AdSense para anúncios automáticos e monetização por cliques.
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h3 className="font-semibold text-green-800 mb-2">Anúncios Nativos</h3>
                            <p className="text-sm text-green-700">
                                Anúncios discretos que se misturam com o conteúdo para melhor experiência.
                            </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">Patrocínios</h3>
                            <p className="text-sm text-blue-700">
                                Venda espaços publicitários diretamente para empresas interessadas.
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <h3 className="font-semibold text-purple-800 mb-2">Programa Premium</h3>
                            <p className="text-sm text-purple-700">
                                Ofereça versão sem anúncios para usuários que pagam uma assinatura.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
