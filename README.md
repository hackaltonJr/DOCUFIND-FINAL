# DocuFind Backend

Project overview
- A backend API for DocuFind built with Express and MongoDB.

Prerequisites
- Node.js 18+ and npm
- MongoDB (local or remote)

Setup
1. Clone the repository:
   git clone <repo-url>
   cd <repo-folder>

2. Copy environment example:
   cp .env.example .env
   Edit `.env` to configure MONGODB_URI, PORT, TRUSTED_ORIGINS as needed.

3. Install dependencies:
   npm install

4. Development run:
   npm run dev

5. Production run:
   npm start

Database seeding
- To insert sample data run:
  npm run seed
  or
  node scripts/seed.js

Docker
- Build:
  docker build -t docufind-backend .
- Run:
  docker run -e MONGODB_URI="mongodb://host:27017/docufind" -p 5000:5000 docufind-backend

Testing
- Run tests with:
  npm test

API Usage
- Base URL for frontend integration (example for Next.js):
  NEXT_PUBLIC_API_URL=http://localhost:5000/api

Postman
- Postman collection available at docs/postman_collection.json (import into Postman and set baseUrl variable to http://localhost:5000/api)

Contributing
- Contributions are welcome. Please open issues or PRs.

License
- MIT
