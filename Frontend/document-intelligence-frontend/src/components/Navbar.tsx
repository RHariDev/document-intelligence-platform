import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { pathname } = useLocation();

  const linkStyle = (path: string) =>
    `px-4 py-2 rounded ${
      pathname === path ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-100"
    }`;

  return (
    <nav className="bg-white shadow mb-6">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">DocIntel</Link>
        <div className="space-x-4">
          <Link to="/" className={linkStyle("/")}>Home</Link>
          <Link to="/upload" className={linkStyle("/upload")}>Upload</Link>
          <Link to="/library" className={linkStyle("/library")}>Library</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
