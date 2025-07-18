# PowerShell script to set up the admin system

# Check if the Supabase CLI is installed
$supabaseInstalled = $null
try {
    $supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
} catch {
    # Command not found
}

if ($supabaseInstalled) {
    Write-Host "Setting up admin system using Supabase CLI..." -ForegroundColor Green
    supabase db reset
    supabase db push
} else {
    Write-Host "Supabase CLI not found. Using direct database connection..." -ForegroundColor Yellow
    
    # Check if psql is installed
    $psqlInstalled = $null
    try {
        $psqlInstalled = Get-Command psql -ErrorAction SilentlyContinue
    } catch {
        # Command not found
    }
    
    if ($psqlInstalled) {
        Write-Host "Running setup script with psql..." -ForegroundColor Green
        
        # Prompt for database connection details
        $dbHost = Read-Host -Prompt "Enter database host (default: localhost)"
        if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }
        
        $dbPort = Read-Host -Prompt "Enter database port (default: 5432)"
        if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }
        
        $dbName = Read-Host -Prompt "Enter database name"
        $dbUser = Read-Host -Prompt "Enter database username"
        $dbPassword = Read-Host -Prompt "Enter database password" -AsSecureString
        
        # Convert secure string to plain text
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
        $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        
        # Set environment variables for psql
        $env:PGPASSWORD = $plainPassword
        
        # Run the SQL script
        psql -h $dbHost -p $dbPort -d $dbName -U $dbUser -f setup-admin-system.sql
        
        # Clear the password from environment
        $env:PGPASSWORD = ""
    } else {
        Write-Host "Neither Supabase CLI nor psql found. Please install one of these tools to run the setup script." -ForegroundColor Red
        Write-Host "Alternatively, you can run the SQL commands in setup-admin-system.sql manually in your database client." -ForegroundColor Yellow
    }
}

Write-Host "`nSetup complete. Default admin login:" -ForegroundColor Green
Write-Host "Email: admin@spendify.com" -ForegroundColor Cyan
Write-Host "Password: changeme" -ForegroundColor Cyan