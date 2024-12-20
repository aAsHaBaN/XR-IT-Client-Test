param ($adapterName, $adapterIP, $subnetMask)

$SUCCESS_MESSAGE = "The command completed successfully."

if($null -eq $adapterIP) {
    throw "Must provide a static IP."
} elseif($null -eq $subnetMask) {
    throw "Must provide a subnet mask."
} elseif($null -eq $adapterName) {
    throw "Must provide an adapter name."
}

$getAdapterResponse = vpncmd /CLIENT localhost /CMD NicGetSetting $adapterName

if($getAdapterResponse.Length -eq 12) {
    $createAdapterResponse = vpncmd /CLIENT localhost /CMD NicCreate $adapterName
    $successMessage = $createAdapterResponse[10]
    
    if($successMessage -ne $SUCCESS_MESSAGE) {
        throw "Creating VPN adapter was unsuccessful."
    }

    $fulladapterName = $adapterName + " - VPN Client"
    $formattedIP = [IPAddress]$adapterIP.Trim()
    $formattedSubnet = [IPAddress]$subnetMask.Trim()

    netsh interface ipv4 set address name=$fulladapterName static $formattedIP $formattedSubnet
} else {
    "VPN Adapter with this name already exists, continuing."
}

