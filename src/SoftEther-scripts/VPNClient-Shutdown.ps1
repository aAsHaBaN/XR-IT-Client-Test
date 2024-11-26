param ($accountName)

Set-Location $PSScriptRoot
vpncmd /CLIENT localhost /CMD AccountDisconnect $accountName