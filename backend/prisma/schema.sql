-- Create enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "EmployeeStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'ON_PROBATION', 'CONFIRMED', 'NOTICE_PERIOD', 'RESIGNED', 'TERMINATED', 'INACTIVE');
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');
CREATE TYPE "DocumentType" AS ENUM ('PROFILE_PHOTO', 'GOVERNMENT_ID', 'TAX_ID', 'RESUME', 'BANK_PROOF', 'EDUCATION', 'EXPERIENCE', 'OFFER_LETTER', 'OTHER');
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MISSING');
CREATE TYPE "AttendanceType" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY', 'WEEK_OFF');
CREATE TYPE "LeaveType" AS ENUM ('SICK_LEAVE', 'CASUAL_LEAVE', 'PAID_LEAVE', 'UNPAID_LEAVE', 'MATERNITY_LEAVE', 'PATERNITY_LEAVE');
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'PROCESSED', 'PAID');
CREATE TYPE "ProbationDecision" AS ENUM ('CONFIRM', 'EXTEND', 'TERMINATE');
CREATE TYPE "ProbationStatus" AS ENUM ('IN_PROGRESS', 'CONFIRMED', 'EXTENDED', 'TERMINATED');
CREATE TYPE "GoalStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TaxRegime" AS ENUM ('OLD', 'NEW');
CREATE TYPE "TaxDeclarationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- Create tables
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL UNIQUE,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "PasswordHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT
);

CREATE TABLE "Designation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT
);

CREATE TABLE "Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "workHours" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "employeeCode" TEXT NOT NULL UNIQUE,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phoneNumber" TEXT,
    "dateOfBirth" DATE,
    "gender" "Gender",
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "zipCode" TEXT,
    "departmentId" TEXT,
    "designationId" TEXT,
    "reportingManagerId" TEXT,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "confirmationDate" TIMESTAMP(3),
    "exitDate" TIMESTAMP(3),
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ONBOARDING',
    "probationEndDate" TIMESTAMP(3),
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "bankAccountNumber" TEXT,
    "bankName" TEXT,
    "bankIFSC" TEXT,
    "taxId" TEXT,
    "governmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    FOREIGN KEY ("userId") REFERENCES "User"("id"),
    FOREIGN KEY ("departmentId") REFERENCES "Department"("id"),
    FOREIGN KEY ("designationId") REFERENCES "Designation"("id"),
    FOREIGN KEY ("reportingManagerId") REFERENCES "Employee"("id")
);

CREATE TABLE "EmployeeDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "comments" TEXT,
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
);

CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "punchIn" TIMESTAMP(3),
    "punchOut" TIMESTAMP(3),
    "workHours" DOUBLE PRECISION,
    "attendanceType" "AttendanceType" NOT NULL DEFAULT 'ABSENT',
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "isEarlyDeparture" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "ipAddress" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
    UNIQUE ("employeeId", "date")
);

CREATE TABLE "Leave" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalDays" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
);

CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "allocated" DOUBLE PRECISION NOT NULL,
    "used" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    UNIQUE ("employeeId", "year", "leaveType")
);

CREATE TABLE "SalaryStructure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL UNIQUE,
    "ctc" DOUBLE PRECISION NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL,
    "specialAllowance" DOUBLE PRECISION NOT NULL,
    "pfEmployer" DOUBLE PRECISION NOT NULL,
    "pfEmployee" DOUBLE PRECISION NOT NULL,
    "professionalTax" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
);

CREATE TABLE "PayrollRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL,
    "specialAllowance" DOUBLE PRECISION NOT NULL,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "pfEmployee" DOUBLE PRECISION NOT NULL,
    "pfEmployer" DOUBLE PRECISION NOT NULL,
    "professionalTax" DOUBLE PRECISION NOT NULL,
    "tds" DOUBLE PRECISION NOT NULL,
    "otherDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
    UNIQUE ("employeeId", "month", "year")
);

CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payrollRecordId" TEXT NOT NULL UNIQUE,
    "pdfUrl" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("payrollRecordId") REFERENCES "PayrollRecord"("id") ON DELETE CASCADE
);

CREATE TABLE "ProbationReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL UNIQUE,
    "probationEndDate" DATE NOT NULL,
    "managerRecommendation" "ProbationDecision",
    "managerComments" TEXT,
    "managerSubmittedAt" TIMESTAMP(3),
    "hrDecision" "ProbationDecision",
    "hrComments" TEXT,
    "hrSubmittedAt" TIMESTAMP(3),
    "confirmationDate" DATE,
    "confirmationLetterUrl" TEXT,
    "status" "ProbationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
);

CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "targetDate" DATE NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
);

CREATE TABLE "PerformanceReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "goalId" TEXT,
    "reviewerId" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "reviewDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
    FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL
);

CREATE TABLE "TaxDeclaration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "regime" "TaxRegime" NOT NULL DEFAULT 'OLD',
    "section80C" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "section80D" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "section80G" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hraExemption" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "homeLoanInterest" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "TaxDeclarationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
    UNIQUE ("employeeId", "financialYear")
);

CREATE TABLE "TaxProof" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taxDeclarationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "proofUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("taxDeclarationId") REFERENCES "TaxDeclaration"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_refreshToken_idx" ON "Session"("refreshToken");
CREATE INDEX "PasswordHistory_userId_idx" ON "PasswordHistory"("userId");
CREATE INDEX "Attendance_employeeId_date_idx" ON "Attendance"("employeeId", "date");
CREATE INDEX "Leave_employeeId_status_idx" ON "Leave"("employeeId", "status");
CREATE INDEX "PayrollRecord_month_year_status_idx" ON "PayrollRecord"("month", "year", "status");

-- Create junction table for Shift-Department many-to-many relationship
CREATE TABLE "_DepartmentToShift" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    FOREIGN KEY ("A") REFERENCES "Department"("id") ON DELETE CASCADE,
    FOREIGN KEY ("B") REFERENCES "Shift"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "_DepartmentToShift_AB_unique" ON "_DepartmentToShift"("A", "B");
CREATE INDEX "_DepartmentToShift_B_index" ON "_DepartmentToShift"("B");
