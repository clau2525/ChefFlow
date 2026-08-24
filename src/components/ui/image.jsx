import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Image that fills its container. `fittingType="fill"` crops to cover, `"fit"`
 * letterboxes. Recipe photos are served straight from Supabase Storage, so
 * there is no resizing layer here — just a lazy <img> with the call signature
 * the pages already use.
 */
const Image = React.forwardRef(
  ({ src, alt = "", fittingType = "fill", aspectRatio, className, style, ...props }, ref) => (
    <span
      className={cn("inline-block relative overflow-hidden", className)}
      style={{ aspectRatio, ...style }}
    >
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          "w-full h-full inset-0 absolute",
          fittingType === "fit" ? "object-contain" : "object-cover"
        )}
        {...props}
      />
    </span>
  )
)
Image.displayName = "Image"

export { Image }
