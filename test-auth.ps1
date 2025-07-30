Write-Host "Testing authentication with test account..."

$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Request body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Login successful:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Login failed:"
    Write-Host "Exception: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)"
    }
}

Write-Host "Testing register first..."

$registerBody = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "Register successful:"
    $registerResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Register failed:"
    Write-Host "Exception: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)"
    }
}

Write-Host "Test completed."
