# 📝 Regras de Negócio para Reviews

## 🔒 Novas Regras Implementadas

### **Condições para Fazer Review:**

1. **✅ Agendamento Concluído**: O usuário deve ter pelo menos **1 agendamento com status "completed"** na barbearia
2. **✅ Uma Avaliação por Barbearia**: Cada usuário pode fazer apenas **1 review por barbearia**
3. **✅ Usuário Logado**: Precisa estar autenticado no sistema

### **Validações Implementadas:**

#### **1. Verificação ao Abrir Dialog:**
- Checa automaticamente se o usuário pode avaliar
- Mostra mensagem explicativa se não puder
- Não permite acesso ao formulário

#### **2. Verificação Dupla no Envio:**
- Valida novamente antes de enviar para o Firebase
- Previne burla das regras pelo frontend
- Garante integridade dos dados

## 🧪 Como Testar as Regras

### **Cenário 1: Usuário SEM Agendamento Concluído**
1. Faça login como cliente
2. Acesse uma barbearia onde nunca fez agendamento
3. Clique em "Avaliar"
4. **Resultado Esperado**: Mensagem explicando que precisa ter agendamento concluído

### **Cenário 2: Usuário COM Agendamento Pendente/Confirmado**
1. Faça um agendamento na barbearia
2. Deixe o status como "pending" ou "confirmed"
3. Tente avaliar a barbearia
4. **Resultado Esperado**: Não pode avaliar (precisa estar "completed")

### **Cenário 3: Usuário COM Agendamento Concluído**
1. Tenha um agendamento com status "completed"
2. Tente avaliar a barbearia
3. **Resultado Esperado**: Pode fazer o review normalmente

### **Cenário 4: Usuário que JÁ FEZ Review**
1. Já tenha feito um review na barbearia
2. Tente avaliar novamente
3. **Resultado Esperado**: Não pode fazer outro review

## 🔧 Funções Implementadas

### **`canUserReviewBarbershop(userId, barbershopId)`**
```typescript
// Verifica duas condições:
// 1. Se o usuário já fez review (retorna false se sim)
// 2. Se tem agendamento concluído (retorna true só se tem)
```

### **Componente ReviewForm**
- **Estado `canReview`**: null | true | false
- **Estado `checkingEligibility`**: Loading da verificação
- **Interface Condicional**: Mostra diferentes conteúdos baseado na elegibilidade

## 📊 Estados do Agendamento

Para teste, você precisa ter agendamentos com estes status:

- **`pending`**: Agendamento criado, aguardando confirmação
- **`confirmed`**: Agendamento confirmado pela barbearia
- **`completed`**: ✅ **Serviço realizado** (ÚNICO que permite review)
- **`cancelled`**: Agendamento cancelado

## 🎯 Fluxo Completo de Teste

### **Passo 1: Preparar Dados de Teste**
1. Crie uma barbearia
2. Faça login como cliente
3. Crie agendamentos com diferentes status

### **Passo 2: Testar Regra de Agendamento**
```
Status: pending/confirmed/cancelled → ❌ NÃO pode avaliar
Status: completed → ✅ PODE avaliar
```

### **Passo 3: Testar Regra de Review Único**
```
Primeira avaliação → ✅ PODE fazer
Segunda avaliação → ❌ NÃO pode fazer
```

### **Passo 4: Verificar Mensagens**
- **Sem agendamento**: "Você precisa ter pelo menos um agendamento concluído"
- **Sem agendamento concluído**: Mesma mensagem
- **Já fez review**: "Você também só pode fazer uma avaliação por barbearia"

## ⚡ Implementação Técnica

### **Firebase Queries Utilizadas:**
```typescript
// Verificar review existente
where("clientId", "==", userId)
where("barbershopId", "==", barbershopId)

// Verificar agendamento concluído
where("clientId", "==", userId)
where("barbershopId", "==", barbershopId)
where("status", "==", "completed")
```

### **Validação Dupla:**
1. **Frontend**: Verifica antes de mostrar formulário
2. **Envio**: Verifica novamente antes de salvar

## 🚀 Próximos Passos

Para completar o teste:

1. **Altere status de agendamentos** manualmente no Firebase
2. **Teste todos os cenários** descritos acima
3. **Verifique mensagens** de erro e sucesso
4. **Confirme integridade** das regras de negócio

---

**✅ Sistema de reviews agora protegido com regras de negócio robustas!**