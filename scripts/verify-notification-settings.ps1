$baseUrl = "http://localhost:3000"

# 1. Add Repo
$repoName = "antigravity/verification-test"
Write-Host "1. Creating Repo: $repoName..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/repos" -Method Post -Body (@{ repoName = $repoName } | ConvertTo-Json) -ContentType "application/json"
    $token = $response.apiToken
    Write-Host "   -> Created Repo with Token: $token"
} catch {
    Write-Error "   -> Failed to create repo. Is the server running?"
    exit
}

if (-not $token) {
    Write-Error "   -> No token received."
    exit
}

# Get Repo ID
Write-Host "2. Fetching Repo ID..."
$repos = Invoke-RestMethod -Uri "$baseUrl/api/repos" -Method Get
$repo = $repos | Where-Object { $_.repoName -eq $repoName }
$repoId = $repo.id
Write-Host "   -> Repo ID: $repoId"

# 2. Update Settings: Allow ONLY "pr_opened"
Write-Host "3. Updating Settings: Allow ONLY 'pr_opened'..."
$settings = @{
    id = $repoId
    allowedEvents = @("pr_opened")
    messageTemplate = "VERIFIED: {pr.title} by {pr.author}"
    groupIds = @() # Empty array = All groups (legacy behavior) or None? Code says empty -> all active groups.
}
Invoke-RestMethod -Uri "$baseUrl/api/repos" -Method Patch -Body ($settings | ConvertTo-Json) -ContentType "application/json"
Write-Host "   -> Settings Updated."

# 3. Test ALLOWED Event
Write-Host "4. Testing ALLOWED Event (pr_opened)..."
$payloadAllowed = @{
    token = $token
    event = "pr_opened"
    repo = $repoName
    title = "Allow This"
    author = "Tester"
    url = "http://test.com"
}
try {
    $resAllowed = Invoke-RestMethod -Uri "$baseUrl/api/notify/github" -Method Post -Body ($payloadAllowed | ConvertTo-Json) -ContentType "application/json"
    Write-Host "   -> Response: $($resAllowed | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "   -> Failed: $_"
}

# 4. Test IGNORED Event
Write-Host "5. Testing IGNORED Event (pr_merged)..."
$payloadIgnored = @{
    token = $token
    event = "pr_merged"
    repo = $repoName
    title = "Ignore This"
    author = "Tester"
    url = "http://test.com"
}
try {
    $resIgnored = Invoke-RestMethod -Uri "$baseUrl/api/notify/github" -Method Post -Body ($payloadIgnored | ConvertTo-Json) -ContentType "application/json"
    Write-Host "   -> Response: $($resIgnored | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "   -> Failed: $_"
}

# 5. Cleanup
Write-Host "6. Cleaning Up..."
Invoke-RestMethod -Uri "$baseUrl/api/repos" -Method Delete -Body (@{ id = $repoId } | ConvertTo-Json) -ContentType "application/json"
Write-Host "   -> Deleted Repo."
