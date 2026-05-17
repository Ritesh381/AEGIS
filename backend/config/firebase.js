import admin from 'firebase-admin';

let firebaseApp;
let db;
let auth;

try {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });

  db = admin.firestore();
  auth = admin.auth();

  console.log('✅ Firebase Admin initialized (Firestore + Auth)');
} catch (error) {
  console.warn('⚠️  Firebase Admin initialization failed:', error.message);
  console.warn('   Running without Firestore — analyses will not be persisted.');

  // Provide in-memory fallbacks so the app doesn't crash
  const inMemoryStore = {};

  db = {
    collection: (name) => ({
      doc: (id) => ({
        set: async (data, opts) => { inMemoryStore[`${name}/${id}`] = { ...inMemoryStore[`${name}/${id}`], ...data }; },
        get: async () => {
          const d = inMemoryStore[`${name}/${id}`];
          return { exists: !!d, data: () => d, id };
        },
        update: async (data) => { inMemoryStore[`${name}/${id}`] = { ...inMemoryStore[`${name}/${id}`], ...data }; },
      }),
      add: async (data) => {
        const id = `auto_${Date.now()}`;
        inMemoryStore[`${name}/${id}`] = data;
        return { id };
      },
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            get: async () => ({ docs: [] }),
          }),
          get: async () => ({ docs: [] }),
        }),
        get: async () => ({ docs: [] }),
      }),
      orderBy: () => ({
        limit: () => ({
          get: async () => ({ docs: [] }),
        }),
        get: async () => ({ docs: [] }),
      }),
    }),
  };

  auth = {
    verifyIdToken: async () => ({ uid: 'fallback-user', email: 'fallback@aegis.local' }),
  };
}

export { db, auth };
export default firebaseApp;
