import { type ClassValue, clsx } from "clsx"
import { Metadata } from "next"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function absoluteUrl(path:string){
  if(typeof window !=='undefined') return path
  if(process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${3000}${path}`
}

export function constructMetadata({
  title = "Switch - the SaaS for students",
  description = "Switch is an open-source software to make chatting to your PDF files easy.",
  image = "",
  icons = "",
  noIndex = false
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@Pranjul"
    },
    icons,
    metadataBase: new URL('https://switch-2k23.vercel.app/'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}