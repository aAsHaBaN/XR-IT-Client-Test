param ($accountName)

if ($null -eq $accountName) {
    throw "Must provide account name"
}

$accountInfo = vpncmd /CLIENT localhost /CMD AccountGet $accountName
$a = [System.Collections.ArrayList]@()

if ($accountInfo.Length -gt 12) {
    $hostname = $accountInfo[13].Split("|")[1].Trim()
    
    [void]$a.add($accountName)
    [void]$a.add($hostname)

}
else {
    [void]$a.add($null)
    [void]$a.add($null)
}

return $a