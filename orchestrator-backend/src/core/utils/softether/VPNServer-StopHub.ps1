param ($hub_name, $account_pw, $hub_pw)

if($null -eq $hub_name) {
    throw "Must provide a hub name to create"
} elseif($null -eq $account_pw) {
    throw "Must provide account password"
} elseif($null -eq $hub_pw) {
    throw "Must provide a hub password"
}

Set-Location $PSScriptRoot
$get_hub_info = "./VPNServer-GetHubInfo.ps1 -hub_name " + $hub_name + " -account_pw " + $account_pw
$res = Invoke-Expression $get_hub_info

Set-Location $PSScriptRoot
$hub_exists = $res[0]
$is_hub_online = $res[1]
$successResponse = '<PS-SCRIPT-RETURN>`n{"is_successful":true}'

if($hub_exists -eq $False) {
    throw "Hub does not exist."
} elseif($is_hub_online -eq $False) {
    "Hub is already offline, continuing..."
    $successResponse
} else {    
    vpncmd /SERVER localhost /HUB:$hub_name /PASSWORD:$hub_pw /CMD Offline
    "Hub offline."
    $successResponse
}