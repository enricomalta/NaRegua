# WhatsApp Bot API - Payloads e Integracao

## Endpoint
- `POST /api/whatsapp`

## Autenticacao por secret key
Envie a chave no header (recomendado):
- `x-secret-key: SUA_SECRET_KEY`

Tambem e aceito no body:
- `secret_key: "SUA_SECRET_KEY"`

Variavel no servidor (Next.js):
- `WHATSAPP_BOT_SECRET_KEY`

## Formato base da requisicao
```json
{
  "action": "get_services",
  "secret_key": "SUA_SECRET_KEY",
  "payload": {}
}
```

## Acoes disponiveis

### 1) Ver servicos
Action: `get_services`

Payload:
```json
{
  "barbershopId": "uiI4qalMWN2oHuOoiFZh"
}
```

Exemplo curl:
```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-secret-key: SUA_SECRET_KEY" \
  -d '{
    "action": "get_services",
    "payload": {
      "barbershopId": "uiI4qalMWN2oHuOoiFZh"
    }
  }'
```

### 2) Ver precos
Action: `get_prices`

Payload:
```json
{
  "barbershopId": "uiI4qalMWN2oHuOoiFZh"
}
```

Exemplo curl:
```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-secret-key: SUA_SECRET_KEY" \
  -d '{
    "action": "get_prices",
    "payload": {
      "barbershopId": "uiI4qalMWN2oHuOoiFZh"
    }
  }'
```

### 3) Ver horarios disponiveis
Action: `get_available_slots`

Payload minimo:
```json
{
  "barbershopId": "uiI4qalMWN2oHuOoiFZh",
  "date": "2026-06-02"
}
```

Payload com servico especifico:
```json
{
  "barbershopId": "uiI4qalMWN2oHuOoiFZh",
  "date": "2026-06-02",
  "serviceId": "1"
}
```

Exemplo curl:
```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-secret-key: SUA_SECRET_KEY" \
  -d '{
    "action": "get_available_slots",
    "payload": {
      "barbershopId": "uiI4qalMWN2oHuOoiFZh",
      "date": "2026-06-02",
      "serviceId": "1"
    }
  }'
```

### 4) Agendar horario
Action: `book_appointment`

Payload:
```json
{
  "barbershopId": "uiI4qalMWN2oHuOoiFZh",
  "serviceId": "1",
  "date": "2026-06-02",
  "time": "10:30",
  "clientName": "Joao",
  "clientPhone": "5532999999999",
  "notes": "Preferencia por tesoura"
}
```

Campos:
- `barbershopId` obrigatorio
- `serviceId` obrigatorio
- `date` obrigatorio (YYYY-MM-DD)
- `time` obrigatorio (HH:mm)
- `clientId` opcional
- `clientName` opcional
- `clientPhone` opcional
- `notes` opcional

Exemplo curl:
```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-secret-key: SUA_SECRET_KEY" \
  -d '{
    "action": "book_appointment",
    "payload": {
      "barbershopId": "uiI4qalMWN2oHuOoiFZh",
      "serviceId": "1",
      "date": "2026-06-02",
      "time": "10:30",
      "clientName": "Joao",
      "clientPhone": "5532999999999"
    }
  }'
```

### 5) Cancelar agendamento
Action: `cancel_appointment`

Payload:
```json
{
  "bookingId": "BOOKING_ID_AQUI",
  "reason": "Cliente desistiu"
}
```

Exemplo curl:
```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-secret-key: SUA_SECRET_KEY" \
  -d '{
    "action": "cancel_appointment",
    "payload": {
      "bookingId": "BOOKING_ID_AQUI",
      "reason": "Cliente desistiu"
    }
  }'
```

## Exemplo de resposta de sucesso
```json
{
  "ok": true,
  "action": "get_services",
  "result": {
    "barbershopId": "uiI4qalMWN2oHuOoiFZh",
    "services": []
  }
}
```

## Exemplo de resposta de erro
```json
{
  "error": "unauthorized"
}
```

## Checklist de seguranca para producao
- Use apenas HTTPS (nunca HTTP em producao).
- Guarde a chave apenas em variavel de ambiente do servidor e no bot.
- Nao versionar a chave em git.
- Preferir envio da chave em header `x-secret-key`.
- Rotacionar a chave periodicamente.
- Implementar rate limit por IP ou por chave em camada de edge/proxy.
- Opcional recomendado: permitir apenas IPs fixos do servidor do bot (allowlist no proxy).
