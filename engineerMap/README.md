# EngineerMap Documentation

**EngineerMap** allows the  presentation of iSheet data into a map format on HighQ Home or Wiki pages.

It relies on map templates, which contain region shapes and names, that are mapped to iSheet rows by the first column in the iSheet, and then colors are applied from the second column in the iSheet view, which should be a choice type column which has colors specified against the choices.

---

## Table of Contents
- [Adding a list to a HighQ Site](#adding-a-map-to-a-highq-site)
- [Modifying Options](#modifying-options)
- [Advanced Configuration](#advanced-configuration)
  - [Required Options](#required-options)
  - [Configuration Options](#configuration-options)

---

## Adding a Map to a HighQ Site

### Requirements
- **Plugin installed**: The plugin files must be in your System File Library and correctly referenced in your Plugin Config File
- **iSheets** module enabled
- **Home** or **Wiki** module active on your site


### Add to Your Home/Wiki Page

1. Edit the target Home or Wiki panel and switch to **Source view**.
2. Add a link to your created iSheet view using the rich text editor link function.
3. In **Source view**, paste the following standard snippet **replacing the flag_ urls with your own EngineerLegal-plugins and EngineerCore urls**:

```html
<div id="mapContainer1">
  <script>
    engineerLegal({
      container: 'mapContainer1',
      plugin: 'map',
    });
  </script>

  <!-- EngineerLegal-plugins -->
  <script src="./flag/flag_000000000000000000000.action"></script>

  <!-- EngineerCore -->
  <script src="./flag/flag_000000000000000000000.action"></script>
</div>
```

## Modifying Options

The code for each plugin can be modified by setting "options" - these are the lines of code ending in a comma (`,`) between the curly braces (`{}`) after `engineerLegal`. Each line changes or provides information to a different component of the plugin. Details of all the options available are listed in the Advanced Configuration section of this guide.

To add a new option, add a new line after the last comma and before the last curly brace and add your option line as below:

> **Warning:** HighQ does not keep a version history of your edits to code in Home pages, so it's good practice to save your code into another window (such as Notepad) before making changes in case you need to roll back.

```javascript
  engineerLegal({
  container: 'container1',
  // << ADD NEW LINE HERE >>
  });
```

For example, if you wanted to change the color of regions that have no data in your iSheet from the default black to red we can use the defaultMapColor option. 

We would add a new line to the code above, add our option, then a colon (:) then a single quote (‘) then color (you can use any HTML accepted color so ‘red’ or ‘#FF0000’) then another single quote and comma. 

```javascript
  engineerLegal({
  container: 'container1',
  defaultMapColor: ‘#FF0000’, 
  });
```

---

# Advanced Configuration

This section lists all the possible map options that can be used to modify the standard behavior of the map. See the "Modifying Map Options" section for instructions on using these.

---

## Required Options

The options below **MUST** be included for the map to load.

### `container`

* **Example:** `container: 'mapContainer1',`

Tells the code where you want the map to appear on your page. It requires a corresponding HTML element similar to `<div id="mapContainer1">&nbsp;</div>` somewhere on the page. This `div` can use any term between the quotes in the `id=` attribute as long as it corresponds exactly with the `container` option value.

### `mapData`

* **Example1:** `mapData: './flag/flag_50l54i48i54j54h54h56.action',`
* **Example2:** `mapData: engineerCore_getMaps('apac'),`

Points to the file containing the JSON data that builds the map shapes. If you have multiple maps installed in your instance, you'll need to point to the correct `mapData` JSON file for the map you're hoping to display. If you have configured the map templates in your plugins config file, you can refer to them by name using the Example2 notation

### `plugin`
* **Example:** `plugin: 'map',`

Tells the code which plugin to launch

---

## Configuration Options

The options below can be used to modify the behavior or look and feel of the map. They do not need to be set and can be removed to return them to their defaults.

### `printRegions`

* **Default:** `'false'`
* **Example:** `printRegions: 'true',`

When set to `true`, the map will print a list of all valid region names in the current `mapData` template file to the browser's JavaScript console (accessed with `F12` or `CTRL + SHIFT + J`). This list can be copied and used to create your iSheet Jurisdiction column.

### `nameColumn`

* **Example:** `nameColumn: '2',`

Tells the code which column in your iSheet view contains the list of Region or State names. The first column is column `0`, the second is `1`, etc. Normally the first column (`0`) will contain the region names, but if you are linking to a dataset that must be formatted differently, this value will need to be updated for the map to generate.

### `useSelector`

* **Default:** Selects all Choice and Hyperlink columns in the iSheet view
* **Example:** `useSelector: 'Risk Level,Enforcement',`

Allows you to specify which columns in the iSheet will create layers on the map if not ALL choice or hyperlink columns are required as map layers/buttons. Column names must be added **EXACTLY** as they are titled and separated by commas. Do not include a space after the comma or the title will not match.

> **Note:** At present, you must remove commas from column titles to use this `useSelector` option.

### `hideErrors`

* **Default:** `'false'`
* **Example:** `hideErrors: 'true',`

As of May 2024, EngineerMap will show an errors button if rows are found in the iSheet that do not match a country/region/state. This helps ensure that regions are not missed. Setting this option to `true` will hide the errors button.

### `borderColor`

* **Default:** `'white'`
* **Example:** `borderColor: 'black',`

Sets the border color around each region on the map. Accepts any HTML-accepted color string (e.g., `'red'` or `'#FF0000'`).

### `fontSize`

* **Default:** `'10px'`
* **Example:** `fontSize: '12px',`

Sets the font size of labels on the map in pixels. Note that larger font sizes can impact mobile views more dramatically than desktop.

### `lineSize`

* **Default:** `'1.5'`
* **Example:** `lineSize: '2',`

Sets the size of lines around each region on the map in pixels. Note that larger line sizes can impact mobile views more dramatically than desktop.

### `hoverMapColor`

* **Default:** `'lightgrey'`
* **Example:** `hoverMapColor: 'none',`

Sets the color of a region when a mouse cursor is hovered over it. Accepts any HTML-accepted color (e.g., `'red'` or `'#FF0000'`). To disable the hover color change, set to `'none'`.

### `otherMapColor`

* **Default:** `'slategrey'`
* **Example:** `otherMapColor: '#3d54d3',`

Sets the color of a region when a URL is set in a hyperlink-type column. Sets the color for a choice column that has `'other'` picked as its value. When `isChoropleth` is set to `true`, this governs the base color of region shading. Accepts any HTML-accepted color (e.g., `'red'` or `'#FF0000'`).

### `defaultMapColor`

* **Default:** `'black'`
* **Example:** `defaultMapColor: 'gray',`

Sets the color for a region when no data is present in the iSheet. Accepts any HTML-accepted color (e.g., `'red'` or `'#FF0000'`).

### `mapNormalText`

* **Default:** `'white'`
* **Example:** `mapNormalText: 'brown',`

Sets the color for text labels in a region. Accepts any HTML-accepted color (e.g., `'red'` or `'#FF0000'`).

### `mapHoverText`

* **Default:** `'darkslategrey'`
* **Example:** `mapHoverText: 'brown',`

Sets the color for text labels in a region when a mouse cursor is hovered over them. Accepts any HTML-accepted color (e.g., `'red'` or `'#FF0000'`).

### `mapInverseText`

* **Default:** `'lightslategrey'`
* **Example:** `mapInverseText: 'blue',`

Sets the color for any lines used to connect region labels that sit outside of their region (e.g., because the region is too small for an internal label). On mobile view, this will also set the text color of external region labels. Accepts any HTML-accepted color (e.g., `'red'` or `'#FF0000'`).

### `otherTitle`

* **Default:** `'Other'`
* **Example:** `otherTitle: 'Conditional',`

Sets the label in the legend for how any items input into the choice column under the "other" grouping will be displayed. If, for example, a region could be high or low risk, but some regions have a conditional nature such as "Low pending new legislation," then the other option could be used to capture this.

### `defaultTitle`

* **Default:** `'Pending'`
* **Example:** `defaultTitle: 'Not surveyed',`

Sets the label in the legend for regions that have no data, perhaps because they are excluded or are pending.

### `linkTitle`

* **Default:** `'Pending'`
* **Example:** `linkTitle: 'Documents Available',`

Sets the label in the legend for regions that have a URL populated in a hyperlink column in the iSheet (e.g., if each region links to its legislation guidance in a wiki page, populated regions will be grouped under this legend name).

### `mapLinks`

* **Default:** `'isheet'`
* **Example:** `mapLinks: 'search',`

Determines what happens when clicking on a region on the map:

* `'isheet'` – Links to the iSheet record containing the data for the region.
* `'viewItem'` – Opens the HighQ view item modal window for the record region.
* `'print'` – Opens the HighQ print view for the iSheet record containing data for the region.
* `'none'` – Disables linking.
* `'search'` – Runs a search for the region name in the iSheet, potentially returning multiple records for that region.
* `'override'` – Allows a specific link to be set for all regions using the `mapLinkOverride` option.

> Additional `mapLinks` options are available if EngineerTable is used (see the [Table Options] section).

### `mapLinkOverride`

* **Default:** `none`
* **Example:** `mapLinkOverride: '[https://www.google.com](https://www.google.com)',`

If the `mapLinks` option is set to `'override'`, this option will cause all regions to link to a single specific URL (such as another HighQ page, external link, or another map).

### `hyperlinkColumn`

* **Default:** `false`
* **Example:** `hyperlinkColumn: '5',`

Can be set to the column index (The first column is `0`, the second is `1`, etc.) of a Hyperlink-type column. This will apply any link found for each row to the region in the map, causing a click on that region to take the user to that page. This will also prevent that hyperlink column from being added to the layer menu/buttons.

### `mapLinkTab`

* **Default:** `'blank'`
* **Example:** `mapLinkTab: 'self',`

Determines if links from regions should open in the same tab (`'self'`) or a new tab (`'blank'`).

### `labelText`

* **Default:** `'initial'`
* **Example:** `labelText: 'none',`

Determines if regions should be labeled with their initials (`'initial'`), in full (`'full'`) or none (`'none'`).

### `hideUnusedLabels`

* **Default:** `'false'`
* **Example:** `hideUnusedLabels: 'true',`

If a region isn't present in the iSheet data, this option hides its label to declutter the map.

### `tooltipColumn`

* **Default:** `'none'`
* **Example:** `tooltipColumn: '3',`

Determines if regions should have tooltips when a mouse cursor is hovered over them:

* `'0'` – Displays the value from the first column on the left in the iSheet (in most cases, the region name).
* `Any number` – Displays tooltips from that column index. *(Caution: A number exceeding the column count may cause the map to fail to display).*
* `'dynamic'` – Displays a value from the column next to the choice column for the currently selected view. The iSheet should be structured with a single- or multi-line text column after each choice/hyperlink column.
* `'value'` – Displays the choice column value for the region.
* `'none'` – Removes tooltips.

> If using a density map (`isChoropleth`), setting a column number will only display the region name. Setting `'value'` will append the number of occurrences for that region to the tooltip.

### `showLegend`

* **Default:** `'true'`
* **Example:** `showLegend: 'false',`

Setting this to anything other than `'true'` will hide the legend from below the map.

### `showLegendDefault`

* **Default:** `'true'`
* **Example:** `showLegendDefault: 'false',`

Setting this to anything other than `'true'` will hide the default "Pending" entity (or configured `defaultTitle`) from the legend.

### `legendTitle`

* **Default:** `' '`
* **Example:** `legendTitle: 'Risk: ',`

Prepends the specified text before your legend on the first line. Defaults to blank. Note that if your map contains multiple layers showing different statuses/risks, this text will not change when the user switches between map layers.

### `sortLegend`

* **Default:** `'false'`
* **Example:** `sortLegend: 'true',`

Allows for a specific sort order of options in the map legend:

* `'false'` (default) – Sorts the legend based on the order items appear in the iSheet view.
* `'true'` – Requires the iSheet choice column to be modified with a number and space before each choice to determine order (e.g., `"1 Low"`, `"2 Medium"`, `"3 High"`). The number will then be removed from the displayed legend item.
* `'alphabetical'` – Sorts the legend alphabetically with `defaultTitle` added last.

### `mapLastModified`

* **Default:** `'false'`
* **Example:** `mapLastModified: 'true',`

Appends the latest date from the iSheet "Last modified" date column to the map legend. The "Last modified date" column must be added to the iSheet view for the map to display this.

> **Tip:** If using tooltips, place "Last modified date" as the first column in the iSheet view (position `0`) so it does not appear in tooltips. In that case, set `nameColumn` to `1` or the new index of the region list.

### `useLayerMenu`

* **Default:** `'false'`
* **Example:** `useLayerMenu: 'true',`

Switches from generating a button for each map layer to using a dropdown menu to conserve screen space.

### `buttonText`

* **Default:** `'Select Layer'`
* **Example:** `buttonText: 'Quick View',`

When `useLayerMenu` is set to `'true'`, `buttonText` sets the dropdown button label text.

### `quickViewSearchEnabled`

* **Default:** `'false'`
* **Example:** `quickViewSearchEnabled: 'true',`

When `useLayerMenu` is set to `'true'`, setting this to `true` enables a type-ahead search box in the layer dropdown menu to locate a view in a long list.

### `searchDelay`

* **Default:** `'500'`
* **Example:** `searchDelay: '300',`

When both `useLayerMenu` and `quickViewSearchEnabled` are set to `'true'`, this value sets the millisecond delay before executing the type-ahead search.

---

## Density Maps (Choropleth)

The `isChoropleth` option configures the map to count the number of times a region appears in your iSheet and shade the region lighter or darker relative to the average.

### `isChoropleth`

* **Default:** `'false'`
* **Example:** `isChoropleth: 'true',`

Configures the map to count the number of occurrences of a region name and shade the region based on this count.

### `choroplethGroupsNumber`

* **Default:** `'3'`
* **Example:** `choroplethGroupsNumber: '4',`

When `isChoropleth` is `true`, this determines the number of color density bands displayed. More groups result in greater granularity but smaller visible differences in color strength between groups.

### `choroplethLegendTitle`

* **Default:** `'Occurrences'`
* **Example:** `choroplethLegendTitle: 'Cases',`

When `isChoropleth` is `true`, this sets the title in the map legend (e.g., set to `'Cases'` when showing case counts per region).

### `choroplethBaseBrightness`

* **Default:** `'150'`
* **Example:** `choroplethBaseBrightness: '120',`

When `isChoropleth` is `true`, this sets the brightness for the base map color (set via `otherMapColor`). For bright colors like red, reducing this option to `120` can make differentiating color bands easier.

---

## Table Options

Using these options requires **EngineerTable** to be installed in your HighQ instance.

> **Note:** As of version 4, you no longer need to add the flag URL for EngineerTable into the page.

### `mapLinks`

* **Default:** `'false'`
* **Example:** `mapLinks: 'table',`

Adds a click action to each region that performs an action in EngineerTable based on the value:

* `'table'` – Shows details for the clicked region in EngineerTable.
* `'compare'` – Shows details for the clicked region alongside any previously clicked regions (clicking again removes it).
* `'filter'` – Shows all region details in EngineerTable, then acts like `'compare'` thereafter.

### `tableAllColumns`

* **Default:** `'false'`
* **Example:** `tableAllColumns: 'true',`

By default, clicking a region only shows table columns related to the selected layer choice column. Setting this to `true` displays the full iSheet row set in the table.

### `compareLineSize`

* **Default:** `'8'`
* **Example:** `compareLineSize: '10',`

Sets the border width around a region when it is clicked and added to the comparison view. Smaller values are useful for narrower map layouts.

### `compareBorderColor`

* **Default:** `'#e40fda'`
* **Example:** `compareBorderColor: 'orange',`

Sets the border color around a region when it is clicked and added to the comparison view.

### Configuring EngineerTable Below Your Map

By default, EngineerTable loads directly below EngineerMap in its default configuration. To modify the table, nest options within `tableOptions: { }`:

```javascript
mapLinks: 'table',  
tableOptions: {
    recordLinks: 'viewItem',
    transposeTable: 'true',
},

```

> **Note:** Any other EngineerTable options can also be added to your tableOptions. Review the EngineerTable documentation.

---

## Overlays

EngineerMap can display specific location data on top of the map to represent office locations, real estate holdings, project teams, etc. This requires a separate iSheet view with the following columns:

1. **Single Line Text** – Location Name
2. **Single Line Text** – Latitude (`Lat` or `Latitude`)
3. **Single Line Text** – Longitude (`Long` or `Longitude`)
4. *(Optional)* **Choice** – Controls location icon color on the map
5. *(Optional)* **Hyperlink** – Opens a target link when the point is clicked

Latitude and Longitude must be added in **Decimal Degrees**:

| Name | Latitude | Longitude |
| --- | --- | --- |
| Client1 | 41.4033 | -2.1740 |

* Verify Latitude is between `-90` and `90`.
* Verify Longitude is between `-180` and `180`.

> **Note:** Zip/Postcode lookup is not supported; use decimal coordinates directly.

### Setup Steps

1. Create the overlay iSheet view and link to it on your page.
2. Update the link class in HTML source mode from `class="CKContextLink"` to `class="CKContextLink overlay-link1"`.
3. Pass the class link reference into your map options:
```javascript
overlayViewLink: engineercore_getLinkByClass("overlay-link1"),

```

### Overlay Options

#### `isOverlayChoropleth`

* **Default:** `'false'`
* **Example:** `isOverlayChoropleth: 'true',`

Configures the overlay to count exact latitude/longitude matches and shade the points accordingly.

#### `overlayPointSize`

* **Default:** `'10'`
* **Example:** `overlayPointSize: '2',`

Sets the relative size of overlay points. Use smaller values (e.g., `2` or `3`) for tightly packed locations.

#### `overlayPointColor`

* **Default:** `'#000'`
* **Example:** `overlayPointColor: 'blue',`

Sets default point color if no choice column color exists. Also acts as the base color for choropleth points.

#### `overlayShape`

* **Default:** `'circle'`
* **Example:** `overlayShape: 'star',`

Sets the point icon shape. Options: `'circle'`, `'square'`, `'star'`, `'triangle'`.

#### `overlayLinks`

* **Default:** `'false'`
* **Example:** `overlayLinks: 'isheet',`

Determines click action for overlay points:

* `'isheet'` – Links to the iSheet record.
* `'print'` – Opens HighQ print view for the record.
* `'false'` – Disables linking.
* `'table'` – Displays the row in a table below the map.
* `'compare'` – Adds the row to a comparison table below the map.
* `'filter'` – Displays all overlay rows in a comparison table below the map.