import {
    Globe,
    StickyNote,
    Calculator,
    Folder,
    Terminal,
    Settings,
    AppWindow,
    LucideIcon
} from "lucide-react";

interface AppIconProps {
    appName: string;
    size?: number;
    className?: string;
    color?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
    browser: Globe,
    notes: StickyNote,
    calculator: Calculator,
    files: Folder,
    terminal: Terminal,
    settings: Settings
};

export function AppIcon({ appName, size = 20, className, color = "currentColor" }: AppIconProps) {
    const Icon = ICON_MAP[appName.toLowerCase()] || AppWindow;

    return <Icon size={size} className={className} color={color} strokeWidth={1.5} />;
}
