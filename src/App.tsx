import { useGameStore } from '@/store/gameStore';
import Toast from '@/components/Toast';
import Menu from '@/scenes/Menu';
import Select from '@/scenes/Select';
import MapView from '@/scenes/MapView';
import Battle from '@/scenes/Battle';
import EventScene from '@/scenes/EventScene';
import Shop from '@/scenes/Shop';
import Reward from '@/scenes/Reward';
import Rest from '@/scenes/Rest';
import End from '@/scenes/End';
import Codex from '@/scenes/Codex';

export default function App() {
  const scene = useGameStore((s) => s.scene);

  return (
    <div className="min-h-screen w-full">
      {scene === 'menu' && <Menu />}
      {scene === 'select' && <Select />}
      {scene === 'map' && <MapView />}
      {scene === 'battle' && <Battle />}
      {scene === 'event' && <EventScene />}
      {scene === 'shop' && <Shop />}
      {scene === 'reward' && <Reward />}
      {scene === 'rest' && <Rest />}
      {(scene === 'death' || scene === 'victory') && <End />}
      {scene === 'codex' && <Codex />}
      <Toast />
    </div>
  );
}
