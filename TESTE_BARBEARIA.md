# 🧪 Guia de Teste - Criação de Barbearias

## 📋 Checklist de Teste

### 1. ✅ Configuração Inicial
**IMPORTANTE**: Antes de testar, configure as regras do Firestore no Firebase Console:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `na-regua-d3528`
3. Vá para **Firestore Database** → **Rules**
4. Cole estas regras **TEMPORÁRIAS** para teste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Clique em **Publish** (Publicar)

### 2. 🧪 Teste de Criação de Usuário Barbeiro

1. Acesse: `http://localhost:3000/signup`
2. Selecione a aba **"Barbeiro"**
3. Preencha os dados:
   - **Nome**: Teste Barbeiro
   - **Email**: teste@barbeiro.com
   - **Telefone**: (11) 99999-9999
   - **Senha**: 123456
4. Clique em **"Criar Conta"**
5. ✅ Deve redirecionar para `/barber/setup`

### 3. 🏪 Teste de Criação de Barbearia

1. Na página `/barber/setup`, preencha:
   - **Nome**: Barbearia Teste
   - **Descrição**: Uma barbearia de teste
   - **Endereço**: Rua Teste, 123, São Paulo, SP
   - **Telefone**: (11) 3333-3333
   - **Serviço 1**: Corte Masculino, R$ 30,00, 30 min
2. Configure horários de funcionamento
3. Clique em **"Cadastrar Barbearia"**
4. ✅ Deve redirecionar para `/barber/dashboard`

### 4. 🔍 Verificação no Firebase

1. Vá para **Firestore Database** no Firebase Console
2. Verifique se foram criadas as coleções:
   - **users**: deve ter o usuário barbeiro
   - **barbershops**: deve ter a barbearia criada

### 5. 📊 Verificação no Dashboard

1. No dashboard (`/barber/dashboard`), deve aparecer:
   - Nome da barbearia
   - Informações básicas
   - Mensagem "Nenhum agendamento ainda" (normal para novo cadastro)

## 🐛 Possíveis Problemas

### Erro: "Missing or insufficient permissions"
**Solução**: Verifique se as regras do Firestore foram configuradas corretamente.

### Erro: "User data not found"
**Solução**: Certifique-se de que o usuário foi criado corretamente no signup.

### Página em branco no dashboard
**Solução**: Verifique o console do navegador (F12) para erros.

## 📸 Log de Teste

Para verificar se tudo está funcionando, abra o **Console do Navegador** (F12) e observe:

1. Durante o cadastro de usuário: deve aparecer logs do Firebase Auth
2. Durante a criação da barbearia: deve aparecer "Barbearia criada com ID: [ID]"
3. No dashboard: deve carregar os dados da barbearia

## ✅ Sucesso

Se tudo funcionou corretamente, você deve ver:
- ✅ Usuário criado no Firebase Auth
- ✅ Documento do usuário na coleção `users`
- ✅ Documento da barbearia na coleção `barbershops`
- ✅ Dashboard mostrando a barbearia criada