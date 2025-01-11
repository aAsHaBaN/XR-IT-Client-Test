#wiki

These Git Commands run inside the Windows Terminal (cmd):

##### Define Local Target Folder:
Make sure to target the folder you would like the Wiki repository to be stored in (e.g. `C:\Users\ZaksPC\Documents>`). 
You can use the `cd` command to target folders from the command line.

### git clone

`C:\Users\ZaksPC\Documents> git clone https://TransRealities@dev.azure.com/TransRealities/XR-IT/_git/XR-IT`
This will clone the entire Azure Server repository onto your local PC (in this case called "XR-IT") and set up the necessary git command files, into the folder you have targeted. You only need to do this once.

### git pull

`C:\Users\ZaksPC\Documents\XR-IT> git pull`
This will pull the entire repository into the "XR-IT" folder.

### git push

`C:\Users\ZaksPC\Documents\XR-IT> git add -A`
This will define that you want to push the entire repository back to Azure's server (git add "all").

`C:\Users\ZaksPC\Documents\XR-IT> git commit -a -m "<COMMENT HERE>"`
This will bundle your added files into a single commit log. You can add comments to the commit log inside the " ".

`C:\Users\ZaksPC\Documents\XR-IT> git push`
Finally, this will push you files and commit log to the Azure server.

