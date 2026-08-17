# Script to test Admin Overview Dashboard & Admin APIs via Gateway

$baseUrl = "http://localhost:8080"
$adminEmail = "admin_$(Get-Random)@nixtap.com"
$adminPassword = "AdminPassword123!"

Write-Host "=========================================="
Write-Host "1. Registering new user for Admin testing"
Write-Host "=========================================="
$regBody = @{
    fullName = "System Administrator"
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    $userId = $regResponse.data.userId
    Write-Host "[SUCCESS] Registered User ID: $userId"
    
    # Update user role to ADMIN in MySQL auth_db
    $mysqlCmd = "`$env:MYSQL_PWD='Yadav@12345'; & 'C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe' -u root -e 'USE auth_db; UPDATE users SET role=''ADMIN'' WHERE id=$userId;'"
    powershell -Command $mysqlCmd
    Write-Host "[SUCCESS] Updated Role to ADMIN in auth_db for User ID $userId"
} catch {
    Write-Host "[FAIL] Registration error: $($_.Exception.Message)"
}

Write-Host "`n=========================================="
Write-Host "2. Logging in as Admin"
Write-Host "=========================================="
$loginBody = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

$adminToken = $null
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $adminToken = $loginResponse.data.accessToken
    Write-Host "[SUCCESS] Admin Logged In. JWT Token acquired."
} catch {
    Write-Host "[FAIL] Admin Login error: $($_.Exception.Message)"
}

Write-Host "`n=========================================="
Write-Host "3. Testing /api/v1/admin/dashboard (Admin Overview)"
Write-Host "=========================================="
if ($adminToken) {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    try {
        $dashResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/dashboard" -Method Get -Headers $headers
        Write-Host "[SUCCESS] Admin Dashboard Overview Response:"
        Write-Host ($dashResponse | ConvertTo-Json -Depth 5)
    } catch {
        Write-Host "[FAIL] Admin Dashboard Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host "Response Body: $($reader.ReadToEnd())"
        }
    }

    Write-Host "`n=========================================="
    Write-Host "4. Testing /api/v1/admin/users (User Management)"
    Write-Host "=========================================="
    try {
        $usersResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/users" -Method Get -Headers $headers
        Write-Host "[SUCCESS] Admin Users Response:"
        Write-Host ($usersResponse | ConvertTo-Json -Depth 5)
    } catch {
        Write-Host "[FAIL] Admin Users Error: $($_.Exception.Message)"
    }

    Write-Host "`n=========================================="
    Write-Host "5. Testing /api/v1/admin/cards (Business Card Management)"
    Write-Host "=========================================="
    try {
        $cardsResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/cards" -Method Get -Headers $headers
        Write-Host "[SUCCESS] Admin Cards Response:"
        Write-Host ($cardsResponse | ConvertTo-Json -Depth 5)
    } catch {
        Write-Host "[FAIL] Admin Cards Error: $($_.Exception.Message)"
    }

    Write-Host "`n=========================================="
    Write-Host "6. Testing /api/v1/admin/audit-logs (Audit Logs)"
    Write-Host "=========================================="
    try {
        $auditResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/audit-logs" -Method Get -Headers $headers
        Write-Host "[SUCCESS] Admin Audit Logs Response:"
        Write-Host ($auditResponse | ConvertTo-Json -Depth 5)
    } catch {
        Write-Host "[FAIL] Admin Audit Logs Error: $($_.Exception.Message)"
    }
}
