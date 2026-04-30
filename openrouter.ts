const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

function getModel(): string {
  try {
    return localStorage.getItem('openrouter-model') || DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

async function callAI(prompt: string, jsonMode = false): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? '';
}

export async function fetchSongChords(song: string, artist: string, format: 'chords' | 'tabs' = 'chords'): Promise<string> {
  const cacheKey = `song-${artist.toLowerCase()}-${song.toLowerCase()}-${format}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch (e) {
    console.warn('localStorage access failed', e);
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

  let text = await callAI(prompt);

  // Strip markdown code fences if the model wraps output anyway
  if (text.startsWith('```')) {
    const lines = text.split('\n');
    if (lines[0].startsWith('```')) lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    text = lines.join('\n');
  }
  text = text.trim();

  try {
    localStorage.setItem(cacheKey, text);

    const offlineSongsStr = localStorage.getItem('offline-songs') || '[]';
    const offlineSongs = JSON.parse(offlineSongsStr);
    const exists = offlineSongs.find((s: any) =>
      s.title.toLowerCase() === song.toLowerCase() &&
      s.artist.toLowerCase() === artist.toLowerCase()
    );
    if (!exists) {
      offlineSongs.unshift({ title: song, artist, timestamp: Date.now() });
      localStorage.setItem('offline-songs', JSON.stringify(offlineSongs));
    }
  } catch (e) {
    console.warn('localStorage set failed', e);
  }

  return text;
}

export async function searchSongs(query: string): Promise<{ title: string; artist: string }[]> {
  const prompt = `Return a JSON object with a "results" array of exactly 5 popular songs matching the query: "${query}".
Format strictly: {"results":[{"title":"Song Name","artist":"Artist Name"}]}
Only output the JSON object. No markdown, no explanation.`;

  try {
    let text = await callAI(prompt, true);

    // Strip markdown fences just in case
    if (text.includes('```')) {
      text = text.replace(/```(?:json)?\n?/g, '').trim();
    }

    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : (parsed.results ?? []);
    return arr.slice(0, 5);
  } catch (e) {
    console.error('Search failed or offline', e);

    try {
      const stored = localStorage.getItem('offline-songs');
      if (stored) {
        const offline = JSON.parse(stored);
        const q = query.toLowerCase();
        return offline
          .filter((s: any) =>
            s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
          )
          .slice(0, 5);
      }
    } catch {
      // ignore
    }

    return [];
  }
}
