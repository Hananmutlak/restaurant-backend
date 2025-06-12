# Backend – Milano Restaurant API

## Installation

För att använda detta backend behöver du ha Node.js , MongoDB  och npm  installerat. 
vi ska skapa .env och lägga denna 
PORT=5000
MONGODB_URI=mongodb://localhost:27017/milano
JWT_SECRET=your_jwt_secret_key
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5501


Starta utvecklingsservern med kommandot `npm start`, och backend-servern kommer att vara tillgänglig på `http://localhost:5000`.

## Konfiguration

Systemet använder MongoDB som databas. Anslutningssträngen ställs in i `.env`-filen med `MONGODB_URI`. JWT används för autentisering, och hemlig nyckel anges med `JWT_SECRET`. 
Variabeln `ALLOWED_ORIGINS` används för att tillåta CORS från angivna klienter.

## API-endpoints

### Autentisering

- `POST /api/auth/login` – Logga in användare och få en JWT-token  
  **Request body:**  
 {
    "email": "maya@hanan.com",
    "password": "123456"
  }
### Produkter
1_GET /api/products – Hämta alla produkter
2- GET /api/products/:id – Hämta en specifik produkt
3-POST /api/products – Lägg till ny produkt 
4-PUT /api/products/:id – Uppdatera produkt
 5-DELETE /api/products/:id – Radera produkt
  ### Bokningar
  1-GET /api/bookings – Hämta alla bokningar
  2-POST /api/bookings – Skapa ny bokning
3-PATCH /api/bookings/:id/status – Uppdatera bokningsstatus
4-DELETE /api/bookings/:id – Radera bokning
### Tekniker som används
1-Node.js
2-Express.js
3-MongoDB
4-Mongoose
5-(JWT)
6-CORS



  
