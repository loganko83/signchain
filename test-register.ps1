# PowerShell 스크립트로 회원가입 테스트
$body = @{
    username = "testuser1"
    email = "test1@example.com" 
    password = "password123"
    fullName = "Test User"
}

$jsonBody = $body | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Body $jsonBody `
        -ContentType "application/json"
    
    Write-Host "Registration Success:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "Registration Failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
