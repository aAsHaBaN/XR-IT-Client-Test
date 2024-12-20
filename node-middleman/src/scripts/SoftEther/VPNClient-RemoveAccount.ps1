param ($accountName)

$NOT_CONNECTED_MESSAGE = "The specified VPN Connection Setting is not connected."

Set-Location $PSScriptRoot
$get_vpn_info = "./VPNClient-GetAccountInfo.ps1 -accountName " + $accountName
$res = Invoke-Expression $get_vpn_info

$accountName = $res[0]
$isConnected = $res[1]

if($accountName -eq $False) {
    "You are not registered with the specified VPN."
} else {
    $getAccountStatus = "vpncmd /CLIENT localhost /CMD AccountStatusGet " + $accountName
    $getStatusRes = Invoke-Expression $getAccountStatus
    
    $isConnected = $getStatusRes[11].Trim() -ne $NOT_CONNECTED_MESSAGE
    
    if($isConnected -eq $True) {
        vpncmd /CLIENT localhost /CMD AccountDisconnect $accountName
    } 

    vpncmd /CLIENT localhost /CMD AccountDelete $accountName    
}