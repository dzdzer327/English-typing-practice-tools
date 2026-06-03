import { Link, useLocation } from 'react-router-dom';
import type { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="logo">⌨️ Typing Practice</div>

      {user && (
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>首页</Link>
          <Link to="/practice" className={isActive('/practice')}>练习</Link>
          <Link to="/challenge" className={isActive('/challenge')}>每日挑战</Link>
          <Link to="/stats" className={isActive('/stats')}>统计</Link>
          <Link to="/checkin" className={isActive('/checkin')}>打卡</Link>
        </div>
      )}

      <div className="user-info">
        {user ? (
          <>
            <span>欢迎, {user.nickname || user.username}</span>
            <button onClick={onLogout}>退出</button>
          </>
        ) : (
          <Link to="/login">
            <button>登录</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
