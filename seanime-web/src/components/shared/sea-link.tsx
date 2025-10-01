import { cn } from "@/components/ui/core/styling"
import { __isDesktop__ } from "@/types/constants"
import Link, { LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

type SeaLinkProps = {} & LinkProps & React.ComponentPropsWithRef<"a"> & {
    onLinkClick?: () => void
}

export const SeaLink = React.forwardRef((props: SeaLinkProps, _) => {

    const {
        href,
        children,
        className,
        onLinkClick,
        ...rest
    } = props

    const router = useRouter()

    const handleClick = () => {
        onLinkClick?.()
        router.push(href as string)
    }

    if (__isDesktop__ && rest.target !== "_blank") {
        return (
            <a
                className={cn(
                    "cursor-pointer",
                    className,
                )}
                onClick={handleClick}
                data-current={(rest as any)["data-current"]}
            >
                {children}
            </a>
        )
    }

    return (
        <div onClick={onLinkClick}>
            <Link href={href} className={cn("cursor-pointer", className)} {...rest}>
                {children}
            </Link>
        </div>
    )
})
