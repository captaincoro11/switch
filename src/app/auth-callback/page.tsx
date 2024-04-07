import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";

const Page = () => {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PageContent router={router} />
        </Suspense>
    );
}

const PageContent = ({ router }) => {
    const searchParams = useSearchParams();
    const origin = searchParams.get('origin')

    const { data, error } = trpc.authCallback.useQuery(undefined, {
        retry: true,
        retryDelay: 500,
    });

    if (error) {
        if (error.data?.code === "UNAUTHORIZED") {
            router.push('/sign-in');
        }
        return null; // Return null or an error component if needed
    }

    if (data && data.success) {
        // User is synced to our database
        router.push(origin ? `/${origin}` : '/dashboard');
        return null; // Redirecting, no need to render anything else
    }

    return (
        <div className="w-full mt-24 flex justify-center ">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-800"/>
                <h3 className="font-semibold text-xl">Setting Up your account...</h3>
                <p>You will be redirected automatically.</p>
            </div>
        </div>
    );
}

export default Page;
