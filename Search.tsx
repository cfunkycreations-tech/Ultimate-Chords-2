import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchSongs } from "../services/gemini";
import { Loader2, Music } from "lucide-react";

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<{title: string, artist: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    
    let active = true;
    setLoading(true);
    searchSongs(query).then(data => {
      if (active) {
        setResults(data);
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [query]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Search Results for "{query}"</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((song, i) => (
            <Link 
              key={i}
              to={`/song/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-yellow-500/50 hover:bg-zinc-800/80 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-zinc-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-100">{song.title}</h3>
                  <p className="text-zinc-400">{song.artist}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500">
          No results found. Try a different search term.
        </div>
      )}
    </div>
  );
}
