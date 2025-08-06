import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import React from "react";

import type { Category, Script } from "@/lib/types";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { basePath } from "@/config/site-config";
import { fetchCategories } from "@/lib/data";
import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function formattedBadge(type: string) {
  switch (type) {
    case "vm":
      return <Badge className="text-blue-500/75 border-blue-500/75">VM</Badge>;
    case "ct":
      return <Badge className="text-yellow-500/75 border-yellow-500/75">LXC</Badge>;
    case "pve":
      return <Badge className="text-orange-500/75 border-orange-500/75">PVE</Badge>;
    case "addon":
      return <Badge className="text-green-500/75 border-green-500/75">ADDON</Badge>;
  }
  return null;
}

// random Script
function getRandomScript(categories: Category[]): Script | null {
  const allScripts = categories.flatMap(cat => cat.scripts || []);
  if (allScripts.length === 0)
    return null;
  const idx = Math.floor(Math.random() * allScripts.length);
  return allScripts[idx];
}

export default function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [links, setLinks] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const fetchSortedCategories = () => {
    setIsLoading(true);
    fetchCategories()
      .then((categories) => {
        setLinks(categories);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error(error);
      });
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        fetchSortedCategories();
        setOpen(open => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const openRandomScript = async () => {
    if (links.length === 0) {
      setIsLoading(true);
      try {
        const categories = await fetchCategories();
        setLinks(categories);
        const randomScript = getRandomScript(categories);
        if (randomScript) {
          router.push(`/scripts?id=${randomScript.slug}`);
        }
      }
      finally {
        setIsLoading(false);
      }
    }
    else {
      const randomScript = getRandomScript(links);
      if (randomScript) {
        router.push(`/scripts?id=${randomScript.slug}`);
      }
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className={cn(
            "relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64",
          )}
          onClick={() => {
            fetchSortedCategories();
            setOpen(true);
          }}
        >
          <span className="inline-flex">Search scripts...</span>
          <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.45rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>
            K
          </kbd>
        </Button>

        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={openRandomScript} disabled={isLoading} className="hidden lg:flex">
                <Sparkles className="size-4" />
                <span className="sr-only">Open Random Script</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Random Script</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search scripts</DialogTitle>
        <CommandInput placeholder="Search for a script..." />
        <CommandList>
          <CommandEmpty>{isLoading ? "Loading..." : "No scripts found."}</CommandEmpty>
          {links.map(category => (
            <CommandGroup key={`category:${category.name}`} heading={category.name}>
              {category.scripts.map(script => (
                <CommandItem
                  key={`script:${script.slug}`}
                  value={`${script.slug}-${script.name}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/scripts?id=${script.slug}`);
                  }}
                >
                  <div className="flex gap-2" onClick={() => setOpen(false)}>
                    <Image
                      src={script.logo || `/${basePath}/logo.png`}
                      onError={e => ((e.currentTarget as HTMLImageElement).src = `/${basePath}/logo.png`)}
                      unoptimized
                      width={16}
                      height={16}
                      alt=""
                      className="h-5 w-5"
                    />
                    <span>{script.name}</span>
                    <span>{formattedBadge(script.type)}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
