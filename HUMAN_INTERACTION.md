# Human Interaction Guide: Setting Up TechNext HRMS

This guide provides a step-by-step process to get the TechNext HRMS portal fully operational on your local machine.

## Prerequisites
Ensure the following are installed on your system:
- **Node.js**: v18 or later ([Download](https://nodejs.org/))
- **Docker Desktop**: For running PostgreSQL and Redis ([Download](https://www.docker.com/products/docker-desktop/))
- **Git**: Version control ([Download](https://git-scm.com/))

---

## Step 1: Clone and Prepare
1.  Open your terminal.
2.  Clone the repository (if you haven't already):
    ```bash
    git clone <repository-url>
    cd technnext-hrms
    ```

## Step 2: Database Infrastructure
We use Docker to run the database and cache.

1.  Start the infrastructure:
    ```bash
    docker-compose up -d
    \`\`\`
2.  Verify containers are running:
    \`\`\`bash
    docker ps
    \`\`\`
    You should see `postgres` and `redis` containers active.

## Step 3: Backend Setup (NestJS)
Configuring the server API.

1.  Navigate to the backend directory:
    \`\`\`bash
    cd backend
    \`\`\`
2.  Install dependencies:
    \`\`\`bash
    npm install
    \`\`\`
3.  **Environment Variables**:
    Create a `.env` file in the `backend/` directory with the following content:
    \`\`\`env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hrms?schema=public"
    JWT_SECRET="replace-with-a-very-secure-random-string"
    JWT_ACCESS_EXPIRY="15m"
    PORT=3001
    \`\`\`
    > **Note**: Change `JWT_SECRET` to a strong random string for security.

4.  **Database Migration**:
    Apply the database schema:
    \`\`\`bash
    npx prisma migrate dev --name init
    ```

5.  **Seed Initial Data**:
    Create an Admin user and sample data:
    ```bash
    npx prisma db seed
    ```
    *This creates user: `admin@technnexthrms.com` / password: `admin123`*

6.  **Start the Server**:
    ```bash
    npm run start:dev
    ```
    The backend should now be running at `http://localhost:3001`.

## Step 4: Frontend Setup (Next.js)
Setting up the user interface.

1.  Open a **new terminal window** (keep backend running).
2.  Navigate to the frontend directory:
    \`\`\`bash
    cd frontend
    \`\`\`
3.  Install dependencies:
    \`\`\`bash
    npm install
    \`\`\`
4.  **Environment Variables**:
    Create a `.env.local` file in the `frontend/` directory:
    \`\`\`env
    NEXT_PUBLIC_API_URL="http://localhost:3001"
    \`\`\`

5.  **Start the Client**:
    \`\`\`bash
    npm run dev
    \`\`\`
    The application will be accessible at `http://localhost:3000`.

## Step 5: Verification & First Login
1.  Open your browser to [http://localhost:3000](http://localhost:3000).
2.  You should see the Login Page.
3.  Login with the default Admin credentials:
    - **Email**: `admin@technnexthrms.com`
    - **Password**: `admin123`
4.  You will be redirected to the **Dashboard**.

## Troubleshooting
- **Database Connection Error**: Ensure Docker is running and port 5432 is not blocked. Check `docker logs` for the postgres container.
- **Build Errors**: Try deleting `node_modules` and running `npm install` again in the respective directory.
- **Prisma Errors**: Run `npx prisma generate` in the `backend` folder to regenerate the client.

---
**System is now fully operational!** 🚀
