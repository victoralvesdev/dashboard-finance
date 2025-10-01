"use client";

import { EyeIcon, EyeOffIcon, LogOut, Moon, Sun } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { HeaderLogo } from "@/components/header-logo";

import { Filters } from "@/components/filters";
import { useHideInfos } from "@/hooks/use-hide-infos";
import { useTheme } from "@/hooks/use-theme";
import { WelcomeMessage } from "@/components/welcome-message";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useEffect } from "react";

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { hideInfos, onToggle } = useHideInfos();
  const { isDark, onToggle: toggleTheme } = useTheme();

  const handleToggle = () => onToggle();
  const handleThemeToggle = () => toggleTheme();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <header className="bg-gradient-to-b from-purple-700 to-purple-500 dark:from-gray-900 dark:to-gray-800 px-4 py-8 lg:px-14 pb-36 transition-colors">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          <div className="flex items-center gap-x-4">
            {pathname === "/" && (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger
                    className="flex justify-center w-full color"
                    onClick={handleToggle}
                  >
                    {hideInfos ? (
                      <EyeIcon className="size-8 text-slate-700" />
                    ) : (
                      <EyeOffIcon className="size-8 text-slate-700" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {hideInfos
                      ? "Mostrar informações"
                      : "Esconder informações sensíveis"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleThemeToggle}
                    className="text-white hover:bg-purple-600"
                  >
                    {isDark ? (
                      <Sun className="size-5" />
                    ) : (
                      <Moon className="size-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isDark ? "Modo Claro" : "Modo Escuro"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-white hover:bg-purple-600"
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
        <WelcomeMessage />
        <Filters />
      </div>
    </header>
  );
};
