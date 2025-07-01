import { Home, BarChart3, Users, FileText, Settings } from "lucide-react"
import { NavLink } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import OlivaLogo from '@/assets/Oliva_skin.png';

const items = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Bookings", url: "/bookings", icon: Users },
  { title: "Reports", url: "/reports", icon: FileText },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar className="border-r border-[#1a1a1a]/10 bg-white shadow-lg" collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-2 border-b border-[#1a1a1a]/10 bg-gradient-to-r from-[#00b2b8]/5 to-transparent">
          <div className="flex flex-col items-center">
            {!isCollapsed ? (
              <>
                <div className="w-full px-0">
                  <img 
                    src={OlivaLogo} 
                    alt="Oliva Skin and Hair Clinic" 
                    className="w-full h-auto object-contain min-h-[60px] max-h-[220px] select-none pointer-events-none"
                    draggable={false}
                  />
                </div>
              </>
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-[#00b2b8] to-[#008a8f] rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:shadow-xl select-none pointer-events-none">
                <span className="text-white font-bold text-2xl">O</span>
              </div>
            )}
          </div>
        </div>
        
        <SidebarGroup className="flex-1 py-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={cn(
                      "text-[#1a1a1a]/60 hover:text-[#00b2b8]",
                      "relative group transition-all duration-300 ease-out"
                    )}
                  >
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        cn(
                          "flex items-center gap-3 px-6 py-3 mx-2 transition-all duration-300 ease-out",
                          "relative rounded-xl overflow-hidden",
                          "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#00b2b8]/10 before:to-transparent",
                          "before:transform before:scale-x-0 before:origin-left before:transition-transform before:duration-300 before:ease-out",
                          "hover:before:scale-x-100",
                          isActive 
                            ? "bg-gradient-to-r from-[#00b2b8]/15 to-[#00b2b8]/5 text-[#00b2b8] font-semibold shadow-md before:scale-x-100" 
                            : "hover:shadow-md hover:transform hover:translate-x-1",
                          "after:content-[''] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2",
                          "after:h-0 after:w-1 after:rounded-r-full after:transition-all after:duration-300 after:ease-out",
                          "after:bg-gradient-to-b after:from-[#00b2b8] after:to-[#008a8f]",
                          isActive && "after:h-8",
                          "hover:after:h-4"
                        )
                      }
                    >
                      <item.icon className={cn(
                        "h-5 w-5 transition-all duration-300 ease-out relative z-10",
                        "group-hover:scale-110 group-hover:rotate-3",
                        "filter drop-shadow-sm"
                      )} />
                      {!isCollapsed && (
                        <span className="font-medium relative z-10 transition-all duration-300">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="p-2 border-t border-[#1a1a1a]/10 bg-gradient-to-r from-transparent to-[#00b2b8]/5">
          <div className="flex items-center justify-center gap-2 px-0 py-1 text-sm text-[#1a1a1a]/60 transition-all duration-300 hover:text-[#00b2b8]">
            {!isCollapsed && (
              <span className="font-medium">© 2025 Oliva</span>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}