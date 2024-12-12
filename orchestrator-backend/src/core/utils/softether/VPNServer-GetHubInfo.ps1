param ($hub_name, $account_pw)

$IS_ONLINE = "Online"
$hubs = vpncmd /SERVER localhost /PASSWORD:$account_pw /CMD HubList
$hubs = $hubs[14..($hubs.Length-1)]

$hub_exists = $False
$is_hub_online = $False

for(($i = 0); $i + 14 -lt ($hubs.Length); $i+=14) {   
    $current_hub_name =  $hubs[$i].Split("|")[1].Trim()
    
    if($hub_name -eq $current_hub_name) {
        $hub_exists = $True
        $is_hub_online = $hubs[$i + 1].Split("|")[1].Trim() -eq $IS_ONLINE

        break
    }

}

$a = [System.Collections.ArrayList]@()
[void]$a.add($hub_exists)
[void]$a.add($is_hub_online)

return $a