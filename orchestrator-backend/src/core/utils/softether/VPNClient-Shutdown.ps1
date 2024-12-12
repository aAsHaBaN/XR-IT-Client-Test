param ($accountName)

$disconnectSuccessMessage = "The command completed successfully."
$alreadyDisconnectedMessage = "The specified VPN Connection Setting is not connected."
$successResponse = '<PS-SCRIPT-RETURN>`n{"is_successful":true}'

Set-Location $PSScriptRoot
$res = vpncmd /CLIENT localhost /CMD AccountDisconnect $accountName

if($res[10] -eq $disconnectSuccessMessage) {
    "VPN Client disconnected"
    $successResponse
} elseif ($res[11] -eq $alreadyDisconnectedMessage) {
    "VPN Client already disconnected, continuing..."
    $successResponse
} else {
    throw "Error disconnecting VPN client."
}