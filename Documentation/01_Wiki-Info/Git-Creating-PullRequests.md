These Git Commands run inside the Windows Terminal (cmd), allowing you to isolate you to work on your changes outside of master. This way to prevent breaking changes from being pushed directly into master.

##### Creating a branch
To begin, it is probably best to get the newest version of master, so do a pull
`C:\Users\ZaksPC\Documents\XR-IT> git pull`

Before making your changes, it is time to create a branch from master
`C:\Users\ZaksPC\Documents\XR-IT> git branch <BRANCH NAME HERE>`

As for the branch name, our team is currently using the convention as follows:
`user/branch-type/branch-name`

For example, if you are working on a feature:
`damir/feature/mvn-network-endpoint`

or documentation:
`arjo/documentation/unreal-udp-messaging`
### git checkout

Now you are ready to switch to this branch and start working! To switch branches:

`git checkout <BRANCH NAME HERE>` 
ex: `git checkout damir/feature/mvn-network-endpoint`

Double check that you are on the right branch by executing
`git branch`

You should see your branch highlighted in green. If this is the case, go ahead and make your changes!

### Finishing up

Once your changes are complete, the same commands apply for pushing them to master. You do a `git add`, `git commit`, but for a push you will want to do the following:

  `git push --set-upstream origin <YOUR BRANCH NAME HERE>`
  ex:   `git push --set-upstream origin damir/documentation/branching`

### Merging changes to master

Navigate to `https://dev.azure.com/TransRealities/_git/XR-IT/branches`
There you will see a banner that says you have new changes to your branch.

Click on 'Create Pull Request' and follow the pages to merge the branch to master
