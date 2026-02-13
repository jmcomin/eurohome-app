'use client';

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface SearchInputProps {
    placeholder?: string;
}

export default function SearchInput({ placeholder = "Buscar..." }: SearchInputProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    function handleSearch(term: string) {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }

    return (
        <div className="relative flex-1">
            <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-slate-900 animate-pulse' : 'text-slate-400'}`}
                size={18}
            />
            <input
                type="text"
                placeholder={placeholder}
                defaultValue={searchParams.get('query')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition bg-white"
            />
        </div>
    );
}
