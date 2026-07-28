import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore Database (passing custom databaseId if defined in config)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Helper to ensure user is logged in anonymously
export async function ensureAnonymousAuth(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        try {
          const userCred = await signInAnonymously(auth);
          unsubscribe();
          resolve(userCred.user);
        } catch (err) {
          unsubscribe();
          reject(err);
        }
      }
    });
  });
}

export interface LeaderboardEntry {
  id?: string;
  playerName: string;
  score: number;
  wpm: number;
  accuracy: number;
  difficulty: string;
  levelReached: number;
  userId: string;
  createdAt?: any;
}

/**
 * Save new high score to Firebase Firestore
 */
export async function saveScoreToFirebase(entry: {
  playerName: string;
  score: number;
  wpm: number;
  accuracy: number;
  difficulty: string;
  levelReached: number;
}) {
  try {
    let uid = 'anon_' + Math.random().toString(36).substring(2, 9);
    try {
      const user = await ensureAnonymousAuth();
      if (user?.uid) uid = user.uid;
    } catch (e) {
      console.warn('Anonymous auth note (proceeding without auth token):', e);
    }

    const leaderboardCol = collection(db, 'leaderboard');
    const docData = {
      playerName: (entry.playerName || 'Steve').trim(),
      score: Number(entry.score) || 0,
      wpm: Number(entry.wpm) || 0,
      accuracy: Number(entry.accuracy) || 0,
      difficulty: entry.difficulty || 'normal',
      levelReached: Number(entry.levelReached) || 1,
      userId: uid,
      createdAt: serverTimestamp(),
    };

    const newDoc = await addDoc(leaderboardCol, docData);
    console.log('Pontuação salva com sucesso no Firebase! ID:', newDoc.id);
    return newDoc.id;
  } catch (error) {
    console.error('Erro ao salvar pontuação no Firebase:', error);
    return null;
  }
}

/**
 * Fetch top scores from Firebase Firestore for global ranking
 */
export async function getGlobalLeaderboard(maxLimit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const leaderboardCol = collection(db, 'leaderboard');
    let querySnapshot;

    try {
      const q = query(leaderboardCol, orderBy('score', 'desc'), limit(maxLimit));
      querySnapshot = await getDocs(q);
    } catch (err) {
      console.warn('Fallback: buscando documentos sem orderBy devido a erro de índice ou query', err);
      querySnapshot = await getDocs(leaderboardCol);
    }

    const scores: LeaderboardEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      scores.push({
        id: doc.id,
        playerName: data.playerName || 'Steve',
        score: Number(data.score) || 0,
        wpm: Number(data.wpm) || 0,
        accuracy: Number(data.accuracy) || 0,
        difficulty: data.difficulty || 'normal',
        levelReached: Number(data.levelReached) || 1,
        userId: data.userId || '',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recente',
      });
    });

    // Ensure strictly sorted by score descending
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, maxLimit);
  } catch (error) {
    console.error('Erro ao buscar ranking do Firebase:', error);
    return [];
  }
}
