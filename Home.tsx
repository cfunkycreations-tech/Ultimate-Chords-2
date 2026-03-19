import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, TrendingUp, Music, Star, Wand2, X, Clock } from "lucide-react";

const POPULAR_SONGS = [
  { title: "Wonderwall", artist: "Oasis" },
  { title: "Hallelujah", artist: "Jeff Buckley" },
  { title: "Let It Be", artist: "The Beatles" },
  { title: "Creep", artist: "Radiohead" },
  { title: "Hotel California", artist: "Eagles" },
  { title: "Perfect", artist: "Ed Sheeran" },
  { title: "Can't Help Falling In Love", artist: "Elvis Presley" },
  { title: "Yellow", artist: "Coldplay" },
];

interface OfflineSong {
  title: string;
  artist: string;
  timestamp: number;
}

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [genTitle, setGenTitle] = useState("");
  const [genArtist, setGenArtist] = useState("");
  const [offlineSongs, setOfflineSongs] = useState<OfflineSong[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('offline-songs');
      if (stored) {
        setOfflineSongs(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load offline songs", e);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (genTitle.trim() && genArtist.trim()) {
      setIsModalOpen(false);
      navigate(`/song/${encodeURIComponent(genArtist.trim())}/${encodeURIComponent(genTitle.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Find chords for <span className="text-yellow-500">any song</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Powered by AI, Ultimate Chords generates accurate guitar tabs and lyrics for millions of songs instantly.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mt-8">
          <div className="relative flex items-center w-full shadow-2xl shadow-yellow-500/10 rounded-full">
            <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search for songs, artists, or lyrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-full py-4 pl-12 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all placeholder:text-zinc-500"
            />
            <button 
              type="submit"
              className="absolute right-2 px-6 py-2 bg-yellow-500 text-zinc-950 font-semibold rounded-full hover:bg-yellow-400 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-700 text-zinc-100 font-medium rounded-full hover:bg-zinc-800 hover:border-yellow-500 transition-all shadow-xl shadow-black/50 hover:scale-105"
          >
            <Wand2 className="w-5 h-5 text-yellow-500" />
            Can't find it? Generate with AI
          </button>
        </div>
      </section>

      {/* Offline Songs Grid */}
      {offlineSongs.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h2 className="text-2xl font-bold">Recent & Available Offline</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {offlineSongs.slice(0, 8).map((song, i) => (
              <Link 
                key={i}
                to={`/song/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`}
                className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-yellow-500/50 hover:bg-zinc-800/80 transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/10 transition-colors">
                  <Music className="w-6 h-6 text-zinc-500 group-hover:text-yellow-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-100 truncate group-hover:text-yellow-500 transition-colors">
                    {song.title}
                  </h3>
                  <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Songs Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-500" />
          <h2 className="text-2xl font-bold">Popular Right Now</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_SONGS.map((song, i) => (
            <Link 
              key={i}
              to={`/song/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`}
              className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-yellow-500/50 hover:bg-zinc-800/80 transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/10 transition-colors">
                <Music className="w-6 h-6 text-zinc-500 group-hover:text-yellow-500 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-100 truncate group-hover:text-yellow-500 transition-colors">
                  {song.title}
                </h3>
                <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
              </div>
              <button className="text-zinc-600 hover:text-yellow-500 transition-colors">
                <Star className="w-5 h-5" />
              </button>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Generation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">Generate Tab</h2>
                <p className="text-zinc-400 text-sm">Create chords & tabs with AI</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Song Title</label>
                <input 
                  type="text" 
                  required
                  value={genTitle}
                  onChange={(e) => setGenTitle(e.target.value)}
                  placeholder="e.g. Stairway to Heaven"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Artist Name</label>
                <input 
                  type="text" 
                  required
                  value={genArtist}
                  onChange={(e) => setGenArtist(e.target.value)}
                  placeholder="e.g. Led Zeppelin"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-yellow-500 text-zinc-950 font-bold rounded-xl hover:bg-yellow-400 transition-colors mt-2 flex items-center justify-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                Generate Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
