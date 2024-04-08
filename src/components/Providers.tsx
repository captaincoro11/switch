"use client"

import { useState } from "react"
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { httpBatchLink } from "@trpc/client"
import { trpc } from "@/app/_trpc/client"

const Provider = ({children}:{children:React.ReactNode})=>{
    const [queryClient] = useState(()=>new QueryClient())
    const [trpcClient] = useState(()=>
    trpc.createClient({
        links:[
            httpBatchLink({
                url:'https://switch-2k23.vercel.app/api/trpc'
            })
        ]
    }))

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
            {children}
            </QueryClientProvider>
            
        </trpc.Provider>    )

}

export default Provider

