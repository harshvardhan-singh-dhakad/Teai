import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'Rachel', userId } = await req.json();

    if (!text || !userId) {
      return NextResponse.json({ error: 'Missing text or userId' }, { status: 400 });
    }

    // 1. Get user settings from Firestore
    const userDocRef = doc(db, 'users', userId, 'settings', 'elevenlabs');
    const userDoc = await getDoc(userDocRef);
    
    let apiKey = process.env.DEFAULT_ELEVENLABS_KEY;
    let apiKeySource: 'user' | 'default' = 'default';

    if (userDoc.exists() && userDoc.data().apiKey) {
      apiKey = userDoc.data().apiKey;
      apiKeySource = 'user';
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'No ElevenLabs API key found' }, { status: 500 });
    }

    // 2. Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail?.status || 'ElevenLabs API error');
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUri = `data:audio/mpeg;base64,${base64Audio}`;

    // 3. Log usage in Firestore
    const usageRef = collection(db, 'users', userId, 'usage');
    await addDoc(usageRef, {
      timestamp: serverTimestamp(),
      textLength: text.length,
      voiceUsed: voice,
      apiKeySource,
    });

    return NextResponse.json({ audio: audioDataUri });
  } catch (error: any) {
    console.error('Error generating voice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
