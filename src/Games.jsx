import { useNavigate } from 'react-router-dom';
import skullsIcon from '../public/20250719_2340_Knight in Dark Cemetery_remix_01k0jygx76fmpvg66ntyjz665j.png';

export default function Games() {
  const navigate = useNavigate();

  const handleOpenGame = () => {
    navigate('/isogame');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Games</h2>
      <p>This is where I'll showcase my game projects.</p>
      <div className="mt-6">
        <button onClick={handleOpenGame} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
          <img src={skullsIcon} alt="Skulls and Daggers" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 16 }} />
          <div className="mt-2 text-center font-semibold">Skulls and Daggers</div>
        </button>
      </div>
    </div>
  );
}
