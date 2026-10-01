# HighQ Plugins
Data visualisation plugins for HighQ


## Prerequisites
- **HighQ Collaborate**
- **System Admin Account**: Required to perform the installation - NOT required for usage once installed.
- **Scripting Enabled**: Scripting must be enabled on your HighQ instance (or allowed for each user editing a page containing a plugin). Refer to the HighQ Knowledge Base: *Enable users to bypass XSS protection and add custom JavaScript*.

> **Note:** Engineer.Legal plugins do not support System Dashboards or "Custom Pages".

---

## General Considerations
- These plugins get HighQ iSheet data via HighQ's iSheet XML export; while dependable, this limits the volumne of data that can reasonably be loaded. Expect long loading times for iSheets with thousands of rows.
- It is best to create a dedicated iSheet view for each plugin
- The plugins are designed to fail silently so end users do not see technical errors, if a plugin fails to load, check the JavaScript console (usually CTRL+SHIFT+J) in your browser for hints on what might have gone wrong.
- Multiple plugins in the same page must have unique container names - if plugins aren't loading, or appearing in the wrong place, check this first.
- The plugins respect user permissions, users must have access to the iSheets, views, and columns required by each plugin to see the chart.
- Each chart uses a link in the same home page section to determine what isheet view to load.

---

## Installation

1. **Create Plugin Config File**: 
    -  If this is your first time using these plugins, download the `engineerLegal-plugins.js` template file above and open it in a text editor of your choice.
    -  If you already have one or more plugins installed, you should edit your current `engineerLegal-plugins.js` file. In your HighQ instance, go to **Your Profile Picture / Icon** (top right) > **System Admin** > **File Library** and look for `engineerLegal-plugins.js`, right click and select "Save link as..." or similar. This will save the file to your local machine for you to open it in a text editor of your choice.
    > **Note:** You may need to right click the file and select "Open with..." to edit the files with Notepad
2. **Download JavaScript Files**: Download `engineerCore.js` and any plugins you want to use from the folders above. The `lib` folder contains JavaScript library files that enable optional features for exporting some plugins.
3. **Upload to HighQ File Library**:
   - In your HighQ instance, go to **Your Profile Picture / Icon** (top right) > **System Admin** > **File Library**.
   - Click **Add new file** and upload `engineerCore.js`.
4. **Obtain URL**:
   - Copy the URL for `engineerCore.js` by right clicking the file name and selecting copy link
   - **DO NOT** use the *Get Link / Public Link* column.
5. **Enter URL into Plugin Config File**: Paste the copied URL between the single quotes on the "core" line of the config template. You'll need to carefully replace your HighQ domain and application context name with a `.` so instead of:
    - `https://extranet.firm.com/collaborate/flag/flag_xxxxxxxxxxxxxxx.action`
    you end up with only:
    - `./flag/flag_xxxxxxxxxxxxxxx.action`
6. **Repeat for each plugin**: If you are installing all the plugins, you'll need to upload each in turn and add the URLs. If you are installing EngineerMap, you can do the same thing with map template files too.
7. **Save and upload**: Save your Plugin Config File and add that to your System File Library along with the plugins.
8. **Create your code block**: You'll need the flag URLs from your `engineerCore.js` and `engineerLegal-plugins.js` which should be input into code block below on the lines commented:

```html
<div id="pluginContainer1">
<script>
    engineerLegal({
      container: 'pluginContainer1',
    });
 </script>
 <!--engineerCore--><script src="./flag/flag_0000000000000000.action"></script>
 <!--engineerLegal-plugins--><script src="./flag/flag_1111111111111111.action"></script>
 </div>
```
9. You're ready to use this in your HighQ Home Page

---

## Updating Your Version

If updated versions become available

1. Download the new JS files provided.
2. Navigate to **System Admin** > **File Library** and locate your existing plugin file.
3. Click on the **File ID** to the left of the filename to open the **Update file** page.
4. Replace the old file with the new file and click **Save**.

> **Warning:** Overwrites occur immediately upon clicking **Save** and are irreversible. Always maintain local backups before overwriting files in the File Library.

> **Note on Caching:** Browsers may cache older script versions. If users report display issues, instruct them to perform a hard refresh (`Ctrl + Shift + R` or `Cmd + Shift + R`).
