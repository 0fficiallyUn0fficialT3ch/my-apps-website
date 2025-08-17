import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import About from './About.jsx';
import Games from './Games.jsx';
import Apps from './Apps.jsx';
import Contact from './Contact.jsx';
import IsoGame from './IsoGame';

export default function App() {
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [armedMode, setArmedMode] = useState(true);
  const handleToggleArmed = () => setArmedMode(a => !a);

  const renderPage = () => {
    switch (page) {
      case 'about':
        return <About />;
      case 'games':
        return <Games />;
      case 'apps':
        return <Apps />;
      case 'contact':
        return <Contact />;
      default:
        return (
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">{getPageTitle()}</h1>
            <video
              className="mx-auto rounded-lg shadow-lg mt-8 w-full max-w-xl"
              controls
              autoPlay
              muted
              loop
            >
              <source src="/assets/video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    switch (page) {
      case 'home':
        return '0fficiallyUn0fficialT3ch';
      case 'games':
        return 'Games';
      case 'apps':
        return 'Other Apps';
      case 'about':
        return 'About';
      case 'contact':
        return 'Contact';
      default:
        return '0fficiallyUn0fficialT3ch';
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
    <div className="min-h-screen relative overflow-hidden bg-cover bg-center text-white font-tech"
      style={{ backgroundImage: 'url(/assets/background.webp)' }}
    >
      {/* Menu Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-12 left-0 bg-black bg-opacity-80 text-white rounded shadow-md p-4 space-y-2">
            <button onClick={() => { setPage('home'); setMenuOpen(false); }} className="block w-full text-left">Home</button>
            <button onClick={() => { setPage('about'); setMenuOpen(false); }} className="block w-full text-left">About</button>
            <button onClick={() => { setPage('games'); setMenuOpen(false); }} className="block w-full text-left">Games</button>
            <button onClick={() => { setPage('apps'); setMenuOpen(false); }} className="block w-full text-left">Other Apps</button>
            <button onClick={() => { setPage('contact'); setMenuOpen(false); }} className="block w-full text-left">Contact</button>
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="px-6 mt-12">{renderPage()}</div>
    </div>
          }
        />
        <Route path="/isogame" element={<IsoGame armedMode={armedMode} onToggleArmed={handleToggleArmed} />} />
      </Routes>
    </BrowserRouter>
  );
}
