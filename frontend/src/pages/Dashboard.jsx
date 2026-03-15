import { Link } from 'react-router-dom';
import WeatherWidget from '../components/WeatherWidget';
import { Plant, Flask, Bug, ArrowRight } from '@phosphor-icons/react';

const Dashboard = () => {
  const cards = [
    {
      title: "Crop Selection",
      desc: "Analyze your soil to find the perfect crops.",
      icon: <Plant size={40} weight="duotone" className="text-emerald-500" />,
      link: "/crop",
      color: "emerald"
    },
    {
      title: "Fertilizer Calculator",
      desc: "Get precision recommendations based on nutrients.",
      icon: <Flask size={40} weight="duotone" className="text-blue-500" />,
      link: "/fertilizer",
      color: "blue"
    },
    {
      title: "Disease Detection",
      desc: "Identify plant health issues in seconds via AI.",
      icon: <Bug size={40} weight="duotone" className="text-red-500" />,
      link: "/disease",
      color: "red"
    }
  ];

  return (
    <div className="dashboard animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2">Welcome, Farmer Friend!</h1>
        <p className="text-gray-500">Here's your farm's overview and AI tools for today.</p>
      </div>

      <WeatherWidget />

      <h2 className="text-2xl font-bold mb-6">Quick Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(card => (
          <Link to={card.link} key={card.title} className="tool-card glass-panel p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-105" style={{textDecoration: 'none', color: 'inherit'}}>
            <div className={`p-5 mb-6 rounded-3xl bg-${card.color}-50`}>
              {card.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{card.title}</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {card.desc}
            </p>
            <div className={`mt-auto flex items-center gap-2 font-bold text-${card.color}-600`}>
                Try Now <ArrowRight weight="bold" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-10 glass-panel animate-slide-up" style={{
        background: 'linear-gradient(135deg, #111827, #1f2937)',
        color: '#fff',
        borderRadius: '24px'
      }}>
        <div className="max-w-xl">
            <h3 className="text-2xl font-bold mb-4">Deep Learning Insight</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Our CNN models analyze soil textures and leaf patterns to provide sub-meter precision for your cultivation decisions.
            </p>
            <button className="btn-primary" style={{backgroundColor: '#10b981'}}>
                Knowledge Base
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
