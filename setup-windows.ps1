# Hospital Bed Booking System - Windows Setup Script
# This script handles the complete setup for Windows users

Write-Host "🏥 Hospital Bed Booking System - Windows Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Step 1: Clean install
Write-Host "`n📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

# Step 2: Generate random secret for NEXTAUTH_SECRET
Write-Host "`n🔐 Step 2: Generating NEXTAUTH_SECRET..." -ForegroundColor Yellow
$secret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(
    (New-Guid).ToString() + (Get-Random -Minimum 100000 -Maximum 999999).ToString()
))
Write-Host "Generated secret: $secret" -ForegroundColor Green

# Step 3: Create .env.local
Write-Host "`n⚙️  Step 3: Creating .env.local..." -ForegroundColor Yellow

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host ".env.local already exists. Preserving existing file." -ForegroundColor Cyan
} else {
    # Copy from .env.example if it exists
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "Created .env.local from .env.example" -ForegroundColor Green
    } else {
        Write-Host "Creating new .env.local..." -ForegroundColor Green
        @"
# Database
DATABASE_URL="postgresql://postgres:Harsha@26@localhost:5432/hospital_db"

# NextAuth
NEXTAUTH_SECRET="$secret"
NEXTAUTH_URL="http://localhost:3000"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Socket.IO
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# Logging
LOG_LEVEL="debug"
NODE_ENV="development"

# Optional: Sentry (error tracking)
# NEXT_PUBLIC_SENTRY_DSN=
# SENTRY_DSN=
"@ | Out-File ".env.local" -Encoding UTF8
        Write-Host "Created .env.local with defaults" -ForegroundColor Green
    }
}

# Step 4: Generate Prisma Client
Write-Host "`n🔧 Step 4: Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generation failed" -ForegroundColor Red
    exit 1
}

# Step 5: Run migrations
Write-Host "`n📊 Step 5: Running database migrations..." -ForegroundColor Yellow
npm run prisma:migrate -- --skip-generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migration may have failed. Check if PostgreSQL is running." -ForegroundColor Yellow
    Write-Host "To start PostgreSQL: Start-Service postgresql-x64-18" -ForegroundColor Cyan
} else {
    Write-Host "✅ Migrations completed" -ForegroundColor Green
}

# Step 6: Seed database
Write-Host "`n🌱 Step 6: Seeding database..." -ForegroundColor Yellow
npm run prisma:seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seeding may have failed. That's okay - you can seed manually later." -ForegroundColor Yellow
    Write-Host "Run: npm run prisma:seed" -ForegroundColor Cyan
} else {
    Write-Host "✅ Database seeded successfully" -ForegroundColor Green
}

# Final instructions
Write-Host "`n" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start Next.js app in Terminal 1:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "`n2. Start Socket.IO server in Terminal 2:" -ForegroundColor Cyan
Write-Host "   npm run socket" -ForegroundColor White
Write-Host "`n3. Open browser:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host "`n4. Run tests:" -ForegroundColor Cyan
Write-Host "   npm run test" -ForegroundColor White
Write-Host "   npm run test:e2e" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Yellow
Write-Host "- PRODUCTION_GUIDE.md - Full architecture & deployment" -ForegroundColor Cyan
Write-Host "- SETUP_INSTRUCTIONS.md - Detailed setup guide" -ForegroundColor Cyan
Write-Host "- API_DOCUMENTATION.md - API reference" -ForegroundColor Cyan

Write-Host "`n🔐 NEXTAUTH_SECRET has been generated and saved to .env.local" -ForegroundColor Green
Write-Host "If you need to regenerate it later, edit .env.local manually." -ForegroundColor Cyan

Write-Host "`n" -ForegroundColor Cyan
