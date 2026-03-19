import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fetchSongChords(song: string, artist: string, format: 'chords' | 'tabs' = 'chords'): Promise<string> {
  const cacheKey = `song-${artist.toLowerCase()}-${song.toLowerCase()}-${format}`;
  
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return cached;
    }
  } catch (e) {
    console.warn("localStorage access failed", e);
  }

  const prompt = format === 'chords' 
    ? `Provide the chords and lyrics for the song "${song}" by "${artist}" in ChordPro format.
Use [Chord] inline with the lyrics, like this: "This is a [C]lyric with a [G]chord".
Do NOT put chords on a separate line above the lyrics.
Include standard song sections as directives, e.g., {title: Song Name}, {artist: Artist Name}, {start_of_chorus}, {end_of_chorus}, {comment: Verse 1}.
Only output the raw text in ChordPro format. Do not use markdown code blocks.`
    : `Provide the guitar tablature (ASCII tabs) for the song "${song}" by "${artist}".
Include standard song sections as directives, e.g., {title: Song Name}, {artist: Artist Name}, {comment: Intro}, etc.
CRITICAL: Ensure every line of the tablature starts with the string name and a pipe character, exactly like this:
e|-----------------|
B|-----------------|
G|-----------------|
D|-----------------|
A|-----------------|
E|-----------------|
Only output the raw text. Do not use markdown code blocks.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      temperature: 0.2,
    }
  });

  let text = response.text || "";
  // Strip markdown code blocks if the model still includes them
  if (text.startsWith('```')) {
    const lines = text.split('\n');
    if (lines[0].startsWith('```')) lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    text = lines.join('\n');
  }
  text = text.trim();

  try {
    localStorage.setItem(cacheKey, text);
    
    // Save to offline songs list
    const offlineSongsStr = localStorage.getItem('offline-songs') || '[]';
    const offlineSongs = JSON.parse(offlineSongsStr);
    const songExists = offlineSongs.find((s: any) => s.title.toLowerCase() === song.toLowerCase() && s.artist.toLowerCase() === artist.toLowerCase());
    
    if (!songExists) {
      offlineSongs.unshift({ title: song, artist: artist, timestamp: Date.now() });
      localStorage.setItem('offline-songs', JSON.stringify(offlineSongs));
    }
  } catch (e) {
    console.warn("localStorage set failed", e);
  }

  return text;
}

export async function searchSongs(query: string): Promise<{title: string, artist: string}[]> {
  const prompt = `Search for 5 popular songs matching the query: "${query}".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING }
            },
            required: ["title", "artist"]
          }
        },
        temperature: 0.2,
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse search results or offline", e);
    
    // Fallback to searching offline songs
    try {
      const offlineSongsStr = localStorage.getItem('offline-songs');
      if (offlineSongsStr) {
        const offlineSongs = JSON.parse(offlineSongsStr);
        const q = query.toLowerCase();
        return offlineSongs.filter((s: any) => 
          s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
        ).slice(0, 5);
      }
    } catch (err) {
      console.warn("Failed to search offline songs", err);
    }
    
    return [];
  }
}
