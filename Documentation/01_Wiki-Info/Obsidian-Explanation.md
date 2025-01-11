#wiki

*Obsidian works like a fancy note editor, with the ability to organise note folders, embed code, create tags, link notes together, and create mindmaps, among other functions.*

When o**pening Obsidian for the first time**, you should be presented with a 'Vault Overview' page. Assuming you have completed the [[Git-Commands#git clone]] step, here you can select "Open Folder As Vault" and find the `Documentation` folder inside the `XR-IT` folder that was created during the git clone step. This will create the Obsidian Vault and all of the Wiki will be loaded into it.

Some **necessary Obsidian Settings** to enable:
- `Settings > Files and Links > Detect all file extensions > Enable`
- `Settings > Editor > Show line number > Enable`
- `Settings > Files and Links > Default location for new attachments > In subfolder under current folder > "attachments"`

**Wiki rules to follow**
- Folders and File titles cannot contain spaces. Use *dashes* as replacement (e.g. Obsidian-Explanation)
- Tags (`#tags`) are a useful way of non-linear note organisation. You can next tags using *forward slashes*  (`#tags/something`). 
- You can link other notes using *double square brackets* (`[[here-is-a-note]]`), and even quote that note by including a *hashtag* after writing the title (`[[here-is-a-note#quote]]`)
- Create block code using *backticks*, and optionally add auto-colour to the code block by doing *three backticks followed by the language*:
```js
print: 'hello world';
```

The workspace is fully **customisable** (Obsidian settings stay local to your PC, so won't be pushed to Azure's Server). You can customise your workspace under: `Settings > Appearance`

**Do not enable community plugins** unless you are fully aware of safety/reliability of that plugin.