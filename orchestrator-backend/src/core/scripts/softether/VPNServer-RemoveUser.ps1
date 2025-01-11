param ($hub_name, $account_pw, $hub_pw, $username)
$USER_DELETED_MESSAGE = "The command completed successfully."
$USER_NOT_FOUND_MESSAGE = "Object not found."

if($null -eq $hub_name) {
    throw "Must provide a hub name to create"
} elseif($null -eq $account_pw) {
    throw "Must provide account password"
} elseif($null -eq $hub_pw) {
    throw "Must provide a hub password"
} elseif($null -eq $username) {
    throw "Must provide a username"
}

Set-Location $PSScriptRoot
$get_hub_info = "./VPNServer-GetHubInfo.ps1 -hub_name " + $hub_name + " -account_pw " + $account_pw
$hub_info = Invoke-Expression $get_hub_info

$hub_exists = $hub_info[0]

if($hub_exists -eq $False) {
    throw "Hub does not exist."
} else {    
    $res = vpncmd /SERVER localhost /HUB:$hub_name /PASSWORD:$hub_pw  /CMD UserDelete $username

    if($res[12].Trim() -eq $USER_DELETED_MESSAGE) {
        "Deleted user."
        
        $successResponse = '{"is_successful":true}'
        [string]::Format("<PS-SCRIPT-RETURN>`n{0}", $successResponse)
    } elseif($res[13].Trim() -eq $USER_NOT_FOUND_MESSAGE) {
        throw "User does not exist."
    } else {
        throw $res
    }
}