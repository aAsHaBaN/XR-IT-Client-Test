# Not requiring password protection for users at this time
param ($username, $password, $accountName, $hostName, $hubName, $adapterName)
#param ($username, $accountName, $hostName, $hubName, $cert_location, $key_location)

$ALREADY_CONNECTED_MESSAGE = 'The specified VPN Connection Setting is currently connected.'
$SUCCESSFUL_COMMAND = 'The command completed successfully.'


if ($null -eq $username) {
    throw "Must provide username for connecting user"
}
elseif ($null -eq $password) {
    throw "Must provide password for connecting user"
}
elseif ($null -eq $accountName) {
    throw "Must provide an account name"
}
elseif ($null -eq $hostName) {
    throw "Must provide a host name"
}
elseif ($null -eq $hubName) {
    throw "Must provide a hub name"
}

Set-Location $PSScriptRoot
$getVPNInfo = "./VPNClient-GetAccountInfo.ps1 -accountName " + $accountName

$res = Invoke-Expression $getVPNInfo
$matchAccountName = $res[0]

if ($matchAccountName -eq $Null) {
    vpncmd /CLIENT localhost /CMD AccountCreate $accountName /SERVER:$hostName /HUB:$hubName /USERNAME:$username /NICNAME:$adapterName
    
    #vpncmd /CLIENT localhost /CMD AccountCertSet $accountName /LOADCERT:$cert_location /LOADKEY:$key_location
    vpncmd /CLIENT localhost /CMD AccountPasswordSet $accountName /PASSWORD:$password /TYPE:standard
}
else {
    "A VPN connection with this account name already exists."
}