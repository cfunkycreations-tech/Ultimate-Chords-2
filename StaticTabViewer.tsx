import React, { useMemo } from 'react';
import { parseGuitarTab } from './tabParser';
import { cn } from './utils';

interface StaticTabViewerProps {
  rawText: string;
  fontSize: number;
}

export function StaticTabViewer({ rawText, fontSize }: StaticTabViewerProps) {
  const parsedTabs = useMemo(() => parseGuitarTab(rawText), [rawText]);

  return (
    <div 
      className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-inner space-y-12 overflow-x-auto"
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
    >
      {parsedTabs.map((block, bIdx) => {
        if (block.type === 'text') {
          return (
            <div 
              key={bIdx} 
              className="text-zinc-300 font-mono whitespace-pre-wrap"
              style={{ paddingLeft: 'calc(0.5rem + 2px)' }}
            >
              {block.content}
            </div>
          );
        }

        return (
          <div key={bIdx} className="flex items-start pb-4">
            {/* Prefixes (e| B| G| etc) */}
            <div className="flex flex-col pr-2 border-r-2 border-zinc-700 sticky left-0 bg-zinc-950 z-30">
              {block.prefixes.map((prefix, pIdx) => (
                <div key={pIdx} className="h-[1.5em] flex items-center justify-end font-mono font-bold text-zinc-500">
                  {prefix}
                </div>
              ))}
            </div>

            {/* Columns */}
            <div className="flex flex-row relative">
              {block.columns.map((col, cIdx) => (
                <div key={cIdx} className="flex flex-col relative bg-zinc-950">
                  {col.chars.map((char, rIdx) => (
                    <div key={rIdx} className="h-[1.5em] w-[1ch] relative flex items-center justify-center">
                      {/* Staff Line */}
                      <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-zinc-800 z-0" />
                      
                      {/* Bar Line */}
                      {col.isBar && (
                        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-zinc-600 z-10" />
                      )}
                      
                      {/* Number/Character */}
                      {!col.isBar && char !== '-' && char !== ' ' && (
                        <span className="relative z-20 px-[1px] font-bold font-mono bg-zinc-950 text-zinc-300">
                          {char}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
