Documentation for MVN Animate Software remote control via UDP.

> [!INFO]
[UDP Documentation from Movella](https://base.movella.com/s/article/UDP-Remote-Control?language=en_US)

The UDP commands use case sensitive XML-like text-string containing ‘key-value’pairs. The commands are typically broadcast (e.g. destination IP-address <netmask>.255) over the network so all recording devices are triggered simultaneously, or sent to a specific IP-address.
*All fields are placed between double-quotes.*  
*The Boolean format takes the values "TRUE" or "FALSE".*  
*The Path format uses forward slashes.*

**Example:**
*The following gives an example of the command that starts a recording:*

```bash
<StartRecordingReq SessionName="C:/Xsens/MVN/session_01" StartTime="13 46 13 25" />
<IdentifyAck InstanceName=”MVN Studio A”>
<Address VALUE=”192.168.3.4” />
<Address VALUE=”CA:56:3D:23:45:67:67” />
</IdentifyAck>
```