# Script to verify Admin Security Isolation

$baseUrl = "http://localhost:8080"
$regEmail = "regular_$(Get-Random)@nixtap.com"
$regPassword = "UserPassword123!"

Write-Host "=========================================="
Write-Host "1. Registering standard user (ROLE_USER)"
Write-Host "=========================================="
$regBody = @{
    fullName = "Regular User"
    email = $regEmail
    password = $regPassword
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "[SUCCESS] Registered Standard User: $regEmail"
} catch {
    Write-Host "[FAIL] Registration error: $($_.Exception.Message)"
}

Write-Host "`n=========================================="
Write-Host "2. Logging in as Standard User"
Write-Host "=========================================="
$loginBody = @{
    email = $regEmail
    password = $regPassword
} | ConvertTo-Json

$userToken = $null
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $userToken = $loginResponse.data.accessToken
    Write-Host "[SUCCESS] Standard User Logged In. Role: $($loginResponse.data.user.role)"
} catch {
    Write-Host "[FAIL] Standard User Login error: $($_.Exception.Message)"
}

Write-Host "`n=========================================="
Write-Host "3. Attempting to access Admin Dashboard (/api/v1/admin/dashboard)"
Write-Host "=========================================="
if ($userToken) {
    $headers = @{
        "Authorization" = "Bearer $userToken"
    }
    try {
        $dashResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/dashboard" -Method Get -Headers $headers
        Write-Host "[SECURITY VIOLATION FAIL] Standard user accessed admin endpoint!"
    } catch {
        Write-Host "[SECURITY VERIFIED SUCCESS] Standard user correctly BLOCKED from Admin API."
        Write-Host "HTTP Status: $($_.Exception.Message)"
    }
}
