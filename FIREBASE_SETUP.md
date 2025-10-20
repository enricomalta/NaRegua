# 🔥 Configuração do Firebase - Na Régua

## 📋 Checklist de Configuração

### 1. ✅ Firestore Database
1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `na-regua-d3528`
3. Vá para **Firestore Database**
4. Clique em **Rules** (Regras)
5. **Substitua as regras atuais** pelo conteúdo do arquivo `firestore.rules` deste projeto

### 2. ✅ Authentication
1. No Firebase Console, vá para **Authentication**
2. Clique na aba **Sign-in method**
3. **Ative o provedor "Email/Password"**
4. Salve as alterações

### 3. ✅ Variáveis de Ambiente
As variáveis já estão configuradas no arquivo `.env`:
- ✅ API Key: `AIzaSyAud9KTIx0HRfsGejl-B6grlQ_O08i6iFo`
- ✅ Project ID: `na-regua-d3528`
- ✅ Auth Domain: `na-regua-d3528.firebaseapp.com`

## 🔐 Regras de Segurança Recomendadas

Copie e cole essas regras no Firestore:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Para desenvolvimento/teste - TEMPORÁRIO
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

⚠️ **IMPORTANTE**: Essas são regras permissivas para desenvolvimento. Em produção, use as regras mais restritivas do arquivo `firestore.rules`.

## 🚀 Como Testar

1. Configure as regras no Firebase Console
2. Reinicie o servidor de desenvolvimento: \`npm run dev\`
3. Acesse \`/signup\` para criar um usuário
4. Verifique se o usuário aparece no Firestore Database

## 🐛 Problemas Comuns

### "Missing or insufficient permissions"
- ✅ Verifique se as regras do Firestore estão configuradas
- ✅ Verifique se o Authentication está ativado
- ✅ Certifique-se de que o usuário está autenticado

### "FirebaseError: Invalid API key"
- ✅ Verifique se as variáveis de ambiente estão corretas
- ✅ Reinicie o servidor após alterar o arquivo \`.env\`

## 📊 Estrutura do Banco de Dados

\`\`\`
firestore/
├── users/
│   ├── {userId}
│   │   ├── name
│   │   ├── email
│   │   ├── role
│   │   ├── phone
│   │   └── createdAt
├── barbershops/
├── bookings/
├── reviews/
└── employees/
\`\`\`