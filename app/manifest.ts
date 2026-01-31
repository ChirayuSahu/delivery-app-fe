import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Delivery - Rajesh Pharma",
        short_name: "Rajesh Pharma",
        theme_color: "#00a73c",
        background_color: "#00a73c",
        display: "fullscreen",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
            {
                src: "/favicon/favicon.ico",
                sizes: "192x192",
                type: "image/x-icon",
            },
        ]
    }
}