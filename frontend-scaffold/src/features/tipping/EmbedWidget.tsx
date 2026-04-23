import React, { useEffect, useState } from 'react';
import { HeartHandshake, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useContract } from '../../hooks';
import type { Profile } from '../../types';

interface EmbedWidgetProps {
  username?: string;
  theme?: 'light' | 'dark';
  presets?: string[];
}

const EmbedWidget: React.FC<EmbedWidgetProps> = ({ 
  username: propUsername, 
  theme: propTheme, 
  presets: propPresets 
}) => {
  const [searchParams] = useSearchParams();
  const username = propUsername || searchParams.get('username') || '';
  const theme = propTheme || (searchParams.get('theme') as 'light' | 'dark') || 'light';
  const presets = propPresets || searchParams.get('presets')?.split(',') || ['5', '10', '20'];
  const normalizedUsername = username.trim();

  const { getProfileByUsername } = useContract();
  const [creator, setCreator] = useState<Profile | null>(null);
  const [resolvedUsername, setResolvedUsername] = useState('');
  const [amount, setAmount] = useState(presets[0]);
  const loading = Boolean(normalizedUsername) && resolvedUsername !== normalizedUsername;

  useEffect(() => {
    if (!normalizedUsername) {
      return;
    }

    let cancelled = false;

    getProfileByUsername(normalizedUsername)
      .then((profile) => {
        if (cancelled) {
          return;
        }

        setCreator(profile);
        setResolvedUsername(normalizedUsername);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(error);
        setCreator(null);
        setResolvedUsername(normalizedUsername);
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedUsername, getProfileByUsername]);

  const resolvedCreator =
    resolvedUsername === normalizedUsername ? creator : null;

  const handleTip = () => {
    const url = `https://tipz.app/@${username}?amount=${amount}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
      </div>
    );
  }

  if (!resolvedCreator) {
    return (
      <div className={`w-full h-full flex items-center justify-center p-4 text-center ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <p className="font-bold">Creator not found</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full p-4 overflow-hidden flex flex-col ${theme === 'dark' ? 'dark bg-black text-white' : 'bg-white text-black'}`}>
      <Card className="flex-1 flex flex-col items-center justify-center text-center gap-4 border-2 border-current shadow-brutalist bg-transparent">
        <Avatar
          address={resolvedCreator.owner}
          alt={resolvedCreator.displayName}
          fallback={resolvedCreator.displayName}
          size="xl"
          className="border-2 border-current"
        />
        
        <div>
          <h3 className="font-black uppercase text-lg leading-tight">{resolvedCreator.displayName}</h3>
          <p className="text-xs font-bold opacity-70">@{resolvedCreator.username}</p>
        </div>

        <div className="w-full space-y-3 mt-2">
          <div className="flex gap-2 justify-center">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className={`px-3 py-1 text-sm font-black border-2 border-current transition-colors ${
                  amount === p 
                    ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white') 
                    : 'bg-transparent'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent border-2 border-current p-2 font-black text-center focus:outline-none"
              placeholder="Custom"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-xs opacity-50">XLM</span>
          </div>

          <Button
            onClick={handleTip}
            className="w-full btn-brutalist flex items-center justify-center gap-2"
            icon={<HeartHandshake size={18} />}
          >
            Tip Now
          </Button>
        </div>

        <a 
          href="https://tipz.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1 hover:opacity-100 transition-opacity"
        >
          Powered by Tipz <ExternalLink size={10} />
        </a>
      </Card>
    </div>
  );
};

export default EmbedWidget;
