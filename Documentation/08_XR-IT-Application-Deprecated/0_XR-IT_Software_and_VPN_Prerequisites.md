
To run the XR-IT Software which currently contains scripts which setup the VPN automatically, you will need to complete the following prerequisites.

1. <b>Download the following prerequisite software</b>

[Git](https://git-scm.com/downloads)
[Node.js](https://nodejs.org/en)
[SoftEther Client*](https://www.softether-download.com/en.aspx?product=softether)
   
   \*Select Softhether Client for Windows. If you are running on another OS (particularly Mac), better to use a VM as SoftEther for Mac is experimental and quite unreliable

<br/>
2.<b> Install the source code</b>

Once the prerequisite software is downloaded execute the following command in the Command Line. Do this in a place where you would like to store the XR-IT repo, such as C:/Documents

```
git clone https://TransRealities@dev.azure.com/TransRealities/XR-IT/_git/XR-IT
```
<br/>
There is a chance that you will be prompted for your username and password. While the username is your DAE email, the password is different. 

[Navigate to this page](https://dev.azure.com/TransRealities/XR-IT/_git/XR-IT?path=%2F&version=GBmaster) and click 'Generate Git Credentials'. Paste the generated password in the command line.
<br/>

3. <b>Install dependencies.</b>

You will likely be using the XR-IT client interface rather than the server, though this next step is the same for both. You will execute two commands from the Command Line, one is to navigate into the 'client' folder and the next is to install the necessary dependencies

```
cd XR-IT/client
npm i
```

<br/>

4. <b>VERY IMPORTANT: Allow scripts to run on your machine</b>

The last step is to enable Powershell scripts to be run on your machine. To do this, open a Powershell editor with Administrator privileges. Execute the following command.

```
Set-ExecutionPolicy RemoteSgined -Scope CurrentUser
```