import React, { useState, useEffect } from 'react';
import { X, Search, Zap, DollarSign } from 'lucide-react';
import { cn } from './utils';

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export const MODEL_STORAGE_KEY = 'openrouter-model';
export const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

export function getSelectedModel(): string {
  try {
    return localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

function isFree(m: OpenRouterModel) {
  return m.pricing.prompt === '0' && m.pricing.completion === '0';
}

function formatCtx(n: number) {
  return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
}

interface ModelPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModelPicker({ isOpen, onClose }: ModelPickerProps) {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(getSelectedModel);

  useEffect(() => {
    if (!isOpen || models.length > 0) return;
    setLoading(true);
    fetch('https://openrouter.ai/api/v1/models')
      .then(r => r.json())
      .then(data => {
        // Sort: free first, then alphabetically by name within each group
        const sorted = (data.data as OpenRouterModel[]).sort((a, b) => {
          const aFree = isFree(a);
          const bFree = isFree(b);
          if (aFree && !bFree) return -1;
          if (!aFree && bFree) return 1;
          return a.name.localeCompare(b.name);
        });
        setModels(sorted);
      })
      .catch(err => console.error('Failed to load models', err))
      .finally(() => setLoading(false));
  }, [isOpen, models.length]);

  const filtered = models.filter(m =>
    m.id.toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const freeModels = filtered.filter(isFree);
  const paidModels = filtered.filter(m => !isFree(m));

  const select = (id: string) => {
    setSelected(id);
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, id);
    } catch {}
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col" style={{ maxHeight: '80vh' }}>

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold">Choose AI Model</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Free models listed first · selection saved automatically</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-zinc-800 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              autoFocus
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 placeholder:text-zinc-600 transition-all"
            />
          </div>
        </div>

        {/* Model list */}
        <div className="overflow-y-auto flex-1 p-2">
          {loading ? (
            <div className="py-16 text-center text-zinc-500 text-sm">Loading models from OpenRouter...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm">No models match "{search}"</div>
          ) : (
            <>
              {freeModels.length > 0 && (
                <section className="mb-2">
                  <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                    <Zap className="w-3 h-3" />
                    Free · {freeModels.length} models
                  </div>
                  {freeModels.map(m => (
                    <ModelRow key={m.id} model={m} selected={selected} onSelect={select} />
                  ))}
                </section>
              )}

              {paidModels.length > 0 && (
                <section>
                  <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <DollarSign className="w-3 h-3" />
                    Paid · {paidModels.length} models
                  </div>
                  {paidModels.map(m => (
                    <ModelRow key={m.id} model={m} selected={selected} onSelect={select} />
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const ModelRow: React.FC<{
  model: OpenRouterModel;
  selected: string;
  onSelect: (id: string) => void;
}> = ({ model, selected, onSelect }) => {
  const isSelected = model.id === selected;
  const free = isFree(model);

  return (
    <button
      onClick={() => onSelect(model.id)}
      className={cn(
        'w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors border',
        isSelected
          ? 'bg-yellow-500/10 border-yellow-500/20'
          : 'border-transparent hover:bg-zinc-800'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className={cn('text-sm font-medium truncate', isSelected ? 'text-yellow-400' : 'text-zinc-100')}>
          {model.name}
        </div>
        <div className="text-xs text-zinc-500 truncate font-mono">{model.id}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-zinc-600 font-mono">{formatCtx(model.context_length)}</span>
        {free
          ? <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">FREE</span>
          : <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
              ${parseFloat(model.pricing.prompt) * 1_000_000}/M
            </span>
        }
      </div>
    </button>
  );
}
