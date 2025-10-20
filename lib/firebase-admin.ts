import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Configuração do Firebase Admin
const adminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Função para obter ou criar o app admin
function getAdminApp(): App {
  // Verificar se já existe um app admin
  const existingApp = getApps().find(app => app?.name === 'admin');
  if (existingApp) {
    return existingApp;
  }

  // Criar novo app admin
  try {
    // Tentar usar service account se estiver disponível
    if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      console.log('Using Firebase service account credentials');
      return initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }, 'admin');
    } else {
      // Para desenvolvimento, inicializar sem service account
      // Isso funcionará se você configurar as regras de desenvolvimento do Firestore
      console.log('Using Firebase Admin without service account (development mode)');
      return initializeApp(adminConfig, 'admin');
    }
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
    // Fallback: usar configuração básica
    return initializeApp({ 
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
    }, 'admin');
  }
}

// Obter o app admin
const adminApp = getAdminApp();

// Exportar os serviços
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);

export default adminApp;