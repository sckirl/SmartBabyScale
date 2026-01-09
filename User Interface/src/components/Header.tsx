import { Baby, Menu, User, Activity, Wifi, WifiOff } from "lucide-react";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Badge } from "./ui/badge";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const navigationItems = [
    { id: "dashboard", label: "Dasbor Utama" },
    { id: "history", label: "Riwayat Pasien" },
    { id: "growth", label: "Grafik Pertumbuhan" },
    { id: "settings", label: "Pengaturan" },
  ];

  // Mock data - in real implementation, this would come from device
  const deviceConnected = true;
  const babyId = "NBY-2024-001";
  const gestationalAge = "38 Minggu";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">EPOSREM</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === item.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Patient Info & Profile */}
        <div className="flex items-center space-x-4">
          {/* Patient Info - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-3 text-sm">
            <div className="text-right">
              <div className="font-medium text-gray-900">ID: {babyId}</div>
              <div className="text-xs text-gray-500">Usia Gestasi: {gestationalAge}</div>
            </div>
            <Badge variant={deviceConnected ? "default" : "destructive"} className="flex items-center gap-1">
              {deviceConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Aktif
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Terputus
                </>
              )}
            </Badge>
          </div>

          <Button variant="ghost" size="icon" className="hidden md:flex">
            <User className="h-5 w-5" />
          </Button>
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              {/* Patient Info in Mobile */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">ID: {babyId}</div>
                <div className="text-sm text-gray-600 mb-2">Usia Gestasi: {gestationalAge}</div>
                <Badge variant={deviceConnected ? "default" : "destructive"} className="flex items-center gap-1 w-fit">
                  {deviceConnected ? (
                    <>
                      <Wifi className="h-3 w-3" />
                      Perangkat Aktif
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3" />
                      Perangkat Terputus
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="flex flex-col space-y-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`text-left px-4 py-3 rounded-md transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}