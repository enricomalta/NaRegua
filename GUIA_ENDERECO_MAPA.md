# 🗺️ Guia - Novo Sistema de Endereço e Localização

## ✨ Novas Funcionalidades Implementadas

### 📍 **1. Campos de Endereço Detalhados**
Agora o cadastro de barbearias inclui campos separados:
- **Rua/Avenida**: Nome da rua
- **Número**: Número do estabelecimento  
- **Bairro**: Bairro onde está localizada
- **CEP**: Código postal (com busca automática!)
- **Cidade**: Nome da cidade
- **Estado**: Estado (UF)

### 🔍 **2. Busca Automática por CEP**
- Digite um CEP válido (8 dígitos)
- O sistema automaticamente preenche:
  - Rua/Avenida
  - Bairro  
  - Cidade
  - Estado
  - **Coordenadas geográficas precisas**

### 🗺️ **3. Seletor de Localização no Mapa**
- **Mapa interativo** para posicionamento preciso
- **Clique no mapa** para definir localização
- **Arraste o marcador** para ajustar posição
- **Buscar no Mapa**: Localiza automaticamente baseado no endereço
- **Coordenadas em tempo real**: Mostra lat/lng atual

## 🧪 Como Testar

### **Passo 1: Acesse o Cadastro**
```
http://localhost:3000/signup → Barbeiro → /barber/setup
```

### **Passo 2: Teste a Busca por CEP**
1. No campo **CEP**, digite: `01310-100`
2. Aguarde alguns segundos
3. ✅ Campos devem preencher automaticamente:
   - Rua: Avenida Paulista
   - Bairro: Bela Vista
   - Cidade: São Paulo
   - Estado: SP
   - **Coordenadas devem mudar no mapa**

### **Passo 3: Teste o Seletor de Mapa**
1. Clique em **"Buscar no Mapa"**
2. O mapa deve centralizar na localização
3. **Clique em outro ponto** do mapa
4. Veja as coordenadas mudarem
5. **Arraste o marcador vermelho** 📍
6. Coordenadas se atualizam em tempo real

### **Passo 4: Complete o Cadastro**
1. Preencha nome, descrição, serviços
2. Clique em **"Cadastrar Barbearia"**
3. ✅ Deve salvar com endereço detalhado e coordenadas precisas

## 🔧 APIs Utilizadas

### **ViaCEP**
- Busca informações por CEP brasileiro
- Retorna: rua, bairro, cidade, estado
- Gratuita e confiável

### **Nominatim (OpenStreetMap)**
- Conversão de endereço → coordenadas
- Geocoding gratuito
- Precisão boa para Brasil

## 🎯 Benefícios

### **Para Barbeiros**
- ✅ Cadastro mais rápido (CEP preenche tudo)
- ✅ Localização precisa no mapa
- ✅ Melhor visibilidade para clientes

### **Para Clientes**
- ✅ Encontram barbearias com precisão
- ✅ Endereços completos e organizados
- ✅ Navegação GPS mais precisa

## 🐛 Troubleshooting

### **CEP não preenche automaticamente**
- Verifique se tem 8 dígitos
- Teste com CEPs válidos: `01310-100`, `04038-001`
- Aguarde alguns segundos

### **Mapa não carrega**
- Verifique conexão com internet
- Recarregue a página (F5)
- Leaflet pode demorar alguns segundos

### **Coordenadas imprecisas**
- Use o seletor de mapa para ajustar
- Arraste o marcador para posição exata
- Coordenadas são salvas automaticamente

## 📊 Estrutura de Dados

```typescript
interface Barbershop {
  address: {
    street: "Avenida Paulista"
    number: "123"
    neighborhood: "Bela Vista"
    city: "São Paulo"
    state: "SP"
    zipCode: "01310-100"
    fullAddress: "Avenida Paulista, 123, Bela Vista, São Paulo, SP - 01310-100"
  }
  latitude: -23.5613
  longitude: -46.6565
}
```

Agora as barbearias têm localização precisa e endereços organizados! 🎉