# Estrutura do Banco de Dados Firebase - Na Regua

## Coleções Principais

### 1. `users` (Usuários)
```
users/{userId}
{
  id: string,
  email: string,
  name: string,
  role: "client" | "barber" | "admin",
  avatar?: string,
  phone?: string,
  createdAt: timestamp,
  
  // Sub-coleção para empregos em barbearias
  employments: {
    [barbershopId]: {
      barbershopId: string,
      barbershopName: string,
      role: "owner" | "manager" | "barber" | "receptionist",
      joinedAt: timestamp,
      isActive: boolean,
      permissions: {
        viewBookings: boolean,
        createBookings: boolean,
        editBookings: boolean,
        cancelBookings: boolean,
        viewServices: boolean,
        createServices: boolean,
        editServices: boolean,
        deleteServices: boolean,
        viewEmployees: boolean,
        inviteEmployees: boolean,
        editEmployees: boolean,
        removeEmployees: boolean,
        viewReports: boolean,
        viewRevenue: boolean,
        editBarbershop: boolean,
        manageBarbershop: boolean
      }
    }
  }
}
```

### 2. `barbershops` (Barbearias)
```
barbershops/{barbershopId}
{
  id: string,
  name: string,
  description: string,
  ownerId: string,
  address: {
    street: string,
    number: string,
    neighborhood: string,
    city: string,
    state: string,
    zipCode: string,
    fullAddress: string
  },
  latitude: number,
  longitude: number,
  phone: string,
  images: string[],
  rating: number,
  reviewCount: number,
  services: Service[],
  workingHours: WorkingHours,
  createdAt: timestamp,
  
  // Funcionários como sub-coleção
  employees: {
    [userId]: {
      userId: string,
      name: string,
      email: string,
      avatar?: string,
      phone?: string,
      role: "owner" | "manager" | "barber" | "receptionist",
      joinedAt: timestamp,
      isActive: boolean,
      permissions: EmployeePermissions
    }
  }
}
```

### 3. `bookings` (Agendamentos)
```
bookings/{bookingId}
{
  id: string,
  clientId: string,
  barbershopId: string,
  serviceId: string,
  barberId?: string, // ID do barbeiro que vai atender
  date: timestamp,
  time: string,
  status: "pending" | "confirmed" | "completed" | "cancelled",
  createdAt: timestamp,
  notes?: string
}
```

### 4. `reviews` (Avaliações)
```
reviews/{reviewId}
{
  id: string,
  clientId: string,
  clientName: string,
  clientAvatar?: string,
  barbershopId: string,
  rating: number,
  comment: string,
  createdAt: timestamp
}
```

### 5. `employee-invitations` (Convites para Funcionários)
```
employee-invitations/{invitationId}
{
  id: string,
  barbershopId: string,
  barbershopName: string,
  invitedEmail: string,
  invitedBy: string,
  role: "owner" | "manager" | "barber" | "receptionist",
  permissions: EmployeePermissions,
  status: "pending" | "accepted" | "rejected" | "expired",
  createdAt: timestamp,
  expiresAt: timestamp
}
```

## Índices Recomendados

1. **users**
   - email (único)
   - role
   - employments.{barbershopId}

2. **barbershops**
   - ownerId
   - city
   - state
   - rating
   - employees.{userId}

3. **bookings**
   - clientId
   - barbershopId
   - barberId
   - date
   - status
   - barbershopId + date (composto)

4. **reviews**
   - barbershopId
   - clientId
   - rating
   - createdAt

5. **employee-invitations**
   - barbershopId
   - invitedEmail
   - status
   - expiresAt

## Regras de Segurança Sugeridas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler e editar seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Barbearias - leitura pública, escrita para proprietários/funcionários
    match /barbershops/{barbershopId} {
      allow read: if true;
      allow write: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        resource.data.employees[request.auth.uid].isActive == true
      );
    }
    
    // Agendamentos - acesso baseado em relacionamento
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && (
        resource.data.clientId == request.auth.uid ||
        // Verificar se é funcionário da barbearia
        exists(/databases/$(database)/documents/barbershops/$(resource.data.barbershopId)) &&
        get(/databases/$(database)/documents/barbershops/$(resource.data.barbershopId)).data.employees[request.auth.uid].isActive == true
      );
    }
    
    // Avaliações - leitura pública, escrita para clientes
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.clientId;
    }
    
    // Convites - acesso para destinatários e remetentes
    match /employee-invitations/{invitationId} {
      allow read, write: if request.auth != null && (
        resource.data.invitedEmail == request.auth.token.email ||
        resource.data.invitedBy == request.auth.uid
      );
    }
  }
}
```

## Exemplo de Documento de Usuário Completo

```json
{
  "id": "2jP9GIsXYMW0lEp7wdQySyhwKp02",
  "email": "barbeiro@example.com",
  "name": "João Silva",
  "role": "barber",
  "avatar": "https://example.com/avatar.jpg",
  "phone": "32987062817",
  "createdAt": "2025-10-19T20:31:45.000Z",
  "employments": {
    "barbershop-123": {
      "barbershopId": "barbershop-123",
      "barbershopName": "Barbearia Teste",
      "role": "owner",
      "joinedAt": "2025-10-19T20:31:45.000Z",
      "isActive": true,
      "permissions": {
        "viewBookings": true,
        "createBookings": true,
        "editBookings": true,
        "cancelBookings": true,
        "viewServices": true,
        "createServices": true,
        "editServices": true,
        "deleteServices": true,
        "viewEmployees": true,
        "inviteEmployees": true,
        "editEmployees": true,
        "removeEmployees": true,
        "viewReports": true,
        "viewRevenue": true,
        "editBarbershop": true,
        "manageBarbershop": true
      }
    }
  }
}
```