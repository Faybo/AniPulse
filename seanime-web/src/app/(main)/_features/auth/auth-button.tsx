"use client"
import React from "react"
import { useLogout } from "@/api/hooks/auth.hooks"
import { isLoginModalOpenAtom } from "@/app/(main)/_atoms/server-status.atoms"
import { useCurrentUser, useSetServerStatus, useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Avatar } from "@/components/ui/avatar"
import { ANILIST_OAUTH_URL } from "@/lib/server/config"
import { openTab } from "@/lib/helpers/browser"
import { useAtom } from "jotai"
import { BiLogIn, BiLogOut } from "react-icons/bi"
import { FiLogIn } from "react-icons/fi"
import { SiAnilist } from "react-icons/si"

interface AuthButtonProps {
    fixed?: boolean
}

export function AuthButton({ fixed = true }: AuthButtonProps) {
    const user = useCurrentUser()
    const serverStatus = useServerStatus()
    const setServerStatus = useSetServerStatus()
    const { mutate: logout, data, isPending } = useLogout()
    const [loginModal, setLoginModal] = useAtom(isLoginModalOpenAtom)

    React.useEffect(() => {
        if (!isPending) {
            setServerStatus(data)
        }
    }, [isPending, data])

    const confirmSignOut = useConfirmationDialog({
        title: "Sign out",
        description: "Are you sure you want to sign out?",
        onConfirm: () => {
            logout()
        },
    })

    // Don't render anything when fixed=true (removes top-right button)
    if (fixed) {
        return null
    }

    if (!user) {
        return (
            <Button
                onClick={() => openTab(ANILIST_OAUTH_URL)}
                leftIcon={<SiAnilist />}
                intent="primary"
                size="md"
            >
                Login with AniList
            </Button>
        )
    }

    return (
        <>
            <DropdownMenu
                trigger={
                    <Button
                        leftIcon={<Avatar size="sm" src={user?.viewer?.avatar?.medium || undefined} />}
                        rightIcon={<BiLogOut />}
                        intent="gray-subtle"
                        size="md"
                    >
                        {user?.viewer?.name || "User"}
                    </Button>
                }
            >
                <DropdownMenuItem onClick={confirmSignOut.open}>
                    <BiLogOut /> Sign out
                </DropdownMenuItem>
            </DropdownMenu>
            <ConfirmationDialog {...confirmSignOut} />
        </>
    )
}
