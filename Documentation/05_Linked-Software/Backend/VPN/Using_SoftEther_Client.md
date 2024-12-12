
[Install the SoftEther Client here.](https://www.softether-download.com/en.aspx?product=softether)

All of the VPN scripts provide automated actions which can be manually executed using SoftEther's visual client, which is included as part of the prerequisite software. On the flip side, the visual client allows you to double check that scripts are operating as intended.

To connect to the VPN, open the SoftEther visual client, login and select:
'<b>Add VPN Connection</b>'

From there, a dialog will pop up and the values depend on whether you are in VLAB1 or outside of it. 

From outside, we use the Public Static IP of VLAB1 (192.87.95.201) and the dialog should be filled out as follows:

![[SoftEther_OutsideVLAB.png]]

Alternatively if you are on the same VLAN as the Dell Server (VLAB1), you will use the machines private IP (10.10.10.1) as such:

![[SoftEther_Inside_VLAB.png]]
