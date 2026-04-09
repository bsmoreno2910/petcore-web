import { Outlet } from 'react-router-dom'
import { Sidebar } from './BarraLateral'
import { Header } from './Cabecalho'
import { useUiStore } from '@/stores/interface.store'

export function AppLayout() {
  const { sidebarOpen, setSidebarOpen } = useUiStore()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
