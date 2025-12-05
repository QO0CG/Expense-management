import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && true);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-16 h-8 rounded-full p-1 transition-all duration-500 ease-in-out",
        "bg-gradient-to-r shadow-inner",
        isDarkMode 
          ? "from-slate-800 to-purple-900 shadow-purple-500/20" 
          : "from-sky-300 to-amber-200 shadow-amber-500/20"
      )}
      aria-label="Toggle theme"
    >
      {/* Track decoration */}
      <div className={cn(
        "absolute inset-0 rounded-full transition-opacity duration-500",
        isDarkMode ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute top-1 left-2 w-1 h-1 bg-white/40 rounded-full" />
        <div className="absolute top-3 left-4 w-0.5 h-0.5 bg-white/30 rounded-full" />
        <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white/20 rounded-full" />
      </div>
      
      {/* Sliding circle with icon */}
      <div
        className={cn(
          "relative w-6 h-6 rounded-full transition-all duration-500 ease-in-out flex items-center justify-center",
          "shadow-lg",
          isDarkMode 
            ? "translate-x-8 bg-gradient-to-br from-slate-700 to-slate-900 shadow-purple-500/30" 
            : "translate-x-0 bg-gradient-to-br from-amber-300 to-orange-400 shadow-amber-500/50"
        )}
      >
        <Sun 
          className={cn(
            "absolute h-4 w-4 text-amber-100 transition-all duration-500",
            isDarkMode ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
          )} 
        />
        <Moon 
          className={cn(
            "absolute h-4 w-4 text-purple-200 transition-all duration-500",
            isDarkMode ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
          )} 
        />
      </div>
    </button>
  );
};
