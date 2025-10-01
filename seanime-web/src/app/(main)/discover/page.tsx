"use client"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { DiscoverPageHeader } from "@/app/(main)/discover/_components/discover-page-header"
import { DiscoverAiringSchedule } from "@/app/(main)/discover/_containers/discover-airing-schedule"
import { DiscoverMissedSequelsSection } from "@/app/(main)/discover/_containers/discover-missed-sequels"
import { DiscoverPastSeason, DiscoverThisSeason } from "@/app/(main)/discover/_containers/discover-popular"
import { DiscoverTrending } from "@/app/(main)/discover/_containers/discover-trending"
import { DiscoverTrendingCountry } from "@/app/(main)/discover/_containers/discover-trending-country"
import { DiscoverTrendingMovies } from "@/app/(main)/discover/_containers/discover-trending-movies"
import { DiscoverUpcoming } from "@/app/(main)/discover/_containers/discover-upcoming"
import { __discord_pageTypeAtom } from "@/app/(main)/discover/_lib/discover.atoms"
import { RecentReleases } from "@/app/(main)/schedule/_containers/recent-releases"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { Button } from "@/components/ui/button"
import { StaticTabs } from "@/components/ui/tabs"
import { Modal } from "@/components/ui/modal"
import { defineSchema, Field, Form } from "@/components/ui/form"
import { AdminMessage } from "@/components/admin/admin-message"
import { Avatar } from "@/components/ui/avatar"
import { ConditionalAd, ConditionalNativeAd } from "@/components/ads/ad-manager"
import { useAtom } from "jotai/react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React from "react"
import { FaSearch } from "react-icons/fa"
import { ANILIST_PIN_URL } from "@/lib/server/config"
// Removed AniList login button

export const dynamic = "force-static"


export default function Page() {

    const serverStatus = useServerStatus()
    const router = useRouter()
    const [pageType, setPageType] = useAtom(__discord_pageTypeAtom)
    const searchParams = useSearchParams()
    const searchType = searchParams.get("type")

    React.useEffect(() => {
        if (searchType) {
            setPageType(searchType as any)
        }
    }, [searchParams])

    const [tokenModalOpen, setTokenModalOpen] = React.useState(false)

    return (
        <>
            <DiscoverPageHeader />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="p-4 sm:p-8 space-y-10 pb-10 relative z-[4]"
                data-discover-page-container
            >

                {/* AniList Login removido */}

                {/* Navegação secundária menor */}
                <div
                    className="lg:absolute w-full lg:-top-10 left-0 flex gap-4 p-4 items-center justify-center flex-wrap opacity-75"
                    data-discover-page-header-tabs-container
                >
                    <div data-discover-page-header-advanced-search-container>
                        <Button
                            leftIcon={<FaSearch />}
                            intent="gray-outline"
                            size="sm"
                            className="rounded-full text-sm"
                            onClick={() => router.push("/search")}
                        >
                            Advanced search
                        </Button>
                    </div>
                    
                    <div data-discover-page-header-schedule-container>
                        <Button
                            intent="gray-outline"
                            size="sm"
                            className="rounded-full text-sm"
                            onClick={() => setPageType(pageType === "schedule" ? "anime" : "schedule")}
                        >
                            {pageType === "schedule" ? "Back to Discover" : "Schedule"}
                        </Button>
                    </div>
                    
                    {/* Login via token AniList */}
                    <div data-discover-page-header-auth-container>
                        {serverStatus?.user && !serverStatus?.user?.isSimulated ? (
                            <Link href="/anilist" aria-label="Open AniList profile">
                                <Avatar size="sm" src={serverStatus?.user?.viewer?.avatar?.medium || undefined} />
                            </Link>
                        ) : (
                            <Button
                                intent="white"
                                size="sm"
                                className="rounded-full text-sm"
                                onClick={() => setTokenModalOpen(true)}
                            >
                                AniList token
                            </Button>
                        )}
                    </div>
                </div>

                {/* Modal para login com token */}
                <Modal
                    title="Log in with AniList"
                    description="Paste your AniList access token"
                    open={tokenModalOpen}
                    onOpenChange={(v) => setTokenModalOpen(v)}
                    overlayClass="bg-opacity-95 bg-gray-950"
                    contentClass="border"
                >
                    <div className="mt-4 text-center space-y-4">
                        <Link href={ANILIST_PIN_URL} target="_blank">
                            <Button intent="white" size="md">Get AniList token</Button>
                        </Link>

                        <Form
                            schema={defineSchema(({ z }) => z.object({
                                token: z.string().min(1, "Token is required"),
                            }))}
                            onSubmit={data => {
                                router.push("/auth/callback#access_token=" + data.token.trim())
                                setTokenModalOpen(false)
                            }}
                        >
                            <Field.Textarea
                                name="token"
                                label="Enter the token"
                                fieldClass="px-4"
                            />
                            <Field.Submit showLoadingOverlayOnSuccess>Continue</Field.Submit>
                        </Form>
                    </div>
                </Modal>
                
                {/* Admin Messages */}
                <div className="px-4 py-2">
                    <AdminMessage />
                </div>

                {/* Top Ad */}
                <ConditionalAd position="top" size="leaderboard" className="mx-4" />
                
                <AnimatePresence mode="wait" initial={false}>
                    {pageType === "anime" && <PageWrapper
                        key="anime"
                        className="relative 2xl:order-first pb-10 pt-4"
                        {...{
                            initial: { opacity: 0, y: 60 },
                            animate: { opacity: 1, y: 0 },
                            exit: { opacity: 0, scale: 0.99 },
                            transition: {
                                duration: 0.35,
                            },
                        }}
                        data-discover-page-anime-container
                    >
                        <div className="space-y-4 z-[5] relative" data-discover-page-anime-trending-container>
                            <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">🔥 Trending Right Now</h2>
                            <DiscoverTrending />
                        </div>
                        <RecentReleases />
                        <div className="space-y-4 z-[5] relative" data-discover-page-anime-highest-rated-container>
                            <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">⭐ Top of the Season</h2>
                            <DiscoverThisSeason />
                        </div>
                        <div className="space-y-4 z-[5] relative" data-discover-page-anime-highest-rated-container>
                            <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">🏆 Best of Last Season</h2>
                            <DiscoverPastSeason />
                        </div>
                        <DiscoverMissedSequelsSection />
                        <div className="space-y-4 z-[5] relative" data-discover-page-anime-upcoming-container>
                            <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">🚀 Coming Soon</h2>
                            <DiscoverUpcoming />
                        </div>
                        <div className="space-y-4 z-[5] relative" data-discover-page-anime-trending-movies-container>
                            <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">🎬 Trending Movies</h2>
                            <DiscoverTrendingMovies />
                        </div>
                        {/*<div className="space-y-2 z-[5] relative">*/}
                        {/*    <h2>Popular shows</h2>*/}
                        {/*    <DiscoverPopular />*/}
                        {/*</div>*/}
                    </PageWrapper>}
                    {pageType === "schedule" && <PageWrapper
                        key="schedule"
                        className="relative 2xl:order-first pb-10 pt-4"
                        data-discover-page-schedule-container
                        {...{
                            initial: { opacity: 0, y: 60 },
                            animate: { opacity: 1, y: 0 },
                            exit: { opacity: 0, scale: 0.99 },
                            transition: {
                                duration: 0.35,
                            },
                        }}
                    >
                        <DiscoverAiringSchedule />
                    </PageWrapper>}
                    {pageType === "manga" && <PageWrapper
                        key="manga"
                        className="relative 2xl:order-first pb-10 pt-4"
                        data-discover-page-manga-container
                        {...{
                            initial: { opacity: 0, y: 60 },
                            animate: { opacity: 1, y: 0 },
                            exit: { opacity: 0, scale: 0.99 },
                            transition: {
                                duration: 0.35,
                            },
                        }}
                    >
                        {/*<div className="space-y-2 z-[5] relative">*/}
                        {/*    <h2>Trending right now</h2>*/}
                        {/*    <DiscoverTrendingMangaAll />*/}
                        {/*</div>*/}
                        <div className="space-y-2 z-[5] relative" data-discover-page-manga-trending-container>
                            <h2>Trending Manga</h2>
                            <DiscoverTrendingCountry country="JP" />
                        </div>
                        <div className="space-y-2 z-[5] relative" data-discover-page-manga-trending-manhwa-container>
                            <h2>Trending Manhwa</h2>
                            <DiscoverTrendingCountry country="KR" />
                        </div>
                        <div className="space-y-2 z-[5] relative" data-discover-page-manga-trending-manhua-container>
                            <h2>Trending Manhua</h2>
                            <DiscoverTrendingCountry country="CN" />
                        </div>
                        {/*<div className="space-y-2 z-[5] relative">*/}
                        {/*    <DiscoverMangaSearchBar />*/}
                        {/*</div>*/}
                    </PageWrapper>}
                </AnimatePresence>

            </motion.div>
        </>
    )
}
