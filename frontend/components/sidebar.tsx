"use client"

import { cn } from "@/lib/utils"
import { Shield, Mail, Link, FileText, UserCheck, DoorOpen, Phone, Gift, Menu, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface SidebarProps {
  activeModule: string
  setActiveModule: (module: string) => void
  isOpen?: boolean
  onToggle?: () => void
}

const navigationItems = [
  {
    id: "phishing-email",
    label: "Phishing Email",
    icon: Mail,
    description: "Detect suspicious email content",
  },
  {
    id: "malicious-url",
    label: "Malicious URL",
    icon: Link,
    description: "Test link validity and safety",
  },
  {
    id: "baiting-file",
    label: "Baiting (File)",
    icon: FileText,
    description: "Check file extensions for threats",
  },
  {
    id: "pretexting",
    label: "Pretexting",
    icon: UserCheck,
    description: "ID verification simulation",
  },
  {
    id: "tailgating",
    label: "Tailgating",
    icon: DoorOpen,
    description: "Security gate access simulation",
  },
  {
    id: "vishing",
    label: "Vishing",
    icon: Phone,
    description: "Phone number spoofing detection",
  },
  {
    id: "quid-pro-quo",
    label: "Quid Pro Quo",
    icon: Gift,
    description: "Information trading awareness",
  },
]

export function Sidebar({ activeModule, setActiveModule, isOpen = true, onToggle }: SidebarProps) {
  const isMobile = useIsMobile()

  const handleModuleSelect = (module: string) => {
    setActiveModule(module)
    if (isMobile && onToggle) {
      onToggle()
    }
  }

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}
      <div className={cn(
        "bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out",
        isMobile ? (
          cn(
            "fixed top-0 left-0 h-full w-80 z-50",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )
        ) : "w-80 relative"
      )}>
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Security Awareness</h1>
              <p className="text-sm text-gray-400">Training Platform</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">

          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleModuleSelect(item.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg transition-all duration-200 group",
                  "hover:bg-gray-800 hover:translate-x-1",
                  activeModule === item.id ? "bg-blue-600 text-white shadow-lg" : "text-gray-300",
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={cn(
                      "h-5 w-5 mt-0.5 transition-colors",
                      activeModule === item.id ? "text-white" : "text-gray-400 group-hover:text-blue-400",
                    )}
                  />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className={cn("text-sm mt-1", activeModule === item.id ? "text-blue-100" : "text-gray-500")}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">Stay vigilant. Stay secure.</div>
      </div>
    </div>
    </>
  )
}
