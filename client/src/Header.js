import { Link } from 'react-router-dom';
import logo from './logo.svg';
export default function Header(){
    return (
        <header>
        <a href="" className="logo">MyBlog</a>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>
    )
}