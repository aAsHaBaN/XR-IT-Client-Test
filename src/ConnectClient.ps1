Set-Location $PSScriptRoot

$res = Get-ChildItem
$res

# LOG
Write-Output "Starting VPN service..."

# Ensure the VPN client service is started

try {
    vpncmd /CLIENT localhost /CMD ServiceStart
    Write-Host "If it shows error was not caught"
}
catch {
    $_.Exception | Format-List -Force
}

# Log each step
Write-Output "Creating VPN account..."

# Create the VPN account
vpncmd /CLIENT localhost /CMD AccountCreate XRIT /SERVER:192.87.95.201:5555 /HUB:XRIT /USERNAME:damika /NICNAME:VPN

Write-Output "Setting VPN account password..."

# Set the account password
vpncmd /CLIENT localhost /CMD AccountPasswordSet XRIT /PASSWORD:test /TYPE:standard

Write-Output "Starting VPN service..."

# Attempt to connect the VPN account
vpncmd /CLIENT localhost /CMD AccountConnect XRIT

Write-Output "Connecting to VPN..."

# Check the connection status
vpncmd /CLIENT localhost /CMD AccountStatusGet XRIT
