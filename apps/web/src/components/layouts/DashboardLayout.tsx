import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users } from 'lucide-react';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('@mini-crm:token');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Atendimentos', icon: LayoutDashboard, path: '/' },
    { label: 'Pacientes', icon: Users, path: '/patients' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">

      <aside className="flex flex-col md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-white shrink-0 shadow-sm z-10">

        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 md:px-6">
          <span className="text-primary-600 text-xl font-bold">Yoog Saúde</span>
          <button
            onClick={handleLogout}
            className="md:hidden flex items-center p-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 p-3 md:p-4 md:flex-1 no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center shrink-0 rounded-md px-3 py-2.5 md:py-2 text-sm font-medium transition-colors ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon className="mr-2 md:mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" /> Terminar Sessão
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <header className="hidden md:flex h-16 items-center border-b border-gray-200 bg-white px-8 shadow-sm shrink-0">
          <h2 className="text-lg font-medium text-gray-800">
            Painel de Controle
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
