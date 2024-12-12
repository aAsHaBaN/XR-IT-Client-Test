param ($accountName)

$ALREADY_CONNECTED_MESSAGE = 'The specified VPN Connection Setting is currently connected.'
$SUCCESSFUL_COMMAND = 'The command completed successfully.'

if ($null -eq $accountName) {
    throw "Must provide an account name"
}

Set-Location $PSScriptRoot
$get_vpn_info = "./VPNClient-GetAccountInfo.ps1 -accountName " + $accountName
$res = Invoke-Expression $get_vpn_info

$accountName = $res[0]
$hostName = $res[1]

if ($accountName -eq $null) {
    throw "This VPN account does not exist, please check your configuration."
} else {
    $res = vpncmd /CLIENT localhost /CMD AccountConnect $accountName

    if ($res.Length -eq 12 -and $res[10].Trim() -eq $SUCCESSFUL_COMMAND) {
        "Connected to host: " + $hostName
    }
    elseif ($res.Length -eq 12 -and $res[11].Trim() -eq $ALREADY_CONNECTED_MESSAGE) {
        "You are already connected to this host."
    }
    else {
        "Error in connecting to the host."
    }
}