import { NavLink, Outlet } from 'react-router-dom'
import './AppShell.css'

const navItems = [
  { to: '/', label: 'Головна', end: true },
  { to: '/body-map', label: 'Зони тіла', end: false },
  { to: '/catalog', label: 'Каталог', end: false },
  { to: '/training', label: 'Тренування', end: false },
  { to: '/progress', label: 'Прогрес', end: false },
  { to: '/profile', label: 'Профіль', end: false },
]

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-topbar">
        <NavLink to="/" className="app-logo" end>
          <span className="app-logo-mark" aria-hidden="true" />
          Posture
        </NavLink>

        <nav className="app-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-trial-badge">Пробний тиждень — усе відкрито</div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
