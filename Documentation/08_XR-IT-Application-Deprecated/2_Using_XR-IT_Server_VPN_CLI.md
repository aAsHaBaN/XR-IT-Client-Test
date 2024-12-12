<h4>Startup<h4>

Same as the client software for starting up. First thing to do is to open the command line and navigate to the server directory. If your XR-IT repository sits in Documents, it would look like this:

```
cd C:\Documents\XR-IT\server
```

To start the software simply run the following npm (Node Package Manager) command.

```
npm run start
```
The Server CLI should now start!

You will now be prompted with following options, type one of the following to execute those scripts.

<h4>ADD USER</h4>

Putting this at the top as likely, this will be the most useful command for users in our lab.

Here, you will specify the username which you will use to log on to the VPN from the client. 

Example input:

![[2_Example_Add_User.png]]

<h4>CREATE HUB</h4>

This is used to create a new virtual hub group, representing a group of users and settings for a specific VPN connection. 

<h4>START VPN</h4>

Turns a virtual hub on, allowing connections to be established.

<h4>STOP HUB</h4>

Turns a virtual hub off, not allowing connections to be established.

<h4>DELETE HUB</h4>

Deletes a virtual hub removing all settings and users.

<h4>REMOVE USER</h4>

Deletes a user from a virtual hub.

<h4>MESSAGING SERVICE</h4>

Opens the a port on the XR-IT Server node to accept messages from other nodes. This will be developed further