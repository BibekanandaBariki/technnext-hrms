# TechNext HRMS & Employee Portal

A comprehensive Human Resource Management System (HRMS) built with NestJS (Backend) and Next.js (Frontend).

## 🚀 Features

- **Employee Management**: Onboarding, Profiles, Document Management.
- **Attendance Tracking**: Geo-fenced Punch In/Out, Work Hours Calculation.
- **Leave Management**: Leave Applications, Approval Workflows, Balance Tracking.
- **Payroll Processing**: Salary Structure Configuration, Monthly Payslip Generation, PDF Downloads.
- **Performance Management**: Goal Setting (OKRs), Quarterly Reviews.
- **Tax Management**: Investment Declarations, Tax Regime Selection.
- **Role-Based Access Control (RBAC)**: secure access for Admin, HR, Manager, and Employees.

## 🛠️ Tech Stack

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks
- **HTTP Client**: Axios

## 📦 Prerequisites

- Node.js (v18 or later)
- Docker & Docker Compose (for database)
- PostgreSQL (if not using Docker)

## 🏃‍♂️ Getting Started

### 1. clone the repository
```bash
git clone <repository-url>
cd technnext-hrms
```

### 2. Infrastructure Setup (Database)
Start the PostgreSQL and Redis containers:
```bash
docker-compose up -d
```

### 3. Backend Setup
Navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

Install dependencies:
\`\`\`bash
npm install
\`\`\`

Configure Environment Variables:
Copy `.env.example` to `.env` (or create one) and set your database URL and JWT secret.
\`\`\`env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hrms?schema=public"
JWT_SECRET="super-secret-key"
JWT_ACCESS_EXPIRY="15m"
PORT=3001
\`\`\`

Run Database Migrations:
\`\`\`bash
npx prisma migrate dev
\`\`\`

Start the Backend Server:
\`\`\`bash
npm run start:dev
\`\`\`
The API will be available at `http://localhost:3001`.
Swagger Docs: `http://localhost:3001/api/docs`.

### 4. Frontend Setup
Navigate to the frontend directory:
\`\`\`bash
cd ../frontend
\`\`\`

Install dependencies:
\`\`\`bash
npm install
\`\`\`

Configure Environment Variables:
Create `.env.local`:
\`\`\`env
NEXT_PUBLIC_API_URL="http://localhost:3001"
\`\`\`

Start the Frontend Development Server:
\`\`\`bash
npm run dev
\`\`\`
The application will be available at `http://localhost:3000`.

## 🧪 Testing

### Backend
\`\`\`bash
cd backend
npm run test       # Unit tests
npm run test:e2e   # End-to-end tests
\`\`\`

## 📚 API Documentation

The backend includes a fully documented Swagger interface.
Visit \`http://localhost:3001/api/docs\` after starting the backend to explore the API endpoints.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
