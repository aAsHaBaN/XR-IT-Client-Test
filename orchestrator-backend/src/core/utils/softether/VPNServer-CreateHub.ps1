param ($hub_name, $account_pw, $hub_pw)

if($null -eq $hub_name) {
    throw "Must provide a hub name to create"
} elseif($null -eq $account_pw) {
    throw "Must provide account password"
} elseif($null -eq $hub_pw) {
    throw "Must provide a hub password"
}

Set-Location $PSScriptRoot
$get_hub_info = ".\VPNServer-GetHubInfo.ps1 -hub_name " + $hub_name + " -account_pw " + $account_pw
$res = Invoke-Expression $get_hub_info

$hub_exists = $res[0]

if($hub_exists)  {
    throw "Hub with name " + $hub_name + " already exists."

} else {
    vpncmd /SERVER localhost /PASSWORD:$account_pw /CMD HubCreate $hub_name /PASSWORD:$hub_pw
    "Hub created."
    $successResponse = '{"is_successful":true}'
    [string]::Format("<PS-SCRIPT-RETURN>`n{0}", $successResponse)
}