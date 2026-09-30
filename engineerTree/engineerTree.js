/* EngineerTree - a HighQ plugin

MIT License

Copyright (c) 2026 Engineer-Legal-OSS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

This plugin features:
Raphaël 2.1.4 - JavaScript Vector Library 
Copyright © 2008-2012 Dmitry Baranovskiy (http://raphaeljs.com)
Copyright © 2008-2012 Sencha Labs (http://sencha.com)
Licensed under the MIT (http://raphaeljs.com/license.html) license.

*/

var engineerTreeVersion = '5.0.0';

function engineerTree(userOptions) {
    let thisTree = {};
    let rootContainer = null;
    let rawXmlData = null;
    let selectedQuickViewItems = new Map();
    let nodeData = new Map();
    let firstChoice;
    let rightMostNode;
    let leftMostNode;
    let rightMostNodeWidth;
    let deepestNode = 0;
    let renderErrors = [];
    if ($e('#engineertreestyles').length == 0) {
        $e('<style id=engineertreestyles>.tree-menu .legend-item{display: inline-block; margin-right: 5px;}.engineertreetopscroll{transform: rotateX(180deg);}.engineertreescroll{overflow-x: auto; width:100%}.othercol{font-size:0.8em;}.node{text-wrap: nowrap; padding: 1px;z-index:0}.node-content{width: 100%}.othercol{display:block}.tree-badge{position:absolute; top: 95%; left: 75%}.engineertree { position: relative; overflow: hidden; padding: 0 !important;width: max-content;}.engineertree.topscroll{transform: rotateX(180deg);}.engineertree > .node,.engineertree > .pseudo { position: absolute; display: flex; align-items: center}.engineertree.tree-loaded .node { visibility: visible; }.engineertree > .pseudo { border: none;padding: 0;z-index: -1;}.engineertree .collapse-switch { position: absolute;top: 101%;left: 40%;cursor: pointer;text-decoration: none;line-height: 10px; }.engineertree .collapsed .collapse-switch { background-color: #868DEE; }.engineertree .collapsed{filter:drop-shadow(#000 2px 2px) drop-shadow(#fff 4px 4px) drop-shadow(#000 4px 4px)}.engineertree > .node img {border: none; float: left; } .engineertree > .et-node.clickable {cursor:pointer;} .tree-search-menu{display:inline-block; padding-right:5px}.tree-search-menu > input {height:32px}.el-hoverhelp {position: absolute;left: -8px;top: -8px;border-radius: 90px;background: navy;color: white;padding: 0px 4px;}.tree-primary{z-index:1}.tree-menu .alert{display: inline-block; padding: 5px 20px;min-height:unset;margin:0}.tree-menu .alert:before{display: none;}.engineertreescroll.et-pan-active{cursor:grabbing;}</style>').appendTo('head');
    }

    class TreeOptions {
        constructor(customOptions) {
            this.container = customOptions.container ? customOptions.container : null;
            if (!this.container) {
                throw new Error('Option `container` is required.');
            }
            this.iSheetViewLink = customOptions.iSheetViewLink ? customOptions.iSheetViewLink : null;
            if (!this.iSheetViewLink) {
                try {
                    this.iSheetViewLink = engineercore_getLink(this.container);
                } catch (error) {
                    console.log('Cannot use engineercore_getLink, requires engineerCore version 1.2.1');
                }
            }
            if (!this.iSheetViewLink) {
                throw new Error('Either a link to an iSheet view must be created in this section or Option "iSheetViewLink" must be set.');
            }
            this.iSheetViewUrl = new URL(this.iSheetViewLink);
            this.siteID = this.iSheetViewUrl.searchParams.get('metaData.siteID');
            this.sheetID = this.iSheetViewUrl.searchParams.get('metaData.sheetId');
            this.sheetViewID = this.iSheetViewUrl.searchParams.get('metaData.sheetViewID');
            this.nameColumn = customOptions.nameColumn ? customOptions.nameColumn : '0';
            this.linkColumn = customOptions.linkColumn ? customOptions.linkColumn : 'false';
            this.backgroundColorColumn = customOptions.backgroundColorColumn ? customOptions.backgroundColorColumn : 'false';
            this.legendTitle = customOptions.legendTitle ? customOptions.legendTitle : 'Legend: ';
            this.statusColumn = customOptions.statusColumn ? customOptions.statusColumn : 'auto';
            this.parentColumn = customOptions.parentColumn ? customOptions.parentColumn : '1';
            this.childColumn = customOptions.childColumn ? customOptions.childColumn : 'false';
            if (this.childColumn == 'false' && this.parentColumn == 'false') {
                throw new Error('One of either "childColumn" or "parentColumn" must be set.');
            } else if (this.childColumn != 'false') {
                this.matchColumn = this.childColumn;
                this.matchType = 'child';
            } else {
                this.matchColumn = this.parentColumn;
                this.matchType = 'parent';
            }
            this.styleColumn = customOptions.styleColumn ? customOptions.styleColumn : null;
            this.exportButton = customOptions.exportButton ? customOptions.exportButton : 'false';
            this.exportCSVButton = customOptions.exportCSVButton ? customOptions.exportCSVButton : 'false';
            this.fullscreenButton = customOptions.fullscreenButton ? customOptions.fullscreenButton : 'false';
            this.fullscreen = customOptions.fullscreen ? customOptions.fullscreen : false;
            this.textAlign = customOptions.textAlign ? customOptions.textAlign : 'left';
            this.scrollLocation = customOptions.scrollLocation ? customOptions.scrollLocation : 'top'; // top, bottom
            this.insertStruts = customOptions.insertStruts ? customOptions.insertStruts : 'true';
            this.enableSearch = customOptions.enableSearch ? customOptions.enableSearch : 'false';
            this.enablePrune = customOptions.enablePrune ? customOptions.enablePrune : 'false';
            this.enableZoomPan = !!customOptions.enableZoomPan && customOptions.enableZoomPan;
            if (this.enableZoomPan) {
                this.scrollLocation = 'bottom';
            }
            this.zoomMin = customOptions.zoomMin ? Number.parseInt(customOptions.zoomMin) : 25;
            this.zoomMax = customOptions.zoomMax ? Number.parseInt(customOptions.zoomMax) : 200;
            this.labelColumn = customOptions.labelColumn ? customOptions.labelColumn : 'false';
            this.labelPosition = customOptions.labelPosition ? customOptions.labelPosition : 'node'; // node, connector
            this.otherColumns = customOptions.otherColumns ? customOptions.otherColumns : 'false';
            this.showOtherColumnHeaders = customOptions.showOtherColumnHeaders ? customOptions.showOtherColumnHeaders : 'true';
            this.imageWidth = customOptions.imageWidth ? customOptions.imageWidth : '64px';
            // Panel titles can display above, below or right of the panel image
            //this.titleLocation = customOptions.titleLocation ? customOptions.titleLocation : 'right';
            // accept viewItem, isheet, default, table, compare, filter
            this.panelLinks = customOptions.panelLinks ? customOptions.panelLinks : 'false';
            this.panelFunction = customOptions.panelFunction ? customOptions.panelFunction : null;
            this.linkTab = customOptions.linkTab ? customOptions.linkTab : 'blank';
            // accept curve bCurve straight step
            this.lineStyle = customOptions.lineStyle ? customOptions.lineStyle : 'curve';
            this.lineColor = customOptions.lineColor ? customOptions.lineColor : '#000';
            this.labelBorderColor = customOptions.labelBorderColor ? customOptions.labelBorderColor : this.lineColor;
            this.collapsable = customOptions.collapsable ? customOptions.collapsable : false;
            this.collapsed = customOptions.collapsed ? customOptions.collapsed : false;
            this.levelSeparation = customOptions.levelSeparation ? customOptions.levelSeparation : '40';
            this.nodeWidth = customOptions.nodeWidth ? customOptions.nodeWidth : 'auto'; // auto or number in px
            this.nodeHeight = customOptions.nodeHeight ? customOptions.nodeHeight : 'auto'; // auto or number in px
            this.nodeSeparation = customOptions.nodeSeparation ? customOptions.nodeSeparation : '20';
            this.nodeBorderWidth = customOptions.nodeBorderWidth ? customOptions.nodeBorderWidth : null;
            this.nodeBorderColor = customOptions.nodeBorderColor ? customOptions.nodeBorderColor : '#ddd';
            this.nodeTextColor = customOptions.nodeTextColor ? customOptions.nodeTextColor : '#000';
            this.hideLabels = customOptions.hideLabels ? customOptions.hideLabels : null; //comma separated list of specific values to hide
            this.labelFontSize = customOptions.labelFontSize ? customOptions.labelFontSize : '10';
            this.labelColor = customOptions.labelColor ? customOptions.labelColor : '#000';
            this.hoverColor = customOptions.hoverColor ? customOptions.hoverColor : null; //color
            this.clickColor = customOptions.clickColor ? customOptions.clickColor : '#f0f0fc'; //color

            this.spacing = customOptions.spacing ? Number.parseInt(customOptions.spacing) : 1; //1,2,3,4

            this.minorityHoldingLevel = customOptions.minorityHoldingLevel ? customOptions.minorityHoldingLevel : null;
            this.showMajorityHoldingOnly = customOptions.showMajorityHoldingOnly ? customOptions.showMajorityHoldingOnly : false;
            this.holdingColumn = customOptions.holdingColumn ? customOptions.holdingColumn : null;
            if (!this.showMajorityHoldingOnly && this.holdingColumn == null) {
                throw new Error('Holding column must be specified when showing majority holdings only');
            }

            this.preSearchType = customOptions.preSearchType ? customOptions.preSearchType : null; // limit or search
            this.preSearchFrom = customOptions.preSearchFrom ? customOptions.preSearchFrom : null;
            this.preSearchTo = customOptions.preSearchTo ? customOptions.preSearchTo : null;
            this.preLimit = customOptions.preLimit ? customOptions.preLimit : 5;
            this.preLimitDirection = customOptions.preLimitDirection ? customOptions.preLimitDirection : 'both';
            this.autoExport = customOptions.autoExport ? customOptions.autoExport : false;
            this.autoExportFormat = customOptions.autoExportFormat ? customOptions.autoExportFormat : 'png'; // png or csv
            this.autoExportFolderId = customOptions.autoExportFolderId ? customOptions.autoExportFolderId : null;
            this.autoExportTitle = customOptions.autoExportTitle ? customOptions.autoExportTitle : null;

            this.manageTreeButton = customOptions.manageTreeButton ? customOptions.manageTreeButton : false;
            this.eliminateColumnName = customOptions.eliminateColumnName ? customOptions.eliminateColumnName : "Status";
            this.eliminateStatus = customOptions.eliminateStatus ? customOptions.eliminateStatus : "Eliminated";
            this.allowDelete = customOptions.allowDelete ? customOptions.allowDelete : 'false';

            this.onRender = customOptions.onRender ? customOptions.onRender : function (treeId) { };
            // Called when an automated export completes (success or failure)
            this.onExportComplete = customOptions.onExportComplete ? customOptions.onExportComplete : function (response) { };

            this.debug = customOptions.debug ? customOptions.debug : false;
            this.nodeStructure = {};
        }
    }

    class TableOptions {
        constructor(iSheetViewLink, tableOptions) {
            tableOptions = tableOptions !== undefined ? tableOptions : {};
            Object.assign(this, tableOptions);
            this.iSheetViewLink = iSheetViewLink || null;
            this.tableElement = tableOptions.tableElement ? tableOptions.tableElement : null;
            if (!this.tableElement) {
                this.tableElement = options.container + '-table';
                this.showTable = true;
            }
            this.selectedRows = null;
            this.parentPlugin = { [options.container]: 'tree' };
        }
    }

    let options = new TreeOptions(userOptions);
    let tableOptions = new TableOptions(options.iSheetViewLink, userOptions.tableOptions);
    options.tableOptions = tableOptions;
    window.engineerLegalPlugins.tree[options.container] = options;
    let prunedRows = [];
    if ($e('#engineertreestyles-' + options.container).length == 0) {
        $e('<style id=engineertreestyles-' + options.container + '> div.tree-item-on{background:' + options.clickColor + '; border-color:' + options.hoverColor + '!important;}.tt-dropdown-menu{top:auto !important;} .tree-manager{border: 1px solid gray;padding: 4px;border-radius: 15px;margin: 5px 0;} .etm-tree-card{border: 1px solid gray;padding: 4px;border-radius: 15px;margin: 5px 0; background-color: #f0f0f0;}</style>').appendTo('head');
    }
    $e('#' + options.container).empty();
    if (tableOptions.showTable) {
        try {
            if (window['engineerTable']) {
                getTreeData();
            } else {
                throw new Error('engineerTable not loaded');
            }
        } catch (error) {
            try {
                engineercore_load('table').then(function () {
                    getTreeData();
                });
            } catch (error) {
                console.warn('engineercore_load, requires engineerCore version > 4.0.0 ');
                console.error('Unable to load engineerTable, it may not be loaded into the page or correctly installed: \n' + error);
                console.warn('Continuing to load tree without table features...');
                tableOptions.showTable = false;
                options.panelLinks = 'isheet';
                tableOptions = {};
                getTreeData();
            }
        }
    } else {
        getTreeData();
    }

    /**
     * Loads XML doc to build UI based on loaded data
     */
    function getTreeData() {
        engineercore_loadDoc(options.iSheetViewLink, parseiSheetData);
    }

    /**
     * Parses XML data to local objects
     */
    function parseiSheetData(xmlDoc) {
        rawXmlData = engineercore_xmlToObj(xmlDoc);
        buildTreeObject();
    }

    // Create a CSS-safe identifier that preserves special characters by encoding
    // them as hexadecimal tokens. This avoids collapsing or dropping characters
    // (which caused false-positive matches) while ensuring the result only
    // contains safe characters for use in IDs/classes (A-Z a-z 0-9 _ -).
    function engineercore_safeCSS_preserve(name) {
        if (name === null || name === undefined) return '';
        let s = String(name).trim();
        let out = '';
        for (const element of s) {
            const ch = element;
            if (/[A-Za-z0-9\-_]/.test(ch)) {
                out += ch;
            } else {
                let code = ch.codePointAt(0).toString(16).toUpperCase();
                if (code.length < 2) code = '0' + code;
                out += '_' + code + '_';
            }
        }
        // IDs should not start with a digit for CSS selectors — prefix if needed
        if (/^\d/.test(out)) {
            out = 'id_' + out;
        }
        return out;
    }

    function buildTreeObject() {
        let hiddenLabels = [];
        let iSheetNodes = [];
        let uniqueNodes = Object.create(null);
        let rootItemIdx;
        let rootItemID;
        if (options.hideLabels) {
            hiddenLabels = options.hideLabels.split(',');
        }
        if (rawXmlData.view.head?.headColumn) {
            if ((!$e('body').hasClass('dashboardEdit'))) {
                rootContainer = $e('#' + options.container);
                let loading = $e('<div>')
                    .text('Loading...')
                    .css('text-align', 'center')
                    .attr('id', options.container + '-chart');
                rootContainer.prepend(loading);
                for (let i = 0; i < rawXmlData.view.head.headColumn.length; i++) {
                    let header = rawXmlData.view.head.headColumn[i];
                    if (header.columnTypeAlias === 'SHEET_COLUMN_TYPE_IMAGE' && options.flagColumn == 'auto') {
                        options.flagColumn = i;
                    }
                    if (header.columnTypeAlias === 'SHEET_COLUMN_TYPE_HYPERLINK' && options.linkColumn == 'auto') {
                        options.linkColumn = i;
                    }
                    if (header.columnTypeAlias === 'SHEET_COLUMN_TYPE_CHOICE') {
                        if (firstChoice === undefined) {
                            firstChoice = i;
                        }
                    }
                }
            } else {
                throw (new Error('Dashboard in Edit Mode'));
            }
        }
        if (rawXmlData.view.data?.item) {
            iSheetNodes = [];
            uniqueNodes = Object.create(null);
            for (let i = 0; i < rawXmlData.view.data.item.length; i++) {
                let row = rawXmlData.view.data.item[i];
                if (row.column[options.nameColumn]?.rawData) {
                    let statusVal;
                    let statusColor;
                    let link;
                    let background;
                    let classname;
                    let name = getValue(rawXmlData, options.nameColumn, row);
                    let htmlId = engineercore_safeCSS_preserve(name);
                    if (!name) {
                        renderErrors.push('Item number ' + i + 'in the iSheet has no name in column ' + options.nameColumn + ' - skipping');
                        continue;
                    }
                    if (firstChoice && options.statusColumn == 'auto') {
                        statusVal = getValue(rawXmlData, firstChoice, row);
                        statusColor = getChoiceTypeColumnStyle(row.column[firstChoice].rawData);
                    } else if (firstChoice && options.statusColumn != 'false') {
                        statusVal = getValue(rawXmlData, options.statusColumn, row);
                        statusColor = getChoiceTypeColumnStyle(row.column[options.statusColumn].rawData);
                    }
                    if (options.linkColumn != 'false' && options.linkColumn != 'auto') {
                        link = getValue(rawXmlData, options.linkColumn, row);
                    }
                    if (options.backgroundColorColumn != 'false') {
                        background = getChoiceTypeColumnStyle(row.column[options.backgroundColorColumn].rawData);
                    }
                    if (options.styleColumn) {
                        classname = getValue(rawXmlData, options.styleColumn, row);
                    }
                    let relation = { id: engineercore_safeCSS_preserve(getValue(rawXmlData, options.matchColumn, row)), name: getValue(rawXmlData, options.matchColumn, row) };
                    if (!relation.id) {
                        if (rootItemID === undefined) {
                            rootItemIdx = i;
                            rootItemID = htmlId;
                        } else {
                            throw new Error('Multiple root items detected - ensure all parent column rows are populated apart from the top level entity');
                        }
                    }
                    let connVal = null;
                    if (options.holdingColumn != null) {
                        let connectionVal = getValue(rawXmlData, options.holdingColumn, row);
                        if (connectionVal) {
                            connVal = {
                                name: getValue(rawXmlData, options.matchColumn, row),
                                text: connectionVal,
                                number: Number.parseInt(connectionVal.match(/^\d+/))
                            };
                        }
                    }
                    let label = null;
                    if (options.labelColumn != 'false') {
                        label = getValue(rawXmlData, options.labelColumn, row);
                        if (options.hideLabels) {
                            hiddenLabels.forEach(element => {
                                if (element == label) {
                                    label = null;
                                }
                            });
                        }
                    }
                    let nodeObject = {
                        itemID: row.itemID.cdata,
                        itemPosition: row.itemPosition,
                        HTMLid: htmlId,
                        userClass: engineercore_safeCSS(classname),
                        name: name,
                        relations: relation || null,
                        label: label,
                        connVal: connVal,
                        status: statusVal,
                        statusColor: statusColor,
                        background: background,
                        link: link,
                        otherColumns: [],
                        duplicateParents: []
                    };

                    if (options.otherColumns != 'false') {
                        let additionalColumns = options.otherColumns.split(',');
                        additionalColumns.forEach(function (otherCol) {
                            let columnType = rawXmlData.view.head.headColumn[otherCol].columnTypeAlias;
                            let columnName = rawXmlData.view.head.headColumn[otherCol].columnValue.cdata;
                            switch (columnType) {
                                case 'SHEET_COLUMN_TYPE_CHOICE': {
                                    let choiceContent = '';
                                    if (Array.isArray(row.column[otherCol].rawData.choice)) {
                                        row.column[otherCol].rawData.choice.forEach(choice => {
                                            choiceContent += '<span">' + choice.cdata + '</span>';
                                        });
                                    } else {
                                        choiceContent += '<span>' + (row.column[otherCol].rawData.length ? row.column[otherCol].rawData.choice.cdata : ' ') + '</span>';
                                    }
                                    nodeObject.otherColumns.push({ [columnName]: choiceContent });
                                    break;
                                }
                                case 'SHEET_COLUMN_TYPE_LOOKUP': {
                                    let userMulti = false;
                                    let userContent = '';
                                    if (row.column[otherCol].displayData.lookupuser !== undefined) {
                                        if (row.column[otherCol].displayData.lookupuser.userDisplayName !== undefined) {
                                            userContent += row.column[otherCol].displayData.lookupuser.userDisplayName.cdata;
                                        } else {
                                            row.column[otherCol].displayData.lookupuser.forEach(user => {
                                                if (userMulti) {
                                                    userContent += ', ';
                                                }
                                                userContent += user.userDisplayName.cdata;
                                                userMulti = true;
                                            });
                                        }
                                    }
                                    nodeObject.otherColumns.push({ [columnName]: userContent });
                                    break;
                                }
                                default:
                                    nodeObject.otherColumns.push({ [columnName]: row.column[otherCol].displayData.cdata });
                            }
                        });
                    }


                    if (options.showMajorityHoldingOnly) {
                        if (!uniqueNodes[htmlId]) {
                            uniqueNodes[htmlId] = nodeObject;
                        } else {
                            let currentNode = uniqueNodes[htmlId];
                            let compareHoldingVal = currentNode.connVal?.number || 0;
                            let nodeHoldingVal = nodeObject.connVal?.number || 0;
                            if (nodeHoldingVal > compareHoldingVal) {
                                nodeObject.duplicateParents = currentNode.duplicateParents.concat(
                                    [{ [currentNode.connVal?.name || currentNode.name]: currentNode }]
                                );
                                uniqueNodes[htmlId] = nodeObject;
                            } else {
                                currentNode.duplicateParents.push({ [nodeObject.connVal?.name || nodeObject.name]: nodeObject });
                            }
                        }
                    } else {
                        iSheetNodes.push(nodeObject);
                    }

                }
            }
        }

        if (options.showMajorityHoldingOnly) {
            iSheetNodes = Object.values(uniqueNodes);
            rootItemIdx = iSheetNodes.findIndex(function (node) {
                return node.HTMLid === rootItemID;
            });
            console.log('[EngineerTree majority-only]', {
                sourceRows: rawXmlData.view.data.item.length,
                uniqueEntities: iSheetNodes.length,
                duplicateRows: rawXmlData.view.data.item.length - iSheetNodes.length,
                rootName: rootItemID,
                rootIndex: rootItemIdx
            });
        } else {
            // rootItemIdx was captured from the raw response; skipped rows can shift
            // its position in the normalized node list.
            rootItemIdx = iSheetNodes.findIndex(function (node) {
                return node.HTMLid === rootItemID;
            });
        }

        let sortedData = [];
        if (rootItemIdx < 0 || !iSheetNodes[rootItemIdx]) {
            throw new Error('Unable to identify the root item in the normalized iSheet data');
        }
        sortedData.push(iSheetNodes[rootItemIdx]);
        let unsortedNodes = [];
        iSheetNodes.forEach(element => {
            let attachableElement = element;
            if (options.showMajorityHoldingOnly && element.relations.id && !uniqueNodes[element.relations.id] && element.duplicateParents.length > 0) {
                let fallbackEntry = element.duplicateParents.find(function (candidateEntry) {
                    let candidate = Object.values(candidateEntry)[0];
                    return !candidate.relations.id || !!uniqueNodes[candidate.relations.id];
                });
                if (fallbackEntry) {
                    let fallbackElement = Object.values(fallbackEntry)[0];
                    fallbackElement.duplicateParents = element.duplicateParents.filter(function (candidateEntry) {
                        return Object.values(candidateEntry)[0] !== fallbackElement;
                    }).concat([{ [element.connVal?.name || element.name]: element }]);
                    uniqueNodes[element.HTMLid] = fallbackElement;
                    attachableElement = fallbackElement;
                    console.warn('[EngineerTree majority-only] Using attachable minority relationship for node', {
                        name: element.name,
                        selectedParent: element.relations.name,
                        fallbackParent: fallbackElement.relations.name
                    });
                }
            }
            if (attachableElement.relations.id) {
                let insertionID;
                insertionID = attachableElement.relations.id;
                let index = sortedData.findLastIndex(item => item.HTMLid == insertionID);
                if (index > -1) {
                    sortedData.splice(index + 1, 0, attachableElement);
                } else {
                    unsortedNodes.push(attachableElement);
                }
            }
        });
        let previousLength = unsortedNodes.length;
        while (unsortedNodes.length > 0) {
            let nodesMatched = [];
            unsortedNodes.forEach((element, i) => {
                if (element.relations.id) {
                    let index = sortedData.findLastIndex(item => item.HTMLid == element.relations.id);
                    if (index > -1) {
                        sortedData.splice(index + 1, 0, element);
                        nodesMatched.push(i);
                    }
                }
            });
            nodesMatched.toReversed().forEach(element => {
                unsortedNodes.splice(element, 1);
            });
            if (unsortedNodes.length == previousLength) {
                if (options.showMajorityHoldingOnly) {
                    console.warn('[EngineerTree majority-only] Nodes could not be attached after majority reduction', unsortedNodes.map(function (node) {
                        return {
                            name: node.name,
                            selectedParent: node.relations.name,
                            selectedHolding: node.connVal?.text,
                            parentAvailable: !!uniqueNodes[node.relations.id]
                        };
                    }));
                }
                unsortedNodes.forEach(node => {
                    if (uniqueNodes[node.HTMLid]) {
                        console.log(node.name + ' >>> ' + node.relations.name);
                        uniqueNodes[node.HTMLid].duplicateParents.push({ [node.connVal.name]: node });
                    } else {
                        renderErrors.push(node.relations.name + ' not found. Unable to add ' + node.name + ' as its parent cannot be found');
                    }
                });
                break;
            }
            previousLength = unsortedNodes.length;
        }
        console.log('EngineerTree found ' + rawXmlData.view.data.item.length + ' rows in the iSheet view and has created ' + sortedData.length + ' nodes');

        // Turn list of iSheet data into nodeStructure object
        let nodeStructure = Array.from(sortedData).reduce((acc, cur) => {
            const { relations, HTMLid, status, statusColor, label, link, otherColumns, name, itemID, itemPosition, connVal, background, userClass, duplicateParents } = cur;
            let node = {
                HTMLid,
                userClass: userClass,
                itemID: itemID,
                itemPosition: itemPosition,
                relations: relations,
                connVal: connVal,
                children: [],
                status: status,
                statusColor: statusColor,
                label: label,
                text: name,
                link: link,
                background: background,
                otherColumns: otherColumns,
                duplicateParents: duplicateParents
            };
            if (!relations.id) {
                acc = node;
            } else {
                const findParent = (obj, pid) => {
                    if (obj.HTMLid == pid) {
                        return obj;
                    }
                    if (obj.children) {
                        for (let child of obj.children) {
                            if (child.id === pid) return child;
                            let result = findParent(child, pid);
                            if (result) return result;
                        }
                    }
                    return null;
                };

                let parentNode = findParent(acc, relations.id);
                if (parentNode) {
                    parentNode.children = parentNode.children || [];
                    parentNode.children.push(node);
                } else {
                    console.warn('Unable to render node: ' + node.text);
                }
            }
            return acc;
        }, {});

        let pseudoIdx = 0;
        function insertStruts(obj) {
            if (nodeData.get(obj.relations.id) > obj.level) {
                obj.level = nodeData.get(obj.relations.id) + 1;
                nodeData.set(obj.HTMLid, obj.level);
            }
            if (obj.children) {
                obj.children.forEach(function buildStrut(child, i) {
                    child.level = obj.level + 1;
                    let lowest = nodeData.get(child.HTMLid) ? nodeData.get(child.HTMLid) : child.level;
                    if (child.level < lowest) {
                        let pseudoChild = {
                            HTMLid: child.HTMLid + '_pseudo_' + pseudoIdx,
                            relations: { id: obj.HTMLid, name: '' },
                            level: obj.level + 1,
                            pseudo: true,
                            connVal: child.connVal,
                            children: [child],
                            parents: [obj],
                            label: child.label,
                            strut: child.HTMLid
                        };
                        child.level++;
                        pseudoIdx++;
                        obj.children.splice(i, 1, pseudoChild);
                        buildStrut(obj.children[i]);
                    }
                    insertStruts(child);
                });
            }
        }

        function setDepth(obj, depth = 1) {
            if (!obj.level || depth > obj.depth) {
                obj.level = depth;
                let lowest = nodeData.get(obj.HTMLid);
                if (!lowest || depth > lowest) {
                    nodeData.set(obj.HTMLid, depth);
                }
            }
            if (obj.children) {
                obj.children.forEach(function (d) {
                    setDepth(d, depth + 1);
                });
            }
        }

        if (options.insertStruts != 'false') {
            setDepth(nodeStructure);
            insertStruts(nodeStructure);
        }

        options.nodeStructure = nodeStructure;
        renderTreeUI();
    }

    /*Treant-js
     * (c) 2013 Fran Peručić, https://github.com/fperucic
     * Treant-js may be freely distributed under the MIT license.
     * http://fperucic.github.io/treant-js
     * Dave Goodchild, https://github.com/dlgoodchild
     */
    function renderTreeUI() {
        let UTIL = {
            /**
             * Directly updates, recursively the first object with all properties in the second object
             * @param {object} applyTo
             * @param {object} applyFrom
             * @return {object}
             */
            inheritAttrs: function (applyTo, applyFrom) {
                for (let attr in applyFrom) {
                    if (applyFrom.hasOwnProperty(attr)) {
                        if ((applyTo[attr] instanceof Object && applyFrom[attr] instanceof Object) && (typeof applyFrom[attr] !== 'function')) {
                            this.inheritAttrs(applyTo[attr], applyFrom[attr]);
                        }
                        else {
                            applyTo[attr] = applyFrom[attr];
                        }
                    }
                }
                return applyTo;
            },

            /**
             * Takes any number of arguments
             * @returns {*}
             */
            extend: function () {
                Array.prototype.unshift.apply(arguments, [true, {}]);
                return $e.extend(...arguments);
            },

            /**
             * @param {object} obj
             * @returns {*}
             */
            cloneObj: function (obj) {
                if (Object(obj) !== obj) {
                    return obj;
                }
                let res = new obj.constructor();
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        res[key] = this.cloneObj(obj[key]);
                    }
                }
                return res;
            },
        };

        /**
         * ImageLoader is used for determining if all the images from the Tree are loaded.
         * Node size (width, height) can be correctly determined only when all inner images are loaded
         */
        class ImageLoader {
            constructor() {
                this.reset();
            }
            /**
             * @returns {ImageLoader}
             */
            reset() {
                this.loading = [];
                return this;
            }
            /**
             * @param {TreeNode} node
             * @returns {ImageLoader}
             */
            processNode(node) {
                let aImages = node.nodeDOM.getElementsByTagName('img');

                let i = aImages.length;
                while (i--) {
                    this.create(node, aImages[i]);
                }
                return this;
            }
            /**
             * @returns {ImageLoader}
             */
            removeAll(img_src) {
                let i = this.loading.length;
                while (i--) {
                    if (this.loading[i] === img_src) {
                        this.loading.splice(i, 1);
                    }
                }
                return this;
            }
            /**
             * @param {TreeNode} node
             * @param {Element} image
             * @returns {*}
             */
            create(node, image) {
                let self = this, source = image.src;

                function imgTrigger() {
                    self.removeAll(source);
                    node.width = node.nodeDOM.offsetWidth;
                    node.height = node.nodeDOM.offsetHeight;
                }

                if (image.src.indexOf('data:') !== 0) {
                    this.loading.push(source);

                    if (image.complete) {
                        return imgTrigger();
                    }

                    UTIL.addEvent(image, 'load', imgTrigger);
                    UTIL.addEvent(image, 'error', imgTrigger); // handle broken url-s

                    // load event is not fired for cached images, force the load event
                    image.src += ((image.src.indexOf('?') > 0) ? '&' : '?') + new Date().now();
                }
                else {
                    imgTrigger();
                }
            }
            /**
             * @returns {boolean}
             */
            isNotLoading() {
                return (this.loading.length === 0);
            }
        }


        /**
         * Class: TreeStore
         * TreeStore is used for holding initialized Tree objects
         *  Its purpose is to avoid global variables and enable multiple Trees on the page.
         */
        let TreeStore = {
            store: [],
            /**
             * @param {object} jsonConfig
             * @returns {Tree}
             */
            createTree: function (jsonConfig) {
                let nNewTreeId = this.store.length;
                this.store.push(new Tree(jsonConfig, nNewTreeId));
                return this.store[nNewTreeId];
            },
            /**
             * @param {number} treeId
             * @returns {Tree}
             */
            get: function (treeId) {
                return this.store[treeId];
            }
        };

        /**
         * Tree constructor.
         * @param {object} jsonConfig
         * @param {number} treeId
         * @constructor
         */
        let Tree = function (jsonConfig, treeId) {

            this.buildMenu = function () {
                this.container = $e('#' + options.container);
                let $treeManager = $e('<div>')
                    .addClass('tree-manager')
                    .hide();
                let $menu = $e('<div>')
                    .addClass('tree-menu');
                if (options.enableSearch != 'false') {
                    let $from = $e('<input>')
                        .addClass('search-from')
                        .attr('placeholder', 'Search From:');
                    let $to = $e('<input>')
                        .addClass('search-to')
                        .attr('placeholder', 'Search To:');
                    let $search = $e('<button>')
                        .attr('title', 'Locate a single node by name using just the Search From box\nor search for the connection chain between two nodes using both boxes')
                        .text('Search')
                        .addClass('btn btn-default margRight5')
                        .click(treeSearch);
                    let $limitNumber = $e('<select>')
                        .addClass('limit-value');
                    for (let i = 1; i <= 20; i++) { $limitNumber.append('<option value="' + i + '">' + i + '</option>'); }
                    let $limitDir = $e('<select>')
                        .addClass('limit-dir')
                        .append('<option value="both">Both</option>')
                        .append('<option value="down">Down</option>')
                        .append('<option value="up">Up</option>');
                    let $limit = $e('<button>')
                        .attr('title', 'Limit the tree to a sub-tree using the Search From box and selecting\nthe number of levels and direction to limit')
                        .text('Limit')
                        .addClass('btn btn-default margRight5')
                        .click(treeLimit);
                    let $clear = $e('<button>')
                        .text('Reset')
                        .attr('title', 'Reset the tree to its original state')
                        .addClass('btn btn-default')
                        .click(function () {
                            thisTree.reset(thisTree.initJsonConfig, 0).redraw();
                            $e('#' + options.container + ' .tree-menu .alert').remove();
                        });
                    let $searchmenu = $e('<div>')
                        .addClass('tree-search-menu')
                        .append($from)
                        .append($to)
                        .append($search)
                        .append($limitNumber)
                        .append($limitDir)
                        .append($limit)
                        .append($clear);
                    $menu.append($searchmenu);
                }
                if (options.enablePrune != 'false') {
                    let $pruneModeButton = $e('<button>')
                        .text('Prune Mode')
                        .attr('title', 'Select individual nodes to hide from the tree')
                        .addClass('btn btn-default pruneMode')
                        .click(function () {
                            prunedRows = [];
                            $e(this).addClass('hidden');
                            $e('#' + options.container + ' .pruneTree').removeClass('hidden');
                            $e('#' + options.container + ' .pruneCancel').removeClass('hidden');
                            thisTree.pruneMode(thisTree.nodeDB);
                        });
                    $menu.append($pruneModeButton);
                    let $pruneButton = $e('<button>')
                        .text('Prune')
                        .addClass('btn btn-danger pruneTree hidden')
                        .click(function () {
                            thisTree.pruneTree(thisTree.nodeDB, prunedRows);
                        });
                    $menu.append($pruneButton);
                    let $pruneCancel = $e('<button>')
                        .text('Cancel')
                        .addClass('btn btn-warning pruneCancel hidden')
                        .click(function () {
                            $e(this).addClass('hidden');
                            $e('#' + options.container + ' .pruneTree').addClass('hidden');
                            $e('#' + options.container + ' .pruneMode').removeClass('hidden');
                            thisTree.pruneCancel(thisTree.nodeDB);
                        });
                    $menu.append($pruneCancel);
                }
                if (options.fullscreenButton != 'false') {
                    let $fullScreen = $e('<button>')
                        .text('Full Screen')
                        .attr('title', 'Allow tree to use the full width of your screen')
                        .addClass('btn btn-default')
                        .click(function () {
                            let $outerWidth = $e('.homePage .grid');
                            if ($outerWidth.length > 0) {
                                if ($outerWidth.css('max-width') != '100%') {
                                    $e('.homePage .grid').css('max-width', '100%');
                                    $e('#' + options.container + ' svg').css('float', 'left');
                                } else {
                                    $e('.homePage .grid').css('max-width', '1400px');
                                }
                            }
                        });
                    $menu.append($fullScreen);
                }
                if (options.exportButton == 'true') {
                    try {
                        if (typeof (window['html2canvas']()) == 'function') {
                            console.log('html2canvas already loaded - initializing...');
                            addExportButton();
                        }
                    } catch (error) {
                        engineercore_load('html2canvas').then(function () {
                            console.log('html2canvas imported successfully');
                            addExportButton();
                        });
                    }
                }
                if (options.exportCSVButton == 'true') {
                    try {
                        if (window.engineerLegalPlugins.table) {
                            console.log('table already loaded - initializing...');
                            addExportCSVButton();
                        }
                    } catch (error) {
                        engineercore_load('table').then(function () {
                            console.log('table imported successfully');
                            addExportCSVButton();
                        });
                    }
                }
                if (options.manageTreeButton == 'true') {
                    console.log('Adding manage tree button...');
                    addManageTreeButton();
                }
                let $menuAlerts = $e('<div>')
                    .addClass('tree-menu');
                $e('<div>')
                    .addClass('tree-limit alert alert-warning margTop5 hidden')
                    .text('Tree limited')
                    .appendTo($menuAlerts);
                $e('<div>')
                    .addClass('tree-prune alert alert-warning margTop5 hidden')
                    .text('Tree pruned')
                    .appendTo($menuAlerts);
                $e('<div>')
                    .addClass('tree-collapse alert alert-warning margTop5 hidden')
                    .text('Tree collapsed')
                    .appendTo($menuAlerts);
                if (options.enableZoomPan) { $e('<div>').addClass('tree-zoompan alert alert-info margTop5').text('Mousewheel zoom, right-click and drag enabled').appendTo($menuAlerts); }

                function addExportButton() {
                    $menu.append($e('<button type="button" class="nav-link btn btn-default nav-export"/>')
                        .html('Export Chart')
                        .attr('title', 'Export your current view of the tree')
                        .click(function () {
                            engineercore_modal('Export');
                            let $modalBody = $e('#engineerModal .modal-body')
                                .attr('id', 'engModalBody');
                            if (window.screen.isExtended && $e('.dualscreen').length == 0) {
                                $e('#engineerModalHeader').append('<div class="alert-info marg0 dualscreen">Dual screens may cause export issues, if so, move this window to your primary display and try again</div>');
                            }
                            function addExportTableButton() {
                                let $tableButton = $e('<button>')
                                    .text('Table View')
                                    .addClass('btn btn-default')
                                    .css('margin-left', '10px')
                                    .click(function () {
                                        $e('#el-modal-header-msg').remove();
                                        let tableRows = [];
                                        thisTree.nodeDB.db.forEach(dbnode => {
                                            if (!dbnode.pseudo) {
                                                tableRows.push(dbnode.itemPosition - 1);
                                                let shadows = dbnode.hasShadow;
                                                if (shadows) {
                                                    shadows.forEach(sNodeId => {
                                                        tableRows.push(thisTree.nodeDB.get(sNodeId).itemPosition - 1);
                                                    });
                                                }
                                            }
                                        });
                                        $modalBody.empty();
                                        engineerTable({
                                            container: 'engModalBody',
                                            iSheetViewLink: tableOptions.iSheetViewLink,
                                            selectedRows: tableRows.toString(),
                                            exportButton: 'true',
                                        });
                                    });
                                $e('#engineerModalHeader').append($tableButton);
                            }
                            try {
                                if (window.engineerLegalPlugins.table) {
                                    console.log('table already loaded - initializing...');
                                    addExportTableButton();
                                }
                            } catch (error) {
                                engineercore_load('table').then(function () {
                                    console.log('table imported successfully');
                                    addExportTableButton();
                                });
                            }
                            let $treeBody = $e('#' + options.container + ' .engineertreescroll');
                            let originalTreeWidth = $treeBody.width();
                            if (rightMostNode > 32767) {
                                alert('Your chart is too large to export you may need to user your browser screenshot tool instead');
                                return;
                            }
                            $e('#engineerModal .modal-dialog').width('99%');
                            let $outerWidth = $e('.homePage .grid');
                            let lastWidth;
                            if ($outerWidth.length > 0) {
                                if ($outerWidth.css('max-width') != '100%') {
                                    lastWidth = $outerWidth.css('max-width');
                                    $e('.homePage .grid').css('max-width', '100%');
                                } else {
                                    $e('.homePage .grid').css('max-width', '1400px');
                                }
                            }
                            let exportWidth;
                            let leftOffset = 0;
                            try {
                                const nodes = thisTree.nodeDB.db.filter(n => !n.pseudo && !n.searchHide && !n.hidden);
                                if (nodes && nodes.length > 0) {
                                    const minX = Math.min(...nodes.map(n => n.X));
                                    const maxX = Math.max(...nodes.map(n => n.X + (n.width || 0)));
                                    const padding = 20;
                                    exportWidth = Math.ceil(maxX - minX) + padding * 2;
                                    leftOffset = Math.max(0, Math.floor(minX - padding));
                                } else {
                                    exportWidth = rightMostNode + (rightMostNodeWidth * 2);
                                    leftOffset = Math.max(0, Math.floor(leftMostNode - 10));
                                }
                            } catch (err) {
                                exportWidth = rightMostNode + (rightMostNodeWidth * 2);
                                leftOffset = Math.max(0, Math.floor(leftMostNode - 10));
                            }

                            $treeBody.width(exportWidth);
                            $treeBody.scrollLeft(leftOffset);
                            html2canvas(document.querySelector('#' + options.container + ' .engineertreescroll'), { scrollX: 0, scrollY: 0, windowWidth: exportWidth, width: exportWidth })
                                .then(canvas => {
                                    $modalBody.empty()
                                        .append(canvas)
                                        .prepend('<p id="el-modal-header-msg">Right click the below image and select Save As to export</p>');
                                })
                                .catch(error => {
                                    alert('Unable to export at this time - ' + error);
                                });
                            $treeBody.width(originalTreeWidth);
                            $e('.homePage .grid').css('max-width', lastWidth);
                            $e('#engineerModal').modal();
                        })
                    );
                }

                function addExportCSVButton() {
                    $menu.append($e('<button type="button" class="nav-link btn btn-default nav-export"/>')
                        .html('Export CSV')
                        .attr('title', 'Export your current view of the tree to a CSV file')
                        .click(function () {
                            engineercore_modal('Export');
                            let $modalBody = $e('#engineerModal .modal-body')
                                .attr('id', 'engModalBody');

                            let tableRows = [];
                            thisTree.nodeDB.db.forEach(dbnode => {
                                if (!dbnode.pseudo) {
                                    tableRows.push(dbnode.itemPosition - 1);
                                    let shadows = dbnode.hasShadow;
                                    if (shadows) {
                                        shadows.forEach(sNodeId => {
                                            tableRows.push(thisTree.nodeDB.get(sNodeId).itemPosition - 1);
                                        });
                                    }
                                }
                            });
                            $modalBody.empty();
                            $e('#engineerModal').modal();
                            engineerTable({
                                container: 'engModalBody',
                                iSheetViewLink: tableOptions.iSheetViewLink,
                                selectedRows: tableRows.toString(),
                                exportButton: 'true',
                                onRender: function () {
                                    $e('#engModalBody-export').click();
                                    $modalBody.empty();
                                    $modalBody.text('Export complete, please check your downloads folder for the file.');
                                }
                            });
                        })
                    );
                }

                function addManageTreeButton() {
                    let manageTreeInitialized = false;
                    $menu.append($e('<button type="button" class="nav-link btn btn-default nav-manage"/>')
                        .html('Manage Tree')
                        .click(function () {
                            let $treeManager = $e('#' + options.container + ' .tree-manager');
                            if (manageTreeInitialized) {
                                $treeManager.toggle();
                                return;
                            }
                            manageTreeInitialized = true;
                            $treeManager.show();

                            // Manage Tree functionality

                            var App = {};

                            // ---- State -------------------------------------------------------------
                            App.state = {
                                sheetId: options.sheetID,
                                viewId: options.sheetViewID,
                                columns: [],        // [{sequence, columnid, columntypealias, columnvalue}]
                                items: [],          // normalized rows: {itemid, values: {columnid: displayValue}}
                                rawItems: [],       // original item objects from the API
                                tree: null,         // {name: node} root map
                                roots: [],          // root node names
                                selectedEntity: null,
                                nameColumnId: null,
                                parentColumnId: null,
                                eliminateColumnId: null,
                                eliminatedChoiceId: null,
                                lastUrl: options.iSheetViewLink,
                            };

                            App.getNameColumn = function () {
                                return App.findColumnById(App.state.nameColumnId) || App.state.columns[Number.parseInt(options.nameColumn)];
                            };

                            App.getParentColumn = function () {
                                return App.findColumnById(App.state.parentColumnId) || App.state.columns[Number.parseInt(options.parentColumn)];
                            };

                            App.getEliminateColumn = function () {
                                return App.findColumnByName(options.eliminateColumnName);
                            };

                            App.rebuildTree = function () {
                                if (!App.state.items.length) return;
                                var nameCol = App.getNameColumn();
                                if (!nameCol) return;
                                App.state.roots = buildEntityNames(App.state.items, nameCol.columnid);
                                if ($e('#etm-main').length) {
                                    App.renderMain();
                                }
                            };

                            // ---- Utilities --------------------------------------------------------

                            App.logApi = function (label, details) {
                                console.log('[EngineerTreeManager API]', label, details || {});
                            };

                            App.logApiError = function (label, xhr, status, error) {
                                console.error('[EngineerTreeManager API ERROR]', label, {
                                    status: xhr?.status,
                                    statusText: xhr?.statusText,
                                    readyState: xhr?.readyState,
                                    responseText: xhr?.responseText,
                                    responseURL: xhr?.responseURL,
                                    responseHeaders: xhr?.getAllResponseHeaders?.(),
                                    error: error,
                                    statusCode: status
                                });
                            };

                            // Extract a readable display value from a column's displaydata object,
                            // handling text, choice, number, hyperlink and auto-increment columns.
                            function getDisplayValue(col) {
                                var dd = col.displaydata || {};
                                if (dd.value !== undefined && dd.value !== '' && dd.value !== null) {
                                    return String(dd.value);
                                }
                                if (dd.choices?.choice?.label) {
                                    return dd.choices.choice.label;
                                }
                                if (dd.linkdisplayname) {
                                    return dd.linkdisplayname;
                                }
                                return '';
                            }

                            // Normalize one API item into {itemid, values:{columnid:val}, raw: item}.
                            function normalizeItem(item) {
                                var values = {};
                                var cols = item.column || [];
                                var i;
                                for (i = 0; i < cols.length; i++) {
                                    values[cols[i].attributecolumnid] = getDisplayValue(cols[i]);
                                }
                                return { itemid: item.itemid, values: values, raw: item };
                            }

                            // Return the unique entity names used by the manager picker.
                            function buildEntityNames(items, nameColId) {
                                var names = [];
                                var seen = Object.create(null);
                                var i;
                                for (i = 0; i < items.length; i++) {
                                    var name = items[i].values[nameColId];
                                    if (name && !seen[name]) {
                                        seen[name] = true;
                                        names.push(name);
                                    }
                                }
                                return names.sort(function (left, right) {
                                    return left.localeCompare(right);
                                });
                            }

                            // Build a PUT payload to update one column on one item. The itemid is
                            // required so the iSheet API knows which row to update.
                            function buildUpdatePayload(itemid, columnId, value) {
                                return {
                                    data: {
                                        item: [
                                            {
                                                itemid: String(itemid),
                                                column: [
                                                    {
                                                        attributecolumnid: String(columnId),
                                                        rawdata: { value: String(value) }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                };
                            }

                            // Build a PUT payload to eliminate one item by setting the eliminate column to the eliminated status value.
                            function buildEliminatePayload(itemid, columnId, value) {
                                return {
                                    data: {
                                        item: [
                                            {
                                                itemid: String(itemid),
                                                column: [
                                                    {
                                                        attributecolumnid: String(columnId),
                                                        rawdata: {
                                                            choices: {
                                                                choice: [
                                                                    {
                                                                        id: String(value)
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                };
                            }

                            // PUT an update to the iSheet items endpoint. Returns a promise.
                            function putUpdate(sheetId, itemid, payload) {
                                var url = './api/20/isheet/' + sheetId + '/items/' + itemid;
                                App.logApi('PUT start', { url: url, itemid: itemid, payload: payload });
                                return $e.ajax({
                                    url: url,
                                    method: 'PUT',
                                    contentType: 'application/json',
                                    dataType: 'text',
                                    headers: { Accept: 'application/json' },
                                    data: JSON.stringify(payload)
                                }).done(function (data) {
                                    if (data === '' || data === null || data === undefined) {
                                        App.logApi('PUT success (empty body)', { url: url, itemid: itemid, status: 200, response: data });
                                    } else {
                                        App.logApi('PUT success', { url: url, itemid: itemid, response: data });
                                    }
                                }).fail(function (xhr, status, error) {
                                    if ((xhr?.status === 200) || (xhr?.status === 204)) {
                                        App.logApi('PUT resolved with HTTP success but empty body', {
                                            url: url,
                                            itemid: itemid,
                                            status: xhr?.status,
                                            responseText: xhr?.responseText,
                                            error: error
                                        });
                                        return;
                                    }
                                    App.logApiError('PUT failed', xhr, status, error);
                                });
                            }

                            // Retry a PUT once on failure, then resolve/reject.
                            function putUpdateWithRetry(sheetId, itemid, payload) {
                                return putUpdate(sheetId, itemid, payload).then(
                                    null,
                                    function () { return putUpdate(sheetId, itemid, payload); }
                                );
                            }

                            // ---- Rendering --------------------------------------------------------

                            App.init = function (containerId) {
                                App.state.containerId = containerId;
                                var $c = $e('#' + containerId).empty();
                                $c.append(App.renderShell());
                                App.bindShell($c);
                            };

                            App.showEntryForm = function () {
                                var containerId = App.state.containerId;
                                var $c = $e('#' + containerId).empty();
                                $c.append(App.renderShell());
                                App.bindShell($c);
                            };

                            App.renderShell = function () {
                                return $e(
                                    '<div class="etm-wrap">' +
                                    '<div class="etm-header">' +
                                    '<h3 style="margin: 0;">EngineerTree Manager</h3>' +
                                    '<p>Manage your entity tree by adding and entity or searching for an entity to edit. This tool will make changes to your entity isheet, use with caution.</p>' +
                                    '<div class="etm-load-msg" style="margin-top:12px;">Loading...</div>' +
                                    '</div>' +
                                    '<div class="etm-main" style="display:block;"></div>' +
                                    '</div>'
                                );
                            };

                            App.bindShell = function ($c) {
                                console.log('Loading sheetId=' + App.state.sheetId + ', viewId=' + App.state.viewId);
                                App.loadColumnDetails(App.state.sheetId, App.state.viewId);
                                App.loadSheet(App.state.sheetId, App.state.viewId);
                            };

                            // ---- Data loading -----------------------------------------------------

                            // Fetch all items from the sheet, paginating until we have them all.
                            App.loadSheet = function (sheetId, viewId) {
                                var $main = $e('#' + options.container + ' .etm-main').hide();
                                App.showMsg('#' + options.container + ' .etm-load-msg', 'Loading tree data...', 'info');

                                var limit = 100;
                                var offset = 0;
                                var lookupData = {};

                                getItems();
                                function getItems() {
                                    let requestOptions = {
                                        method: 'GET',
                                        headers: {
                                            'Accept': 'application/json'
                                        }
                                    };
                                    let params = new URLSearchParams({
                                        sheetviewid: viewId,
                                        limit: limit,
                                        offset: offset,
                                    });
                                    fetch('./api/20/isheet/' + sheetId + '/items?' + params.toString(), requestOptions)
                                        .then(response => {
                                            if (response.status == 200) {
                                                return response.json();
                                            } else {
                                                console.log('Unable to get lookup data from source isheet');
                                                App.showMsg('#' + options.container + ' .etm-load-msg', 'Failed to load sheet: ' + (response.message || 'unknown error'), 'danger');
                                            }
                                        })
                                        .then(result => {
                                            if (Number.parseInt(result.isheet.recordcount) > 0) {
                                                let isheetData = result.isheet || {}; 
                                                if (!App.state.columns.length && isheetData.head?.headcolumn) {
                                                    App.state.columns = Array.isArray(isheetData.head.headcolumn) ? isheetData.head.headcolumn : [isheetData.head.headcolumn];
                                                }
                                                if ($e.isEmptyObject(lookupData)) {
                                                    lookupData = result;
                                                } else {
                                                    if (Number.parseInt(result.isheet.recordcount) == 1) {
                                                        isheetData.data.item = [isheetData.data.item];
                                                    }
                                                    lookupData.isheet.data.item = lookupData.isheet.data.item.concat(isheetData.data.item);
                                                    lookupData.isheet.recordcount = Number.parseInt(lookupData.isheet.recordcount) + Number.parseInt(isheetData.recordcount);
                                                }
                                                if (Number.parseInt(result.isheet.recordcount) == limit) {
                                                    console.warn('Greater than ' + limit + ' records returned');
                                                    offset += limit;
                                                    getItems();
                                                    return;
                                                }
                                            }
                                            if (lookupData.isheet.data.item.length > 0) {
                                                validateResponse(lookupData.isheet.data.item);
                                            }
                                            else {
                                                reportStatus('fail', 'Source iSheet empty or incorrectly configured');
                                                console.error('Source iSheet empty');
                                            }
                                        })
                                        .catch(error => {
                                            App.showMsg('#' + options.container + ' .etm-load-msg', 'Failed to load sheet: ' + (error.message || 'unknown error'), 'danger');
                                        });
                                }

                                function validateResponse(items) {
                                    console.log('Validating response', items);
                                    App.state.rawItems = items;
                                    App.state.items = items.map(normalizeItem);
                                    var nameCol = App.getNameColumn();
                                    App.state.roots = buildEntityNames(App.state.items, nameCol.columnid);
                                    App.showMsg('#' + options.container + ' .etm-load-msg', 'Loaded ' + App.state.items.length + ' entities. Either type a company name or select one from the list to begin.', 'success');
                                    App.renderMain();
                                    $main.show();
                                }
                            };


                            App.loadColumnDetails = function (sheetId, viewId) {
                                var requestUrl = './api/20/isheets/admin/' + sheetId + '/columns?sheetviewid=' + viewId;
                                $e.ajax({
                                    url: requestUrl,
                                    method: 'GET',
                                    headers: { Accept: 'application/json' }
                                }).then(function (data) {
                                    let editPermission;
                                    if (data.column?.length) {
                                        data.column.forEach(function (col) {
                                            if (col.editpermission == 1) {
                                                editPermission = true;
                                            }
                                            if (col.name === options.eliminateColumnName) {
                                                App.state.eliminateColumnId = col.columnid;
                                                if (col.columnspecificdetail.choices?.choice?.length) {
                                                    for (const element of col.columnspecificdetail.choices.choice) {
                                                        if (element.label == '<![CDATA[' + options.eliminateStatus + ']]>') {
                                                            App.state.eliminatedChoiceId = element.id;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    if (!editPermission) {
                                        App.showMsg('#' + options.container + ' .etm-load-msg', 'You do not have permission to edit this sheet. You can view the tree but cannot make changes.', 'warning');
                                        $e('#' + options.container + ' .etm-main').remove();
                                    }
                                }, function (error_, status, error) {
                                    App.logApiError('GET columns failed', error_, status, error);
                                    throw error_;
                                });

                            };

                            App.findColumnBySequence = function (seq) {
                                var i;
                                for (i = 0; i < App.state.columns.length; i++) {
                                    if (String(App.state.columns[i].sequence) === String(seq)) return App.state.columns[i];
                                }
                                return null;
                            };

                            App.findColumnByName = function (name) {
                                let i;
                                let nameUpper = String(name).toUpperCase();
                                for (i = 0; i < App.state.columns.length; i++) {
                                    if (String(App.state.columns[i].columnvalue).toUpperCase() === nameUpper) return App.state.columns[i];
                                }
                                return null;
                            };

                            App.findColumnById = function (id) {
                                var i;
                                for (i = 0; i < App.state.columns.length; i++) {
                                    if (String(App.state.columns[i].columnid) === String(id)) return App.state.columns[i];
                                }
                                return null;
                            };

                            // ---- Main panel (search + actions) ------------------------------------

                            App.renderMain = function () {
                                var $main = $e('#' + options.container + ' .etm-main').empty();
                                var $addPanel = $e('<div class="etm-actions" style="margin-top:12px;"><h4>Add Entity</h4><p>Add a new entity to the tree using the HighQ iSheet form, please refresh manually when finished.</p></div>');
                                buildAddButton($addPanel);
                                $main.append(
                                    '<div class="row" style="margin-top:16px 0px; padding: 0 15px;">' +
                                    '<div class="col-sm-8">' +
                                    $addPanel.html() +
                                    '<div class="etm-card">' +
                                    '<h4>Find an entity to edit</h4>' +
                                    '<label class="etm-label" for="etm-search" style="display: block;">Search for an entity to edit, or pick it from the list to the right</label>' +
                                    '<input type="text" class="form-control etm-typeahead etm-search" style="float: none; margin-bottom: 10px;" placeholder="Type a company name..." autocomplete="off" />' +
                                    '</div>' +
                                    '<div class="etm-confirm" style="margin-top:12px;clear:both"></div>' +
                                    '<div class="etm-actions" style="margin-top:12px;"></div>' +
                                    '<div class="etm-workspace" style="margin-top:12px;"></div>' +
                                    '</div>' +
                                    '<div class="col-sm-4">' +
                                    '<div class="etm-card etm-tree-card">' +
                                    '<div class="etm-section-title"><h4>Entity List</h4></div>' +
                                    '<div class="etm-tree" style="max-height: 500px; overflow-y: auto;"></div>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>'
                                );
                                $e('#' + options.container + ' .etm-tree').html(App.renderTree());
                                console.log(App.state);
                                var nameCol = App.getNameColumn();
                                var names = App.state.items.map(function (it) {
                                    return { value: it.values[nameCol.columnid] };
                                }).filter(function (n) { return !!n.value; }).filter(function (n, idx, arr) {
                                    return arr.findIndex(function (item) { return item.value === n.value; }) === idx;
                                });
                                console.log(names);
                                // Bootstrap 3 typeahead via the bootstrap3-typeahead jQuery plugin
                                // If unavailable we fall back to a simple datalist.
                                var $search = $e('#' + options.container + ' .etm-search');
                                if (window.Bloodhound) {
                                    var bh = new Bloodhound({
                                        datumTokenizer: function (d) {
                                            console.log(d);
                                            return Bloodhound.tokenizers.whitespace(d.value);

                                        },
                                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                                        local: names
                                    });
                                    bh.initialize();
                                    $search.typeahead({ highlight: true, minLength: 1 }, { source: bh.ttAdapter(), name: 'entities', display: 'value' });
                                } else {
                                    $search.attr('list', options.container + ' .etm-name-list');
                                    $main.append('<datalist id="' + options.container + ' .etm-name-list">' + names.map(function (n) { return '<option value="' + App.esc(n.value) + '">'; }).join('') + '</datalist>');
                                }

                                $e('#' + options.container + ' .etm-tree').on('click', '.etm-tree-company', function () {
                                    $e('#' + options.container + ' .etm-search').val($e(this).text().trim()).trigger('typeahead:selected');
                                });

                                $search.on('typeahead:select typeahead:selected', function () {
                                    App.onSearchSelect($e(this).val().trim());
                                });

                                try {
                                    rebindCKContentLink();
                                } catch (err) {
                                    console.warn('Failed to rebind CKContextLinks', err);
                                }
                            };

                            App.renderTree = function () {
                                if (!App.state.roots.length) return '<div class="text-muted">No entities were found.</div>';
                                return App.state.roots.map(function (name) {
                                    return '<div class="etm-tree-node"><a class="etm-tree-company">' + App.esc(name) + '</a></div>';
                                }).join('');
                            };

                            App.onSearchSelect = function (name) {
                                var nameCol = App.getNameColumn();
                                var item = null;
                                var i;
                                for (i = 0; i < App.state.items.length; i++) {
                                    if (App.state.items[i].values[nameCol.columnid] === name) { item = App.state.items[i]; break; }
                                }
                                if (!item) {
                                    $e('#' + options.container + ' .etm-confirm').html('<div class="alert alert-warning">No entity found with that name.</div>');
                                    $e('#' + options.container + ' .etm-actions').empty();
                                    return;
                                }
                                App.state.selectedEntity = item;
                                App.renderConfirm(item);
                                App.renderActions();
                            };

                            App.renderConfirm = function (item) {
                                var nameCol = App.getNameColumn();
                                var parentCol = App.getParentColumn();
                                var entityName = item.values[nameCol.columnid] || '';
                                var labelColumnOption = options.labelColumns !== undefined ? options.labelColumns : options.labelColumn;
                                var labelColumnIndexes = [];
                                if (labelColumnOption !== 'false' && labelColumnOption !== null && labelColumnOption !== undefined) {
                                    String(labelColumnOption).split(',').forEach(function (index) {
                                        var parsedIndex = Number.parseInt(index, 10);
                                        if (!Number.isNaN(parsedIndex) && !labelColumnIndexes.includes(parsedIndex)) {
                                            labelColumnIndexes.push(parsedIndex);
                                        }
                                    });
                                }
                                var shares = App.state.items.filter(function (share) {
                                    return share.values[nameCol.columnid] === entityName;
                                });
                                var pills = shares.map(function (share) {
                                    var shareholder = share.values[parentCol.columnid] || 'Unassigned';
                                    var labels = labelColumnIndexes.map(function (index) {
                                        var col = App.state.columns[index];
                                        return col ? share.values[col.columnid] : '';
                                    }).filter(function (value) { return !!value; });
                                    var text = shareholder + (labels.length ? ' (' + labels.join(', ') + ')' : '');
                                    return '<span class="label label-default" style="display:inline-block; margin:0 6px 6px 0;">' + App.esc(text) + '</span>';
                                }).join('');
                                var html = '<div class="panel panel-default"><div class="panel-heading"><b>Entity:</b> ' + App.esc(entityName) + '</div><div class="panel-body">' +
                                    '<b>Shareholders</b><div style="margin-top:8px;">' + (pills || '<span class="text-muted">No shareholders found.</span>') + '</div></div></div>';
                                $e('#' + options.container + ' .etm-confirm').html(html);
                            };

                            App.renderActions = function () {
                                let $actions = $e('#' + options.container + ' .etm-actions');
                                $actions.html(
                                    '<div class="btn-group" role="group">' +
                                    '<button class="btn btn-default etm-act-rename">Rename Entity</button>' +
                                    '<button class="btn btn-default etm-act-move">Transfer Shares</button>' +
                                    '<button class="btn btn-warning etm-act-eliminate" '+(!App.state.eliminatedChoiceId ? 'disabled title="Unable to locate Eliminate choice column"' : '')+'">Eliminate Entity</button>'+
                                    (options.allowDelete == 'true' ? '<button class="btn btn-danger etm-act-delete">Delete Entity</button>' : '') +
                                    '</div>'
                                );
                                $actions.on('click.etmActions', '.etm-act-rename', App.openRename);
                                $actions.on('click.etmActions', '.etm-act-move', App.openMove);
                                $actions.on('click.etmActions', '.etm-act-eliminate', App.openEliminate);
                                $actions.on('click.etmActions', '.etm-act-delete', App.openDelete);
                                $e('#' + options.container + ' .etm-workspace').empty();
                            };

                            // ---- Add --------------------------------------------------------------

                            function buildAddButton(menuDiv) {
                                if (options.addItemButton != 'false') {
                                    let addButton = $e('<a>')
                                        .text('Add New Entity')
                                        .addClass('btn btn-success CKContextLink add-button el-menu-item')
                                        .attr('href', engineerLegal_buildISheetUrl(options.iSheetViewLink, 'sheetHome', false, false))
                                        .attr('id', '{"linkType":"iSheetAddItem","siteID":"' + options.siteID + '","contextID":"' + options.sheetID + '","sheetViewID":"' + options.sheetViewID + '","linkedFromCKEditor":true}')
                                        .attr('target', '_SELF');
                                    menuDiv.append(addButton);
                                }
                            }

                            // ---- Rename -----------------------------------------------------------

                            App.openRename = function () {
                                var item = App.state.selectedEntity;
                                var nameCol = App.getNameColumn();
                                var currentName = item.values[nameCol.columnid];
                                $e('#' + options.container + ' .etm-workspace').html(
                                    '<div class="panel panel-default"><div class="panel-heading"><b>Rename entity</b></div><div class="panel-body">' +
                                    '<p>Renaming <b>' + App.esc(currentName) + '</b> will also update any entities that list it as their parent.</p>' +
                                    '<label class="etm-label" for="etm-new-name">New name</label>' +
                                    '<input type="text" class="form-control etm-new-name" value="' + App.esc(currentName) + '" />' +
                                    '<div style="margin-top:10px;"><button class="btn btn-default etm-rename-go">Apply rename</button> ' +
                                    '<button class="btn btn-link etm-cancel">Cancel</button></div>' +
                                    '<div class="etm-rename-msg" style="margin-top:10px;"></div>' +
                                    '</div></div>'
                                );
                                $e('#' + options.container + ' .etm-cancel').on('click', App.renderActions);
                                $e('#' + options.container + ' .etm-rename-go').on('click', function () {
                                    App.doRename(item, $e('#' + options.container + ' .etm-new-name').val().trim());
                                });
                            };

                            // Rename the selected entity and every child row that references it as
                            // its parent. All updates are attempted; on any failure the already-
                            // succeeded updates are rolled back.
                            App.doRename = function (item, newName) {
                                if (!newName) {
                                    App.showMsg('#' + options.container + ' .etm-rename-msg', 'Please enter a new name.', 'danger');
                                    return;
                                }
                                var nameCol = App.getNameColumn();
                                var parentCol = App.getParentColumn();
                                var oldName = item.values[nameCol.columnid];
                                var sheetId = App.state.sheetId;

                                // Collect every (itemid, columnId, value) update we need to make.
                                var updates = [
                                    { itemid: item.itemid, columnId: nameCol.columnid, value: newName }
                                ];
                                var i;
                                for (i = 0; i < App.state.items.length; i++) {
                                    var it = App.state.items[i];
                                    if (it.itemid === item.itemid) continue;
                                    if (it.values[parentCol.columnid] === oldName) {
                                        updates.push({ itemid: it.itemid, columnId: parentCol.columnid, value: newName });
                                    } else if (it.values[nameCol.columnid] === oldName) {
                                        updates.push({ itemid: it.itemid, columnId: nameCol.columnid, value: newName });
                                    } else if (it.values[nameCol.columnid] === newName) {
                                        App.showMsg('#' + options.container + ' .etm-rename-msg', 'Rename failed: another entity already has the new name.', 'danger');
                                        return;
                                    }
                                }

                                var $btn = $e('#' + options.container + ' .etm-rename-go').prop('disabled', true).text('Applying...');
                                var done = [];

                                // Run updates sequentially so we can roll back precisely.
                                function next(idx) {
                                    if (idx >= updates.length) {
                                        return $e.Deferred().resolve();
                                    }
                                    var u = updates[idx];
                                    var payload = buildUpdatePayload(u.itemid, u.columnId, u.value);
                                    return putUpdateWithRetry(sheetId, u.itemid, payload).then(function () {
                                        done.push(u);
                                        return next(idx + 1);
                                    }, function (error_) {
                                        // stop the chain
                                        return $e.Deferred().reject(error_);
                                    });
                                }

                                next(0).then(function () {
                                    App.showMsg('#' + options.container + ' .etm-rename-msg', 'Renamed ' + updates.length + ' record(s) successfully.', 'success');
                                    App.reloadAfterEdit();
                                }).fail(function (xhr) {
                                    // Rollback succeeded updates
                                    App.rollback(done, sheetId).always(function () {
                                        $btn.prop('disabled', false).text('Apply rename');
                                        App.showMsg('#' + options.container + ' .etm-rename-msg',
                                            'Rename failed and was rolled back. ' + done.length + ' change(s) were reverted. (' + (xhr.statusText || 'error') + ')',
                                            'danger');
                                    });
                                });
                            };

                            // ---- Move -------------------------------------------------------------

                            App.openMove = function () {
                                var nameCol = App.getNameColumn();
                                var currentName = App.state.selectedEntity.values[nameCol.columnid];
                                var shares = App.state.items.filter(function (it) {
                                    return it.values[nameCol.columnid] === currentName;
                                });
                                var names = App.state.items.map(function (it) {
                                    return it.values[nameCol.columnid];
                                }).filter(function (n) { return !!n && n !== currentName; }).filter(function (n, idx, arr) {
                                    return arr.indexOf(n) === idx;
                                });

                                var visibleColumnIndexes = [];
                                function addVisibleColumn(index) {
                                    var parsedIndex = Number.parseInt(index, 10);
                                    if (!Number.isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < App.state.columns.length && !visibleColumnIndexes.includes(parsedIndex)) {
                                        visibleColumnIndexes.push(parsedIndex);
                                    }
                                }
                                addVisibleColumn(options.nameColumn);
                                addVisibleColumn(options.parentColumn);
                                addVisibleColumn(options.labelColumn);
                                if (options.otherColumns !== 'false') {
                                    options.otherColumns.split(',').forEach(addVisibleColumn);
                                }
                                var visibleColumns = visibleColumnIndexes.map(function (index) {
                                    return App.state.columns[index];
                                });
                                var shareHeaders = visibleColumns.map(function (col) {
                                    return '<th style="width:120px; min-width:120px;">' + App.esc(col.columnvalue) + '</th>';
                                }).join('');
                                var shareRows = shares.map(function (share, shareIndex) {
                                    var values = visibleColumns.map(function (col) {
                                        return '<td style="width:120px; min-width:120px;">' + App.esc(share.values[col.columnid] || '') + '</td>';
                                    }).join('');
                                    return '<tr><td style="width:60px; min-width:60px;"><input type="radio" name="etm-move-share" class="etm-move-share" value="' + shareIndex + '" /></td>' +
                                        '<td style="width:60px; min-width:60px;">' + App.esc(share.itemid) + '</td>' + values + '</tr>';
                                }).join('');

                                $e('#' + options.container + ' .etm-workspace').html(
                                    '<div class="panel panel-default"><div class="panel-heading"><b>Transfer Shares</b></div><div class="panel-body">' +
                                    '<p>Choose which share of <b>' + App.esc(currentName) + '</b> to transfer, then choose its new parent.</p>' +
                                    '<label class="etm-label">Share to transfer</label>' +
                                    '<div class="table-responsive" style="overflow-x:auto; overflow-y:hidden; max-width:100%;"><table class="table table-condensed table-bordered" style="width:max-content; min-width:100%; white-space:nowrap;"><thead><tr><th style="width:60px; min-width:60px;">Select</th><th style="width:60px; min-width:60px;">Item ID</th>' + shareHeaders + '</tr></thead><tbody>' + shareRows + '</tbody></table></div>' +
                                    '<div class="etm-move-share-confirm" style="margin-top:12px;"></div>' +
                                    '<label class="etm-label" for="etm-move-pick">New parent entity</label>' +
                                    '<input type="text" class="form-control etm-typeahead etm-move-pick" placeholder="Type a company name..." autocomplete="off" />' +
                                    '<div class="etm-move-parent-confirm" style="margin-top:12px;"></div>' +
                                    '<div style="margin-top:10px;"><button class="btn btn-default etm-move-go" disabled>Transfer</button> ' +
                                    '<button class="btn btn-link etm-cancel">Cancel</button></div>' +
                                    '<div class="etm-move-msg" style="margin-top:10px;"></div>' +
                                    '</div></div>'
                                );
                                $e('#' + options.container + ' .etm-cancel').on('click', App.renderActions);

                                var pickedShare = null;
                                var pickedParent = null;
                                var $go = $e('#' + options.container + ' .etm-move-go');
                                function updateMoveButton() {
                                    $go.prop('disabled', !(pickedShare && pickedParent));
                                }

                                $e('#' + options.container + ' .etm-move-share').on('change', function () {
                                    pickedShare = shares[Number.parseInt($e(this).val(), 10)];
                                    var html = '<div class="alert alert-info"><b>Selected share:</b> Item ID ' + App.esc(pickedShare.itemid) + '<br/>';
                                    visibleColumns.forEach(function (col) {
                                        html += App.esc(col.columnvalue) + ': ' + App.esc(pickedShare.values[col.columnid] || '') + '<br/>';
                                    });
                                    html += '</div>';
                                    $e('#' + options.container + ' .etm-move-share-confirm').html(html);
                                    updateMoveButton();
                                });

                                var $pick = $e('#' + options.container + ' .etm-move-pick');
                                if ($e.fn.typeahead && typeof $e.fn.typeahead.Constructor === 'function') {
                                    $pick.typeahead({ source: names, items: 10, autoSelect: false, fitToElement: true });
                                } else {
                                    $pick.attr('list', options.container + '-etm-move-list');
                                    $e('#' + options.container + ' .etm-workspace').append('<datalist id="' + options.container + '-etm-move-list">' + names.map(function (n) { return '<option value="' + App.esc(n) + '">'; }).join('') + '</datalist>');
                                }

                                $pick.on('change typeahead:select typeahead:selected', function () {
                                    var nm = $e(this).val().trim();
                                    pickedParent = null;
                                    for (const element of App.state.items) {
                                        if (element.values[nameCol.columnid] === nm) { pickedParent = element; break; }
                                    }
                                    if (!pickedParent) {
                                        $e('#' + options.container + ' .etm-move-parent-confirm').empty();
                                        updateMoveButton();
                                        return;
                                    }
                                    var html = '<div class="alert alert-info"><b>New parent:</b><br/>';
                                    App.state.columns.forEach(function (col) {
                                        html += App.esc(col.columnvalue) + ': ' + App.esc(pickedParent.values[col.columnid] || '') + '<br/>';
                                    });
                                    html += '</div>';
                                    $e('#' + options.container + ' .etm-move-parent-confirm').html(html);
                                    updateMoveButton();
                                });

                                $go.on('click', function () {
                                    if (!pickedShare || !pickedParent) return;
                                    App.doMove(pickedShare, pickedParent);
                                });
                            };

                            App.doMove = function (share, newParent) {
                                var parentCol = App.getParentColumn();
                                var nameCol = App.getNameColumn();
                                var newParentName = newParent.values[nameCol.columnid];
                                var sheetId = App.state.sheetId;
                                var payload = buildUpdatePayload(share.itemid, parentCol.columnid, newParentName);

                                var $btn = $e('#' + options.container + ' .etm-move-go').prop('disabled', true).text('Moving...');
                                putUpdateWithRetry(sheetId, share.itemid, payload).then(function () {
                                    App.showMsg('#' + options.container + ' .etm-move-msg', 'Entity moved under ' + App.esc(newParentName) + '.', 'success');
                                    App.reloadAfterEdit();
                                }).fail(function (xhr) {
                                    $btn.prop('disabled', false).text('Transfer');
                                    App.showMsg('#' + options.container + ' .etm-move-msg', 'Move failed: ' + (xhr.statusText || 'error'), 'danger');
                                });
                            };

                            // ---- Eliminate -----------------------------------------------------------

                            App.openEliminate = function () {
                                if (!App.state.eliminateColumnId || !App.state.eliminatedChoiceId) {
                                    $e('#' + options.container + ' .etm-workspace').html('<div class="alert alert-danger">Eliminate column or eliminated status value not found in sheet.</div>');
                                    return;
                                }
                                var item = App.state.selectedEntity;
                                var nameCol = App.getNameColumn();
                                var parentCol = App.getParentColumn();
                                var name = item.values[nameCol.columnid];
                                var parentName = item.values[parentCol.columnid];

                                // Find children and siblings of this entity
                                var children = [];
                                var siblings = [];
                                var i;
                                for (i = 0; i < App.state.items.length; i++) {
                                    if (App.state.items[i].values[parentCol.columnid] === name) {
                                        children.push(App.state.items[i]);
                                    } else if (App.state.items[i].values[nameCol.columnid] === name) {
                                        siblings.push(App.state.items[i]);
                                    }
                                }

                                var html = '<div class="panel panel-warning"><div class="panel-heading"><b>Eliminate entity</b></div><div class="panel-body">' +
                                    '<p>You are about to eliminate <b>' + App.esc(name) + '</b>.</p>';

                                if (children.length === 0) {
                                    html += '<p>This entity has no child entities.</p>' +
                                        '<div style="margin-top:10px;"><button class="btn btn-warning etm-elm-go">Eliminate entity</button> ' +
                                        '<button class="btn btn-link etm-cancel">Cancel</button></div>';
                                } else {
                                    html += '<p>It has ' + children.length + ' child entit' + (children.length === 1 ? 'y' : 'ies') + '. Choose where to transfer them:</p>';
                                    // default = parent of the entity being eliminated
                                    var defaultTarget = parentName || '(root)';
                                    var opts = [defaultTarget].concat(App.state.items.map(function (it) { return it.values[nameCol.columnid]; }).filter(function (n) { return !!n && n !== name; }));
                                    // unique
                                    var seen = {};
                                    opts = opts.filter(function (o) { if (seen[o]) return false; seen[o] = true; return true; });

                                    html += '<table class="table table-condensed"><thead><tr><th>Child</th><th>Transfer to</th></tr></thead><tbody>';
                                    for (i = 0; i < children.length; i++) {
                                        var cn = children[i].values[nameCol.columnid];
                                        html += '<tr><td>' + App.esc(cn) + '</td><td><select class="form-control etm-elm-target" data-itemid="' + children[i].itemid + '">';
                                        for (const element of opts) {
                                            html += '<option value="' + App.esc(element) + '">' + App.esc(element) + '</option>';
                                        }
                                        html += '</select></td></tr>';
                                    }
                                    html += '</tbody></table>';
                                    html += '<div style="margin-top:10px;"><button class="btn btn-warning etm-elm-go">Transfer children &amp; eliminate</button> ' +
                                        '<button class="btn btn-link etm-cancel">Cancel</button></div>';
                                }
                                html += '<div class="etm-eliminate-msg" style="margin-top:10px;"></div></div></div>';

                                $e('#' + options.container + ' .etm-workspace').html(html);
                                $e('#' + options.container + ' .etm-cancel').on('click', App.renderActions);

                                $e('#' + options.container + ' .etm-elm-go').on('click', function () {
                                    App.doEliminate(siblings, children);
                                });
                            };

                            // Eliminate flow: first re-parent each child (PUT updates to the parent
                            // column), then eliminate the entity's own row by setting a custom column to a specific status. Succeeded re-parents are
                            // rolled back if a later step fails.
                            App.doEliminate = function (items, children) {
                                var sheetId = App.state.sheetId;
                                var parentCol = App.getParentColumn();
                                items = Array.isArray(items) ? items : [items];

                                var $btn = $e('#' + options.container + ' .etm-elm-go').prop('disabled', true).text('Processing...');

                                // Gather child re-parent updates
                                var childUpdates = [];
                                if (children.length) {
                                    $e('#' + options.container + ' .etm-elm-target').each(function () {
                                        var $sel = $e(this);
                                        var itemid = $sel.attr('data-itemid');
                                        var target = $sel.val();
                                        childUpdates.push({ itemid: itemid, value: target });
                                    });
                                }

                                var done = [];

                                function reparentNext(idx) {
                                    if (idx >= childUpdates.length) return $e.Deferred().resolve();
                                    var u = childUpdates[idx];
                                    // "(root)" means clear the parent
                                    var val = u.value === '(root)' ? '' : u.value;
                                    var payload = buildUpdatePayload(u.itemid, parentCol.columnid, val);
                                    return putUpdateWithRetry(sheetId, u.itemid, payload).then(function () {
                                        done.push({ itemid: u.itemid, columnId: parentCol.columnid });
                                        return reparentNext(idx + 1);
                                    }, function (error_) { return $e.Deferred().reject(error_); });
                                }

                                function eliminateNext(idx) {
                                    if (idx >= items.length) return $e.Deferred().resolve();
                                    var item = items[idx];
                                    var payload = buildEliminatePayload(item.itemid, App.state.eliminateColumnId, App.state.eliminatedChoiceId);
                                    console.log('Eliminate payload:', payload);
                                    return putUpdateWithRetry(sheetId, item.itemid, payload).then(function () {
                                        return eliminateNext(idx + 1);
                                    });
                                }

                                reparentNext(0).then(function () {
                                    return eliminateNext(0);
                                }).then(function () {
                                    App.showMsg('#' + options.container + ' .etm-eliminate-msg', 'Eliminated ' + items.length + ' record(s)' + (children.length ? ' and re-parented ' + children.length + ' child(ren)' : '') + '.', 'success');
                                    App.reloadAfterEdit();
                                }).fail(function (xhr) {
                                    var finishFailure = function () {
                                        $btn.prop('disabled', false).text('Move children & eliminate');
                                        App.showMsg('#' + options.container + ' .etm-eliminate-msg', 'Eliminate failed; ' + done.length + ' re-parent change(s) were rolled back. (' + (xhr.statusText || 'error') + ')', 'danger');
                                    };
                                    if (done.length) {
                                        App.rollback(done, sheetId).always(finishFailure);
                                    } else {
                                        finishFailure();
                                    }
                                });
                            };

                            // ---- Delete -----------------------------------------------------------

                            App.openDelete = function () {
                                var item = App.state.selectedEntity;
                                var nameCol = App.getNameColumn();
                                var parentCol = App.getParentColumn();
                                var name = item.values[nameCol.columnid];
                                var parentName = item.values[parentCol.columnid];

                                // Find children and siblings of this entity
                                var children = [];
                                var siblings = [];
                                var i;
                                for (i = 0; i < App.state.items.length; i++) {
                                    if (App.state.items[i].values[parentCol.columnid] === name) {
                                        children.push(App.state.items[i]);
                                    } else if (App.state.items[i].values[nameCol.columnid] === name) {
                                        siblings.push(App.state.items[i]);
                                    }
                                }

                                var html = '<div class="panel panel-danger"><div class="panel-heading"><b>Delete entity</b></div><div class="panel-body">' +
                                    '<p>You are about to DELETE <b>' + App.esc(name) + '</b> from the iSheet. If you need to recover it you must access the iSheet deleted items view within 30 days</p>';

                                if (children.length === 0) {
                                    html += '<p>This entity has no child entities.</p>' +
                                        '<div style="margin-top:10px;"><button class="btn btn-danger etm-del-go">Delete entity</button> ' +
                                        '<button class="btn btn-link etm-cancel">Cancel</button></div>';
                                } else {
                                    html += '<p>It has ' + children.length + ' child entit' + (children.length === 1 ? 'y' : 'ies') + '. Choose where to transfer them:</p>';
                                    // default = parent of the entity being deleted
                                    var defaultTarget = parentName || '(root)';
                                    var opts = [defaultTarget].concat(App.state.items.map(function (it) { return it.values[nameCol.columnid]; }).filter(function (n) { return !!n && n !== name; }));
                                    // unique
                                    var seen = {};
                                    opts = opts.filter(function (o) { if (seen[o]) return false; seen[o] = true; return true; });

                                    html += '<table class="table table-condensed"><thead><tr><th>Child</th><th>Transfer to</th></tr></thead><tbody>';
                                    for (i = 0; i < children.length; i++) {
                                        var cn = children[i].values[nameCol.columnid];
                                        html += '<tr><td>' + App.esc(cn) + '</td><td><select class="form-control etm-del-target" data-itemid="' + children[i].itemid + '">';
                                        for (const element of opts) {
                                            html += '<option value="' + App.esc(element) + '">' + App.esc(element) + '</option>';
                                        }
                                        html += '</select></td></tr>';
                                    }
                                    html += '</tbody></table>';
                                    html += '<div style="margin-top:10px;"><button class="btn btn-danger etm-del-go">Transfer children &amp; delete</button> ' +
                                        '<button class="btn btn-link etm-cancel">Cancel</button></div>';
                                }
                                html += '<div class="etm-del-msg" style="margin-top:10px;"></div></div></div>';

                                $e('#' + options.container + ' .etm-workspace').html(html);
                                $e('#' + options.container + ' .etm-cancel').on('click', App.renderActions);

                                $e('#' + options.container + ' .etm-del-go').on('click', function () {
                                    App.doDelete(siblings, children);
                                });
                            };

                            // Delete flow: first re-parent each child (PUT updates to the parent
                            // column), then delete the entity's own row. Succeeded re-parents are
                            // rolled back if a later step fails.
                            App.doDelete = function (items, children) {
                                var sheetId = App.state.sheetId;
                                var parentCol = App.getParentColumn();

                                var $btn = $e('#' + options.container + ' .etm-del-go').prop('disabled', true).text('Processing...');

                                // Gather child re-parent updates
                                var childUpdates = [];
                                if (children.length) {
                                    $e('.etm-del-target').each(function () {
                                        var $sel = $e(this);
                                        var itemid = $sel.attr('data-itemid');
                                        var target = $sel.val();
                                        childUpdates.push({ itemid: itemid, value: target });
                                    });
                                }

                                var done = [];

                                function reparentNext(idx) {
                                    if (idx >= childUpdates.length) return $e.Deferred().resolve();
                                    var u = childUpdates[idx];
                                    // "(root)" means clear the parent
                                    var val = u.value === '(root)' ? '' : u.value;
                                    var payload = buildUpdatePayload(u.itemid, parentCol.columnid, val);
                                    return putUpdateWithRetry(sheetId, u.itemid, payload).then(function () {
                                        done.push({ itemid: u.itemid, columnId: parentCol.columnid });
                                        return reparentNext(idx + 1);
                                    }, function (error_) { return $e.Deferred().reject(error_); });
                                }

                                reparentNext(0).then(function () {
                                    // Now delete the entitys' rows
                                    let itemids = items.map(item => item.itemid).join(',');
                                    var deleteUrl = './api/20/isheet/' + sheetId + '/items/?itemids=' + itemids;
                                    App.logApi('DELETE item start', { url: deleteUrl, itemids: itemids, children: children.length });
                                    return $e.ajax({
                                        url: deleteUrl,
                                        method: 'DELETE',
                                        dataType: 'text',
                                        headers: { Accept: 'application/json' }
                                    }).done(function (data) {
                                        if (data === '' || data === null || data === undefined) {
                                            App.logApi('DELETE item success (empty body)', { url: deleteUrl, itemids: itemids, status: 200, response: data });
                                        } else {
                                            App.logApi('DELETE item success', { url: deleteUrl, itemids: itemids, response: data });
                                        }
                                    }).fail(function (xhr, status, error) {
                                        if ((xhr?.status === 200) || (xhr?.status === 204)) {
                                            App.logApi('DELETE resolved with HTTP success but empty body', {
                                                url: deleteUrl,
                                                itemids: itemids,
                                                status: xhr?.status,
                                                responseText: xhr?.responseText,
                                                error: error
                                            });
                                            return;
                                        }
                                        App.logApiError('DELETE item failed', xhr, status, error);
                                    });
                                }).then(function () {
                                    App.showMsg('#' + options.container + ' .etm-del-msg', 'Entity deleted' + (children.length ? ' and ' + children.length + ' child(ren) re-parented' : '') + '.', 'success');
                                    App.reloadAfterEdit();
                                }).fail(function (xhr) {
                                    if (done.length) {
                                        App.rollback(done, sheetId).always(function () {
                                            $btn.prop('disabled', false).text('Move children & delete');
                                            App.showMsg('#' + options.container + ' .etm-del-msg', 'Delete failed; ' + done.length + ' re-parent change(s) were rolled back. (' + (xhr.statusText || 'error') + ')', 'danger');
                                        });
                                    } else {
                                        $btn.prop('disabled', false).text('Move children & delete');
                                        App.showMsg('#' + options.container + ' .etm-del-msg', 'Delete failed: ' + (xhr.statusText || 'error'), 'danger');
                                    }
                                });
                            };

                            // ---- Rollback ---------------------------------------------------------

                            // Revert a list of previously applied updates using the in-memory
                            // original values. Each entry: {itemid, columnId}.
                            App.rollback = function (done, sheetId) {
                                if (!done.length) return $e.Deferred().resolve();
                                var i = 0;
                                function revertNext() {
                                    if (i >= done.length) return $e.Deferred().resolve();
                                    var d = done[i];
                                    i++;
                                    // find original value from state
                                    var orig = null;
                                    var k;
                                    for (k = 0; k < App.state.items.length; k++) {
                                        if (App.state.items[k].itemid === d.itemid) { orig = App.state.items[k]; break; }
                                    }
                                    if (!orig) return revertNext();
                                    var val = orig.values[d.columnId] || '';
                                    var payload = buildUpdatePayload(d.itemid, d.columnId, val);
                                    return putUpdate(sheetId, d.itemid, payload).then(revertNext, revertNext);
                                }
                                return revertNext();
                            };

                            // ---- Helpers ----------------------------------------------------------

                            App.reloadAfterEdit = function () {
                                App.state.columns = [];
                                App.state.items = [];
                                App.state.rawItems = [];
                                App.state.selectedEntity = null;
                                App.renderRefreshPanel();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            };

                            App.renderRefreshPanel = function () {
                                var $main = $e('#' + options.container + ' .etm-main');
                                if (!$main.length) return;
                                $main.empty().append(
                                    '<div class="etm-card">' +
                                    '<div class="etm-section-title">Tree updated</div>' +
                                    '<p>Continue making edits to the tree or refresh the full tree?</p>' +
                                    '<div class="btn-group" role="group">' +
                                    '<button class="btn btn-default" id="' + options.container + '-etm-refresh-tree">Make another edit</button>' +
                                    '<button class="btn btn-default" id="' + options.container + '-etm-refresh-full-tree">Refresh full tree</button>' +
                                    '</div>' +
                                    '<div class="etm-refresh-msg" style="margin-top:12px;"></div>' +
                                    '</div>'
                                );

                                $e('#' + options.container + '-etm-refresh-tree').on('click', function () {
                                    if (!App.state.sheetId) {
                                        App.showMsg('#' + options.container + ' .etm-refresh-msg', 'No saved sheet URL is available to refresh from.', 'warning');
                                        return;
                                    }
                                    App.showMsg('#' + options.container + ' .etm-refresh-msg', 'Refreshing current tree...', 'info');
                                    App.state.columns = [];
                                    App.state.items = [];
                                    App.state.rawItems = [];
                                    App.state.selectedEntity = null;
                                    App.loadSheet(App.state.sheetId, App.state.viewId || null);
                                });

                                $e('#' + options.container + '-etm-refresh-full-tree').on('click', function () {
                                    window.location.reload();
                                });

                            };

                            App.showMsg = function (sel, msg, type) {
                                $e(sel).html('<div class="alert alert-' + type + ' etm-alert">' + App.esc(msg) + '</div>');
                            };

                            App.esc = function (s) {
                                if (s === null || s === undefined) return '';
                                return String(s)
                                    .replaceAll('&', '&amp;')
                                    .replaceAll('<', '&lt;')
                                    .replaceAll('>', '&gt;')
                                    .replaceAll('"', '&quot;')
                                    .replaceAll('\'', '&#39;');
                            };

                            App.init(options.container + ' .tree-manager');

                        })
                    );

                }

                let legendContainer = $e('<span class="legendPanel"/>');
                let legendArr = [];
                let titles = [];

                if (options.backgroundColorColumn != 'false') {
                    legendContainer.css({ 'float': 'right', 'display': 'inline-block' });
                    legendContainer.prepend($e('<span class="legendTitle" style="font-weight:600; padding-left:10px">' + options.legendTitle + '</span>'));
                    if (rawXmlData.view.data.item) {
                        rawXmlData.view.data.item.forEach(calcLegend);
                    }
                    legendArr.forEach(function (item) {
                        buildLegendItem(item);
                    });

                    $menu.append(legendContainer);

                }

                function calcLegend(item) {
                    let column = options.backgroundColorColumn;
                    let itemColor;
                    let itemTitle;
                    let sortIndex;
                    if (item.column[column].rawData?.choice) {
                        let styleColor;
                        if (item.column[column].rawData.choice[0]?.style) {
                            styleColor = item.column[column].rawData.choice[0].style;
                            styleColor = styleColor.substr(styleColor.indexOf('#'));
                            itemColor = styleColor;
                            itemTitle = item.column[column].rawData.choice[0].cdata;
                        }
                    } else {
                        itemTitle = options.defaultTitle;
                        itemColor = options.defaultBarColor;
                    }
                    if (itemTitle && !titles.includes(itemTitle)) {
                        sortIndex = Number.parseInt(itemTitle.match(/^\d*/), 10);
                        let itemTitleStrip;
                        if (!sortIndex) {
                            sortIndex = rawXmlData.view.data.item.length;
                        }
                        if (options.sortLegend == 'true') {
                            itemTitleStrip = itemTitle.replace(/^\d*\S\s/, '');
                        } else {
                            itemTitleStrip = itemTitle;
                        }
                        let legendItem = { color: itemColor, title: itemTitleStrip, sort: sortIndex };
                        titles.push(itemTitle);
                        legendArr.push(legendItem);
                    }

                }

                function buildLegendItem(item) {
                    let classId = engineercore_safeCSS(item.title);
                    let legendElement = $e('<div>')
                        .css('background', item.color)
                        .addClass('legend-item badge legend-item-' + classId)
                        .text(item.title);
                    legendContainer.append(legendElement);
                }

                if (renderErrors.length > 0) {
                    $menu.append($e('<button type="button" class="nav-link btn btn-danger nav-errors"/>')
                        .html('Errors')
                        .click(function () {
                            engineercore_modal('Chart Render Errors');
                            $e('#engineerModal .modal-body').html('');
                            $e('#engineerModal .modal-body').html(function () {
                                let formattedErrors = '';
                                renderErrors.forEach(err => {
                                    formattedErrors += '> ' + err + '<br/>';
                                });
                                return formattedErrors;
                            });
                            $e('#engineerModal').modal();
                        })
                    );
                }
                this.container.prepend($menuAlerts);
                this.container.prepend($treeManager);
                this.container.prepend($menu);
            };

            /**
             * @param {object} jsonConfig
             * @param {number} treeId
             * @returns {Tree}
             */
            this.reset = function (jsonConfig, treeId) {
                this.container = $e('#' + options.container + '-chart');
                this.container.empty();
                this.initJsonConfig = jsonConfig;
                this.initTreeId = treeId;

                this.id = treeId;

                this.CONFIG = UTIL.extend(Tree.CONFIG, jsonConfig.chart);

                this.drawArea = $e('<div>');
                this.drawArea.addClass('engineertree');
                this.scrollArea = $e('<div>');
                this.scrollArea.addClass('engineertreescroll');
                if (options.scrollLocation == 'top') {
                    this.scrollArea.addClass('engineertreetopscroll');
                    this.drawArea.addClass('topscroll');
                }
                this.drawArea.appendTo(this.scrollArea);
                this.scrollArea.appendTo(this.container);
                this.zoomState = { zoom: 100, panX: 0, panY: 0 }; if (options.enableZoomPan) { this.drawArea.addClass('et-zoom-pan-enabled'); };

                this.imageLoader = new ImageLoader();
                this.nodeDB = new NodeDB(jsonConfig.nodeStructure, this);
                this.multiParentConnections = [];
                this.loaded = false;
                this._R = new Raphael(this.drawArea[0], 100, 100);
                if (options.enableZoomPan) { _et_setupZoomPanListeners(this); }
                if (tableOptions.showTable) {
                    let $engineerTableContainer = $e('<div>');
                    $engineerTableContainer.attr('id', options.container + '-table');
                    $engineerTableContainer.css('padding-top', '1em');
                    $e('#' + options.container).after($engineerTableContainer);
                }
                if (options.fullscreen) {
                    let $outerWidth = $e('.homePage .grid');
                    if ($outerWidth.length > 0) {
                        if ($outerWidth.css('max-width') != '100%') {
                            $e('.homePage .grid').css('max-width', '100%');
                            $e('#' + options.container + ' svg').css('float', 'left');
                        }
                    }
                }
                return this;
            };

            /**
             * @returns {Tree}
             */
            this.reload = function () {
                this.reset(this.initJsonConfig, this.initTreeId).redraw();
                return this;
            };
            this.reset(jsonConfig, treeId);
        };

        // --- Zoom/Pan helper functions ---
        function _et_applyZoomPan(tree) {
            if (!options.enableZoomPan || !tree.drawArea) return;
            const z = tree.zoomState.zoom / 100, t = `translate(${tree.zoomState.panX}px, ${tree.zoomState.panY}px) scale(${z})`;
            tree.drawArea[0].style.transform = t;
        }
        function _et_setupZoomPanListeners(tree) {
            if (!options.enableZoomPan) return;
            const $scrollArea = tree.scrollArea[0];
            if (!$scrollArea) return;
            function _handleWheel(e) {
                if (e.ctrlKey) return;
                e.preventDefault();
                const delta = e.deltaY > 0 ? -5 : 5, newZoom = Math.max(options.zoomMin, Math.min(options.zoomMax, tree.zoomState.zoom + delta));
                if (newZoom !== tree.zoomState.zoom) { tree.zoomState.zoom = newZoom; _et_applyZoomPan(tree); }
            }
            let isPanning = false, startX = 0, startY = 0;
            function _handleMouseDown(e) {
                if (e.button === 2) { isPanning = true; startX = e.clientX - tree.zoomState.panX; startY = e.clientY - tree.zoomState.panY; $scrollArea.classList.add('et-pan-active'); e.preventDefault(); }
            }
            function _handleMouseMove(e) {
                if (isPanning) { tree.zoomState.panX = e.clientX - startX; tree.zoomState.panY = e.clientY - startY; _et_applyZoomPan(tree); }
            }
            function _handleMouseUp(e) {
                if (isPanning && e.button === 2) { isPanning = false; $scrollArea.classList.remove('et-pan-active'); }
            }
            function _handleContextMenu(e) {
                e.preventDefault();
            }
            $scrollArea.addEventListener('wheel', _handleWheel, { passive: false });
            $scrollArea.addEventListener('mousedown', _handleMouseDown);
            document.addEventListener('mousemove', _handleMouseMove);
            document.addEventListener('mouseup', _handleMouseUp);
            $scrollArea.addEventListener('contextmenu', _handleContextMenu);
            tree._zoomPanListeners = { handleWheel: _handleWheel, handleMouseDown: _handleMouseDown, handleMouseMove: _handleMouseMove, handleMouseUp: _handleMouseUp, handleContextMenu: _handleContextMenu, scrollArea: $scrollArea };
        }
        // --- Export helpers for autoExport (PNG/CSV) and HighQ upload ---
        function _etl_csvEscape(val) {
            if (val === null || val === undefined) return '""';
            let s = String(val);
            s = s.replace(/"/g, '""');
            return '"' + s + '"';
        }

        function _etl_createAutoExportFileName(type) {
            let base = options.preSearchFrom || $e('#' + options.container + ' .search-from').val() || options.container;
            base = String(base).trim() || options.container;
            base = base.replace(/[\\/:*?"<>|\s]+/g, '-');
            let ts = new Date().toISOString().replace(/[:.]/g, '-');
            let ext = type;
            return base + '-' + ts + '.' + ext;
        }

        function _etl_exportTreeCSV(tree) {
            return new Promise((resolve) => {
                let rows = [];
                let header = ['Name', 'Parent', 'Label', 'Status', 'ConnVal', 'Link', 'OtherColumns'];
                rows.push(header.map(_etl_csvEscape).join(','));
                tree.nodeDB.db.forEach(node => {
                    if (node.pseudo || node.searchHide || node.hidden) return;
                    let parentName = (node.parentId >= 0 && tree.nodeDB.get(node.parentId)) ? (tree.nodeDB.get(node.parentId).text || '') : '';
                    let otherCols = '';
                    if (node.otherColumns?.length) {
                        otherCols = node.otherColumns.map(o => {
                            let k = Object.keys(o)[0];
                            let v = o[k];
                            return k + ':' + v;
                        }).join('; ');
                    }
                    let vals = [
                        node.text || '',
                        parentName || '',
                        node.label || '',
                        (node.status?.text) || '',
                        (node.connVal?.text) || '',
                        node.link || '',
                        otherCols
                    ];
                    rows.push(vals.map(_etl_csvEscape).join(','));
                });
                let csv = rows.join('\r\n');
                let blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                resolve(blob);
            });
        }

        function _etl_exportTreePNG(tree) {
            return new Promise((resolve, reject) => {
                let resolved = false;
                const timeout = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        reject(new Error('PNG export timeout: canvas.toBlob did not complete within 30 seconds'));
                    }
                }, 30000);

                const cleanup = (fn) => {
                    clearTimeout(timeout);
                    resolved = true;
                    fn();
                };

                try {
                    let $treeBody = $e('#' + options.container + ' .engineertreescroll');
                    let originalTreeWidth = $treeBody.width();
                    if (rightMostNode > 32767) {
                        return cleanup(() => reject(new Error('Chart too large to export')));
                    }
                    let exportWidth, leftOffset;
                    try {
                        const nodes = tree.nodeDB.db.filter(n => !n.pseudo && !n.searchHide && !n.hidden);
                        if (nodes && nodes.length > 0) {
                            const minX = Math.min(...nodes.map(n => n.X));
                            const maxX = Math.max(...nodes.map(n => n.X + (n.width || 0)));
                            const padding = 20;
                            exportWidth = Math.ceil(maxX - minX) + padding * 2;
                            leftOffset = Math.max(0, Math.floor(minX - padding));
                        } else {
                            exportWidth = (rightMostNode || $treeBody.width()) + ((rightMostNodeWidth || 0) * 2);
                            leftOffset = Math.max(0, Math.floor((leftMostNode || 0) - 10));
                        }
                    } catch (err) {
                        exportWidth = (rightMostNode || $treeBody.width()) + ((rightMostNodeWidth || 0) * 2);
                        leftOffset = Math.max(0, Math.floor((leftMostNode || 0) - 10));
                    }

                    $treeBody.width(exportWidth);
                    $treeBody.scrollLeft(leftOffset);

                    html2canvas(document.querySelector('#' + options.container + ' .engineertreescroll'), { scrollX: 0, scrollY: 0, windowWidth: exportWidth, width: exportWidth })
                        .then(canvas => {
                            canvas.toBlob(function (blob) {
                                $treeBody.width(originalTreeWidth);
                                cleanup(() => resolve(blob));
                            }, 'image/png');
                        })
                        .catch(err => {
                            $treeBody.width(originalTreeWidth);
                            cleanup(() => reject(err));
                        });
                } catch (err) {
                    cleanup(() => reject(err));
                }
            });
        }

        async function _etl_uploadFileToHighQ(filename, blob) {
            if (!options.autoExportFolderId) {
                throw new Error('autoExportFolderId not set');
            }
            const url = './api/20/files/content?parentfolderid=' + encodeURIComponent(options.autoExportFolderId);
            const form = new FormData();
            const baseNoExt = filename.replace(/\.[^/.]+$/, '');
            form.append('filename', baseNoExt);
            form.append('file', blob, filename);
            const resp = await fetch(url, {
                method: 'POST',
                body: form,
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error('Upload failed: ' + resp.status + ' ' + text);
            }
            return resp.json();
        }

        function performAutoExport(tree) {
            void (async function () {
                try {
                    if (!options.autoExportFolderId) {
                        console.warn('autoExportFolderId not set; skipping auto export');
                        options.onExportComplete({ success: false, message: 'autoExportFolderId not set' });
                        return;
                    }
                    const type = options.autoExportFormat || 'png';
                    const filename = _etl_createAutoExportFileName(type);
                    let blob;
                    if (type === 'csv') {
                        blob = await _etl_exportTreeCSV(tree);
                    } else {
                        if (typeof html2canvas === 'undefined') {
                            await engineercore_load('html2canvas');
                        }
                        // Verify html2canvas is actually available after loading
                        if (typeof html2canvas === 'undefined') {
                            throw new TypeError('html2canvas failed to load properly');
                        }
                        blob = await _etl_exportTreePNG(tree);
                    }
                    // Verify blob was created before upload
                    if (!blob) {
                        throw new Error('Export failed to generate PNG blob');
                    }
                    if (type === 'pdf') {
                        // use PDFLib to convert the PNG blob
                        if (typeof PDFLib === 'undefined') {
                            await engineercore_load('pdf');
                        }
                        // Verify PDFLib is actually available after loading
                        if (typeof PDFLib === 'undefined') {
                            throw new TypeError('PDFLib failed to load properly');
                        }
                        // Add the PNG to a single page PDF and get the resulting PDF as a blob for upload ensuring that PNG is not larger than PDFLib limits (which can cause it to fail to embed without error)
                        const arrayBuffer = await blob.arrayBuffer();
                        const pdfDoc = await PDFLib.PDFDocument.create();
                        const pngImage = await pdfDoc.embedPng(arrayBuffer);

                        // Use US Letter size (portrait or landscape based on image orientation)
                        const textPadding = 30;
                        const margin = 20;
                        const usLetterWidth = 612;
                        const usLetterHeight = 792;

                        // Determine orientation based on image dimensions
                        const isLandscape = pngImage.width > pngImage.height;
                        const pageWidth = isLandscape ? usLetterHeight : usLetterWidth;   // landscape: 792, portrait: 612
                        const pageHeight = isLandscape ? usLetterWidth : usLetterHeight;  // landscape: 612, portrait: 792

                        // Calculate available space for image (account for margins and text)
                        const availableWidth = pageWidth - (margin * 2);
                        const availableHeight = pageHeight - textPadding - margin;

                        // Scale image to fit within available space
                        let scaledWidth = pngImage.width;
                        let scaledHeight = pngImage.height;

                        if (scaledWidth > availableWidth) {
                            const scale = availableWidth / scaledWidth;
                            scaledWidth = scaledWidth * scale;
                            scaledHeight = scaledHeight * scale;
                        }

                        if (scaledHeight > availableHeight) {
                            const scale = availableHeight / scaledHeight;
                            scaledWidth = scaledWidth * scale;
                            scaledHeight = scaledHeight * scale;
                        }

                        const page = pdfDoc.addPage([pageWidth, pageHeight]);

                        // Draw text at top
                        let title = options.autoExportTitle || filename;
                        page.drawText(title, {
                            x: margin,
                            y: pageHeight - 20,
                            size: 12,
                            color: PDFLib.rgb(0, 0, 0)
                        });

                        // Draw image below text, centered horizontally
                        const imageX = (pageWidth - scaledWidth) / 2;
                        const imageY = margin;

                        page.drawImage(pngImage, {
                            x: imageX,
                            y: imageY,
                            width: scaledWidth,
                            height: scaledHeight
                        });

                        // PDFLib.PDFDocument.save() returns Uint8Array, convert to Blob
                        const pdfBytes = await pdfDoc.save();
                        blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    }
                    await _etl_uploadFileToHighQ(filename, blob);
                    try { options.onExportComplete({ success: true, message: 'Export completed successfully for ' + filename }); } catch (err) { console.warn('onExportComplete callback error', err); }
                } catch (err) {
                    console.error('Auto export failed', err);
                    try { options.onExportComplete({ success: false, message: err.toString() }); } catch (e) { }
                }
            })();
        }

        Tree.prototype = {

            /**
             * @returns {NodeDB}
             */
            getNodeDb: function () {
                return this.nodeDB;
            },

            /**
             * @returns {Tree}
             */
            redraw: function (shownNodes) {
                this.positionTree(null, shownNodes);
                return this;
            },

            /**
             * @param {function} callback
             * @returns {Tree}
             */
            positionTree: function (callback, shownNodes) {
                let self = this;
                if (shownNodes) {
                    this.nodeDB.db.forEach(element => {
                        if (!shownNodes.includes(element.id)) {
                            $e(element.nodeDOM).hide();
                            element.pseudo = true;
                            element.searchHide = true;
                        }
                    });
                }

                if (this.imageLoader.isNotLoading()) {
                    let root;
                    root = this.root();

                    this.resetLevelData();
                    this.firstWalk(root, 0);
                    this.secondWalk(root, 0, 0, 0);
                    leftMostNode = null;
                    rightMostNode = 0;
                    deepestNode = 0;
                    this.positionNodes();
                    this.labelPaths();
                    if (!shownNodes) {
                        this.addPanelLinks();
                    }

                    if (this.CONFIG.animateOnInit) {
                        setTimeout(
                            function () {
                                root.toggleCollapse();
                            },
                            this.CONFIG.animateOnInitDelay
                        );
                    }

                    if (!this.loaded) {
                        this.drawArea.addClass('tree-loaded'); // nodes are hidden until .loaded class is added
                        if (Object.prototype.toString.call(callback) === '[object Function]') {
                            callback(self);
                        }
                        self.CONFIG.callback.onTreeLoaded.apply(self, [root]);
                        options.onRender(options.container);
                        this.loaded = true;
                    }

                    if (options.preSearchType) {
                        if (options.preSearchType == 'search') {
                            treeSearch(null, options.preSearchFrom, options.preSearchTo);
                        }
                        else if (options.preSearchType == 'limit') {
                            treeLimit(null, options.preSearchFrom, options.preLimit, options.preLimitDirection);
                        }
                        if (options.autoExport) {
                            try {
                                performAutoExport(self);
                            } catch (err) {
                                console.error('autoExport init failed', err);
                                try { options.onExportComplete({ success: false, message: err.toString() }); } catch (e) { }
                            }
                        }
                    }

                }
                else {
                    setTimeout(
                        function () {
                            self.positionTree(callback);
                        }, 10
                    );
                }
                if (shownNodes && shownNodes.length > 0) {
                    this.scrollArea.scrollLeft(this.nodeDB.get(shownNodes[0]).X - (this.scrollArea.width() / 2));
                } else {
                    this.scrollArea.scrollLeft(this.nodeDB.get(0).X - (this.scrollArea.width() / 2));
                }
                return this;
            },

            /**
             * In a first post-order walk, every node of the tree is assigned a preliminary
             * x-coordinate (held in field node->prelim).
             * In addition, internal nodes are given modifiers, which will be used to move their
             * children to the right (held in field node->modifier).
             * @param {TreeNode} node
             * @param {number} level
             * @returns {Tree}
             */
            firstWalk: function (node, level) {
                node.prelim = null;
                node.modifier = null;
                node.Y = null;
                node.X = null;
                if (node.shadow) {
                    //return;
                    let shadow = this.nodeDB.get(node.shadow);
                    node.prelim = 0;
                    node.width = 0;
                    node.height = shadow.height;
                    node.modifier = 0;

                    this.setNeighbors(node, level);
                    let leftSibling = node.leftSibling();
                    if (leftSibling && !leftSibling.searchHide) {
                        node.prelim = leftSibling.prelim + leftSibling.size() + this.CONFIG.siblingSeparation;
                    }
                    else {
                        node.prelim = 0;
                    }
                } else {
                    if (node.searchHide) {
                        node.prelim = 0;
                        node.width = 0;
                        node.height = 0;
                        node.modifier = 0;
                    }
                    this.setNeighbors(node, level);
                    this.calcLevelDim(node, level);
                    let leftSibling = node.leftSibling();

                    if (node.childrenCount() === 0 || level == this.CONFIG.maxDepth) {
                        // set preliminary x-coordinate
                        if (leftSibling && !leftSibling.searchHide) {
                            node.prelim = leftSibling.prelim + leftSibling.size() + this.CONFIG.siblingSeparation;
                        } else {
                            node.prelim = 0;
                        }
                    }
                    else {
                        //node is not a leaf, firstWalk for each child
                        for (let i = 0, n = node.childrenCount(); i < n; i++) {
                            this.firstWalk(node.childAt(i), level + 1);
                        }
                        let midPoint = node.childrenCenter() - node.size() / 2;
                        if (leftSibling) {
                            if (leftSibling.searchHide) {
                                node.prelim = 0;
                            } else {
                                node.prelim = leftSibling.prelim + leftSibling.size() + this.CONFIG.siblingSeparation;
                                node.modifier = node.prelim - midPoint;
                                this.apportion(node, level);
                            }
                        } else {
                            node.prelim = midPoint;
                        }
                        /*if (node.stackParent) { // handle the parent of stacked children
                            node.modifier += this.nodeDB.get(node.stackChildren[0]).size() / 2 + node.connStyle.stackIndent;
                        }
                        else if (node.stackParentId) { // handle stacked children
                            node.prelim = 0;
                        }*/
                    }
                }
                return this;
            },

            /*
             * Clean up the positioning of small sibling subtrees.
             * Subtrees of a node are formed independently and
             * placed as close together as possible. By requiring
             * that the subtrees be rigid at the time they are put
             * together, we avoid the undesirable effects that can
             * accrue from positioning nodes rather than subtrees.
             */
            apportion: function (node, level) {
                let firstChild = node.firstChild(),
                    firstChildLeftNeighbor = firstChild.leftNeighbor(),
                    compareDepth = options.spacing,
                    depthToStop = this.CONFIG.maxDepth - level;

                while (firstChild && firstChildLeftNeighbor && compareDepth <= depthToStop) {
                    // calculate the position of the firstChild, according to the position of firstChildLeftNeighbor

                    let modifierSumRight = 0,
                        modifierSumLeft = 0,
                        leftAncestor = firstChildLeftNeighbor,
                        rightAncestor = firstChild;

                    for (let i = 0; i < compareDepth; i++) {
                        leftAncestor = leftAncestor?.parent();
                        rightAncestor = rightAncestor?.parent();
                        modifierSumLeft += leftAncestor?.modifier || 0;
                        modifierSumRight += rightAncestor?.modifier || 0;

                        // all the stacked children are oriented towards right so use right variables
                        if (rightAncestor?.stackParent !== undefined) {
                            modifierSumRight += rightAncestor?.size() / 2;
                        }
                    }

                    // find the gap between two trees and apply it to subTrees
                    // and mathing smaller gaps to smaller subtrees
                    let totalGap = (firstChildLeftNeighbor.prelim + modifierSumLeft + firstChildLeftNeighbor.size() + this.CONFIG.subTeeSeparation) - (firstChild.prelim + modifierSumRight);

                    if (totalGap > 0) {
                        let subtreeAux = node,
                            numSubtrees = 0;

                        // count all the subtrees in the LeftSibling
                        while (subtreeAux && subtreeAux.id != leftAncestor?.id) {
                            subtreeAux = subtreeAux.leftSibling();
                            numSubtrees++;
                        }

                        if (subtreeAux) {
                            let subtreeMoveAux = node,
                                singleGap = totalGap / numSubtrees;

                            while (subtreeMoveAux.id != leftAncestor.id) {
                                subtreeMoveAux.prelim += totalGap;
                                subtreeMoveAux.modifier += totalGap;

                                totalGap -= singleGap;
                                subtreeMoveAux = subtreeMoveAux.leftSibling();
                            }
                        }
                    }

                    compareDepth++;

                    firstChild = (firstChild.childrenCount() === 0) ?
                        node.leftMost(0, compareDepth) :
                        firstChild.firstChild();

                    if (firstChild) {
                        firstChildLeftNeighbor = firstChild.leftNeighbor();
                    }
                }
            },

            /*
             * During a second pre-order walk, each node is given a
             * final x-coordinate by summing its preliminary
             * x-coordinate and the modifiers of all the node's
             * ancestors.  The y-coordinate depends on the height of
             * the tree.  (The roles of x and y are reversed for
             * RootOrientations of EAST or WEST.)
             */
            secondWalk: function (node, level, X, Y) {
                if (level <= this.CONFIG.maxDepth) {
                    if (node.shadow) {
                        if (node.rightSibling()) {
                            this.secondWalk(node.rightSibling(), level, X, Y);
                        }
                    } else {
                        let xTmp = node.prelim + X,
                            yTmp = Y, align = this.CONFIG.nodeAlign,
                            orient = this.CONFIG.rootOrientation,
                            levelHeight, nodesizeTmp;

                        if (orient == 'NORTH' || orient == 'SOUTH') {
                            levelHeight = this.levelMaxDim[level].height;
                            nodesizeTmp = node.height;
                            if (node.pseudo) {
                                node.height = levelHeight;
                            }
                        }
                        else if (orient == 'WEST' || orient == 'EAST') {
                            levelHeight = this.levelMaxDim[level].width;
                            nodesizeTmp = node.width;
                            if (node.pseudo) {
                                node.width = levelHeight;
                            }
                        }
                        node.level = level;
                        node.X = xTmp;

                        if (node.pseudo) {
                            node.X = xTmp + 15;
                            if (orient == 'NORTH' || orient == 'WEST') {
                                node.Y = yTmp; // align "BOTTOM"
                            }
                            else if (orient == 'SOUTH' || orient == 'EAST') {
                                node.Y = (yTmp + (levelHeight - nodesizeTmp)); // align "TOP"
                            }
                        } else {
                            node.Y = (align == 'CENTER') ? (yTmp + (levelHeight - nodesizeTmp) / 2) :
                                (align == 'TOP') ? (yTmp + (levelHeight - nodesizeTmp)) :
                                    yTmp;
                        }

                        if (orient == 'WEST' || orient == 'EAST') {
                            let swapTmp = node.X;
                            node.X = node.Y;
                            node.Y = swapTmp;
                        }

                        if (orient == 'SOUTH') {
                            node.Y = -node.Y - nodesizeTmp;
                        }
                        else if (orient == 'EAST') {
                            node.X = -node.X - nodesizeTmp;
                        }

                        if (node.childrenCount() !== 0) {
                            if (node.id === 0 && this.CONFIG.hideRootNode) {
                                this.secondWalk(node.firstChild(), level + 1, X + node.modifier, Y);
                            }
                            else {
                                this.secondWalk(node.firstChild(), level + 1, X + node.modifier, Y + levelHeight + this.CONFIG.levelSeparation);
                            }
                        }

                        if (node.rightSibling()) {
                            this.secondWalk(node.rightSibling(), level, X, Y);
                        }
                    }
                } else {
                    renderErrors.push('Max level of ' + this.CONFIG.maxDepth + ' exceeded by node: ' + node.text);
                }
            },


            /**
             * position all the nodes, center the tree in center of its container
             * @returns {Tree}
             */
            positionNodes: function () {
                let self = this,
                    treeSize = {
                        x: self.nodeDB.getMinMaxCoord('X', null, null),
                        y: self.nodeDB.getMinMaxCoord('Y', null, null)
                    },

                    treeWidth = treeSize.x.max - treeSize.x.min,
                    treeHeight = treeSize.y.max - treeSize.y.min,

                    treeCenter = {
                        x: treeSize.x.max - treeWidth / 2,
                        y: treeSize.y.max - treeHeight / 2
                    };

                this.handleOverflow((treeWidth), treeHeight);

                let containerCenter = { x: self.drawArea[0].clientWidth / 2, y: self.drawArea[0].clientHeight / 2 },

                    deltaX = containerCenter.x - treeCenter.x,
                    deltaY = containerCenter.y - treeCenter.y,

                    // all nodes must have positive X or Y coordinates, handle this with offsets
                    negOffsetX = ((treeSize.x.min + deltaX) <= 0) ? Math.abs(treeSize.x.min) : 0,
                    negOffsetY = ((treeSize.y.min + deltaY) <= 0) ? Math.abs(treeSize.y.min) : 0,
                    i, len, node;

                // position all the nodes

                for (i = 0, len = this.nodeDB.db.length; i < len; i++) {
                    node = this.nodeDB.get(i);

                    if (node.shadow) {
                        let shadow = this.nodeDB.get(node.shadow);
                        node.X = shadow.X;
                        node.Y = shadow.Y;

                        node.width = shadow.width;

                        if (!shadow.positioned) {
                            node.X += negOffsetX + ((treeWidth < this.drawArea[0].clientWidth) ? deltaX : this.CONFIG.padding);
                            node.Y += negOffsetY + ((treeHeight < this.drawArea[0].clientHeight) ? deltaY : this.CONFIG.padding);
                            node.positioned = false;
                        }

                    } else {
                        node.X += negOffsetX + ((treeWidth < this.drawArea[0].clientWidth) ? deltaX : this.CONFIG.padding);
                        node.Y += negOffsetY + ((treeHeight < this.drawArea[0].clientHeight) ? deltaY : this.CONFIG.padding);
                    }


                    self.CONFIG.callback.onBeforePositionNode.apply(self, [node, i, containerCenter, treeCenter]);

                    if (node.id === 0 && this.CONFIG.hideRootNode) {
                        self.CONFIG.callback.onAfterPositionNode.apply(self, [node, i, containerCenter, treeCenter]);
                        continue;
                    }

                    let collapsedParent = node.collapsedParent(),
                        hidePoint = null;

                    if (collapsedParent) {
                        // position the node behind the connector point of the parent, so future animations can be visible
                        hidePoint = collapsedParent.connectorPoint(true);
                        node.hide(hidePoint);
                    }
                    else if (node.positioned) {
                        node.show();
                    }
                    else {
                        node.nodeDOM.style.left = node.X + 'px';
                        node.nodeDOM.style.top = node.Y + 'px';
                        node.positioned = true;
                    }
                    if (node.hasShadow) {
                        node.hasShadow.forEach(function (s) {
                            let sNode = self.nodeDB.get(s);
                            sNode.X = node.X;
                            sNode.Y = node.Y;
                            sNode.show();
                            self.setConnectionToParent(sNode, hidePoint);
                        });
                    }
                    if (node.id !== 0 && !(node.parent().id === 0 && this.CONFIG.hideRootNode)) {
                        this.setConnectionToParent(node, hidePoint); // skip the root node
                    }
                    else if (!this.CONFIG.hideRootNode && node.drawLineThrough) {
                        // drawlinethrough is performed for the root node
                        node.drawLineThroughMe();
                    }
                    self.CONFIG.callback.onAfterPositionNode.apply(self, [node, i, containerCenter, treeCenter]);
                }

                return this;
            },

            /**
             * Create Raphael instance, (optionally set scroll bars if necessary)
             * @param {number} treeWidth
             * @param {number} treeHeight
             * @returns {Tree}
             */
            handleOverflow: function (treeWidth, treeHeight) {
                let viewWidth = (treeWidth < this.drawArea[0].clientWidth) ? this.drawArea[0].scrollWidth : treeWidth + this.CONFIG.padding * 2,
                    viewHeight = (treeHeight < this.drawArea[0].clientHeight) ? this.drawArea[0].scrollHeight : treeHeight + this.CONFIG.padding * 2;

                this._R.setSize(viewWidth, viewHeight);

                if (this.CONFIG.scrollbar == 'resize') {
                    $e(this.drawArea[0]).width(viewWidth).height(viewHeight);
                }
                else if (this.CONFIG.scrollbar == 'native') {

                    if (this.drawArea[0].clientWidth < treeWidth) {
                        this.drawArea[0].style.overflowX = 'auto';
                    }
                    $e('#' + options.container).scrollLeft(viewWidth / 4);
                } // else this.CONFIG.scrollbar == 'None'
                return this;
            },

            /**
             * @param {TreeNode} treeNode
             * @param {boolean} hidePoint
             * @returns {Tree}
             */
            setConnectionToParent: function (treeNode, hidePoint) {
                let stacked = treeNode.stackParentId,
                    connLine,
                    lineThrough,
                    parent = (stacked ? this.nodeDB.get(stacked) : treeNode.parent()),

                    pathString = hidePoint ?
                        this.getPointPathString(hidePoint) :
                        this.getPathString(parent, treeNode, stacked);
                if (treeNode.connCreated) {
                    // connector already exists, update the connector geometry
                    if (options.showMajorityHoldingOnly) {
                        if (treeNode.shadow || treeNode.strut && this.nodeDB.get(this.nodeDB.getNodeId(treeNode.strut)).connVal.number > treeNode.connVal.number) {
                            return;
                        }
                    }
                    connLine = treeNode.connector;
                    if (connLine) {
                        connLine.remove();
                    }
                    lineThrough = treeNode.lineThroughMe;
                    if (lineThrough) {
                        lineThrough.remove();
                    }
                    connLine = this._R.path(pathString);
                    if (treeNode.searchHide || parent.searchHide) {
                        connLine.remove();
                    } else if (!treeNode.pseudo && !treeNode.searchHide) {
                        let nodeRight = treeNode.X + treeNode.width;
                        if (nodeRight > rightMostNode) {
                            rightMostNode = nodeRight;
                            rightMostNodeWidth = treeNode.width;
                        }
                        if (leftMostNode === null || treeNode.X < leftMostNode) {
                            leftMostNode = treeNode.X;
                        }
                        let nodeBottom = treeNode.Y + treeNode.height;
                        if (nodeBottom > deepestNode) {
                            deepestNode = nodeBottom;
                        }
                    }
                    if ((treeNode.drawLineThrough || treeNode.pseudo && !treeNode.shadow)) {
                        treeNode.drawLineThroughMe(hidePoint);
                    }
                    this.animatePath(connLine, pathString);
                } else {
                    if (options.minorityHoldingLevel && treeNode.connVal) {
                        if (treeNode.connVal.number > options.minorityHoldingLevel || (!treeNode.hasShadow && !parent.pseudo && !treeNode.pseudo)) {
                            if (treeNode.shadow && treeNode.connVal.number < options.minorityHoldingLevel) {
                                let temp = this.nodeDB.get(treeNode.shadow);
                                if (temp.connCreated) {
                                    treeNode.buildHoverHelp();
                                }
                            } else if (!treeNode.searchHide) {
                                connLine = this._R.path(pathString);
                                if ((treeNode.drawLineThrough || treeNode.pseudo)) {
                                    treeNode.drawLineThroughMe(hidePoint);
                                }
                            }
                        } else if (!treeNode.pseudo) {
                            treeNode.buildHoverHelp();
                        }
                    } else if (options.showMajorityHoldingOnly && treeNode.connVal) {
                        if (treeNode.shadow) {
                            treeNode.buildHoverHelp();
                        } else if (treeNode.duplicateParents.length > 0 && !treeNode.searchHide) {
                            treeNode.buildHoverHelp();
                            connLine = this._R.path(pathString);
                            if ((treeNode.drawLineThrough || treeNode.pseudo) && !treeNode.shadow) {
                                treeNode.drawLineThroughMe(hidePoint);
                            }
                        } else if (treeNode.strut && this.nodeDB.get(this.nodeDB.getNodeId(treeNode.strut)).connVal.number > treeNode.connVal.number) {
                            console.log('Minority shareholder ' + treeNode.label);
                        } else if (!treeNode.searchHide) {
                            connLine = this._R.path(pathString);
                            if ((treeNode.drawLineThrough || treeNode.pseudo) && !treeNode.shadow) {
                                treeNode.drawLineThroughMe(hidePoint);
                            }
                        }
                    } else if (!treeNode.searchHide) {
                        connLine = this._R.path(pathString);
                        if ((treeNode.drawLineThrough || treeNode.pseudo) && !treeNode.shadow) {
                            treeNode.drawLineThroughMe(hidePoint);
                        }
                    }
                    // don't show connector arrows for pseudo nodes
                    if (treeNode.pseudo) {
                        delete parent.connStyle.style['arrow-end'];
                    } else {
                        let nodeRight = treeNode.X + treeNode.width;
                        if (!treeNode.searchHide && nodeRight > rightMostNode) {
                            rightMostNode = nodeRight;
                            rightMostNodeWidth = treeNode.width;
                        }
                    }
                    if (parent.pseudo) {
                        delete parent.connStyle.style['arrow-start'];
                    }

                    treeNode.connCreated = true;
                }
                if (connLine) {
                    if (parent.searchHide) {
                        connLine.attr({ 'stroke-dasharray': '- ' });
                    }
                    connLine.attr({ stroke: options.lineColor });
                    treeNode.connector = connLine;
                }
                return this;

            },

            labelPaths: function () {
                const padding = 3;
                const border = 1;
                if (options.labelColumn != 'false') {
                    let textattr = { 'font-size': options.labelFontSize, 'font-weight': 400, 'color': options.labelColor, 'background-color': '#fff', 'border': 'solid ' + options.labelBorderColor + ' ' + border + 'px', 'padding': '0px ' + padding + 'px', 'position': 'absolute', 'text-wrap': 'nowrap' };
                    this.nodeDB.db.forEach(node => {
                        $e('#' + node.nodeHTMLid + '-label').remove();
                        if (node.connector && node.label && !node.pseudo && !node.hidden && !node.parent().searchHide && !node.searchHide) {
                            if (options.labelPosition == 'node') {
                                let $lbl = $e('<div>')
                                    .attr('id', node.nodeHTMLid + '-label')
                                    .text(node.label)
                                    .css(textattr)
                                    .offset({ top: node.Y - border * 2, left: node.X + node.width / 2 })
                                    .addClass(engineercore_safeCSS(node.label));
                                if (options.lineStyle == 'bCurve' || options.lineStyle == 'curve') {
                                    $lbl.css('border-radius', '8px');
                                }
                                $e(this.drawArea).append($lbl);
                                $lbl.offset({ top: $lbl.offset().top - $lbl.height(), left: $lbl.offset().left - $lbl.width() / 2 - padding });
                            } else if (options.labelPosition == 'connector') {
                                let pathObj = node.connector;
                                let bbox = pathObj.getBBox();
                                let $lbl = $e('<div>')
                                    .attr('id', node.nodeHTMLid + '-label')
                                    .text(node.label)
                                    .css(textattr)
                                    .offset({ top: bbox.y + bbox.height / 2, left: bbox.x + bbox.width / 2 })
                                    .addClass(engineercore_safeCSS(node.label));
                                if (options.lineStyle == 'bCurve' || options.lineStyle == 'curve') {
                                    $lbl.css('border-radius', '8px');
                                }
                                $e(this.drawArea).append($lbl);
                                $lbl.offset({ top: $lbl.offset().top - $lbl.height() / 2, left: $lbl.offset().left - $lbl.width() / 2 });
                            }
                        }
                    });
                }
            },

            hideStruts: function () {
                this.getNodeDb().db.forEach(dbnode => {
                    if (dbnode.strut) {
                        if ($e('#' + dbnode.strut).hasClass('hidden') && dbnode.lineThroughMe) {
                            $e(dbnode.lineThroughMe[0]).hide();
                            if (dbnode.strutParent()) {
                                $e(dbnode.connector.node).hide();
                            }
                        } else {
                            dbnode.show();
                            $e(dbnode.lineThroughMe[0]).show();
                            $e(dbnode.connector.node).show();
                            if (dbnode.strutParent()) {
                                $e(dbnode.connector.node).show();
                            }
                        }
                    }
                });
            },

            addPanelLinks: function () {
                let tree = this;
                if (options.linkColumn != 'false' && options.linkColumn != 'auto') {
                    $e('#' + options.container + ' .et-node').each(function () {
                        $e(this).off('click');
                        let link = $e(this).data('treenode').link;
                        if (link !== undefined) {
                            $e(this).addClass('clickable');
                            $e(this).click(function () {
                                window.open(link);
                            });
                        }
                    });
                } else if (options.panelFunction) {
                    $e('#' + options.container + ' .et-node').each(function () {
                        $e(this).off('click');
                        $e(this).addClass('clickable');
                        $e(this).click(function () {
                            options.panelFunction($e(this).data('treenode'));
                        });
                    });
                } else if (options.panelLinks != 'false') {
                    $e('#' + options.container + ' .et-node').each(function () {
                        $e(this).off('click');
                        let nodeData = $e(this).data('treenode');
                        if (nodeData.pseudo || nodeData.shadow) {
                            return;
                        }
                        $e(this).addClass('clickable');
                        let index = nodeData.itemPosition - 1;
                        let itemId = nodeData.itemID;
                        let searchText = nodeData.text;

                        if (options.panelLinks == 'print') {
                            let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetPrintItem');
                            let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + itemId + '&view=readonly&injectSheetLinkView=true&isPrintPreview=true');
                            $e(this).click(function () {
                                window.open(link, '_blank');
                            });
                        } else if (options.panelLinks == 'isheet') {
                            let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetHome');
                            let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + itemId);
                            $e(this).click(function () {
                                window.open(link, '_' + options.linkTab);
                            });
                        } else if (options.panelLinks == 'search') {
                            let iDColumn = rawXmlData.view.head.headColumn[options.nameColumn];
                            let advancedSearchColumn = 'filterValue_' + iDColumn.columnid + '_';
                            advancedSearchColumn += iDColumn.columnTypeAlias == 'SHEET_COLUMN_TYPE_CHOICE' ? '3' : '1';
                            let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetHome');
                            let link = res.replace('&metaData.isheetExportType=xml', '');
                            if (iDColumn.columnTypeAlias == 'SHEET_COLUMN_TYPE_CHOICE') {
                                link += '&advanceSearch=true' + '&' + advancedSearchColumn + '=' + searchText;
                            } else {
                                link += '&advanceSearch=true' + '&' + advancedSearchColumn + '="' + searchText + '"';
                            }
                            $e(this).click(function () {
                                window.open(link, '_' + options.linkTab);
                            });
                        } else if (options.panelLinks == 'default') {
                            let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetHome');
                            res = res.replace(/metaData.sheetViewID=\d*/i, '');
                            let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + itemId);
                            $e(this).click(function () {
                                window.open(link, '_' + options.linkTab);
                            });
                        } else if (options.panelLinks == 'viewItem') {
                            $e(this).click(function () {
                                const itemBtn = document.createElement('A');
                                itemBtn.className = 'CKContextLink hidden';
                                itemBtn.textContent = 'LINK';
                                itemBtn.setAttribute('id', '{"linkType":"iSheetItem","siteID":"' + options.siteID + '","contextID":"' + options.sheetID + '","sheetItemID":"' + itemId + '","sheetViewID":"0","viewMode":"0","linkedFromCKEditor":false}');
                                let viewBtnLink = buildISheetUrl('injectColumnViewItemPage', itemId, true, {
                                    'metaData.viewMode': '0',
                                    'view': 'readonly',
                                    'sheetItemLinkView': 'false',
                                });
                                itemBtn.setAttribute('href', viewBtnLink);
                                $j('#' + options.container).append(itemBtn);
                                rebindCKContentLink();
                                itemBtn.click();
                                itemBtn.remove();
                            });
                        } else if (options.panelLinks == 'table' || options.panelLinks == 'compare') {
                            $e(this).click(function () {
                                let sNodePos = [];
                                let thisNode = $e(this).data().treenode;
                                if (thisNode.hasShadow) {
                                    thisNode.hasShadow.forEach(sNodeId => {
                                        sNodePos.push(tree.nodeDB.get(sNodeId).itemPosition - 1);
                                    });
                                } else if (thisNode.duplicateParents.length > 0) {
                                    thisNode.duplicateParents.forEach(sNode => {
                                        sNodePos.push(Number.parseInt(Object.values(sNode)[0].itemPosition) - 1);
                                    });
                                }
                                if (selectedQuickViewItems.has(index)) {
                                    $e(this).removeClass('tree-item-on');
                                    $e(this).addClass('tree-item-off');
                                    selectedQuickViewItems.delete(index);
                                    sNodePos.forEach(sNodePos => {
                                        selectedQuickViewItems.delete(sNodePos);
                                    });
                                } else {
                                    if (options.panelLinks == 'table') {
                                        $e('#' + options.container + ' .tree-item-on').addClass('tree-item-off').removeClass('tree-item-on');
                                        selectedQuickViewItems.clear();
                                    }
                                    $e(this).removeClass('tree-item-off');
                                    $e(this).addClass('tree-item-on');
                                    selectedQuickViewItems.set(index, index);
                                    sNodePos.forEach(sNodePos => {
                                        selectedQuickViewItems.set(sNodePos, sNodePos);
                                    });
                                }
                                let selectedRows = [];
                                for (let row of selectedQuickViewItems.keys()) {
                                    selectedRows.push(row);
                                }
                                tableOptions.selectedRows = selectedRows.toString();
                                if (tableOptions.selectedRows.length === 0) {
                                    $e('#' + tableOptions.tableElement).hide();
                                } else {
                                    renderEngineerTable();
                                    $e('#' + tableOptions.tableElement).show();
                                }
                            });
                        }

                        else {
                            return;
                        }
                    });
                }
            },

            pruneMode: function (nodeDb) {
                selectedQuickViewItems.clear();
                $e('#' + options.container + ' .node').removeClass('tree-item-on');

                nodeDb.db.forEach(dbnode => {
                    if (dbnode.searchHide) {
                        return;
                    }
                    $e(dbnode.nodeDOM).off('click');
                    $e(dbnode.nodeDOM).on('click', thisTree.pruneHandler);
                });
            },

            pruneCancel: function (nodeDb) {
                selectedQuickViewItems.clear();
                $e('#' + options.container + ' .node').removeClass('tree-item-on');

                nodeDb.db.forEach(dbnode => {
                    if (dbnode.searchHide) {
                        return;
                    }
                    $e(dbnode.nodeDOM).off('click', thisTree.pruneHandler);
                });
                thisTree.addPanelLinks();
            },

            pruneHandler: function () {
                let sNodeIds = [];
                let shadows = $e(this).data().treenode.hasShadow;
                let id = $e(this).data().treenode.id;
                if (shadows) {
                    shadows.forEach(sNodeId => {
                        sNodeIds.push(thisTree.nodeDB.get(sNodeId).id);
                    });
                }
                let children = thisTree.searchDown(thisTree.nodeDB.get(id), null, [], undefined, 0, 0);
                //search down to also prune all child nodes
                if (selectedQuickViewItems.has(id)) {
                    $e(this).removeClass('tree-item-on');
                    $e(this).addClass('tree-item-off');
                    selectedQuickViewItems.delete(id);
                    sNodeIds.forEach(sNodeid => {
                        selectedQuickViewItems.delete(sNodeid);
                    });
                    children.forEach(sNodeid => {
                        selectedQuickViewItems.delete(sNodeid);
                    });
                } else {
                    $e(this).removeClass('tree-item-off');
                    $e(this).addClass('tree-item-on');
                    selectedQuickViewItems.set(id, id);
                    sNodeIds.forEach(sNodeid => {
                        selectedQuickViewItems.set(sNodeid, sNodeid);
                    });
                    children.forEach(sNodeid => {
                        selectedQuickViewItems.set(sNodeid);
                    });
                }
                for (let row of selectedQuickViewItems.keys()) {
                    prunedRows.push(row);
                }
            },

            pruneTree: function (nodeDb, pruneArray) {
                let shownNodes = [];
                nodeDb.db.forEach(dbnode => {
                    if (!dbnode.pseudo) {
                        if (!pruneArray.includes(dbnode.id)) {
                            shownNodes.push(dbnode.id);
                        }
                    }
                });
                thisTree.reset(thisTree.initJsonConfig, 0).redraw(shownNodes);
                thisTree.pruneMode(thisTree.nodeDB);
                $e('#' + options.container + ' .tree-prune').removeClass('hidden');

            },

            /**
             * Takes a parent node and recursively searches down the tree to locate a node by name
             * returns the path to that node as an array
             * @param {TreeNode} node
             * @param {String} matchingName
             * @param {Array} path
             * @returns {Array}
             */
            searchTree: function (node, matchingName, path) {
                // search will miss paths that end in a shadow node of a valid path to the target
                // if a path ends in a shadow node, its array should be stored in an shadow object like
                // 42:[1,3,5]
                // then once a valid path is found, each node should be checked for its shadows and if present in the above object, added to the path 
                if (typeof (node) === 'string') {
                    //continue
                }
                if (node.text == matchingName) {
                    return [path];
                } else if (node.children.length > 0 || node.strut) {
                    let i;
                    let result = [];
                    for (i = 0; i < node.children.length; i++) {
                        let childPath = path.slice();
                        childPath.push(node.children[i]);
                        let childResult = this.searchTree(this.nodeDB.db[node.children[i]], matchingName, childPath);
                        if (childResult.length > 0) {
                            result = result.concat(childResult);
                        }
                    }
                    // make final strut connection - disconnected to prevent infinite recursive loops
                    if (node.strut && !node.children.length) {
                        let childPath = path.slice();
                        let childNode = this.nodeDB.getNodeMap().get(node.strut);
                        childPath.push(childNode);
                        let childResult = this.searchTree(this.nodeDB.db[childNode], matchingName, childPath);
                        if (childResult.length > 0) {
                            result = result.concat(childResult);
                        }
                    }
                    return result.flat();
                }
                return [];
            },

            searchDown: function (node, levels, path, rootLevel, shadows, pseudos) {
                if (rootLevel === undefined) {
                    rootLevel = node.level;
                }
                if (shadows === undefined) {
                    shadows = 0;
                }
                if (pseudos === undefined) {
                    pseudos = 0;
                }
                if (node.pseudo) {
                    pseudos++;
                }
                if ((levels && path.length - pseudos > levels) || node.children.length == 0) {
                    if (node.shadow) {
                        path.push(node.shadow);
                    }
                    return [path];
                } else {
                    let childResult;
                    let result = [];
                    if (node.shadow) {
                        shadows++;
                        let childPath = path.slice();
                        childPath.push(node.shadow);
                        childResult = this.searchDown(this.nodeDB.db[node.shadow], levels, childPath, rootLevel, shadows, pseudos);
                        if (childResult.length > 0) {
                            result = result.concat(childResult);
                        }
                    }
                    if (node.children.length > 0 || node.strut) {
                        let i;
                        for (i = 0; i < node.children.length; i++) {
                            let childPath = path.slice();
                            childPath.push(node.children[i]);
                            childResult = this.searchDown(this.nodeDB.db[node.children[i]], levels, childPath, rootLevel, shadows, pseudos);
                            if (childResult.length > 0) {
                                result = result.concat(childResult);
                            }
                        }
                    }
                    return result.flat();
                }
            },

            searchUp: function (node, levels, path, rootLevel, shadows, pseudos) {
                if (rootLevel === undefined) {
                    rootLevel = node.level;
                }
                if (shadows === undefined) {
                    shadows = 0;
                }
                if (pseudos === undefined) {
                    pseudos = 0;
                }
                if (node.pseudo) {
                    pseudos++;
                }
                if (path.length - shadows - pseudos > levels || node.id == 0) {
                    return [path];
                } else if (node.parentId > -1) {
                    let result = [];
                    let parentPath = path.slice();
                    parentPath.push(node.parentId);
                    let parentResult = this.searchUp(this.nodeDB.db[node.parentId], levels, parentPath, rootLevel, shadows, pseudos);
                    if (parentResult.length > 0) {
                        result = result.concat(parentResult);
                    }
                    if (node.hasShadow) {
                        shadows++;
                        let i;
                        for (i = 0; i < node.hasShadow.length; i++) {
                            let parentPath = path.slice();
                            parentPath.push(node.hasShadow[i]);
                            let parentResult = this.searchUp(this.nodeDB.db[node.hasShadow[i]], levels, parentPath, rootLevel, shadows, pseudos);
                            if (parentResult.length > 0) {
                                result = result.concat(parentResult);
                            }
                        }
                    }
                    return result.flat();
                }
                return [];
            },

            highlightParents: function (node, path, rootLevel, shadows, pseudos) {
                if (rootLevel === undefined) {
                    rootLevel = node.level;
                }
                if (shadows === undefined) {
                    shadows = 0;
                }
                if (pseudos === undefined) {
                    pseudos = 0;
                }
                if (node.pseudo) {
                    pseudos++;
                }
                if (path.length - shadows - pseudos > 1 || node.id == 0) {
                    path.pop();
                    return [path];
                } else {
                    let result = [];
                    let parentPath = path.slice();
                    parentPath.push(node.parentId);
                    let parentResult = this.highlightParents(this.nodeDB.db[node.parentId], parentPath, rootLevel, shadows, pseudos);
                    if (parentResult.length > 0) {
                        result = result.concat(parentResult);
                    }
                    if (node.hasShadow) {
                        shadows++;
                        let i;
                        for (i = 0; i < node.hasShadow.length; i++) {
                            let parentPath = path.slice();
                            parentPath.push(node.hasShadow[i]);
                            let parentResult = this.highlightParents(this.nodeDB.db[node.hasShadow[i]], parentPath, rootLevel, shadows, pseudos);
                            if (parentResult.length > 0) {
                                result = result.concat(parentResult);
                            }
                        }
                    }
                    return result.flat();
                }
            },

            findNodeByName: function (name, searchType, $input) {
                let nodeNames = [];
                for (let i = 0, len = this.nodeDB.db.length; i < len; i++) {
                    let dbnode = this.nodeDB.get(i);
                    if (dbnode.text) {
                        if (dbnode.text == name) {
                            if (!dbnode.shadow) {
                                return dbnode;
                            }
                        }
                        nodeNames.push(dbnode.text);
                    }
                }

                let fuzzyMatches = fuzzyFind(name);
                let fuzzyContainer = $e('<div>');
                if (fuzzyMatches.length > 0) {
                    fuzzyMatches.forEach(match => {
                        let $fuzzyDiv = $e('<a>')
                            .text(match)
                            .css({ 'display': 'block', 'cursor': 'pointer' })
                            .on('click', function () {
                                $input.val(match);
                                $e('#engineerModal').modal('hide');
                                if (searchType == 'SEARCH') {
                                    treeSearch();
                                } else if (searchType == 'LIMIT') {
                                    treeLimit();
                                }
                            });
                        fuzzyContainer.append($fuzzyDiv);
                    });
                    engineercore_modal('Did you mean...', fuzzyContainer);
                    $e('#engineerModal').modal('show');
                } else {
                    alert(alert('Unable to locate ' + name));
                }

                function fuzzyFind(query) {
                    let words = query.toUpperCase().split(' ');
                    return nodeNames.filter(function (item) {
                        return words.every(function (word) {
                            if (item.toUpperCase().includes(word)) {
                                return true;
                            }
                        });
                    });
                }
            },

            /**
             * Create the path which is represented as a point, used for hiding the connection
             * A path with a leading "_" indicates the path will be hidden
             * See: http://dmitrybaranovskiy.github.io/raphael/reference.html#Paper.path
             * @param {object} hidePoint
             * @returns {string}
             */
            getPointPathString: function (hidePoint) {
                return ['_M', hidePoint.x, ',', hidePoint.y, 'L', hidePoint.x, ',', hidePoint.y, hidePoint.x, ',', hidePoint.y].join(' ');
            },

            /**
             * This method relied on receiving a valid Raphael Paper.path.
             * See: http://dmitrybaranovskiy.github.io/raphael/reference.html#Paper.path
             * A pathString is typically in the format of "M10,20L30,40"
             * @param path
             * @param {string} pathString
             * @returns {Tree}
             */
            animatePath: function (path, pathString) {
                if (path.hidden && !pathString.startsWith('_')) {
                    path.show();
                    path.hidden = false;
                }

                // See: http://dmitrybaranovskiy.github.io/raphael/reference.html#Element.animate
                path.animate(
                    {
                        path: pathString.startsWith('_') ? pathString.substring(1) : pathString
                    },
                    this.CONFIG.animation.connectorsSpeed,
                    this.CONFIG.animation.connectorsAnimation,
                    function () {
                        if (pathString.startsWith('_')) { // animation is hiding the path, hide it at the and of animation
                            path.hide();
                            path.hidden = true;
                        }
                    }
                );
                return this;
            },

            /**
             *
             * @param {TreeNode} from_node
             * @param {TreeNode} to_node
             * @param {boolean} stacked
             * @returns {string}
             */
            getPathString: function (from_node, to_node, stacked, absolute = false) {
                let startPoint = from_node.connectorPoint(true),
                    endPoint = to_node.connectorPoint(false),
                    orientation = this.CONFIG.rootOrientation,
                    connType = from_node.connStyle.type,
                    P1 = {}, P2 = {};
                if (Number.isNaN(startPoint.x)) {
                    console.log('Cannot connect from ' + from_node.nodeHTMLid + ' to ' + to_node.nodeHTMLid);
                }
                if (Number.isNaN(endPoint.x)) {
                    console.log('Cannot connect to ' + to_node.nodeHTMLid + ' from ' + from_node.nodeHTMLid);
                }
                if (orientation == 'NORTH' || orientation == 'SOUTH') {
                    P1.y = P2.y = (startPoint.y + endPoint.y) / 2;
                    P1.x = startPoint.x;
                    P2.x = endPoint.x;
                }
                else if (orientation == 'EAST' || orientation == 'WEST') {
                    P1.x = P2.x = (startPoint.x + endPoint.x) / 2;
                    P1.y = startPoint.y;
                    P2.y = endPoint.y;
                }

                if (absolute) {
                    P1.x = startPoint.x - (from_node.width / 2);
                    P2.x = startPoint.x - (from_node.width / 2);
                }

                let sp = (startPoint.x) + ',' + (startPoint.y), p1 = P1.x + ',' + P1.y, p2 = P2.x + ',' + P2.y;
                let ep = (endPoint.x) + ',' + (endPoint.y);
                let pm = (P1.x + P2.x) / 2 + ',' + (P1.y + P2.y) / 2, pathString, stackPoint;


                if (stacked) { // STACKED CHILDREN

                    stackPoint = (orientation == 'EAST' || orientation == 'WEST') ?
                        endPoint.x + ',' + startPoint.y :
                        startPoint.x + ',' + endPoint.y;

                    if (connType == 'step' || connType == 'straight') {
                        pathString = ['M', sp, 'L', stackPoint, 'L', ep];
                    }
                    else if (connType == 'curve' || connType == 'bCurve') {
                        let helpPoint, // used for nicer curve lines
                            indent = from_node.connStyle.stackIndent;

                        if (orientation == 'NORTH') {
                            helpPoint = (endPoint.x - indent) + ',' + (endPoint.y - indent);
                        }
                        else if (orientation == 'SOUTH') {
                            helpPoint = (endPoint.x - indent) + ',' + (endPoint.y + indent);
                        }
                        else if (orientation == 'EAST') {
                            helpPoint = (endPoint.x + indent) + ',' + startPoint.y;
                        }
                        else if (orientation == 'WEST') {
                            helpPoint = (endPoint.x - indent) + ',' + startPoint.y;
                        }
                        pathString = ['M', sp, 'L', helpPoint, 'S', stackPoint, ep];
                    }

                }
                else if (connType == 'step') {
                    pathString = ['M', sp, 'L', p1, 'L', p2, 'L', ep];
                }
                else if (connType == 'curve') {
                    pathString = ['M', sp, 'C', p1, p2, ep];
                }
                else if (connType == 'bCurve') {
                    pathString = ['M', sp, 'Q', p1, pm, 'T', ep];
                }
                else if (connType == 'straight') {
                    pathString = ['M', sp, 'L', sp, ep];
                }
                return pathString.join(' ');
            },

            /**
             * Algorithm works from left to right, so previous processed node will be left neighbour of the next node
             * @param {TreeNode} node
             * @param {number} level
             * @returns {Tree}
             */
            setNeighbors: function (node, level) {
                node.leftNeighborId = this.lastNodeOnLevel[level];
                if (node.leftNeighborId) {
                    node.leftNeighbor().rightNeighborId = node.id;
                }
                this.lastNodeOnLevel[level] = node.id;
                return this;
            },

            /**
             * Used for calculation of height and width of a level (level dimensions)
             * @param {TreeNode} node
             * @param {number} level
             * @returns {Tree}
             */
            calcLevelDim: function (node, level) {
                this.levelMaxDim[level] = {
                    width: Math.max(this.levelMaxDim[level] ? this.levelMaxDim[level].width : 0, node.width),
                    height: Math.max(this.levelMaxDim[level] ? this.levelMaxDim[level].height : 0, node.height)
                };
                return this;
            },

            /**
             * @returns {Tree}
             */
            resetLevelData: function () {
                this.lastNodeOnLevel = [];
                this.levelMaxDim = [];
                return this;
            },

            /**
             * @returns {TreeNode}
             */
            root: function () {
                return this.nodeDB.get(0);
            }
        };

        /**
         * NodeDB is used for storing the nodes. Each tree has its own NodeDB.
         * @param {object} nodeStructure
         * @param {Tree} tree
         * @constructor
         */
        class NodeDB {
            constructor(nodeStructure, tree) {
                this.reset(nodeStructure, tree);
            }
            getNodeMap() {
                return nodeMap;
            }
            clearNodeMap() {
                nodeMap.clear();
            }
            getNodeId(name) {
                return nodeMap.get(name);
            }
            /**
             * @param {object} nodeStructure
             * @param {Tree} tree
             * @returns {NodeDB}
             */
            reset(nodeStructure, tree) {
                this.db = [];
                let self = this;

                /**
                 * @param {object} node
                 * @param {number} parentId
                 */
                function iterateChildren(node, parentId) {
                    let newNode;
                    if (node.HTMLid) {
                        let primary;
                        if (node.children.length > 0) {
                            primary = true;
                        }
                        let compNodeId = nodeMap.get(node.HTMLid);
                        if (compNodeId) {
                            // create shadow node - allow incoming connections from multiple parent nodes by underlaying shadow nodes
                            let compNode = self.get(compNodeId);
                            newNode = self.createNode(node, parentId, tree, null);
                            if (options.holdingColumn) {
                                if (node.connVal.number > compNode.connVal.number) {
                                    primary = true;
                                    newNode.children = compNode.children;
                                    node.children.forEach(child => {
                                        if (nodeMap.get(child.HTMLid)) {
                                            self.db[nodeMap.get(child.HTMLid)].parentId = newNode.id;
                                        }
                                    });
                                    compNode.children = [];
                                }
                            }
                            if (primary) {
                                newNode.nodeHTMLclass += ' tree-primary';
                                if (!newNode.hasShadow) {
                                    newNode.hasShadow = [];
                                }
                                newNode.hasShadow.push(compNode.id);
                                compNode.shadow = newNode.id;
                                compNode.hasShadow = undefined;
                                compNode.nodeHTMLid = node.HTMLid + '__' + compNode.parentId;
                                compNode.nodeHTMLclass = compNode.nodeHTMLclass.replace(' tree-primary', ' ');
                                nodeMap.set(compNode.nodeHTMLid + '__' + compNode.parentId, compNode.id);
                                nodeMap.set(newNode.nodeHTMLid, newNode.id);
                            } else {
                                if (!compNode.hasShadow) {
                                    compNode.hasShadow = [];
                                }
                                compNode.hasShadow.push(newNode.id);
                                newNode.shadow = compNode.id;
                                newNode.nodeHTMLid = node.HTMLid + '__' + parentId;
                                nodeMap.set(newNode.nodeHTMLid + '__' + parentId, newNode.id);
                            }
                        } else {
                            newNode = self.createNode(node, parentId, tree, null);
                            nodeMap.set(node.HTMLid, newNode.id);
                        }
                    } else {
                        newNode = self.createNode(node, parentId, tree, null);
                    }
                    if (node.children) {
                        if (node.childrenDropLevel && node.childrenDropLevel > 0) {
                            while (node.childrenDropLevel--) {
                                // pseudo node needs to inherit the connection style from its parent for continuous connectors
                                let connStyle = UTIL.cloneObj(newNode.connStyle);
                                newNode = self.createNode('pseudo', newNode.id, tree, null);
                                newNode.connStyle = connStyle;
                                newNode.children = [];
                            }
                        }
                        let stack = (node.stackChildren && !self.hasGrandChildren(node)) ? newNode.id : null;

                        if (stack !== null) {
                            newNode.stackChildren = [];
                        }

                        for (let i = 0, len = node.children.length; i < len; i++) {
                            if (stack !== null) {
                                newNode = self.createNode(node.children[i], newNode.id, tree, stack);
                                if ((i + 1) < len) {
                                    // last node
                                    newNode.children = [];
                                }
                            }
                            else {
                                iterateChildren(node.children[i], newNode.id);
                            }
                        }
                    }
                }

                if (tree.CONFIG.animateOnInit) {
                    nodeStructure.collapsed = true;
                }
                this.clearNodeMap();
                iterateChildren(nodeStructure, -1);
                this.createGeometries(tree);

                return this;
            }
            /**
             * @param {Tree} tree
             * @returns {NodeDB}
             */
            createGeometries(tree) {
                let i = this.db.length;

                while (i--) {
                    this.get(i).createGeometry(tree);
                }
                return this;
            }
            /**
             * @param {number} nodeId
             * @returns {TreeNode}
             */
            get(nodeId) {
                return this.db[nodeId];
            }
            /**
             *
             * @param {object} nodeStructure
             * @param {number} parentId
             * @param {Tree} tree
             * @param {number} stackParentId
             * @returns {TreeNode}
             */
            createNode(nodeStructure, parentId, tree, stackParentId) {
                let node = new TreeNode(nodeStructure, this.db.length, parentId, tree, stackParentId);
                this.db.push(node);
                // skip root node (0)
                if (parentId >= 0) {
                    let parent = this.get(parentId);

                    if (nodeStructure.position) {
                        if (nodeStructure.position == 'left') {
                            parent.children.push(node.id);
                        }
                        else if (nodeStructure.position == 'right') {
                            parent.children.splice(0, 0, node.id);
                        }
                        else if (nodeStructure.position == 'center') {
                            parent.children.splice(Math.floor(parent.children.length / 2), 0, node.id);
                        }
                        else {
                            // only 1 child
                            let position = parseInt(nodeStructure.position);
                            if (parent.children.length == 1 && position > 0) {
                                parent.children.splice(0, 0, node.id);
                            }
                            else {
                                parent.children.splice(
                                    Math.max(position, parent.children.length - 1),
                                    0, node.id
                                );
                            }
                        }
                    }
                    else {
                        parent.children.push(node.id);
                        parent.children.sort();
                    }
                }

                if (stackParentId) {
                    this.get(stackParentId).stackParent = true;
                    this.get(stackParentId).stackChildren.push(node.id);
                }

                return node;
            }

            getMinMaxCoord(dim, parent, MinMax) {
                parent = parent || this.get(0);

                MinMax = MinMax || {
                    min: parent[dim],
                    max: parent[dim] + ((dim == 'X') ? parent.width : parent.height)
                };

                let i = parent.childrenCount();

                while (i--) {
                    let node = parent.childAt(i);

                    let maxTest = node[dim] + ((dim == 'X') ? node.width : node.height), minTest = node[dim];

                    if (!node.searchHide || !node.pseudo) {
                        if (maxTest > MinMax.max) {
                            MinMax.max = maxTest;
                        }
                        if (minTest < MinMax.min) {
                            MinMax.min = minTest;
                        }
                    }

                    this.getMinMaxCoord(dim, node, MinMax);
                }
                return MinMax;
            }
            /**
             * @param {object} nodeStructure
             * @returns {boolean}
             */
            hasGrandChildren(nodeStructure) {
                let i = nodeStructure.children.length;
                while (i--) {
                    if (nodeStructure.children[i].children) {
                        return true;
                    }
                }
                return false;
            }
        }

        let nodeMap = new Map();

        /**
         * TreeNode constructor.
         * @param {object} nodeStructure
         * @param {number} id
         * @param {number} parentId
         * @param {Tree} tree
         * @param {number} stackParentId
         * @constructor
         */
        let TreeNode = function (nodeStructure, id, parentId, tree, stackParentId) {
            this.reset(nodeStructure, id, parentId, tree, stackParentId);
        };

        TreeNode.prototype = {

            /**
             * @param {object} nodeStructure
             * @param {number} id
             * @param {number} parentId
             * @param {Tree} tree
             * @param {number} stackParentId
             * @returns {TreeNode}
             */
            reset: function (nodeStructure, id, parentId, tree, stackParentId) {
                this.id = id;
                this.parentId = parentId;
                this.treeId = tree.id;
                this.prelim = 0;
                this.modifier = 0;
                this.leftNeighborId = null;
                this.stackParentId = stackParentId;
                this.pseudo = nodeStructure.pseudo;
                this.searchHide = nodeStructure.searchHide || false;
                this.image = nodeStructure.image || null;
                this.link = nodeStructure.link;

                this.connStyle = {
                    style: {
                        stroke: options.lineColor
                    },
                    type: options.lineStyle
                };
                this.connector = null;

                this.drawLineThrough = nodeStructure.drawLineThrough === false ? false : (nodeStructure.drawLineThrough || tree.CONFIG.node.drawLineThrough);
                this.collapsable = options.collapsable;
                this.collapsed = options.collapsed;
                this.text = nodeStructure.text;
                this.nodeHTMLclass = 'node et-node tree-primary ' + (nodeStructure.userClass || '');
                this.nodeHTMLid = nodeStructure.HTMLid;
                this.otherColumns = nodeStructure.otherColumns;
                this.label = nodeStructure.label;
                this.level = nodeStructure.level;
                this.children = [];
                this.status = {
                    text: nodeStructure.status,
                    color: nodeStructure.statusColor
                };
                this.duplicateParents = nodeStructure.duplicateParents;
                this.strut = nodeStructure.strut;
                this.itemID = nodeStructure.itemID;
                this.itemPosition = nodeStructure.itemPosition;
                this.connVal = nodeStructure.connVal;
                this.background = nodeStructure.background;

                return this;
            },

            /**
             * @returns {Tree}
             */
            getTree: function () {
                return TreeStore.get(this.treeId);
            },

            /**
             * @returns {object}
             */
            getTreeConfig: function () {
                return this.getTree().CONFIG;
            },

            /**
             * @returns {NodeDB}
             */
            getTreeNodeDb: function () {
                return this.getTree().getNodeDb();
            },

            /**
             * @param {number} nodeId
             * @returns {TreeNode}
             */
            lookupNode: function (nodeId) {
                return this.getTreeNodeDb().get(nodeId);
            },

            /**
             * @returns {Tree}
             */
            Tree: function () {
                return TreeStore.get(this.treeId);
            },

            /**
             * @param {number} nodeId
             * @returns {TreeNode}
             */
            dbGet: function (nodeId) {
                return this.getTreeNodeDb().get(nodeId);
            },

            /**
             * Returns the width of the node
             * @returns {float}
             */
            size: function () {
                let orientation = this.getTreeConfig().rootOrientation;
                if (this.pseudo) {
                    return (0);
                }
                if (orientation == 'NORTH' || orientation == 'SOUTH') {
                    return this.width;
                }
                else if (orientation == 'WEST' || orientation == 'EAST') {
                    return this.height;
                }
            },

            /**
             * @returns {number}
             */
            childrenCount: function () {
                return ((this.collapsed || !this.children) ? 0 : this.children.length);
            },

            /**
             * @param {number} index
             * @returns {TreeNode}
             */
            childAt: function (index) {
                return this.dbGet(this.children[index]);
            },

            /**
             * @returns {TreeNode}
             */
            firstChild: function () {
                return this.childAt(0);
            },

            /**
             * @returns {TreeNode}
             */
            lastChild: function () {
                return this.childAt(this.children.length - 1);
            },

            /**
             * @returns {TreeNode}
             */
            parent: function () {
                return this.lookupNode(this.parentId);
            },

            /**
             * @returns {TreeNode}
             */
            leftNeighbor: function () {
                if (this.leftNeighborId) {
                    return this.lookupNode(this.leftNeighborId);
                }
            },

            /**
             * @returns {TreeNode}
             */
            rightNeighbor: function () {
                if (this.rightNeighborId) {
                    return this.lookupNode(this.rightNeighborId);
                }
            },

            /**
             * @returns {TreeNode}
             */
            leftSibling: function () {
                let leftNeighbor = this.leftNeighbor();

                if (leftNeighbor && leftNeighbor.parentId == this.parentId) {
                    return leftNeighbor;
                }
            },

            /**
             * @returns {TreeNode}
             */
            rightSibling: function () {
                let rightNeighbor = this.rightNeighbor();

                if (rightNeighbor && rightNeighbor.parentId == this.parentId) {
                    return rightNeighbor;
                }
            },

            /**
             * @returns {number}
             */
            childrenCenter: function () {
                let first = this.firstChild(),
                    last = this.lastChild();

                return (first.prelim + ((last.prelim - first.prelim) + last.size()) / 2);
            },

            /**
             * Find out if one of the node ancestors is collapsed
             * @returns {*}
             */
            collapsedParent: function () {
                let parent = this.parent();
                if (!parent) {
                    return false;
                }
                if (parent.collapsed) {
                    return parent;
                }
                return parent.collapsedParent();
            },

            /**
             * Find out if one of the node ancestors is a strut
            * @returns {*}
             */
            strutParent: function () {
                let parent = this.parent();
                if (!parent) {
                    return false;
                }
                if (!parent.strut) {
                    return parent;
                }
                return parent.strutParent();
            },

            /**
             * Returns the leftmost child at specific level, (initial level = 0)
             * @param level
             * @param depth
             * @returns {*}
             */
            leftMost: function (level, depth) {
                if (level >= depth) {
                    return this;
                }
                if (this.childrenCount() === 0) {
                    return;
                }

                for (let i = 0, n = this.childrenCount(); i < n; i++) {
                    let leftmostDescendant = this.childAt(i).leftMost(level + 1, depth);
                    if (leftmostDescendant) {
                        return leftmostDescendant;
                    }
                }
            },

            // returns start or the end point of the connector line, origin is upper-left
            connectorPoint: function (startPoint) {
                let orient = this.Tree().CONFIG.rootOrientation, point = {};

                if (this.stackParentId) { // return different end point if node is a stacked child
                    if (orient == 'NORTH' || orient == 'SOUTH') {
                        orient = 'WEST';
                    }
                    else if (orient == 'EAST' || orient == 'WEST') {
                        orient = 'NORTH';
                    }
                }

                // if pseudo, a virtual center is used
                if (orient == 'NORTH') {
                    point.x = (this.pseudo) ? this.X - this.Tree().CONFIG.subTeeSeparation / 1.3 : this.X + this.width / 2;
                    point.y = (startPoint) ? this.Y + this.height : this.Y;
                }
                else if (orient == 'SOUTH') {
                    point.x = (this.pseudo) ? this.X - this.Tree().CONFIG.subTeeSeparation / 2 : this.X + this.width / 2;
                    point.y = (startPoint) ? this.Y : this.Y + this.height;
                }
                else if (orient == 'EAST') {
                    point.x = (startPoint) ? this.X : this.X + this.width;
                    point.y = (this.pseudo) ? this.Y - this.Tree().CONFIG.subTeeSeparation / 2 : this.Y + this.height / 2;
                }
                else if (orient == 'WEST') {
                    point.x = (startPoint) ? this.X + this.width : this.X;
                    point.y = (this.pseudo) ? this.Y - this.Tree().CONFIG.subTeeSeparation / 2 : this.Y + this.height / 2;
                }
                return point;
            },

            /**
             * @returns {string}
             */
            pathStringThrough: function () { // get the geometry of a path going through the node
                let startPoint = this.connectorPoint(true),
                    endPoint = this.connectorPoint(false);

                return ['M', startPoint.x + ',' + startPoint.y, 'L', endPoint.x + ',' + endPoint.y].join(' ');
            },

            /**
             * @param {object} hidePoint
             */
            drawLineThroughMe: function (hidePoint) {
                if (this.searchHide) {
                    return;
                }
                let pathString = hidePoint ?
                    this.Tree().getPointPathString(hidePoint) :
                    this.pathStringThrough();

                this.lineThroughMe = this.Tree()._R.path(pathString);

                let lineStyle = UTIL.cloneObj(this.connStyle.style);

                delete lineStyle['arrow-start'];
                delete lineStyle['arrow-end'];

                this.lineThroughMe.attr(lineStyle);

                if (hidePoint) {
                    this.lineThroughMe.hide();
                    this.lineThroughMe.hidden = true;
                }
            },

            addSwitchEvent: function (nodeSwitch) {
                let self = this;
                $e(nodeSwitch).on('click', function (e) {
                    e.preventDefault();
                    if (self.getTreeConfig().callback.onBeforeClickCollapseSwitch.apply(self, [nodeSwitch, e]) === false) {
                        return false;
                    }
                    self.toggleCollapse();
                    self.getTreeConfig().callback.onAfterClickCollapseSwitch.apply(self, [nodeSwitch, e]);
                }
                );
            },

            /**
             * @returns {TreeNode}
             */
            collapse: function () {
                if (!this.collapsed) {
                    this.toggleCollapse();
                }
                return this;
            },

            /**
             * @returns {TreeNode}
             */
            expand: function () {
                if (this.collapsed) {
                    this.toggleCollapse();
                }
                return this;
            },

            /**
             * @returns {TreeNode}
             */
            toggleCollapse: function () {
                let oTree = this.getTree();
                $e('#' + options.container + 'svg text').remove();

                if (!oTree.inAnimation) {
                    oTree.inAnimation = true;

                    this.collapsed = !this.collapsed; // toggle the collapse at each click
                    $e(this.nodeDOM).toggleClass('collapsed', this.collapsed);
                    if ($e('#' + options.container + ' .collapsed ').length > 0) {
                        $e('#' + options.container + ' .tree-collapse').removeClass('hidden');
                    } else {
                        $e('#' + options.container + ' .tree-collapse').addClass('hidden');
                    }
                    oTree.positionTree();
                    oTree.hideStruts();

                    let self = this;

                    setTimeout(
                        function () {
                            oTree.inAnimation = false;
                            oTree.labelPaths();
                            oTree.CONFIG.callback.onToggleCollapseFinished.apply(oTree, [self, self.collapsed]);
                        },
                        Math.max(oTree.CONFIG.animation.nodeSpeed, oTree.CONFIG.animation.connectorsSpeed)
                    );

                }
                return this;
            },

            hide: function (collapse_to_point = false) {

                let beforeState = this.hidden;
                this.hidden = true;
                $e(this.nodeDOM).addClass('hidden');

                let tree = this.getTree(),
                    config = this.getTreeConfig(),
                    oNewState = {
                        opacity: 0
                    };

                if (this.hasShadow) {
                    this.hasShadow.forEach(nodeid => {
                        tree.nodeDB.get(nodeid).parent().collapsed = true;
                    });
                }

                if (collapse_to_point) {
                    oNewState.left = collapse_to_point.x;
                    oNewState.top = collapse_to_point.y;
                }

                // if parent was hidden in initial configuration, position the node behind the parent without animations
                if (!this.positioned || beforeState) {
                    $e(this.nodeDOM).css(oNewState);
                    this.positioned = true;
                } else {
                    $e(this.nodeDOM).animate(
                        oNewState, config.animation.nodeSpeed, config.animation.nodeAnimation
                    );
                }

                if (this.lineThroughMe) {
                    if (beforeState) {
                        // update without animations
                        let new_path = tree.getPointPathString(collapse_to_point);
                        this.lineThroughMe.attr({ path: new_path });
                    }
                    else {
                        // update with animations
                        tree.animatePath(this.lineThroughMe, tree.getPointPathString(collapse_to_point));
                    }
                }

                return this;
            },

            show: function () {
                this.hidden = false;

                $e(this.nodeDOM).removeClass('hidden');

                let oNewState = { left: this.X, top: this.Y, opacity: 1 },
                    config = this.getTreeConfig();

                if (this.hasShadow) {
                    this.hasShadow.forEach(nodeid => {
                        thisTree.nodeDB.get(nodeid).parent().collapsed = false;
                    });
                }

                // if the node was hidden, update opacity and position
                $e(this.nodeDOM).animate(
                    oNewState,
                    config.animation.nodeSpeed, config.animation.nodeAnimation,
                    function () {
                        // $e.animate applies "overflow:hidden" to the node, remove it to avoid visual problems
                        this.style.overflow = '';
                    }
                );

                if (this.lineThroughMe) {
                    this.getTree().animatePath(this.lineThroughMe, this.pathStringThrough());
                }

                return this;
            },

            buildHoverHelp: function () {
                let $help;
                let node;
                if (options.showMajorityHoldingOnly && this.duplicateParents) {
                    $help = $e('<div>')
                        .addClass('el-hoverhelp')
                        .text('*');
                    let titleText = 'Minority Shareholders:\n';
                    this.duplicateParents.forEach(function (parentConn) {
                        titleText += Object.keys(parentConn)[0] + ': ' + Object.values(parentConn)[0].connVal.text + '\n';
                    });
                    $help.attr('title', titleText);
                    $e(this.nodeDOM).prepend($help);
                } else {
                    if (this.shadow) {
                        let shadowNode = this.getTree().nodeDB.get(this.shadow);
                        node = shadowNode.nodeDOM;
                        if ($e(node).find('.el-hoverhelp').length > 0) {
                            $help = $e(shadowNode.nodeDOM).find('.el-hoverhelp');
                        }
                    } else {
                        node = this.nodeDOM;
                        if ($e(this.nodeDOM).find('.el-hoverhelp').length > 0) {
                            $help = $e(this.nodeDOM).find('.el-hoverhelp');
                        }
                    }
                    if (!$help) {
                        $help = $e('<div>');
                        $help.addClass('el-hoverhelp');
                        $help.attr('title', this.connVal.name + ': ' + this.connVal.text);
                        $help.text('?');
                        $e(node).prepend($help);
                    } else {
                        $help.attr('title', $help.attr('title') + '\n' + this.connVal.name + ': ' + this.connVal.text);
                    }
                }
            }
        };

        /**
         * @param {Tree} tree
         */
        TreeNode.prototype.createGeometry = function (tree) {
            if (this.id === 0 && tree.CONFIG.hideRootNode) {
                this.width = 0;
                this.height = 0;
                return;
            }

            let $drawArea = $e(tree.drawArea);
            let image;

            let node = document.createElement('div');
            node.id = this.nodeHTMLid;
            node.style.color = options.nodeTextColor;
            if (options.nodeBorderWidth) {
                node.style.borderWidth = options.nodeBorderWidth + 'px';
            }
            if (options.nodeBorderColor) {
                node.style.borderColor = options.nodeBorderColor;
            }
            if (options.nodeWidth != 'auto' && !this.pseudo) {
                node.style.width = options.nodeWidth + 'px';
                node.style.textWrap = 'wrap';
            }
            if (options.nodeHeight != 'auto') {
                node.style.height = options.nodeHeight + 'px';
            }
            if (this.background) {
                node.style.backgroundColor = this.background;
            }

            node.className = (!this.pseudo) ? TreeNode.CONFIG.nodeHTMLclass : 'pseudo';
            if (this.nodeHTMLclass && !this.pseudo) {
                node.className += ' ' + this.nodeHTMLclass;
            }

            $e(node).data('treenode', this);

            /////////// CREATE innerHTML //////////////
            if (!this.pseudo && !this.searchHide) {
                if (this.image) {
                    image = document.createElement('img');
                    image.src = this.image;
                    node.appendChild(image);
                }
                if (this.text) {
                    let $text = $e('<div>');
                    $text.addClass('node-content')
                        .text(this.text)
                        .css('text-align', options.textAlign);

                    this.otherColumns.forEach((element) => {
                        let $otherCol = $e('<div>');
                        $otherCol.addClass('othercol othercol-' + engineercore_safeCSS(Object.keys(element).toString()));
                        if (options.showOtherColumnHeaders == 'true') {
                            $otherCol.html(Object.keys(element) + ': ' + Object.values(element));
                        } else {
                            $otherCol.html(Object.values(element));
                        }
                        $text.append($otherCol);
                    });
                    $e(node).append($text);
                }
                if (this.status) {
                    let $statusBadge = $e('<div>')
                        .addClass('badge badge-dark tree-badge')
                        .css('background', this.status.color)
                        .text(this.status.text);
                    $e(node).prepend($statusBadge);
                }

                // handle collapse switch
                if (this.collapsed || (this.collapsable && this.childrenCount() && !this.stackParentId)) {
                    this.createSwitchGeometry(tree, node);
                }

                if (options.hoverColor) {
                    $e(node).hover(function () {
                        let thisNode = ($e(this).data().treenode);
                        if (thisNode.id > 0) {
                            let parents = thisTree.highlightParents(thisNode, [thisNode.id]);

                            parents.forEach(parentNodeId => {
                                let parentNode = tree.nodeDB.get(parentNodeId);
                                let parentLabel = $e('#' + parentNode.nodeHTMLid + '-conn');
                                if (parentLabel) {
                                    parentLabel.css('border-color', options.hoverColor);
                                }
                                let parentConn = parentNode.connector;
                                if (parentConn) {
                                    parentConn.toFront();
                                    $e(parentConn.node).attr('stroke', options.hoverColor);
                                }
                                let parentLineThrough = parentNode.lineThroughMe;
                                if (parentLineThrough) {
                                    $e(parentLineThrough.node).attr('stroke', options.hoverColor);
                                }
                            });
                        }
                        $e(this).css('border-color', options.hoverColor);
                    }, function () {
                        let thisNode = ($e(this).data().treenode);
                        if (thisNode.id > 0) {
                            let parents = thisTree.highlightParents(thisNode, [thisNode.id]);
                            parents.forEach(parentNodeId => {
                                let parentNode = tree.nodeDB.get(parentNodeId);
                                let parentLabel = $e('#' + parentNode.nodeHTMLid + '-conn');
                                if (parentLabel) {
                                    parentLabel.css('border-color', options.labelColor);
                                }
                                let parentConn = parentNode.connector;
                                if (parentConn) {
                                    $e(parentConn.node).attr('stroke', options.lineColor);
                                }
                                let parentLineThrough = parentNode.lineThroughMe;
                                if (parentLineThrough) {
                                    $e(parentLineThrough.node).attr('stroke', options.lineColor);
                                }
                            });
                        }
                        $e(this).css('border-color', options.nodeBorderColor);
                    });
                }
            }
            tree.CONFIG.callback.onCreateNode.apply(tree, [this, node]);

            /////////// APPEND all //////////////
            let $node = $e('#' + node.id);
            if ($node.length < 1) {
                $drawArea.append(node);
            } else {
                $e('#' + node.id).replaceWith(node);
            }

            this.width = node.offsetWidth;
            this.height = node.offsetHeight;

            this.nodeDOM = node;

            tree.imageLoader.processNode(this);
        };

        /**
         * @param {Tree} tree
         * @param {Element} nodeEl
         */
        TreeNode.prototype.createSwitchGeometry = function (tree, nodeEl) {
            let $nodeEl = $e(nodeEl);

            // safe guard and check to see if it has a collapse switch
            let nodeSwitchEl = $nodeEl.find('.collapse-switch');
            if (nodeSwitchEl.length < 1) {
                nodeSwitchEl = document.createElement('a');
                nodeSwitchEl.className = 'collapse-switch';
                nodeSwitchEl.innerHTML = '▼';

                $nodeEl.append(nodeSwitchEl);
                this.addSwitchEvent(nodeSwitchEl);
                if (this.collapsed) {
                    nodeEl.className += ' collapsed';
                }

                tree.CONFIG.callback.onCreateNodeCollapseSwitch.apply(tree, [this, nodeEl, nodeSwitchEl]);
            }
            return nodeSwitchEl;
        };


        // ###########################################
        //      Expose global + default CONFIG params
        // ###########################################


        Tree.CONFIG = {
            maxDepth: 100,
            rootOrientation: 'NORTH', // NORTH || EAST || WEST || SOUTH
            nodeAlign: 'CENTER', // CENTER || TOP || BOTTOM
            levelSeparation: Number.parseInt(options.levelSeparation),
            siblingSeparation: Number.parseInt(options.nodeSeparation),
            subTeeSeparation: 20,
            hideRootNode: false,
            animateOnInit: false,
            animateOnInitDelay: 500,
            padding: 15, // the difference is seen only when the scrollbar is shown
            scrollbar: 'native', // "native" || "fancy" || "None" (PS: "fancy" requires jquery and perfect-scrollbar)
            node: { // each node inherits this, it can all be overridden in node config

                // HTMLclass: 'node',
                // drawLineThrough: false,
                // collapsable: false,
                link: {
                    target: '_self'
                }
            },

            animation: { // each node inherits this, it can all be overridden in node config
                nodeSpeed: 450,
                nodeAnimation: 'linear',
                connectorsSpeed: 450,
                connectorsAnimation: 'linear'
            },

            callback: {
                onCreateNode: function (treeNode, treeNodeDom) { }, // this = Tree
                onCreateNodeCollapseSwitch: function (treeNode, treeNodeDom, switchDom) { }, // this = Tree
                onAfterAddNode: function (newTreeNode, parentTreeNode, nodeStructure) { }, // this = Tree
                onBeforeAddNode: function (parentTreeNode, nodeStructure) { }, // this = Tree
                onAfterPositionNode: function (treeNode, nodeDbIndex, containerCenter, treeCenter) { }, // this = Tree
                onBeforePositionNode: function (treeNode, nodeDbIndex, containerCenter, treeCenter) { }, // this = Tree
                onToggleCollapseFinished: function (treeNode, bIsCollapsed) { }, // this = Tree
                onAfterClickCollapseSwitch: function (nodeSwitch, event) { }, // this = TreeNode
                onBeforeClickCollapseSwitch: function (nodeSwitch, event) { }, // this = TreeNode
                onTreeLoaded: function (rootTreeNode) { } // this = Tree
            }
        };

        TreeNode.CONFIG = {
            nodeHTMLclass: 'panel',

            textClass: {
                name: 'node-name',
                title: 'node-title',
                desc: 'node-desc',
                contact: 'node-contact'
            }
        };

        /**
         * Chart constructor.
         */
        class Treant {
            constructor(jsonConfig, callback) {
                this.tree = TreeStore.createTree(jsonConfig);
                this.tree.buildMenu();
                window.engineerLegalPlugins.tree[options.container].tree = {};
                thisTree = window.engineerLegalPlugins.tree[options.container].tree = this.tree;
                this.tree.positionTree(callback);
            }
        }
        new Treant(options);
    }

    /**
     * Queries a choice column style with back-compatiblity between engineerCore versions
     * 
     * @param object rawData
     * @returns string
     */
    function getChoiceTypeColumnStyle(rawData) {
        let style = '';
        if (rawData.choice) {
            if (rawData.choice[0]) {
                style = rawData.choice[0].style.substr(-7);
            } else {
                style = rawData.choice.style.substr(-7);
            }
        }
        return style;
    }

    function treeSearch(event, searchFrom, searchTo) {
        let $searchFrom = $e('#' + options.container + ' .search-from');
        let $searchTo = $e('#' + options.container + ' .search-to');
        let startnode;
        if (!searchFrom) {
            searchFrom = $searchFrom.val();
        } else {
            $searchFrom.val(searchFrom);
        }
        if (searchFrom.length > 0) {
            startnode = thisTree.findNodeByName(searchFrom, 'SEARCH', $searchFrom);
            if (!startnode) {
                return;
            } else {
                if (!searchTo) {
                    searchTo = $searchTo.val();
                } else {
                    $searchTo.val(searchTo);
                }
                if (searchTo.length > 0) {
                    let endnode = thisTree.findNodeByName(searchTo, 'SEARCH', $searchTo);
                    if (!endnode) {
                        return;
                    }
                    if (startnode.level > endnode.level) {
                        let copystartnode = startnode;
                        startnode = endnode;
                        endnode = copystartnode;
                    }
                    let path = [startnode.id];
                    let arr = thisTree.searchTree(startnode, endnode.text, path);
                    if (arr.length > 0) {
                        options.preSearchType = null; // reset presearchType to avoid triggering presearch after search
                        thisTree.reset(thisTree.initJsonConfig, 0).redraw(arr);
                        thisTree.addPanelLinks();
                        $e('.engineertreescroll').scrollTop(startnode.Y);
                        $e('.tree-limit').removeClass('hidden');
                    } else {
                        alert('No connection found from ' + searchFrom + ' to ' + searchTo);
                    }
                } else {
                    $e('.engineertreescroll').scrollLeft(startnode.X - $e(window).width() / 2);
                    $e('.engineertreescroll').scrollTop(startnode.Y + $e(window).height() / 2);
                    let $foundNode = $e(startnode.nodeDOM);
                    let flashCount = 0;
                    let flash = setInterval(() => {
                        flashCount++;
                        $foundNode.css({ 'border-color': 'red', 'border-width': '5px' });
                        if (flashCount > 10) {
                            clearInterval(flash);
                        }
                        setTimeout(() => {
                            $foundNode.css({ 'border-color': options.nodeBorderColor, 'border-width': '2px' });
                        }, 200);
                    }, 800);
                }
            }
        } else {
            alert('Please enter a name in the Search From box');
        }
    }

    function treeLimit(event, searchFrom, limitNumber, limitDir) {
        let $searchFrom = $e('#' + options.container + ' .search-from');
        if (!searchFrom) {
            searchFrom = $e('#' + options.container + ' .search-from').val();
            limitNumber = $e('#' + options.container + ' .limit-value').val();
            limitDir = $e('#' + options.container + ' .limit-dir').val();
        } else {
            $searchFrom.val(searchFrom);
            $e('#' + options.container + ' .limit-value').val(limitNumber);
            $e('#' + options.container + ' .limit-dir').val(limitDir);
        }

        if (!searchFrom) {
            alert('Please insert a "Search From" value to limit the chart');
            return;
        }
        let startnode = thisTree.findNodeByName(searchFrom, 'LIMIT', $searchFrom);
        if (!startnode) {
            return;
        }

        let path = [startnode.id];
        let arrUp = [];
        let arrDn = [];
        if (limitDir == 'both' || limitDir == 'up') {
            arrUp = thisTree.searchUp(startnode, limitNumber, path);
        }
        if (limitDir == 'both' || limitDir == 'down') {
            arrDn = thisTree.searchDown(startnode, limitNumber, path);
        }
        let arr = [];
        try {
            arr = Array.from(new Set([].concat(arrUp || [], arrDn || []).flat())).map(a => Number.parseInt(a, 10)).filter(n => !Number.isNaN(n));
        } catch (e) {
            arr = [].concat(arrUp || [], arrDn || []);
        }

        if (arr.length > 0) {
            options.preSearchType = null; // reset preSearchType to avoid triggering presearch after search
            thisTree.reset(thisTree.initJsonConfig, 0).redraw(arr);
            thisTree.addPanelLinks();
            $e('#' + options.container + ' .engineertreescroll').scrollTop(thisTree.nodeDB.get(startnode.id).Y);
            $e('#' + options.container + ' .tree-limit').removeClass('hidden');
        } else {
            alert('No connection found from ' + searchFrom + ' with the specified limit');
        }
    }

    /**
     * Returns the value of an iSheet cell
     * 
     * @param object rawXmlData
     * @param string column
     * @param object row
     * @returns string
     */
    function getValue(rawXmlData, column, row) {
        let columnTypeAlias = rawXmlData.view.head.headColumn[column].columnTypeAlias;
        let columnValue;
        switch (columnTypeAlias) {
            case 'SHEET_COLUMN_TYPE_HYPERLINK': {
                if (row.column[column].rawData.linkDisplayURL) {
                    columnValue = row.column[column].rawData.linkDisplayURL.cdata;
                }
                break;
            }
            case 'SHEET_COLUMN_TYPE_CHOICE': {
                if (row.column[column].rawData.choice) {
                    if (row.column[column].rawData.choice[0]) {
                        columnValue = row.column[column].rawData.choice[0].cdata;
                    } else {
                        columnValue = row.column[column].rawData.choice.cdata;
                    }
                }
                break;
            }
            default:
                columnValue = row.column[column].displayData.cdata;
                break;
        }
        return columnValue;
    }

    /**
     * Call EngineerTable library with configured filters
     */
    function renderEngineerTable() {
        if (tableOptions.selectedColumns === null) {
            let columns = [];
            for (let col = 0; col < rawXmlData.view.head.headColumn.length; col++) {
                columns.push(col);
            }
            tableOptions.selectedColumns = columns.toString();
        }
        buildTable(rawXmlData, tableOptions);
    }

    /**
    * Creates a new iSheet URL with the specified parameters. 
    */
    function buildISheetUrl(basePath, itemId, removeSheetId, extraParams) {
        const url = new URL(options.iSheetViewLink.replace('sheetViewExportXML', basePath));
        url.searchParams.delete('metaData.isheetExportType');
        url.searchParams.set('metaData.itemId', itemId);
        if (removeSheetId) {
            url.searchParams.delete('metaData.sheetViewID');
        }
        if (extraParams) {
            for (let extraParam in extraParams) {
                if (extraParams[extraParam]) {
                    url.searchParams.set(extraParam, extraParams[extraParam]);
                }
            }
        }
        return url.toString();
    }
}

function EngineerTree(customOptions) {
    engineerTree(customOptions);
}

if (!window.engineerLegalPlugins) {
    window.engineerLegalPlugins = {};
}
if (!window.engineerLegalPlugins.tree) {
    window.engineerLegalPlugins.tree = { status: 1 };
} else if (!window.engineerLegalPlugins.tree.version) {
    window.engineerLegalPlugins.tree.version = engineerTreeVersion;
}

!function (a, b) { 'function' == typeof define && define.amd ? define('eve', function () { return b(); }) : 'object' == typeof exports ? module.exports = b() : a.eve = b(); }(this, function () { let a, b, c = '0.4.2', d = 'hasOwnProperty', e = /[\.\/]/, f = '*', g = function () { }, h = function (a, b) { return a - b; }, i = { n: {} }, j = function (c, d) { c = String(c); let e, f = b, g = Array.prototype.slice.call(arguments, 2), i = j.listeners(c), k = 0, l = [], m = {}, n = [], o = a; a = c, b = 0; for (var p = 0, q = i.length; q > p; p++)'zIndex' in i[p] && (l.push(i[p].zIndex), i[p].zIndex < 0 && (m[i[p].zIndex] = i[p])); for (l.sort(h); l[k] < 0;)if (e = m[l[k++]], n.push(e.apply(d, g)), b) return b = f, n; for (p = 0; q > p; p++)if (e = i[p], 'zIndex' in e) if (e.zIndex == l[k]) { if (n.push(e.apply(d, g)), b) break; do if (k++, e = m[l[k]], e && n.push(e.apply(d, g)), b) break; while (e); } else m[e.zIndex] = e; else if (n.push(e.apply(d, g)), b) break; return b = f, a = o, n.length ? n : null; }; return j._events = i, j.listeners = function (a) { let b, c, d, g, h, j, k, l, m = a.split(e), n = i, o = [n], p = []; for (g = 0, h = m.length; h > g; g++) { for (l = [], j = 0, k = o.length; k > j; j++)for (n = o[j].n, c = [n[m[g]], n[f]], d = 2; d--;)b = c[d], b && (l.push(b), p = p.concat(b.f || [])); o = l; } return p; }, j.on = function (a, b) { if (a = String(a), 'function' != typeof b) return function () { }; for (var c = a.split(e), d = i, f = 0, h = c.length; h > f; f++)d = d.n, d = d.hasOwnProperty(c[f]) && d[c[f]] || (d[c[f]] = { n: {} }); for (d.f = d.f || [], f = 0, h = d.f.length; h > f; f++)if (d.f[f] == b) return g; return d.f.push(b), function (a) { +a == +a && (b.zIndex = +a); }; }, j.f = function (a) { var b = [].slice.call(arguments, 1); return function () { j.apply(null, [a, null].concat(b).concat([].slice.call(arguments, 0))); }; }, j.stop = function () { b = 1; }, j.nt = function (b) { return b ? new RegExp('(?:\\.|\\/|^)' + b + '(?:\\.|\\/|$)').test(a) : a; }, j.nts = function () { return a.split(e); }, j.off = j.unbind = function (a, b) { if (!a) return void (j._events = i = { n: {} }); var c, g, h, k, l, m, n, o = a.split(e), p = [i]; for (k = 0, l = o.length; l > k; k++)for (m = 0; m < p.length; m += h.length - 2) { if (h = [m, 1], c = p[m].n, o[k] != f) c[o[k]] && h.push(c[o[k]]); else for (g in c) c[d](g) && h.push(c[g]); p.splice.apply(p, h); } for (k = 0, l = p.length; l > k; k++)for (c = p[k]; c.n;) { if (b) { if (c.f) { for (m = 0, n = c.f.length; n > m; m++)if (c.f[m] == b) { c.f.splice(m, 1); break; } !c.f.length && delete c.f; } for (g in c.n) if (c.n[d](g) && c.n[g].f) { var q = c.n[g].f; for (m = 0, n = q.length; n > m; m++)if (q[m] == b) { q.splice(m, 1); break; } !q.length && delete c.n[g].f; } } else { delete c.f; for (g in c.n) c.n[d](g) && c.n[g].f && delete c.n[g].f; } c = c.n; } }, j.once = function (a, b) { var c = function () { return j.unbind(a, c), b.apply(this, arguments); }; return j.on(a, c); }, j.version = c, j.toString = function () { return 'You are running Eve ' + c; }, j; }), function (a, b) { 'function' == typeof define && define.amd ? define('raphael.core', ['eve'], function (a) { return b(a); }) : 'object' == typeof exports ? module.exports = b(require('eve')) : a.Raphael = b(a.eve); }(this, function (a) {
    function b(c) { if (b.is(c, 'function')) return t ? c() : a.on('raphael.DOMload', c); if (b.is(c, U)) return b._engine.create[C](b, c.splice(0, 3 + b.is(c[0], S))).add(c); var d = Array.prototype.slice.call(arguments, 0); if (b.is(d[d.length - 1], 'function')) { var e = d.pop(); return t ? e.call(b._engine.create[C](b, d)) : a.on('raphael.DOMload', function () { e.call(b._engine.create[C](b, d)); }); } return b._engine.create[C](b, arguments); } function c(a) { if ('function' == typeof a || Object(a) !== a) return a; var b = new a.constructor; for (var d in a) a[y](d) && (b[d] = c(a[d])); return b; } function d(a, b) { for (var c = 0, d = a.length; d > c; c++)if (a[c] === b) return a.push(a.splice(c, 1)[0]); } function e(a, b, c) { function e() { var f = Array.prototype.slice.call(arguments, 0), g = f.join('␀'), h = e.cache = e.cache || {}, i = e.count = e.count || []; return h[y](g) ? (d(i, g), c ? c(h[g]) : h[g]) : (i.length >= 1e3 && delete h[i.shift()], i.push(g), h[g] = a[C](b, f), c ? c(h[g]) : h[g]); } return e; } function f() { return this.hex; } function g(a, b) { for (var c = [], d = 0, e = a.length; e - 2 * !b > d; d += 2) { var f = [{ x: +a[d - 2], y: +a[d - 1] }, { x: +a[d], y: +a[d + 1] }, { x: +a[d + 2], y: +a[d + 3] }, { x: +a[d + 4], y: +a[d + 5] }]; b ? d ? e - 4 == d ? f[3] = { x: +a[0], y: +a[1] } : e - 2 == d && (f[2] = { x: +a[0], y: +a[1] }, f[3] = { x: +a[2], y: +a[3] }) : f[0] = { x: +a[e - 2], y: +a[e - 1] } : e - 4 == d ? f[3] = f[2] : d || (f[0] = { x: +a[d], y: +a[d + 1] }), c.push(['C', (-f[0].x + 6 * f[1].x + f[2].x) / 6, (-f[0].y + 6 * f[1].y + f[2].y) / 6, (f[1].x + 6 * f[2].x - f[3].x) / 6, (f[1].y + 6 * f[2].y - f[3].y) / 6, f[2].x, f[2].y]); } return c; } function h(a, b, c, d, e) { var f = -3 * b + 9 * c - 9 * d + 3 * e, g = a * f + 6 * b - 12 * c + 6 * d; return a * g - 3 * b + 3 * c; } function i(a, b, c, d, e, f, g, i, j) { null == j && (j = 1), j = j > 1 ? 1 : 0 > j ? 0 : j; for (var k = j / 2, l = 12, m = [-.1252, .1252, -.3678, .3678, -.5873, .5873, -.7699, .7699, -.9041, .9041, -.9816, .9816], n = [.2491, .2491, .2335, .2335, .2032, .2032, .1601, .1601, .1069, .1069, .0472, .0472], o = 0, p = 0; l > p; p++) { var q = k * m[p] + k, r = h(q, a, c, e, g), s = h(q, b, d, f, i), t = r * r + s * s; o += n[p] * M.sqrt(t); } return k * o; } function j(a, b, c, d, e, f, g, h, j) { if (!(0 > j || i(a, b, c, d, e, f, g, h) < j)) { var k, l = 1, m = l / 2, n = l - m, o = .01; for (k = i(a, b, c, d, e, f, g, h, n); P(k - j) > o;)m /= 2, n += (j > k ? 1 : -1) * m, k = i(a, b, c, d, e, f, g, h, n); return n; } } function k(a, b, c, d, e, f, g, h) { if (!(N(a, c) < O(e, g) || O(a, c) > N(e, g) || N(b, d) < O(f, h) || O(b, d) > N(f, h))) { var i = (a * d - b * c) * (e - g) - (a - c) * (e * h - f * g), j = (a * d - b * c) * (f - h) - (b - d) * (e * h - f * g), k = (a - c) * (f - h) - (b - d) * (e - g); if (k) { var l = i / k, m = j / k, n = +l.toFixed(2), o = +m.toFixed(2); if (!(n < +O(a, c).toFixed(2) || n > +N(a, c).toFixed(2) || n < +O(e, g).toFixed(2) || n > +N(e, g).toFixed(2) || o < +O(b, d).toFixed(2) || o > +N(b, d).toFixed(2) || o < +O(f, h).toFixed(2) || o > +N(f, h).toFixed(2))) return { x: l, y: m }; } } } function l(a, c, d) { var e = b.bezierBBox(a), f = b.bezierBBox(c); if (!b.isBBoxIntersect(e, f)) return d ? 0 : []; for (var g = i.apply(0, a), h = i.apply(0, c), j = N(~~(g / 5), 1), l = N(~~(h / 5), 1), m = [], n = [], o = {}, p = d ? 0 : [], q = 0; j + 1 > q; q++) { var r = b.findDotsAtSegment.apply(b, a.concat(q / j)); m.push({ x: r.x, y: r.y, t: q / j }); } for (q = 0; l + 1 > q; q++)r = b.findDotsAtSegment.apply(b, c.concat(q / l)), n.push({ x: r.x, y: r.y, t: q / l }); for (q = 0; j > q; q++)for (var s = 0; l > s; s++) { var t = m[q], u = m[q + 1], v = n[s], w = n[s + 1], x = P(u.x - t.x) < .001 ? 'y' : 'x', y = P(w.x - v.x) < .001 ? 'y' : 'x', z = k(t.x, t.y, u.x, u.y, v.x, v.y, w.x, w.y); if (z) { if (o[z.x.toFixed(4)] == z.y.toFixed(4)) continue; o[z.x.toFixed(4)] = z.y.toFixed(4); var A = t.t + P((z[x] - t[x]) / (u[x] - t[x])) * (u.t - t.t), B = v.t + P((z[y] - v[y]) / (w[y] - v[y])) * (w.t - v.t); A >= 0 && 1.001 >= A && B >= 0 && 1.001 >= B && (d ? p++ : p.push({ x: z.x, y: z.y, t1: O(A, 1), t2: O(B, 1) })); } } return p; } function m(a, c, d) { a = b._path2curve(a), c = b._path2curve(c); for (var e, f, g, h, i, j, k, m, n, o, p = d ? 0 : [], q = 0, r = a.length; r > q; q++) { var s = a[q]; if ('M' == s[0]) e = i = s[1], f = j = s[2]; else { 'C' == s[0] ? (n = [e, f].concat(s.slice(1)), e = n[6], f = n[7]) : (n = [e, f, e, f, i, j, i, j], e = i, f = j); for (var t = 0, u = c.length; u > t; t++) { var v = c[t]; if ('M' == v[0]) g = k = v[1], h = m = v[2]; else { 'C' == v[0] ? (o = [g, h].concat(v.slice(1)), g = o[6], h = o[7]) : (o = [g, h, g, h, k, m, k, m], g = k, h = m); var w = l(n, o, d); if (d) p += w; else { for (var x = 0, y = w.length; y > x; x++)w[x].segment1 = q, w[x].segment2 = t, w[x].bez1 = n, w[x].bez2 = o; p = p.concat(w); } } } } } return p; } function n(a, b, c, d, e, f) { null != a ? (this.a = +a, this.b = +b, this.c = +c, this.d = +d, this.e = +e, this.f = +f) : (this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.e = 0, this.f = 0); } function o() { return this.x + G + this.y + G + this.width + ' × ' + this.height; } function p(a, b, c, d, e, f) { function g(a) { return ((l * a + k) * a + j) * a; } function h(a, b) { var c = i(a, b); return ((o * c + n) * c + m) * c; } function i(a, b) { var c, d, e, f, h, i; for (e = a, i = 0; 8 > i; i++) { if (f = g(e) - a, P(f) < b) return e; if (h = (3 * l * e + 2 * k) * e + j, P(h) < 1e-6) break; e -= f / h; } if (c = 0, d = 1, e = a, c > e) return c; if (e > d) return d; for (; d > c;) { if (f = g(e), P(f - a) < b) return e; a > f ? c = e : d = e, e = (d - c) / 2 + c; } return e; } var j = 3 * b, k = 3 * (d - b) - j, l = 1 - j - k, m = 3 * c, n = 3 * (e - c) - m, o = 1 - m - n; return h(a, 1 / (200 * f)); } function q(a, b) { var c = [], d = {}; if (this.ms = b, this.times = 1, a) { for (var e in a) a[y](e) && (d[$e(e)] = a[e], c.push($e(e))); c.sort(ka); } this.anim = d, this.top = c[c.length - 1], this.percents = c; } function r(c, d, e, f, g, h) { e = $e(e); var i, j, k, l, m, o, q = c.ms, r = {}, s = {}, t = {}; if (f) for (w = 0, x = fb.length; x > w; w++) { var u = fb[w]; if (u.el.id == d.id && u.anim == c) { u.percent != e ? (fb.splice(w, 1), k = 1) : j = u, d.attr(u.totalOrigin); break; } } else f = +s; for (var w = 0, x = c.percents.length; x > w; w++) { if (c.percents[w] == e || c.percents[w] > f * c.top) { e = c.percents[w], m = c.percents[w - 1] || 0, q = q / c.top * (e - m), l = c.percents[w + 1], i = c.anim[e]; break; } f && d.attr(c.anim[c.percents[w]]); } if (i) { if (j) j.initstatus = f, j.start = new Date - j.ms * f; else { for (var z in i) if (i[y](z) && (ca[y](z) || d.paper.customAttributes[y](z))) switch (r[z] = d.attr(z), null == r[z] && (r[z] = ba[z]), s[z] = i[z], ca[z]) { case S: t[z] = (s[z] - r[z]) / q; break; case 'colour': r[z] = b.getRGB(r[z]); var A = b.getRGB(s[z]); t[z] = { r: (A.r - r[z].r) / q, g: (A.g - r[z].g) / q, b: (A.b - r[z].b) / q }; break; case 'path': var B = Ia(r[z], s[z]), C = B[1]; for (r[z] = B[0], t[z] = [], w = 0, x = r[z].length; x > w; w++) { t[z][w] = [0]; for (var E = 1, F = r[z][w].length; F > E; E++)t[z][w][E] = (C[w][E] - r[z][w][E]) / q; } break; case 'transform': var G = d._, J = Na(G[z], s[z]); if (J) for (r[z] = J.from, s[z] = J.to, t[z] = [], t[z].real = !0, w = 0, x = r[z].length; x > w; w++)for (t[z][w] = [r[z][w][0]], E = 1, F = r[z][w].length; F > E; E++)t[z][w][E] = (s[z][w][E] - r[z][w][E]) / q; else { var K = d.matrix || new n, L = { _: { transform: G.transform }, getBBox: function () { return d.getBBox(1); } }; r[z] = [K.a, K.b, K.c, K.d, K.e, K.f], La(L, s[z]), s[z] = L._.transform, t[z] = [(L.matrix.a - K.a) / q, (L.matrix.b - K.b) / q, (L.matrix.c - K.c) / q, (L.matrix.d - K.d) / q, (L.matrix.e - K.e) / q, (L.matrix.f - K.f) / q]; } break; case 'csv': var M = H(i[z])[I](v), N = H(r[z])[I](v); if ('clip-rect' == z) for (r[z] = N, t[z] = [], w = N.length; w--;)t[z][w] = (M[w] - r[z][w]) / q; s[z] = M; break; default: for (M = [][D](i[z]), N = [][D](r[z]), t[z] = [], w = d.paper.customAttributes[z].length; w--;)t[z][w] = ((M[w] || 0) - (N[w] || 0)) / q; }var O = i.easing, P = b.easing_formulas[O]; if (!P) if (P = H(O).match(Y), P && 5 == P.length) { var Q = P; P = function (a) { return p(a, +Q[1], +Q[2], +Q[3], +Q[4], q); }; } else P = la; if (o = i.start || c.start || +new Date, u = { anim: c, percent: e, timestamp: o, start: o + (c.del || 0), status: 0, initstatus: f || 0, stop: !1, ms: q, easing: P, from: r, diff: t, to: s, el: d, callback: i.callback, prev: m, next: l, repeat: h || c.times, origin: d.attr(), totalOrigin: g }, fb.push(u), f && !j && !k && (u.stop = !0, u.start = new Date - q * f, 1 == fb.length)) return hb(); k && (u.start = new Date - u.ms * f), 1 == fb.length && gb(hb); } a('raphael.anim.start.' + d.id, d, c); } } function s(a) { for (var b = 0; b < fb.length; b++)fb[b].el.paper == a && fb.splice(b--, 1); } b.version = '2.1.4', b.eve = a; var t, u, v = /[, ]+/, w = { circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1 }, x = /\{(\d+)\}/g, y = 'hasOwnProperty', z = { doc: document, win: window }, A = { was: Object.prototype[y].call(z.win, 'Raphael'), is: z.win.Raphael }, B = function () { this.ca = this.customAttributes = {}; }, C = 'apply', D = 'concat', E = 'ontouchstart' in z.win || z.win.DocumentTouch && z.doc instanceof DocumentTouch, F = '', G = ' ', H = String, I = 'split', J = 'click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel'[I](G), K = { mousedown: 'touchstart', mousemove: 'touchmove', mouseup: 'touchend' }, L = H.prototype.toLowerCase, M = Math, N = M.max, O = M.min, P = M.abs, Q = M.pow, R = M.PI, S = 'number', T = 'string', U = 'array', V = Object.prototype.toString, W = (b._ISURL = /^url\(['"]?(.+?)['"]?\)$/i, /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i), X = { NaN: 1, Infinity: 1, '-Infinity': 1 }, Y = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/, Z = M.round, $ = parseFloat, _ = parseInt, aa = H.prototype.toUpperCase, ba = b._availableAttrs = { 'arrow-end': 'none', 'arrow-start': 'none', blur: 0, 'clip-rect': '0 0 1e9 1e9', cursor: 'default', cx: 0, cy: 0, fill: '#fff', 'fill-opacity': 1, font: '10px "Arial"', 'font-family': '"Arial"', 'font-size': '10', 'font-style': 'normal', 'font-weight': 400, gradient: 0, height: 0, href: 'http://raphaeljs.com/', 'letter-spacing': 0, opacity: 1, path: 'M0,0', r: 0, rx: 0, ry: 0, src: '', stroke: '#000', 'stroke-dasharray': '', 'stroke-linecap': 'butt', 'stroke-linejoin': 'butt', 'stroke-miterlimit': 0, 'stroke-opacity': 1, 'stroke-width': 1, target: '_blank', 'text-anchor': 'middle', title: 'Raphael', transform: '', width: 0, x: 0, y: 0 }, ca = b._availableAnimAttrs = { blur: S, 'clip-rect': 'csv', cx: S, cy: S, fill: 'colour', 'fill-opacity': S, 'font-size': S, height: S, opacity: S, path: 'path', r: S, rx: S, ry: S, stroke: 'colour', 'stroke-opacity': S, 'stroke-width': S, transform: 'transform', width: S, x: S, y: S }, da = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/, ea = { hs: 1, rg: 1 }, fa = /,?([achlmqrstvxz]),?/gi, ga = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/gi, ha = /([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/gi, ia = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/gi, ja = (b._radial_gradient = /^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/, {}), ka = function (a, b) { return $e(a) - $e(b); }, la = function (a) { return a; }, ma = b._rectPath = function (a, b, c, d, e) { return e ? [['M', a + e, b], ['l', c - 2 * e, 0], ['a', e, e, 0, 0, 1, e, e], ['l', 0, d - 2 * e], ['a', e, e, 0, 0, 1, -e, e], ['l', 2 * e - c, 0], ['a', e, e, 0, 0, 1, -e, -e], ['l', 0, 2 * e - d], ['a', e, e, 0, 0, 1, e, -e], ['z']] : [['M', a, b], ['l', c, 0], ['l', 0, d], ['l', -c, 0], ['z']]; }, na = function (a, b, c, d) { return null == d && (d = c), [['M', a, b], ['m', 0, -d], ['a', c, d, 0, 1, 1, 0, 2 * d], ['a', c, d, 0, 1, 1, 0, -2 * d], ['z']]; }, oa = b._getPath = { path: function (a) { return a.attr('path'); }, circle: function (a) { var b = a.attrs; return na(b.cx, b.cy, b.r); }, ellipse: function (a) { var b = a.attrs; return na(b.cx, b.cy, b.rx, b.ry); }, rect: function (a) { var b = a.attrs; return ma(b.x, b.y, b.width, b.height, b.r); }, image: function (a) { var b = a.attrs; return ma(b.x, b.y, b.width, b.height); }, text: function (a) { var b = a._getBBox(); return ma(b.x, b.y, b.width, b.height); }, set: function (a) { var b = a._getBBox(); return ma(b.x, b.y, b.width, b.height); } }, pa = b.mapPath = function (a, b) { if (!b) return a; var c, d, e, f, g, h, i; for (a = Ia(a), e = 0, g = a.length; g > e; e++)for (i = a[e], f = 1, h = i.length; h > f; f += 2)c = b.x(i[f], i[f + 1]), d = b.y(i[f], i[f + 1]), i[f] = c, i[f + 1] = d; return a; }; if (b._g = z, b.type = z.win.SVGAngle || z.doc.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1') ? 'SVG' : 'VML', 'VML' == b.type) { var qa, ra = z.doc.createElement('div'); if (ra.innerHTML = '<v:shape adj="1"/>', qa = ra.firstChild, qa.style.behavior = 'url(#default#VML)', !qa || 'object' != typeof qa.adj) return b.type = F; ra = null; } b.svg = !(b.vml = 'VML' == b.type), b._Paper = B, b.fn = u = B.prototype = b.prototype, b._id = 0, b._oid = 0, b.is = function (a, b) { return b = L.call(b), 'finite' == b ? !X[y](+a) : 'array' == b ? a instanceof Array : 'null' == b && null === a || b == typeof a && null !== a || 'object' == b && a === Object(a) || 'array' == b && Array.isArray && Array.isArray(a) || V.call(a).slice(8, -1).toLowerCase() == b; }, b.angle = function (a, c, d, e, f, g) { if (null == f) { var h = a - d, i = c - e; return h || i ? (180 + 180 * M.atan2(-i, -h) / R + 360) % 360 : 0; } return b.angle(a, c, f, g) - b.angle(d, e, f, g); }, b.rad = function (a) { return a % 360 * R / 180; }, b.deg = function (a) { return Math.round(180 * a / R % 360 * 1e3) / 1e3; }, b.snapTo = function (a, c, d) { if (d = b.is(d, 'finite') ? d : 10, b.is(a, U)) { for (var e = a.length; e--;)if (P(a[e] - c) <= d) return a[e]; } else { a = +a; var f = c % a; if (d > f) return c - f; if (f > a - d) return c - f + a; } return c; }; b.createUUID = function (a, b) { return function () { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(a, b).toUpperCase(); }; }(/[xy]/g, function (a) { var b = 16 * M.random() | 0, c = 'x' == a ? b : 3 & b | 8; return c.toString(16); }); b.setWindow = function (c) { a('raphael.setWindow', b, z.win, c), z.win = c, z.doc = z.win.document, b._engine.initWin && b._engine.initWin(z.win); }; var sa = function (a) { if (b.vml) { var c, d = /^\s+|\s+$/g; try { var f = new ActiveXObject('htmlfile'); f.write('<body>'), f.close(), c = f.body; } catch (g) { c = createPopup().document.body; } var h = c.createTextRange(); sa = e(function (a) { try { c.style.color = H(a).replace(d, F); var b = h.queryCommandValue('ForeColor'); return b = (255 & b) << 16 | 65280 & b | (16711680 & b) >>> 16, '#' + ('000000' + b.toString(16)).slice(-6); } catch (e) { return 'none'; } }); } else { var i = z.doc.createElement('i'); i.title = 'Raphaël Colour Picker', i.style.display = 'none', z.doc.body.appendChild(i), sa = e(function (a) { return i.style.color = a, z.doc.defaultView.getComputedStyle(i, F).getPropertyValue('color'); }); } return sa(a); }, ta = function () { return 'hsb(' + [this.h, this.s, this.b] + ')'; }, ua = function () { return 'hsl(' + [this.h, this.s, this.l] + ')'; }, va = function () { return this.hex; }, wa = function (a, c, d) { if (null == c && b.is(a, 'object') && 'r' in a && 'g' in a && 'b' in a && (d = a.b, c = a.g, a = a.r), null == c && b.is(a, T)) { var e = b.getRGB(a); a = e.r, c = e.g, d = e.b; } return (a > 1 || c > 1 || d > 1) && (a /= 255, c /= 255, d /= 255), [a, c, d]; }, xa = function (a, c, d, e) { a *= 255, c *= 255, d *= 255; var f = { r: a, g: c, b: d, hex: b.rgb(a, c, d), toString: va }; return b.is(e, 'finite') && (f.opacity = e), f; }; b.color = function (a) { var c; return b.is(a, 'object') && 'h' in a && 's' in a && 'b' in a ? (c = b.hsb2rgb(a), a.r = c.r, a.g = c.g, a.b = c.b, a.hex = c.hex) : b.is(a, 'object') && 'h' in a && 's' in a && 'l' in a ? (c = b.hsl2rgb(a), a.r = c.r, a.g = c.g, a.b = c.b, a.hex = c.hex) : (b.is(a, 'string') && (a = b.getRGB(a)), b.is(a, 'object') && 'r' in a && 'g' in a && 'b' in a ? (c = b.rgb2hsl(a), a.h = c.h, a.s = c.s, a.l = c.l, c = b.rgb2hsb(a), a.v = c.b) : (a = { hex: 'none' }, a.r = a.g = a.b = a.h = a.s = a.v = a.l = -1)), a.toString = va, a; }, b.hsb2rgb = function (a, b, c, d) { this.is(a, 'object') && 'h' in a && 's' in a && 'b' in a && (c = a.b, b = a.s, d = a.o, a = a.h), a *= 360; var e, f, g, h, i; return a = a % 360 / 60, i = c * b, h = i * (1 - P(a % 2 - 1)), e = f = g = c - i, a = ~~a, e += [i, h, 0, 0, h, i][a], f += [h, i, i, h, 0, 0][a], g += [0, 0, h, i, i, h][a], xa(e, f, g, d); }, b.hsl2rgb = function (a, b, c, d) { this.is(a, 'object') && 'h' in a && 's' in a && 'l' in a && (c = a.l, b = a.s, a = a.h), (a > 1 || b > 1 || c > 1) && (a /= 360, b /= 100, c /= 100), a *= 360; var e, f, g, h, i; return a = a % 360 / 60, i = 2 * b * (.5 > c ? c : 1 - c), h = i * (1 - P(a % 2 - 1)), e = f = g = c - i / 2, a = ~~a, e += [i, h, 0, 0, h, i][a], f += [h, i, i, h, 0, 0][a], g += [0, 0, h, i, i, h][a], xa(e, f, g, d); }, b.rgb2hsb = function (a, b, c) { c = wa(a, b, c), a = c[0], b = c[1], c = c[2]; var d, e, f, g; return f = N(a, b, c), g = f - O(a, b, c), d = 0 == g ? null : f == a ? (b - c) / g : f == b ? (c - a) / g + 2 : (a - b) / g + 4, d = (d + 360) % 6 * 60 / 360, e = 0 == g ? 0 : g / f, { h: d, s: e, b: f, toString: ta }; }, b.rgb2hsl = function (a, b, c) { c = wa(a, b, c), a = c[0], b = c[1], c = c[2]; var d, e, f, g, h, i; return g = N(a, b, c), h = O(a, b, c), i = g - h, d = 0 == i ? null : g == a ? (b - c) / i : g == b ? (c - a) / i + 2 : (a - b) / i + 4, d = (d + 360) % 6 * 60 / 360, f = (g + h) / 2, e = 0 == i ? 0 : .5 > f ? i / (2 * f) : i / (2 - 2 * f), { h: d, s: e, l: f, toString: ua }; }, b._path2string = function () { return this.join(',').replace(fa, '$1'); }; b._preload = function (a, b) { var c = z.doc.createElement('img'); c.style.cssText = 'position:absolute;left:-9999em;top:-9999em', c.onload = function () { b.call(this), this.onload = null, z.doc.body.removeChild(this); }, c.onerror = function () { z.doc.body.removeChild(this); }, z.doc.body.appendChild(c), c.src = a; }; b.getRGB = e(function (a) { if (!a || (a = H(a)).indexOf('-') + 1) return { r: -1, g: -1, b: -1, hex: 'none', error: 1, toString: f }; if ('none' == a) return { r: -1, g: -1, b: -1, hex: 'none', toString: f }; !(ea[y](a.toLowerCase().substring(0, 2)) || '#' == a.charAt()) && (a = sa(a)); var c, d, e, g, h, i, j = a.match(W); return j ? (j[2] && (e = _(j[2].substring(5), 16), d = _(j[2].substring(3, 5), 16), c = _(j[2].substring(1, 3), 16)), j[3] && (e = _((h = j[3].charAt(3)) + h, 16), d = _((h = j[3].charAt(2)) + h, 16), c = _((h = j[3].charAt(1)) + h, 16)), j[4] && (i = j[4][I](da), c = $e(i[0]), '%' == i[0].slice(-1) && (c *= 2.55), d = $e(i[1]), '%' == i[1].slice(-1) && (d *= 2.55), e = $e(i[2]), '%' == i[2].slice(-1) && (e *= 2.55), 'rgba' == j[1].toLowerCase().slice(0, 4) && (g = $e(i[3])), i[3] && '%' == i[3].slice(-1) && (g /= 100)), j[5] ? (i = j[5][I](da), c = $e(i[0]), '%' == i[0].slice(-1) && (c *= 2.55), d = $e(i[1]), '%' == i[1].slice(-1) && (d *= 2.55), e = $e(i[2]), '%' == i[2].slice(-1) && (e *= 2.55), ('deg' == i[0].slice(-3) || '°' == i[0].slice(-1)) && (c /= 360), 'hsba' == j[1].toLowerCase().slice(0, 4) && (g = $e(i[3])), i[3] && '%' == i[3].slice(-1) && (g /= 100), b.hsb2rgb(c, d, e, g)) : j[6] ? (i = j[6][I](da), c = $e(i[0]), '%' == i[0].slice(-1) && (c *= 2.55), d = $e(i[1]), '%' == i[1].slice(-1) && (d *= 2.55), e = $e(i[2]), '%' == i[2].slice(-1) && (e *= 2.55), ('deg' == i[0].slice(-3) || '°' == i[0].slice(-1)) && (c /= 360), 'hsla' == j[1].toLowerCase().slice(0, 4) && (g = $e(i[3])), i[3] && '%' == i[3].slice(-1) && (g /= 100), b.hsl2rgb(c, d, e, g)) : (j = { r: c, g: d, b: e, toString: f }, j.hex = '#' + (16777216 | e | d << 8 | c << 16).toString(16).slice(1), b.is(g, 'finite') && (j.opacity = g), j)) : { r: -1, g: -1, b: -1, hex: 'none', error: 1, toString: f }; }, b), b.hsb = e(function (a, c, d) { return b.hsb2rgb(a, c, d).hex; }), b.hsl = e(function (a, c, d) { return b.hsl2rgb(a, c, d).hex; }), b.rgb = e(function (a, b, c) { function d(a) { return a + .5 | 0; } return '#' + (16777216 | d(c) | d(b) << 8 | d(a) << 16).toString(16).slice(1); }), b.getColor = function (a) { var b = this.getColor.start = this.getColor.start || { h: 0, s: 1, b: a || .75 }, c = this.hsb2rgb(b.h, b.s, b.b); return b.h += .075, b.h > 1 && (b.h = 0, b.s -= .2, b.s <= 0 && (this.getColor.start = { h: 0, s: 1, b: b.b })), c.hex; }, b.getColor.reset = function () { delete this.start; }, b.parsePathString = function (a) { if (!a) return null; var c = ya(a); if (c.arr) return Aa(c.arr); var d = { a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0 }, e = []; return b.is(a, U) && b.is(a[0], U) && (e = Aa(a)), e.length || H(a).replace(ga, function (a, b, c) { var f = [], g = b.toLowerCase(); if (c.replace(ia, function (a, b) { b && f.push(+b); }), 'm' == g && f.length > 2 && (e.push([b][D](f.splice(0, 2))), g = 'l', b = 'm' == b ? 'l' : 'L'), 'r' == g) e.push([b][D](f)); else for (; f.length >= d[g] && (e.push([b][D](f.splice(0, d[g]))), d[g]);); }), e.toString = b._path2string, c.arr = Aa(e), e; }, b.parseTransformString = e(function (a) { if (!a) return null; var c = []; return b.is(a, U) && b.is(a[0], U) && (c = Aa(a)), c.length || H(a).replace(ha, function (a, b, d) { { var e = []; L.call(b); } d.replace(ia, function (a, b) { b && e.push(+b); }), c.push([b][D](e)); }), c.toString = b._path2string, c; }); var ya = function (a) { var b = ya.ps = ya.ps || {}; return b[a] ? b[a].sleep = 100 : b[a] = { sleep: 100 }, setTimeout(function () { for (var c in b) b[y](c) && c != a && (b[c].sleep--, !b[c].sleep && delete b[c]); }), b[a]; }; b.findDotsAtSegment = function (a, b, c, d, e, f, g, h, i) { var j = 1 - i, k = Q(j, 3), l = Q(j, 2), m = i * i, n = m * i, o = k * a + 3 * l * i * c + 3 * j * i * i * e + n * g, p = k * b + 3 * l * i * d + 3 * j * i * i * f + n * h, q = a + 2 * i * (c - a) + m * (e - 2 * c + a), r = b + 2 * i * (d - b) + m * (f - 2 * d + b), s = c + 2 * i * (e - c) + m * (g - 2 * e + c), t = d + 2 * i * (f - d) + m * (h - 2 * f + d), u = j * a + i * c, v = j * b + i * d, w = j * e + i * g, x = j * f + i * h, y = 90 - 180 * M.atan2(q - s, r - t) / R; return (q > s || t > r) && (y += 180), { x: o, y: p, m: { x: q, y: r }, n: { x: s, y: t }, start: { x: u, y: v }, end: { x: w, y: x }, alpha: y }; }, b.bezierBBox = function (a, c, d, e, f, g, h, i) { b.is(a, 'array') || (a = [a, c, d, e, f, g, h, i]); var j = Ha.apply(null, a); return { x: j.min.x, y: j.min.y, x2: j.max.x, y2: j.max.y, width: j.max.x - j.min.x, height: j.max.y - j.min.y }; }, b.isPointInsideBBox = function (a, b, c) { return b >= a.x && b <= a.x2 && c >= a.y && c <= a.y2; }, b.isBBoxIntersect = function (a, c) { var d = b.isPointInsideBBox; return d(c, a.x, a.y) || d(c, a.x2, a.y) || d(c, a.x, a.y2) || d(c, a.x2, a.y2) || d(a, c.x, c.y) || d(a, c.x2, c.y) || d(a, c.x, c.y2) || d(a, c.x2, c.y2) || (a.x < c.x2 && a.x > c.x || c.x < a.x2 && c.x > a.x) && (a.y < c.y2 && a.y > c.y || c.y < a.y2 && c.y > a.y); }, b.pathIntersection = function (a, b) { return m(a, b); }, b.pathIntersectionNumber = function (a, b) { return m(a, b, 1); }, b.isPointInsidePath = function (a, c, d) { var e = b.pathBBox(a); return b.isPointInsideBBox(e, c, d) && m(a, [['M', c, d], ['H', e.x2 + 10]], 1) % 2 == 1; }, b._removedFactory = function (b) { return function () { a('raphael.log', null, 'Raphaël: you are calling to method “' + b + '” of removed object', b); }; }; var za = b.pathBBox = function (a) { var b = ya(a); if (b.bbox) return c(b.bbox); if (!a) return { x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0 }; a = Ia(a); for (var d, e = 0, f = 0, g = [], h = [], i = 0, j = a.length; j > i; i++)if (d = a[i], 'M' == d[0]) e = d[1], f = d[2], g.push(e), h.push(f); else { var k = Ha(e, f, d[1], d[2], d[3], d[4], d[5], d[6]); g = g[D](k.min.x, k.max.x), h = h[D](k.min.y, k.max.y), e = d[5], f = d[6]; } var l = O[C](0, g), m = O[C](0, h), n = N[C](0, g), o = N[C](0, h), p = n - l, q = o - m, r = { x: l, y: m, x2: n, y2: o, width: p, height: q, cx: l + p / 2, cy: m + q / 2 }; return b.bbox = c(r), r; }, Aa = function (a) { var d = c(a); return d.toString = b._path2string, d; }, Ba = b._pathToRelative = function (a) { var c = ya(a); if (c.rel) return Aa(c.rel); b.is(a, U) && b.is(a && a[0], U) || (a = b.parsePathString(a)); var d = [], e = 0, f = 0, g = 0, h = 0, i = 0; 'M' == a[0][0] && (e = a[0][1], f = a[0][2], g = e, h = f, i++, d.push(['M', e, f])); for (var j = i, k = a.length; k > j; j++) { var l = d[j] = [], m = a[j]; if (m[0] != L.call(m[0])) switch (l[0] = L.call(m[0]), l[0]) { case 'a': l[1] = m[1], l[2] = m[2], l[3] = m[3], l[4] = m[4], l[5] = m[5], l[6] = +(m[6] - e).toFixed(3), l[7] = +(m[7] - f).toFixed(3); break; case 'v': l[1] = +(m[1] - f).toFixed(3); break; case 'm': g = m[1], h = m[2]; default: for (var n = 1, o = m.length; o > n; n++)l[n] = +(m[n] - (n % 2 ? e : f)).toFixed(3); } else { l = d[j] = [], 'm' == m[0] && (g = m[1] + e, h = m[2] + f); for (var p = 0, q = m.length; q > p; p++)d[j][p] = m[p]; } var r = d[j].length; switch (d[j][0]) { case 'z': e = g, f = h; break; case 'h': e += +d[j][r - 1]; break; case 'v': f += +d[j][r - 1]; break; default: e += +d[j][r - 2], f += +d[j][r - 1]; } } return d.toString = b._path2string, c.rel = Aa(d), d; }, Ca = b._pathToAbsolute = function (a) { var c = ya(a); if (c.abs) return Aa(c.abs); if (b.is(a, U) && b.is(a && a[0], U) || (a = b.parsePathString(a)), !a || !a.length) return [['M', 0, 0]]; var d = [], e = 0, f = 0, h = 0, i = 0, j = 0; 'M' == a[0][0] && (e = +a[0][1], f = +a[0][2], h = e, i = f, j++, d[0] = ['M', e, f]); for (var k, l, m = 3 == a.length && 'M' == a[0][0] && 'R' == a[1][0].toUpperCase() && 'Z' == a[2][0].toUpperCase(), n = j, o = a.length; o > n; n++) { if (d.push(k = []), l = a[n], l[0] != aa.call(l[0])) switch (k[0] = aa.call(l[0]), k[0]) { case 'A': k[1] = l[1], k[2] = l[2], k[3] = l[3], k[4] = l[4], k[5] = l[5], k[6] = +(l[6] + e), k[7] = +(l[7] + f); break; case 'V': k[1] = +l[1] + f; break; case 'H': k[1] = +l[1] + e; break; case 'R': for (var p = [e, f][D](l.slice(1)), q = 2, r = p.length; r > q; q++)p[q] = +p[q] + e, p[++q] = +p[q] + f; d.pop(), d = d[D](g(p, m)); break; case 'M': h = +l[1] + e, i = +l[2] + f; default: for (q = 1, r = l.length; r > q; q++)k[q] = +l[q] + (q % 2 ? e : f); } else if ('R' == l[0]) p = [e, f][D](l.slice(1)), d.pop(), d = d[D](g(p, m)), k = ['R'][D](l.slice(-2)); else for (var s = 0, t = l.length; t > s; s++)k[s] = l[s]; switch (k[0]) { case 'Z': e = h, f = i; break; case 'H': e = k[1]; break; case 'V': f = k[1]; break; case 'M': h = k[k.length - 2], i = k[k.length - 1]; default: e = k[k.length - 2], f = k[k.length - 1]; } } return d.toString = b._path2string, c.abs = Aa(d), d; }, Da = function (a, b, c, d) { return [a, b, c, d, c, d]; }, Ea = function (a, b, c, d, e, f) { var g = 1 / 3, h = 2 / 3; return [g * a + h * c, g * b + h * d, g * e + h * c, g * f + h * d, e, f]; }, Fa = function (a, b, c, d, f, g, h, i, j, k) { var l, m = 120 * R / 180, n = R / 180 * (+f || 0), o = [], p = e(function (a, b, c) { var d = a * M.cos(c) - b * M.sin(c), e = a * M.sin(c) + b * M.cos(c); return { x: d, y: e }; }); if (k) y = k[0], z = k[1], w = k[2], x = k[3]; else { l = p(a, b, -n), a = l.x, b = l.y, l = p(i, j, -n), i = l.x, j = l.y; var q = (M.cos(R / 180 * f), M.sin(R / 180 * f), (a - i) / 2), r = (b - j) / 2, s = q * q / (c * c) + r * r / (d * d); s > 1 && (s = M.sqrt(s), c = s * c, d = s * d); var t = c * c, u = d * d, v = (g == h ? -1 : 1) * M.sqrt(P((t * u - t * r * r - u * q * q) / (t * r * r + u * q * q))), w = v * c * r / d + (a + i) / 2, x = v * -d * q / c + (b + j) / 2, y = M.asin(((b - x) / d).toFixed(9)), z = M.asin(((j - x) / d).toFixed(9)); y = w > a ? R - y : y, z = w > i ? R - z : z, 0 > y && (y = 2 * R + y), 0 > z && (z = 2 * R + z), h && y > z && (y -= 2 * R), !h && z > y && (z -= 2 * R); } var A = z - y; if (P(A) > m) { var B = z, C = i, E = j; z = y + m * (h && z > y ? 1 : -1), i = w + c * M.cos(z), j = x + d * M.sin(z), o = Fa(i, j, c, d, f, 0, h, C, E, [z, B, w, x]); } A = z - y; var F = M.cos(y), G = M.sin(y), H = M.cos(z), J = M.sin(z), K = M.tan(A / 4), L = 4 / 3 * c * K, N = 4 / 3 * d * K, O = [a, b], Q = [a + L * G, b - N * F], S = [i + L * J, j - N * H], T = [i, j]; if (Q[0] = 2 * O[0] - Q[0], Q[1] = 2 * O[1] - Q[1], k) return [Q, S, T][D](o); o = [Q, S, T][D](o).join()[I](','); for (var U = [], V = 0, W = o.length; W > V; V++)U[V] = V % 2 ? p(o[V - 1], o[V], n).y : p(o[V], o[V + 1], n).x; return U; }, Ga = function (a, b, c, d, e, f, g, h, i) { var j = 1 - i; return { x: Q(j, 3) * a + 3 * Q(j, 2) * i * c + 3 * j * i * i * e + Q(i, 3) * g, y: Q(j, 3) * b + 3 * Q(j, 2) * i * d + 3 * j * i * i * f + Q(i, 3) * h }; }, Ha = e(function (a, b, c, d, e, f, g, h) { var i, j = e - 2 * c + a - (g - 2 * e + c), k = 2 * (c - a) - 2 * (e - c), l = a - c, m = (-k + M.sqrt(k * k - 4 * j * l)) / 2 / j, n = (-k - M.sqrt(k * k - 4 * j * l)) / 2 / j, o = [b, h], p = [a, g]; return P(m) > '1e12' && (m = .5), P(n) > '1e12' && (n = .5), m > 0 && 1 > m && (i = Ga(a, b, c, d, e, f, g, h, m), p.push(i.x), o.push(i.y)), n > 0 && 1 > n && (i = Ga(a, b, c, d, e, f, g, h, n), p.push(i.x), o.push(i.y)), j = f - 2 * d + b - (h - 2 * f + d), k = 2 * (d - b) - 2 * (f - d), l = b - d, m = (-k + M.sqrt(k * k - 4 * j * l)) / 2 / j, n = (-k - M.sqrt(k * k - 4 * j * l)) / 2 / j, P(m) > '1e12' && (m = .5), P(n) > '1e12' && (n = .5), m > 0 && 1 > m && (i = Ga(a, b, c, d, e, f, g, h, m), p.push(i.x), o.push(i.y)), n > 0 && 1 > n && (i = Ga(a, b, c, d, e, f, g, h, n), p.push(i.x), o.push(i.y)), { min: { x: O[C](0, p), y: O[C](0, o) }, max: { x: N[C](0, p), y: N[C](0, o) } }; }), Ia = b._path2curve = e(function (a, b) { var c = !b && ya(a); if (!b && c.curve) return Aa(c.curve); for (var d = Ca(a), e = b && Ca(b), f = { x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null }, g = { x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null }, h = (function (a, b, c) { var d, e, f = { T: 1, Q: 1 }; if (!a) return ['C', b.x, b.y, b.x, b.y, b.x, b.y]; switch (!(a[0] in f) && (b.qx = b.qy = null), a[0]) { case 'M': b.X = a[1], b.Y = a[2]; break; case 'A': a = ['C'][D](Fa[C](0, [b.x, b.y][D](a.slice(1)))); break; case 'S': 'C' == c || 'S' == c ? (d = 2 * b.x - b.bx, e = 2 * b.y - b.by) : (d = b.x, e = b.y), a = ['C', d, e][D](a.slice(1)); break; case 'T': 'Q' == c || 'T' == c ? (b.qx = 2 * b.x - b.qx, b.qy = 2 * b.y - b.qy) : (b.qx = b.x, b.qy = b.y), a = ['C'][D](Ea(b.x, b.y, b.qx, b.qy, a[1], a[2])); break; case 'Q': b.qx = a[1], b.qy = a[2], a = ['C'][D](Ea(b.x, b.y, a[1], a[2], a[3], a[4])); break; case 'L': a = ['C'][D](Da(b.x, b.y, a[1], a[2])); break; case 'H': a = ['C'][D](Da(b.x, b.y, a[1], b.y)); break; case 'V': a = ['C'][D](Da(b.x, b.y, b.x, a[1])); break; case 'Z': a = ['C'][D](Da(b.x, b.y, b.X, b.Y)); }return a; }), i = function (a, b) { if (a[b].length > 7) { a[b].shift(); for (var c = a[b]; c.length;)k[b] = 'A', e && (l[b] = 'A'), a.splice(b++, 0, ['C'][D](c.splice(0, 6))); a.splice(b, 1), p = N(d.length, e && e.length || 0); } }, j = function (a, b, c, f, g) { a && b && 'M' == a[g][0] && 'M' != b[g][0] && (b.splice(g, 0, ['M', f.x, f.y]), c.bx = 0, c.by = 0, c.x = a[g][1], c.y = a[g][2], p = N(d.length, e && e.length || 0)); }, k = [], l = [], m = '', n = '', o = 0, p = N(d.length, e && e.length || 0); p > o; o++) { d[o] && (m = d[o][0]), 'C' != m && (k[o] = m, o && (n = k[o - 1])), d[o] = h(d[o], f, n), 'A' != k[o] && 'C' == m && (k[o] = 'C'), i(d, o), e && (e[o] && (m = e[o][0]), 'C' != m && (l[o] = m, o && (n = l[o - 1])), e[o] = h(e[o], g, n), 'A' != l[o] && 'C' == m && (l[o] = 'C'), i(e, o)), j(d, e, f, g, o), j(e, d, g, f, o); var q = d[o], r = e && e[o], s = q.length, t = e && r.length; f.x = q[s - 2], f.y = q[s - 1], f.bx = $e(q[s - 4]) || f.x, f.by = $e(q[s - 3]) || f.y, g.bx = e && ($e(r[t - 4]) || g.x), g.by = e && ($e(r[t - 3]) || g.y), g.x = e && r[t - 2], g.y = e && r[t - 1]; } return e || (c.curve = Aa(d)), e ? [d, e] : d; }, null, Aa), Ja = (b._parseDots = e(function (a) { for (var c = [], d = 0, e = a.length; e > d; d++) { var f = {}, g = a[d].match(/^([^:]*):?([\d\.]*)/); if (f.color = b.getRGB(g[1]), f.color.error) return null; f.opacity = f.color.opacity, f.color = f.color.hex, g[2] && (f.offset = g[2] + '%'), c.push(f); } for (d = 1, e = c.length - 1; e > d; d++)if (!c[d].offset) { for (var h = $e(c[d - 1].offset || 0), i = 0, j = d + 1; e > j; j++)if (c[j].offset) { i = c[j].offset; break; } i || (i = 100, j = e), i = $e(i); for (var k = (i - h) / (j - d + 1); j > d; d++)h += k, c[d].offset = h + '%'; } return c; }), b._tear = function (a, b) { a == b.top && (b.top = a.prev), a == b.bottom && (b.bottom = a.next), a.next && (a.next.prev = a.prev), a.prev && (a.prev.next = a.next); }), Ka = (b._tofront = function (a, b) { b.top !== a && (Ja(a, b), a.next = null, a.prev = b.top, b.top.next = a, b.top = a); }, b._toback = function (a, b) { b.bottom !== a && (Ja(a, b), a.next = b.bottom, a.prev = null, b.bottom.prev = a, b.bottom = a); }, b._insertafter = function (a, b, c) { Ja(a, c), b == c.top && (c.top = a), b.next && (b.next.prev = a), a.next = b.next, a.prev = b, b.next = a; }, b._insertbefore = function (a, b, c) { Ja(a, c), b == c.bottom && (c.bottom = a), b.prev && (b.prev.next = a), a.prev = b.prev, b.prev = a, a.next = b; }, b.toMatrix = function (a, b) { var c = za(a), d = { _: { transform: F }, getBBox: function () { return c; } }; return La(d, b), d.matrix; }), La = (b.transformPath = function (a, b) { return pa(a, Ka(a, b)); }, b._extractTransform = function (a, c) { if (null == c) return a._.transform; c = H(c).replace(/\.{3}|\u2026/g, a._.transform || F); var d = b.parseTransformString(c), e = 0, f = 0, g = 0, h = 1, i = 1, j = a._, k = new n; if (j.transform = d || [], d) for (var l = 0, m = d.length; m > l; l++) { var o, p, q, r, s, t = d[l], u = t.length, v = H(t[0]).toLowerCase(), w = t[0] != v, x = w ? k.invert() : 0; 't' == v && 3 == u ? w ? (o = x.x(0, 0), p = x.y(0, 0), q = x.x(t[1], t[2]), r = x.y(t[1], t[2]), k.translate(q - o, r - p)) : k.translate(t[1], t[2]) : 'r' == v ? 2 == u ? (s = s || a.getBBox(1), k.rotate(t[1], s.x + s.width / 2, s.y + s.height / 2), e += t[1]) : 4 == u && (w ? (q = x.x(t[2], t[3]), r = x.y(t[2], t[3]), k.rotate(t[1], q, r)) : k.rotate(t[1], t[2], t[3]), e += t[1]) : 's' == v ? 2 == u || 3 == u ? (s = s || a.getBBox(1), k.scale(t[1], t[u - 1], s.x + s.width / 2, s.y + s.height / 2), h *= t[1], i *= t[u - 1]) : 5 == u && (w ? (q = x.x(t[3], t[4]), r = x.y(t[3], t[4]), k.scale(t[1], t[2], q, r)) : k.scale(t[1], t[2], t[3], t[4]), h *= t[1], i *= t[2]) : 'm' == v && 7 == u && k.add(t[1], t[2], t[3], t[4], t[5], t[6]), j.dirtyT = 1, a.matrix = k; } a.matrix = k, j.sx = h, j.sy = i, j.deg = e, j.dx = f = k.e, j.dy = g = k.f, 1 == h && 1 == i && !e && j.bbox ? (j.bbox.x += +f, j.bbox.y += +g) : j.dirtyT = 1; }), Ma = function (a) { var b = a[0]; switch (b.toLowerCase()) { case 't': return [b, 0, 0]; case 'm': return [b, 1, 0, 0, 1, 0, 0]; case 'r': return 4 == a.length ? [b, 0, a[2], a[3]] : [b, 0]; case 's': return 5 == a.length ? [b, 1, 1, a[3], a[4]] : 3 == a.length ? [b, 1, 1] : [b, 1]; } }, Na = b._equaliseTransform = function (a, c) {
        c = H(c).replace(/\.{3}|\u2026/g, a), a = b.parseTransformString(a) || [], c = b.parseTransformString(c) || []; for (var d, e, f, g, h = N(a.length, c.length), i = [], j = [], k = 0; h > k; k++) { if (f = a[k] || Ma(c[k]), g = c[k] || Ma(f), f[0] != g[0] || 'r' == f[0].toLowerCase() && (f[2] != g[2] || f[3] != g[3]) || 's' == f[0].toLowerCase() && (f[3] != g[3] || f[4] != g[4])) return; for (i[k] = [], j[k] = [], d = 0, e = N(f.length, g.length); e > d; d++)d in f && (i[k][d] = f[d]), d in g && (j[k][d] = g[d]); } return { from: i, to: j };
    }; b._getContainer = function (a, c, d, e) { var f; return f = null != e || b.is(a, 'object') ? a : z.doc.getElementById(a), null != f ? f.tagName ? null == c ? { container: f, width: f.style.pixelWidth || f.offsetWidth, height: f.style.pixelHeight || f.offsetHeight } : { container: f, width: c, height: d } : { container: 1, x: a, y: c, width: d, height: e } : void 0; }, b.pathToRelative = Ba, b._engine = {}, b.path2curve = Ia, b.matrix = function (a, b, c, d, e, f) { return new n(a, b, c, d, e, f); }, function (a) { function c(a) { return a[0] * a[0] + a[1] * a[1]; } function d(a) { var b = M.sqrt(c(a)); a[0] && (a[0] /= b), a[1] && (a[1] /= b); } a.add = function (a, b, c, d, e, f) { var g, h, i, j, k = [[], [], []], l = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]], m = [[a, c, e], [b, d, f], [0, 0, 1]]; for (a && a instanceof n && (m = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]]), g = 0; 3 > g; g++)for (h = 0; 3 > h; h++) { for (j = 0, i = 0; 3 > i; i++)j += l[g][i] * m[i][h]; k[g][h] = j; } this.a = k[0][0], this.b = k[1][0], this.c = k[0][1], this.d = k[1][1], this.e = k[0][2], this.f = k[1][2]; }, a.invert = function () { var a = this, b = a.a * a.d - a.b * a.c; return new n(a.d / b, -a.b / b, -a.c / b, a.a / b, (a.c * a.f - a.d * a.e) / b, (a.b * a.e - a.a * a.f) / b); }, a.clone = function () { return new n(this.a, this.b, this.c, this.d, this.e, this.f); }, a.translate = function (a, b) { this.add(1, 0, 0, 1, a, b); }, a.scale = function (a, b, c, d) { null == b && (b = a), (c || d) && this.add(1, 0, 0, 1, c, d), this.add(a, 0, 0, b, 0, 0), (c || d) && this.add(1, 0, 0, 1, -c, -d); }, a.rotate = function (a, c, d) { a = b.rad(a), c = c || 0, d = d || 0; var e = +M.cos(a).toFixed(9), f = +M.sin(a).toFixed(9); this.add(e, f, -f, e, c, d), this.add(1, 0, 0, 1, -c, -d); }, a.x = function (a, b) { return a * this.a + b * this.c + this.e; }, a.y = function (a, b) { return a * this.b + b * this.d + this.f; }, a.get = function (a) { return +this[H.fromCharCode(97 + a)].toFixed(4); }, a.toString = function () { return b.svg ? 'matrix(' + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ')' : [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join(); }, a.toFilter = function () { return 'progid:DXImageTransform.Microsoft.Matrix(M11=' + this.get(0) + ', M12=' + this.get(2) + ', M21=' + this.get(1) + ', M22=' + this.get(3) + ', Dx=' + this.get(4) + ', Dy=' + this.get(5) + ', sizingmethod=\'auto expand\')'; }, a.offset = function () { return [this.e.toFixed(4), this.f.toFixed(4)]; }, a.split = function () { var a = {}; a.dx = this.e, a.dy = this.f; var e = [[this.a, this.c], [this.b, this.d]]; a.scalex = M.sqrt(c(e[0])), d(e[0]), a.shear = e[0][0] * e[1][0] + e[0][1] * e[1][1], e[1] = [e[1][0] - e[0][0] * a.shear, e[1][1] - e[0][1] * a.shear], a.scaley = M.sqrt(c(e[1])), d(e[1]), a.shear /= a.scaley; var f = -e[0][1], g = e[1][1]; return 0 > g ? (a.rotate = b.deg(M.acos(g)), 0 > f && (a.rotate = 360 - a.rotate)) : a.rotate = b.deg(M.asin(f)), a.isSimple = !(+a.shear.toFixed(9) || a.scalex.toFixed(9) != a.scaley.toFixed(9) && a.rotate), a.isSuperSimple = !+a.shear.toFixed(9) && a.scalex.toFixed(9) == a.scaley.toFixed(9) && !a.rotate, a.noRotation = !+a.shear.toFixed(9) && !a.rotate, a; }, a.toTransformString = function (a) { var b = a || this[I](); return b.isSimple ? (b.scalex = +b.scalex.toFixed(4), b.scaley = +b.scaley.toFixed(4), b.rotate = +b.rotate.toFixed(4), (b.dx || b.dy ? 't' + [b.dx, b.dy] : F) + (1 != b.scalex || 1 != b.scaley ? 's' + [b.scalex, b.scaley, 0, 0] : F) + (b.rotate ? 'r' + [b.rotate, 0, 0] : F)) : 'm' + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)]; }; }(n.prototype); for (var Oa = function () { this.returnValue = !1; }, Pa = function () { return this.originalEvent.preventDefault(); }, Qa = function () { this.cancelBubble = !0; }, Ra = function () { return this.originalEvent.stopPropagation(); }, Sa = function (a) { var b = z.doc.documentElement.scrollTop || z.doc.body.scrollTop, c = z.doc.documentElement.scrollLeft || z.doc.body.scrollLeft; return { x: a.clientX + c, y: a.clientY + b }; }, Ta = function () { return z.doc.addEventListener ? function (a, b, c, d) { var e = function (a) { var b = Sa(a); return c.call(d, a, b.x, b.y); }; if (a.addEventListener(b, e, !1), E && K[b]) { var f = function (b) { for (var e = Sa(b), f = b, g = 0, h = b.targetTouches && b.targetTouches.length; h > g; g++)if (b.targetTouches[g].target == a) { b = b.targetTouches[g], b.originalEvent = f, b.preventDefault = Pa, b.stopPropagation = Ra; break; } return c.call(d, b, e.x, e.y); }; a.addEventListener(K[b], f, !1); } return function () { return a.removeEventListener(b, e, !1), E && K[b] && a.removeEventListener(K[b], f, !1), !0; }; } : z.doc.attachEvent ? function (a, b, c, d) { var e = function (a) { a = a || z.win.event; var b = z.doc.documentElement.scrollTop || z.doc.body.scrollTop, e = z.doc.documentElement.scrollLeft || z.doc.body.scrollLeft, f = a.clientX + e, g = a.clientY + b; return a.preventDefault = a.preventDefault || Oa, a.stopPropagation = a.stopPropagation || Qa, c.call(d, a, f, g); }; a.attachEvent('on' + b, e); var f = function () { return a.detachEvent('on' + b, e), !0; }; return f; } : void 0; }(), Ua = [], Va = function (b) { for (var c, d = b.clientX, e = b.clientY, f = z.doc.documentElement.scrollTop || z.doc.body.scrollTop, g = z.doc.documentElement.scrollLeft || z.doc.body.scrollLeft, h = Ua.length; h--;) { if (c = Ua[h], E && b.touches) { for (var i, j = b.touches.length; j--;)if (i = b.touches[j], i.identifier == c.el._drag.id) { d = i.clientX, e = i.clientY, (b.originalEvent ? b.originalEvent : b).preventDefault(); break; } } else b.preventDefault(); var k, l = c.el.node, m = l.nextSibling, n = l.parentNode, o = l.style.display; z.win.opera && n.removeChild(l), l.style.display = 'none', k = c.el.paper.getElementByPoint(d, e), l.style.display = o, z.win.opera && (m ? n.insertBefore(l, m) : n.appendChild(l)), k && a('raphael.drag.over.' + c.el.id, c.el, k), d += g, e += f, a('raphael.drag.move.' + c.el.id, c.move_scope || c.el, d - c.el._drag.x, e - c.el._drag.y, d, e, b); } }, Wa = function (c) { b.unmousemove(Va).unmouseup(Wa); for (var d, e = Ua.length; e--;)d = Ua[e], d.el._drag = {}, a('raphael.drag.end.' + d.el.id, d.end_scope || d.start_scope || d.move_scope || d.el, c); Ua = []; }, Xa = b.el = {}, Ya = J.length; Ya--;)!function (a) { b[a] = Xa[a] = function (c, d) { return b.is(c, 'function') && (this.events = this.events || [], this.events.push({ name: a, f: c, unbind: Ta(this.shape || this.node || z.doc, a, c, d || this) })), this; }, b['un' + a] = Xa['un' + a] = function (c) { for (var d = this.events || [], e = d.length; e--;)d[e].name != a || !b.is(c, 'undefined') && d[e].f != c || (d[e].unbind(), d.splice(e, 1), !d.length && delete this.events); return this; }; }(J[Ya]); Xa.data = function (c, d) { var e = ja[this.id] = ja[this.id] || {}; if (0 == arguments.length) return e; if (1 == arguments.length) { if (b.is(c, 'object')) { for (var f in c) c[y](f) && this.data(f, c[f]); return this; } return a('raphael.data.get.' + this.id, this, e[c], c), e[c]; } return e[c] = d, a('raphael.data.set.' + this.id, this, d, c), this; }, Xa.removeData = function (a) { return null == a ? ja[this.id] = {} : ja[this.id] && delete ja[this.id][a], this; }, Xa.getData = function () { return c(ja[this.id] || {}); }, Xa.hover = function (a, b, c, d) { return this.mouseover(a, c).mouseout(b, d || c); }, Xa.unhover = function (a, b) { return this.unmouseover(a).unmouseout(b); }; var Za = []; Xa.drag = function (c, d, e, f, g, h) { function i(i) { (i.originalEvent || i).preventDefault(); var j = i.clientX, k = i.clientY, l = z.doc.documentElement.scrollTop || z.doc.body.scrollTop, m = z.doc.documentElement.scrollLeft || z.doc.body.scrollLeft; if (this._drag.id = i.identifier, E && i.touches) for (var n, o = i.touches.length; o--;)if (n = i.touches[o], this._drag.id = n.identifier, n.identifier == this._drag.id) { j = n.clientX, k = n.clientY; break; } this._drag.x = j + m, this._drag.y = k + l, !Ua.length && b.mousemove(Va).mouseup(Wa), Ua.push({ el: this, move_scope: f, start_scope: g, end_scope: h }), d && a.on('raphael.drag.start.' + this.id, d), c && a.on('raphael.drag.move.' + this.id, c), e && a.on('raphael.drag.end.' + this.id, e), a('raphael.drag.start.' + this.id, g || f || this, i.clientX + m, i.clientY + l, i); } return this._drag = {}, Za.push({ el: this, start: i }), this.mousedown(i), this; }, Xa.onDragOver = function (b) { b ? a.on('raphael.drag.over.' + this.id, b) : a.unbind('raphael.drag.over.' + this.id); }, Xa.undrag = function () { for (var c = Za.length; c--;)Za[c].el == this && (this.unmousedown(Za[c].start), Za.splice(c, 1), a.unbind('raphael.drag.*.' + this.id)); !Za.length && b.unmousemove(Va).unmouseup(Wa), Ua = []; }, u.circle = function (a, c, d) { var e = b._engine.circle(this, a || 0, c || 0, d || 0); return this.__set__ && this.__set__.push(e), e; }, u.rect = function (a, c, d, e, f) { var g = b._engine.rect(this, a || 0, c || 0, d || 0, e || 0, f || 0); return this.__set__ && this.__set__.push(g), g; }, u.ellipse = function (a, c, d, e) { var f = b._engine.ellipse(this, a || 0, c || 0, d || 0, e || 0); return this.__set__ && this.__set__.push(f), f; }, u.path = function (a) { a && !b.is(a, T) && !b.is(a[0], U) && (a += F); var c = b._engine.path(b.format[C](b, arguments), this); return this.__set__ && this.__set__.push(c), c; }, u.image = function (a, c, d, e, f) { var g = b._engine.image(this, a || 'about:blank', c || 0, d || 0, e || 0, f || 0); return this.__set__ && this.__set__.push(g), g; }, u.text = function (a, c, d) { var e = b._engine.text(this, a || 0, c || 0, H(d)); return this.__set__ && this.__set__.push(e), e; }, u.set = function (a) { !b.is(a, 'array') && (a = Array.prototype.splice.call(arguments, 0, arguments.length)); var c = new jb(a); return this.__set__ && this.__set__.push(c), c.paper = this, c.type = 'set', c; }, u.setStart = function (a) { this.__set__ = a || this.set(); }, u.setFinish = function (a) { var b = this.__set__; return delete this.__set__, b; }, u.getSize = function () { var a = this.canvas.parentNode; return { width: a.offsetWidth, height: a.offsetHeight }; }, u.setSize = function (a, c) { return b._engine.setSize.call(this, a, c); }, u.setViewBox = function (a, c, d, e, f) { return b._engine.setViewBox.call(this, a, c, d, e, f); }, u.top = u.bottom = null, u.raphael = b; var $a = function (a) { var b = a.getBoundingClientRect(), c = a.ownerDocument, d = c.body, e = c.documentElement, f = e.clientTop || d.clientTop || 0, g = e.clientLeft || d.clientLeft || 0, h = b.top + (z.win.pageYOffset || e.scrollTop || d.scrollTop) - f, i = b.left + (z.win.pageXOffset || e.scrollLeft || d.scrollLeft) - g; return { y: h, x: i }; }; u.getElementByPoint = function (a, b) { var c = this, d = c.canvas, e = z.doc.elementFromPoint(a, b); if (z.win.opera && 'svg' == e.tagName) { var f = $a(d), g = d.createSVGRect(); g.x = a - f.x, g.y = b - f.y, g.width = g.height = 1; var h = d.getIntersectionList(g, null); h.length && (e = h[h.length - 1]); } if (!e) return null; for (; e.parentNode && e != d.parentNode && !e.raphael;)e = e.parentNode; return e == c.canvas.parentNode && (e = d), e = e && e.raphael ? c.getById(e.raphaelid) : null; }, u.getElementsByBBox = function (a) { var c = this.set(); return this.forEach(function (d) { b.isBBoxIntersect(d.getBBox(), a) && c.push(d); }), c; }, u.getById = function (a) { for (var b = this.bottom; b;) { if (b.id == a) return b; b = b.next; } return null; }, u.forEach = function (a, b) { for (var c = this.bottom; c;) { if (a.call(b, c) === !1) return this; c = c.next; } return this; }, u.getElementsByPoint = function (a, b) { var c = this.set(); return this.forEach(function (d) { d.isPointInside(a, b) && c.push(d); }), c; }, Xa.isPointInside = function (a, c) { var d = this.realPath = oa[this.type](this); return this.attr('transform') && this.attr('transform').length && (d = b.transformPath(d, this.attr('transform'))), b.isPointInsidePath(d, a, c); }, Xa.getBBox = function (a) { if (this.removed) return {}; var b = this._; return a ? ((b.dirty || !b.bboxwt) && (this.realPath = oa[this.type](this), b.bboxwt = za(this.realPath), b.bboxwt.toString = o, b.dirty = 0), b.bboxwt) : ((b.dirty || b.dirtyT || !b.bbox) && ((b.dirty || !this.realPath) && (b.bboxwt = 0, this.realPath = oa[this.type](this)), b.bbox = za(pa(this.realPath, this.matrix)), b.bbox.toString = o, b.dirty = b.dirtyT = 0), b.bbox); }, Xa.clone = function () { if (this.removed) return null; var a = this.paper[this.type]().attr(this.attr()); return this.__set__ && this.__set__.push(a), a; }, Xa.glow = function (a) { if ('text' == this.type) return null; a = a || {}; var b = { width: (a.width || 10) + (+this.attr('stroke-width') || 1), fill: a.fill || !1, opacity: null == a.opacity ? .5 : a.opacity, offsetx: a.offsetx || 0, offsety: a.offsety || 0, color: a.color || '#000' }, c = b.width / 2, d = this.paper, e = d.set(), f = this.realPath || oa[this.type](this); f = this.matrix ? pa(f, this.matrix) : f; for (var g = 1; c + 1 > g; g++)e.push(d.path(f).attr({ stroke: b.color, fill: b.fill ? b.color : 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-width': +(b.width / c * g).toFixed(3), opacity: +(b.opacity / c).toFixed(3) })); return e.insertBefore(this).translate(b.offsetx, b.offsety); }; var _a = function (a, c, d, e, f, g, h, k, l) { return null == l ? i(a, c, d, e, f, g, h, k) : b.findDotsAtSegment(a, c, d, e, f, g, h, k, j(a, c, d, e, f, g, h, k, l)); }, ab = function (a, c) { return function (d, e, f) { d = Ia(d); for (var g, h, i, j, k, l = '', m = {}, n = 0, o = 0, p = d.length; p > o; o++) { if (i = d[o], 'M' == i[0]) g = +i[1], h = +i[2]; else { if (j = _a(g, h, i[1], i[2], i[3], i[4], i[5], i[6]), n + j > e) { if (c && !m.start) { if (k = _a(g, h, i[1], i[2], i[3], i[4], i[5], i[6], e - n), l += ['C' + k.start.x, k.start.y, k.m.x, k.m.y, k.x, k.y], f) return l; m.start = l, l = ['M' + k.x, k.y + 'C' + k.n.x, k.n.y, k.end.x, k.end.y, i[5], i[6]].join(), n += j, g = +i[5], h = +i[6]; continue; } if (!a && !c) return k = _a(g, h, i[1], i[2], i[3], i[4], i[5], i[6], e - n), { x: k.x, y: k.y, alpha: k.alpha }; } n += j, g = +i[5], h = +i[6]; } l += i.shift() + i; } return m.end = l, k = a ? n : c ? m : b.findDotsAtSegment(g, h, i[0], i[1], i[2], i[3], i[4], i[5], 1), k.alpha && (k = { x: k.x, y: k.y, alpha: k.alpha }), k; }; }, bb = ab(1), cb = ab(), db = ab(0, 1); b.getTotalLength = bb, b.getPointAtLength = cb, b.getSubpath = function (a, b, c) { if (this.getTotalLength(a) - c < 1e-6) return db(a, b).end; var d = db(a, c, 1); return b ? db(d, b).end : d; }, Xa.getTotalLength = function () { var a = this.getPath(); if (a) return this.node.getTotalLength ? this.node.getTotalLength() : bb(a); }, Xa.getPointAtLength = function (a) { var b = this.getPath(); if (b) return cb(b, a); }, Xa.getPath = function () { var a, c = b._getPath[this.type]; if ('text' != this.type && 'set' != this.type) return c && (a = c(this)), a; }, Xa.getSubpath = function (a, c) { var d = this.getPath(); if (d) return b.getSubpath(d, a, c); }; var eb = b.easing_formulas = { linear: function (a) { return a; }, '<': function (a) { return Q(a, 1.7); }, '>': function (a) { return Q(a, .48); }, '<>': function (a) { var b = .48 - a / 1.04, c = M.sqrt(.1734 + b * b), d = c - b, e = Q(P(d), 1 / 3) * (0 > d ? -1 : 1), f = -c - b, g = Q(P(f), 1 / 3) * (0 > f ? -1 : 1), h = e + g + .5; return 3 * (1 - h) * h * h + h * h * h; }, backIn: function (a) { var b = 1.70158; return a * a * ((b + 1) * a - b); }, backOut: function (a) { a -= 1; var b = 1.70158; return a * a * ((b + 1) * a + b) + 1; }, elastic: function (a) { return a == !!a ? a : Q(2, -10 * a) * M.sin(2 * (a - .075) * R / .3) + 1; }, bounce: function (a) { var b, c = 7.5625, d = 2.75; return 1 / d > a ? b = c * a * a : 2 / d > a ? (a -= 1.5 / d, b = c * a * a + .75) : 2.5 / d > a ? (a -= 2.25 / d, b = c * a * a + .9375) : (a -= 2.625 / d, b = c * a * a + .984375), b; } }; eb.easeIn = eb['ease-in'] = eb['<'], eb.easeOut = eb['ease-out'] = eb['>'], eb.easeInOut = eb['ease-in-out'] = eb['<>'], eb['back-in'] = eb.backIn, eb['back-out'] = eb.backOut; var fb = [], gb = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (a) { setTimeout(a, 16); }, hb = function () { for (var c = +new Date, d = 0; d < fb.length; d++) { var e = fb[d]; if (!e.el.removed && !e.paused) { var f, g, h = c - e.start, i = e.ms, j = e.easing, k = e.from, l = e.diff, m = e.to, n = (e.t, e.el), o = {}, p = {}; if (e.initstatus ? (h = (e.initstatus * e.anim.top - e.prev) / (e.percent - e.prev) * i, e.status = e.initstatus, delete e.initstatus, e.stop && fb.splice(d--, 1)) : e.status = (e.prev + (e.percent - e.prev) * (h / i)) / e.anim.top, !(0 > h)) if (i > h) { var q = j(h / i); for (var s in k) if (k[y](s)) { switch (ca[s]) { case S: f = +k[s] + q * i * l[s]; break; case 'colour': f = 'rgb(' + [ib(Z(k[s].r + q * i * l[s].r)), ib(Z(k[s].g + q * i * l[s].g)), ib(Z(k[s].b + q * i * l[s].b))].join(',') + ')'; break; case 'path': f = []; for (var t = 0, u = k[s].length; u > t; t++) { f[t] = [k[s][t][0]]; for (var v = 1, w = k[s][t].length; w > v; v++)f[t][v] = +k[s][t][v] + q * i * l[s][t][v]; f[t] = f[t].join(G); } f = f.join(G); break; case 'transform': if (l[s].real) for (f = [], t = 0, u = k[s].length; u > t; t++)for (f[t] = [k[s][t][0]], v = 1, w = k[s][t].length; w > v; v++)f[t][v] = k[s][t][v] + q * i * l[s][t][v]; else { var x = function (a) { return +k[s][a] + q * i * l[s][a]; }; f = [['m', x(0), x(1), x(2), x(3), x(4), x(5)]]; } break; case 'csv': if ('clip-rect' == s) for (f = [], t = 4; t--;)f[t] = +k[s][t] + q * i * l[s][t]; break; default: var z = [][D](k[s]); for (f = [], t = n.paper.customAttributes[s].length; t--;)f[t] = +z[t] + q * i * l[s][t]; }o[s] = f; } n.attr(o), function (b, c, d) { setTimeout(function () { a('raphael.anim.frame.' + b, c, d); }); }(n.id, n, e.anim); } else { if (function (c, d, e) { setTimeout(function () { a('raphael.anim.frame.' + d.id, d, e), a('raphael.anim.finish.' + d.id, d, e), b.is(c, 'function') && c.call(d); }); }(e.callback, n, e.anim), n.attr(m), fb.splice(d--, 1), e.repeat > 1 && !e.next) { for (g in m) m[y](g) && (p[g] = e.totalOrigin[g]); e.el.attr(p), r(e.anim, e.el, e.anim.percents[0], null, e.totalOrigin, e.repeat - 1); } e.next && !e.stop && r(e.anim, e.el, e.next, null, e.totalOrigin, e.repeat); } } } fb.length && gb(hb); }, ib = function (a) { return a > 255 ? 255 : 0 > a ? 0 : a; }; Xa.animateWith = function (a, c, d, e, f, g) { var h = this; if (h.removed) return g && g.call(h), h; var i = d instanceof q ? d : b.animation(d, e, f, g); r(i, h, i.percents[0], null, h.attr()); for (var j = 0, k = fb.length; k > j; j++)if (fb[j].anim == c && fb[j].el == a) { fb[k - 1].start = fb[j].start; break; } return h; }, Xa.onAnimation = function (b) { return b ? a.on('raphael.anim.frame.' + this.id, b) : a.unbind('raphael.anim.frame.' + this.id), this; }, q.prototype.delay = function (a) { var b = new q(this.anim, this.ms); return b.times = this.times, b.del = +a || 0, b; }, q.prototype.repeat = function (a) { var b = new q(this.anim, this.ms); return b.del = this.del, b.times = M.floor(N(a, 0)) || 1, b; }, b.animation = function (a, c, d, e) { if (a instanceof q) return a; (b.is(d, 'function') || !d) && (e = e || d || null, d = null), a = Object(a), c = +c || 0; var f, g, h = {}; for (g in a) a[y](g) && $e(g) != g && $e(g) + '%' != g && (f = !0, h[g] = a[g]); if (f) return d && (h.easing = d), e && (h.callback = e), new q({ 100: h }, c); if (e) { var i = 0; for (var j in a) { var k = _(j); a[y](j) && k > i && (i = k); } i += '%', !a[i].callback && (a[i].callback = e); } return new q(a, c); }, Xa.animate = function (a, c, d, e) { var f = this; if (f.removed) return e && e.call(f), f; var g = a instanceof q ? a : b.animation(a, c, d, e); return r(g, f, g.percents[0], null, f.attr()), f; }, Xa.setTime = function (a, b) { return a && null != b && this.status(a, O(b, a.ms) / a.ms), this; }, Xa.status = function (a, b) { var c, d, e = [], f = 0; if (null != b) return r(a, this, -1, O(b, 1)), this; for (c = fb.length; c > f; f++)if (d = fb[f], d.el.id == this.id && (!a || d.anim == a)) { if (a) return d.status; e.push({ anim: d.anim, status: d.status }); } return a ? 0 : e; }, Xa.pause = function (b) { for (var c = 0; c < fb.length; c++)fb[c].el.id != this.id || b && fb[c].anim != b || a('raphael.anim.pause.' + this.id, this, fb[c].anim) !== !1 && (fb[c].paused = !0); return this; }, Xa.resume = function (b) { for (var c = 0; c < fb.length; c++)if (fb[c].el.id == this.id && (!b || fb[c].anim == b)) { var d = fb[c]; a('raphael.anim.resume.' + this.id, this, d.anim) !== !1 && (delete d.paused, this.status(d.anim, d.status)); } return this; }, Xa.stop = function (b) { for (var c = 0; c < fb.length; c++)fb[c].el.id != this.id || b && fb[c].anim != b || a('raphael.anim.stop.' + this.id, this, fb[c].anim) !== !1 && fb.splice(c--, 1); return this; }, a.on('raphael.remove', s), a.on('raphael.clear', s), Xa.toString = function () { return 'Raphaël’s object'; }; var jb = function (a) { if (this.items = [], this.length = 0, this.type = 'set', a) for (var b = 0, c = a.length; c > b; b++)!a[b] || a[b].constructor != Xa.constructor && a[b].constructor != jb || (this[this.items.length] = this.items[this.items.length] = a[b], this.length++); }, kb = jb.prototype; kb.push = function () { for (var a, b, c = 0, d = arguments.length; d > c; c++)a = arguments[c], !a || a.constructor != Xa.constructor && a.constructor != jb || (b = this.items.length, this[b] = this.items[b] = a, this.length++); return this; }, kb.pop = function () { return this.length && delete this[this.length--], this.items.pop(); }, kb.forEach = function (a, b) { for (var c = 0, d = this.items.length; d > c; c++)if (a.call(b, this.items[c], c) === !1) return this; return this; }; for (var lb in Xa) Xa[y](lb) && (kb[lb] = function (a) { return function () { var b = arguments; return this.forEach(function (c) { c[a][C](c, b); }); }; }(lb)); return kb.attr = function (a, c) { if (a && b.is(a, U) && b.is(a[0], 'object')) for (var d = 0, e = a.length; e > d; d++)this.items[d].attr(a[d]); else for (var f = 0, g = this.items.length; g > f; f++)this.items[f].attr(a, c); return this; }, kb.clear = function () { for (; this.length;)this.pop(); }, kb.splice = function (a, b, c) { a = 0 > a ? N(this.length + a, 0) : a, b = N(0, O(this.length - a, b)); var d, e = [], f = [], g = []; for (d = 2; d < arguments.length; d++)g.push(arguments[d]); for (d = 0; b > d; d++)f.push(this[a + d]); for (; d < this.length - a; d++)e.push(this[a + d]); var h = g.length; for (d = 0; d < h + e.length; d++)this.items[a + d] = this[a + d] = h > d ? g[d] : e[d - h]; for (d = this.items.length = this.length -= b - h; this[d];)delete this[d++]; return new jb(f); }, kb.exclude = function (a) { for (var b = 0, c = this.length; c > b; b++)if (this[b] == a) return this.splice(b, 1), !0; }, kb.animate = function (a, c, d, e) { (b.is(d, 'function') || !d) && (e = d || null); var f, g, h = this.items.length, i = h, j = this; if (!h) return this; e && (g = function () { !--h && e.call(j); }), d = b.is(d, T) ? d : g; var k = b.animation(a, c, d, g); for (f = this.items[--i].animate(k); i--;)this.items[i] && !this.items[i].removed && this.items[i].animateWith(f, k, k), this.items[i] && !this.items[i].removed || h--; return this; }, kb.insertAfter = function (a) { for (var b = this.items.length; b--;)this.items[b].insertAfter(a); return this; }, kb.getBBox = function () { for (var a = [], b = [], c = [], d = [], e = this.items.length; e--;)if (!this.items[e].removed) { var f = this.items[e].getBBox(); a.push(f.x), b.push(f.y), c.push(f.x + f.width), d.push(f.y + f.height); } return a = O[C](0, a), b = O[C](0, b), c = N[C](0, c), d = N[C](0, d), { x: a, y: b, x2: c, y2: d, width: c - a, height: d - b }; }, kb.clone = function (a) { a = this.paper.set(); for (var b = 0, c = this.items.length; c > b; b++)a.push(this.items[b].clone()); return a; }, kb.toString = function () { return 'Raphaël‘s set'; }, kb.glow = function (a) { var b = this.paper.set(); return this.forEach(function (c, d) { var e = c.glow(a); null != e && e.forEach(function (a, c) { b.push(a); }); }), b; }, kb.isPointInside = function (a, b) { var c = !1; return this.forEach(function (d) { return d.isPointInside(a, b) ? (c = !0, !1) : void 0; }), c; }, b.registerFont = function (a) { if (!a.face) return a; this.fonts = this.fonts || {}; var b = { w: a.w, face: {}, glyphs: {} }, c = a.face['font-family']; for (var d in a.face) a.face[y](d) && (b.face[d] = a.face[d]); if (this.fonts[c] ? this.fonts[c].push(b) : this.fonts[c] = [b], !a.svg) { b.face['units-per-em'] = _(a.face['units-per-em'], 10); for (var e in a.glyphs) if (a.glyphs[y](e)) { var f = a.glyphs[e]; if (b.glyphs[e] = { w: f.w, k: {}, d: f.d && 'M' + f.d.replace(/[mlcxtrv]/g, function (a) { return { l: 'L', c: 'C', x: 'z', t: 'm', r: 'l', v: 'c' }[a] || 'M'; }) + 'z' }, f.k) for (var g in f.k) f[y](g) && (b.glyphs[e].k[g] = f.k[g]); } } return a; }, u.getFont = function (a, c, d, e) { if (e = e || 'normal', d = d || 'normal', c = +c || { normal: 400, bold: 700, lighter: 300, bolder: 800 }[c] || 400, b.fonts) { var f = b.fonts[a]; if (!f) { var g = new RegExp('(^|\\s)' + a.replace(/[^\w\d\s+!~.:_-]/g, F) + '(\\s|$)', 'i'); for (var h in b.fonts) if (b.fonts[y](h) && g.test(h)) { f = b.fonts[h]; break; } } var i; if (f) for (var j = 0, k = f.length; k > j && (i = f[j], i.face['font-weight'] != c || i.face['font-style'] != d && i.face['font-style'] || i.face['font-stretch'] != e); j++); return i; } }, u.print = function (a, c, d, e, f, g, h, i) { g = g || 'middle', h = N(O(h || 0, 1), -1), i = N(O(i || 1, 3), 1); var j, k = H(d)[I](F), l = 0, m = 0, n = F; if (b.is(e, 'string') && (e = this.getFont(e)), e) { j = (f || 16) / e.face['units-per-em']; for (var o = e.face.bbox[I](v), p = +o[0], q = o[3] - o[1], r = 0, s = +o[1] + ('baseline' == g ? q + +e.face.descent : q / 2), t = 0, u = k.length; u > t; t++) { if ('\n' == k[t]) l = 0, x = 0, m = 0, r += q * i; else { var w = m && e.glyphs[k[t - 1]] || {}, x = e.glyphs[k[t]]; l += m ? (w.w || e.w) + (w.k && w.k[k[t]] || 0) + e.w * h : 0, m = 1; } x && x.d && (n += b.transformPath(x.d, ['t', l * j, r * j, 's', j, j, p, s, 't', (a - p) / j, (c - s) / j])); } } return this.path(n).attr({ fill: '#000', stroke: 'none' }); }, u.add = function (a) { if (b.is(a, 'array')) for (var c, d = this.set(), e = 0, f = a.length; f > e; e++)c = a[e] || {}, w[y](c.type) && d.push(this[c.type]().attr(c)); return d; }, b.format = function (a, c) { var d = b.is(c, U) ? [0][D](c) : arguments; return a && b.is(a, T) && d.length - 1 && (a = a.replace(x, function (a, b) { return null == d[++b] ? F : d[b]; })), a || F; }, b.fullfill = function () { var a = /\{([^\}]+)\}/g, b = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, c = function (a, c, d) { var e = d; return c.replace(b, function (a, b, c, d, f) { b = b || d, e && (b in e && (e = e[b]), 'function' == typeof e && f && (e = e())); }), e = (null == e || e == d ? a : e) + ''; }; return function (b, d) { return String(b).replace(a, function (a, b) { return c(a, b, d); }); }; }(), b.ninja = function () { return A.was ? z.win.Raphael = A.is : delete Raphael, b; }, b.st = kb, a.on('raphael.DOMload', function () { t = !0; }), function (a, c, d) { function e() { /in/.test(a.readyState) ? setTimeout(e, 9) : b.eve('raphael.DOMload'); } null == a.readyState && a.addEventListener && (a.addEventListener(c, d = function () { a.removeEventListener(c, d, !1), a.readyState = 'complete'; }, !1), a.readyState = 'loading'), e(); }(document, 'DOMContentLoaded'), b;
}), function (a, b) { 'function' == typeof define && define.amd ? define('raphael.svg', ['raphael.core'], function (a) { return b(a); }) : b('object' == typeof exports ? require('./raphael.core') : a.Raphael); }(this, function (a) {
    if (!a || a.svg) {
        var b = 'hasOwnProperty', c = String, d = parseFloat, e = parseInt, f = Math, g = f.max, h = f.abs, i = f.pow, j = /[, ]+/, k = a.eve, l = '', m = ' ', n = 'http://www.w3.org/1999/xlink', o = { block: 'M5,0 0,2.5 5,5z', classic: 'M5,0 0,2.5 5,5 3.5,3 3.5,2z', diamond: 'M2.5,0 5,2.5 2.5,5 0,2.5z', open: 'M6,1 1,3.5 6,6', oval: 'M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z' }, p = {}; a.toString = function () { return 'Your browser supports SVG.\nYou are running Raphaël ' + this.version; }; var q = function (d, e) { if (e) { 'string' == typeof d && (d = q(d)); for (var f in e) e[b](f) && ('xlink:' == f.substring(0, 6) ? d.setAttributeNS(n, f.substring(6), c(e[f])) : d.setAttribute(f, c(e[f]))); } else d = a._g.doc.createElementNS('http://www.w3.org/2000/svg', d), d.style; return d; }, r = function (b, e) { var j = 'linear', k = b.id + e, m = .5, n = .5, o = b.node, p = b.paper, r = o.style, s = a._g.doc.getElementById(k); if (!s) { if (e = c(e).replace(a._radial_gradient, function (a, b, c) { if (j = 'radial', b && c) { m = d(b), n = d(c); var e = 2 * (n > .5) - 1; i(m - .5, 2) + i(n - .5, 2) > .25 && (n = f.sqrt(.25 - i(m - .5, 2)) * e + .5) && .5 != n && (n = n.toFixed(5) - 1e-5 * e); } return l; }), e = e.split(/\s*\-\s*/), 'linear' == j) { var t = e.shift(); if (t = -d(t), isNaN(t)) return null; var u = [0, 0, f.cos(a.rad(t)), f.sin(a.rad(t))], v = 1 / (g(h(u[2]), h(u[3])) || 1); u[2] *= v, u[3] *= v, u[2] < 0 && (u[0] = -u[2], u[2] = 0), u[3] < 0 && (u[1] = -u[3], u[3] = 0); } var w = a._parseDots(e); if (!w) return null; if (k = k.replace(/[\(\)\s,\xb0#]/g, '_'), b.gradient && k != b.gradient.id && (p.defs.removeChild(b.gradient), delete b.gradient), !b.gradient) { s = q(j + 'Gradient', { id: k }), b.gradient = s, q(s, 'radial' == j ? { fx: m, fy: n } : { x1: u[0], y1: u[1], x2: u[2], y2: u[3], gradientTransform: b.matrix.invert() }), p.defs.appendChild(s); for (var x = 0, y = w.length; y > x; x++)s.appendChild(q('stop', { offset: w[x].offset ? w[x].offset : x ? '100%' : '0%', 'stop-color': w[x].color || '#fff', 'stop-opacity': isFinite(w[x].opacity) ? w[x].opacity : 1 })); } } return q(o, { fill: 'url(\'' + document.location.origin + document.location.pathname + '#' + k + '\')', opacity: 1, 'fill-opacity': 1 }), r.fill = l, r.opacity = 1, r.fillOpacity = 1, 1; }, s = function (a) { var b = a.getBBox(1); q(a.pattern, { patternTransform: a.matrix.invert() + ' translate(' + b.x + ',' + b.y + ')' }); }, t = function (d, e, f) { if ('path' == d.type) { for (var g, h, i, j, k, m = c(e).toLowerCase().split('-'), n = d.paper, r = f ? 'end' : 'start', s = d.node, t = d.attrs, u = t['stroke-width'], v = m.length, w = 'classic', x = 3, y = 3, z = 5; v--;)switch (m[v]) { case 'block': case 'classic': case 'oval': case 'diamond': case 'open': case 'none': w = m[v]; break; case 'wide': y = 5; break; case 'narrow': y = 2; break; case 'long': x = 5; break; case 'short': x = 2; }if ('open' == w ? (x += 2, y += 2, z += 2, i = 1, j = f ? 4 : 1, k = { fill: 'none', stroke: t.stroke }) : (j = i = x / 2, k = { fill: t.stroke, stroke: 'none' }), d._.arrows ? f ? (d._.arrows.endPath && p[d._.arrows.endPath]--, d._.arrows.endMarker && p[d._.arrows.endMarker]--) : (d._.arrows.startPath && p[d._.arrows.startPath]--, d._.arrows.startMarker && p[d._.arrows.startMarker]--) : d._.arrows = {}, 'none' != w) { var A = 'raphael-marker-' + w, B = 'raphael-marker-' + r + w + x + y + '-obj' + d.id; a._g.doc.getElementById(A) ? p[A]++ : (n.defs.appendChild(q(q('path'), { 'stroke-linecap': 'round', d: o[w], id: A })), p[A] = 1); var C, D = a._g.doc.getElementById(B); D ? (p[B]++, C = D.getElementsByTagName('use')[0]) : (D = q(q('marker'), { id: B, markerHeight: y, markerWidth: x, orient: 'auto', refX: j, refY: y / 2 }), C = q(q('use'), { 'xlink:href': '#' + A, transform: (f ? 'rotate(180 ' + x / 2 + ' ' + y / 2 + ') ' : l) + 'scale(' + x / z + ',' + y / z + ')', 'stroke-width': (1 / ((x / z + y / z) / 2)).toFixed(4) }), D.appendChild(C), n.defs.appendChild(D), p[B] = 1), q(C, k); var E = i * ('diamond' != w && 'oval' != w); f ? (g = d._.arrows.startdx * u || 0, h = a.getTotalLength(t.path) - E * u) : (g = E * u, h = a.getTotalLength(t.path) - (d._.arrows.enddx * u || 0)), k = {}, k['marker-' + r] = 'url(#' + B + ')', (h || g) && (k.d = a.getSubpath(t.path, g, h)), q(s, k), d._.arrows[r + 'Path'] = A, d._.arrows[r + 'Marker'] = B, d._.arrows[r + 'dx'] = E, d._.arrows[r + 'Type'] = w, d._.arrows[r + 'String'] = e; } else f ? (g = d._.arrows.startdx * u || 0, h = a.getTotalLength(t.path) - g) : (g = 0, h = a.getTotalLength(t.path) - (d._.arrows.enddx * u || 0)), d._.arrows[r + 'Path'] && q(s, { d: a.getSubpath(t.path, g, h) }), delete d._.arrows[r + 'Path'], delete d._.arrows[r + 'Marker'], delete d._.arrows[r + 'dx'], delete d._.arrows[r + 'Type'], delete d._.arrows[r + 'String']; for (k in p) if (p[b](k) && !p[k]) { var F = a._g.doc.getElementById(k); F && F.parentNode.removeChild(F); } } }, u = { '-': [3, 1], '.': [1, 1], '-.': [3, 1, 1, 1], '-..': [3, 1, 1, 1, 1, 1], '. ': [1, 3], '- ': [4, 3], '--': [8, 3], '- .': [4, 3, 1, 3], '--.': [8, 3, 1, 3], '--..': [8, 3, 1, 3, 1, 3] }, v = function (a, b, d) { if (b = u[c(b).toLowerCase()]) { for (var e = a.attrs['stroke-width'] || '1', f = { round: e, square: e, butt: 0 }[a.attrs['stroke-linecap'] || d['stroke-linecap']] || 0, g = [], h = b.length; h--;)g[h] = b[h] * e + (h % 2 ? 1 : -1) * f; q(a.node, { 'stroke-dasharray': g.join(',') }); } else q(a.node, { 'stroke-dasharray': 'none' }); }, w = function (d, f) {
            let i = d.node, k = d.attrs, m = i.style.visibility; i.style.visibility = 'hidden'; for (var o in f) if (f[b](o)) {
                if (!a._availableAttrs[b](o)) continue; var p = f[o]; switch (k[o] = p, o) {
                    case 'blur': d.blur(p); break; case 'title': var u = i.getElementsByTagName('title'); if (u.length && (u = u[0])) u.firstChild.nodeValue = p; else { u = q('title'); var w = a._g.doc.createTextNode(p); u.appendChild(w), i.appendChild(u); } break; case 'href': case 'target': var x = i.parentNode; if ('a' != x.tagName.toLowerCase()) { var z = q('a'); x.insertBefore(z, i), z.appendChild(i), x = z; } 'target' == o ? x.setAttributeNS(n, 'show', 'blank' == p ? 'new' : p) : x.setAttributeNS(n, o, p); break; case 'cursor': i.style.cursor = p; break; case 'transform': d.transform(p); break; case 'arrow-start': t(d, p); break; case 'arrow-end': t(d, p, 1); break; case 'clip-rect': var A = c(p).split(j); if (4 == A.length) { d.clip && d.clip.parentNode.parentNode.removeChild(d.clip.parentNode); var B = q('clipPath'), C = q('rect'); B.id = a.createUUID(), q(C, { x: A[0], y: A[1], width: A[2], height: A[3] }), B.appendChild(C), d.paper.defs.appendChild(B), q(i, { 'clip-path': 'url(#' + B.id + ')' }), d.clip = C; } if (!p) { var D = i.getAttribute('clip-path'); if (D) { var E = a._g.doc.getElementById(D.replace(/(^url\(#|\)$)/g, l)); E && E.parentNode.removeChild(E), q(i, { 'clip-path': l }), delete d.clip; } } break; case 'path': 'path' == d.type && (q(i, { d: p ? k.path = a._pathToAbsolute(p) : 'M0,0' }), d._.dirty = 1, d._.arrows && ('startString' in d._.arrows && t(d, d._.arrows.startString), 'endString' in d._.arrows && t(d, d._.arrows.endString, 1))); break; case 'width': if (i.setAttribute(o, p), d._.dirty = 1, !k.fx) break; o = 'x', p = k.x; case 'x': k.fx && (p = -k.x - (k.width || 0)); case 'rx': if ('rx' == o && 'rect' == d.type) break; case 'cx': i.setAttribute(o, p), d.pattern && s(d), d._.dirty = 1; break; case 'height': if (i.setAttribute(o, p), d._.dirty = 1, !k.fy) break; o = 'y', p = k.y; case 'y': k.fy && (p = -k.y - (k.height || 0)); case 'ry': if ('ry' == o && 'rect' == d.type) break; case 'cy': i.setAttribute(o, p), d.pattern && s(d), d._.dirty = 1; break; case 'r': 'rect' == d.type ? q(i, { rx: p, ry: p }) : i.setAttribute(o, p), d._.dirty = 1; break; case 'src': 'image' == d.type && i.setAttributeNS(n, 'href', p); break; case 'stroke-width': (1 != d._.sx || 1 != d._.sy) && (p /= g(h(d._.sx), h(d._.sy)) || 1), i.setAttribute(o, p), k['stroke-dasharray'] && v(d, k['stroke-dasharray'], f), d._.arrows && ('startString' in d._.arrows && t(d, d._.arrows.startString), 'endString' in d._.arrows && t(d, d._.arrows.endString, 1)); break; case 'stroke-dasharray': v(d, p, f); break; case 'fill': var F = c(p).match(a._ISURL); if (F) { B = q('pattern'); var G = q('image'); B.id = a.createUUID(), q(B, { x: 0, y: 0, patternUnits: 'userSpaceOnUse', height: 1, width: 1 }), q(G, { x: 0, y: 0, 'xlink:href': F[1] }), B.appendChild(G), function (b) { a._preload(F[1], function () { var a = this.offsetWidth, c = this.offsetHeight; q(b, { width: a, height: c }), q(G, { width: a, height: c }); }); }(B), d.paper.defs.appendChild(B), q(i, { fill: 'url(#' + B.id + ')' }), d.pattern = B, d.pattern && s(d); break; } var H = a.getRGB(p); if (H.error) { if (('circle' == d.type || 'ellipse' == d.type || 'r' != c(p).charAt()) && r(d, p)) { if ('opacity' in k || 'fill-opacity' in k) { var I = a._g.doc.getElementById(i.getAttribute('fill').replace(/^url\(#|\)$/g, l)); if (I) { var J = I.getElementsByTagName('stop'); q(J[J.length - 1], { 'stop-opacity': ('opacity' in k ? k.opacity : 1) * ('fill-opacity' in k ? k['fill-opacity'] : 1) }); } } k.gradient = p, k.fill = 'none'; break; } } else delete f.gradient, delete k.gradient, !a.is(k.opacity, 'undefined') && a.is(f.opacity, 'undefined') && q(i, { opacity: k.opacity }), !a.is(k['fill-opacity'], 'undefined') && a.is(f['fill-opacity'], 'undefined') && q(i, { 'fill-opacity': k['fill-opacity'] }); H[b]('opacity') && q(i, { 'fill-opacity': H.opacity > 1 ? H.opacity / 100 : H.opacity }); case 'stroke': H = a.getRGB(p), i.setAttribute(o, H.hex), 'stroke' == o && H[b]('opacity') && q(i, { 'stroke-opacity': H.opacity > 1 ? H.opacity / 100 : H.opacity }), 'stroke' == o && d._.arrows && ('startString' in d._.arrows && t(d, d._.arrows.startString), 'endString' in d._.arrows && t(d, d._.arrows.endString, 1)); break; case 'gradient': ('circle' == d.type || 'ellipse' == d.type || 'r' != c(p).charAt()) && r(d, p);

                        break; case 'opacity': k.gradient && !k[b]('stroke-opacity') && q(i, { 'stroke-opacity': p > 1 ? p / 100 : p }); case 'fill-opacity': if (k.gradient) { I = a._g.doc.getElementById(i.getAttribute('fill').replace(/^url\(#|\)$/g, l)), I && (J = I.getElementsByTagName('stop'), q(J[J.length - 1], { 'stop-opacity': p })); break; } default: 'font-size' == o && (p = e(p, 10) + 'px'); var K = o.replace(/(\-.)/g, function (a) { return a.substring(1).toUpperCase(); }); i.style[K] = p, d._.dirty = 1, i.setAttribute(o, p);
                }
            } y(d, f), i.style.visibility = m;
        }, x = 1.2, y = function (d, f) { if ('text' == d.type && (f[b]('text') || f[b]('font') || f[b]('font-size') || f[b]('x') || f[b]('y'))) { var g = d.attrs, h = d.node, i = h.firstChild ? e(a._g.doc.defaultView.getComputedStyle(h.firstChild, l).getPropertyValue('font-size'), 10) : 10; if (f[b]('text')) { for (g.text = f.text; h.firstChild;)h.removeChild(h.firstChild); for (var j, k = c(f.text).split('\n'), m = [], n = 0, o = k.length; o > n; n++)j = q('tspan'), n && q(j, { dy: i * x, x: g.x }), j.appendChild(a._g.doc.createTextNode(k[n])), h.appendChild(j), m[n] = j; } else for (m = h.getElementsByTagName('tspan'), n = 0, o = m.length; o > n; n++)n ? q(m[n], { dy: i * x, x: g.x }) : q(m[0], { dy: 0 }); q(h, { x: g.x, y: g.y }), d._.dirty = 1; var p = d._getBBox(), r = g.y - (p.y + p.height / 2); r && a.is(r, 'finite') && q(m[0], { dy: r }); } }, z = function (a) { return a.parentNode && 'a' === a.parentNode.tagName.toLowerCase() ? a.parentNode : a; }, A = function (b, c) { this[0] = this.node = b, b.raphael = !0, this.id = a._oid++, b.raphaelid = this.id, this.matrix = a.matrix(), this.realPath = null, this.paper = c, this.attrs = this.attrs || {}, this._ = { transform: [], sx: 1, sy: 1, deg: 0, dx: 0, dy: 0, dirty: 1 }, !c.bottom && (c.bottom = this), this.prev = c.top, c.top && (c.top.next = this), c.top = this, this.next = null; }, B = a.el; A.prototype = B, B.constructor = A, a._engine.path = function (a, b) { var c = q('path'); b.canvas && b.canvas.appendChild(c); var d = new A(c, b); return d.type = 'path', w(d, { fill: 'none', stroke: '#000', path: a }), d; }, B.rotate = function (a, b, e) { if (this.removed) return this; if (a = c(a).split(j), a.length - 1 && (b = d(a[1]), e = d(a[2])), a = d(a[0]), null == e && (b = e), null == b || null == e) { var f = this.getBBox(1); b = f.x + f.width / 2, e = f.y + f.height / 2; } return this.transform(this._.transform.concat([['r', a, b, e]])), this; }, B.scale = function (a, b, e, f) { if (this.removed) return this; if (a = c(a).split(j), a.length - 1 && (b = d(a[1]), e = d(a[2]), f = d(a[3])), a = d(a[0]), null == b && (b = a), null == f && (e = f), null == e || null == f) var g = this.getBBox(1); return e = null == e ? g.x + g.width / 2 : e, f = null == f ? g.y + g.height / 2 : f, this.transform(this._.transform.concat([['s', a, b, e, f]])), this; }, B.translate = function (a, b) { return this.removed ? this : (a = c(a).split(j), a.length - 1 && (b = d(a[1])), a = d(a[0]) || 0, b = +b || 0, this.transform(this._.transform.concat([['t', a, b]])), this); }, B.transform = function (c) { var d = this._; if (null == c) return d.transform; if (a._extractTransform(this, c), this.clip && q(this.clip, { transform: this.matrix.invert() }), this.pattern && s(this), this.node && q(this.node, { transform: this.matrix }), 1 != d.sx || 1 != d.sy) { var e = this.attrs[b]('stroke-width') ? this.attrs['stroke-width'] : 1; this.attr({ 'stroke-width': e }); } return d.transform = this.matrix.toTransformString(), this; }, B.hide = function () { return this.removed || (this.node.style.display = 'none'), this; }, B.show = function () { return this.removed || (this.node.style.display = ''), this; }, B.remove = function () { var b = z(this.node); if (!this.removed && b.parentNode) { var c = this.paper; c.__set__ && c.__set__.exclude(this), k.unbind('raphael.*.*.' + this.id), this.gradient && c.defs.removeChild(this.gradient), a._tear(this, c), b.parentNode.removeChild(b), this.removeData(); for (var d in this) this[d] = 'function' == typeof this[d] ? a._removedFactory(d) : null; this.removed = !0; } }, B._getBBox = function () { if ('none' == this.node.style.display) { this.show(); var a = !0; } var b, c = !1; this.paper.canvas.parentElement ? b = this.paper.canvas.parentElement.style : this.paper.canvas.parentNode && (b = this.paper.canvas.parentNode.style), b && 'none' == b.display && (c = !0, b.display = ''); var d = {}; try { d = this.node.getBBox(); } catch (e) { d = { x: this.node.clientLeft, y: this.node.clientTop, width: this.node.clientWidth, height: this.node.clientHeight }; } finally { d = d || {}, c && (b.display = 'none'); } return a && this.hide(), d; }, B.attr = function (c, d) { if (this.removed) return this; if (null == c) { var e = {}; for (var f in this.attrs) this.attrs[b](f) && (e[f] = this.attrs[f]); return e.gradient && 'none' == e.fill && (e.fill = e.gradient) && delete e.gradient, e.transform = this._.transform, e; } if (null == d && a.is(c, 'string')) { if ('fill' == c && 'none' == this.attrs.fill && this.attrs.gradient) return this.attrs.gradient; if ('transform' == c) return this._.transform; for (var g = c.split(j), h = {}, i = 0, l = g.length; l > i; i++)c = g[i], c in this.attrs ? h[c] = this.attrs[c] : a.is(this.paper.customAttributes[c], 'function') ? h[c] = this.paper.customAttributes[c].def : h[c] = a._availableAttrs[c]; return l - 1 ? h : h[g[0]]; } if (null == d && a.is(c, 'array')) { for (h = {}, i = 0, l = c.length; l > i; i++)h[c[i]] = this.attr(c[i]); return h; } if (null != d) { var m = {}; m[c] = d; } else null != c && a.is(c, 'object') && (m = c); for (var n in m) k('raphael.attr.' + n + '.' + this.id, this, m[n]); for (n in this.paper.customAttributes) if (this.paper.customAttributes[b](n) && m[b](n) && a.is(this.paper.customAttributes[n], 'function')) { var o = this.paper.customAttributes[n].apply(this, [].concat(m[n])); this.attrs[n] = m[n]; for (var p in o) o[b](p) && (m[p] = o[p]); } return w(this, m), this; }, B.toFront = function () { if (this.removed) return this; var b = z(this.node); b.parentNode.appendChild(b); var c = this.paper; return c.top != this && a._tofront(this, c), this; }, B.toBack = function () { if (this.removed) return this; var b = z(this.node), c = b.parentNode; c.insertBefore(b, c.firstChild), a._toback(this, this.paper); this.paper; return this; }, B.insertAfter = function (b) { if (this.removed || !b) return this; var c = z(this.node), d = z(b.node || b[b.length - 1].node); return d.nextSibling ? d.parentNode.insertBefore(c, d.nextSibling) : d.parentNode.appendChild(c), a._insertafter(this, b, this.paper), this; }, B.insertBefore = function (b) { if (this.removed || !b) return this; var c = z(this.node), d = z(b.node || b[0].node); return d.parentNode.insertBefore(c, d), a._insertbefore(this, b, this.paper), this; }, B.blur = function (b) { var c = this; if (0 !== +b) { var d = q('filter'), e = q('feGaussianBlur'); c.attrs.blur = b, d.id = a.createUUID(), q(e, { stdDeviation: +b || 1.5 }), d.appendChild(e), c.paper.defs.appendChild(d), c._blur = d, q(c.node, { filter: 'url(#' + d.id + ')' }); } else c._blur && (c._blur.parentNode.removeChild(c._blur), delete c._blur, delete c.attrs.blur), c.node.removeAttribute('filter'); return c; }, a._engine.circle = function (a, b, c, d) { var e = q('circle'); a.canvas && a.canvas.appendChild(e); var f = new A(e, a); return f.attrs = { cx: b, cy: c, r: d, fill: 'none', stroke: '#000' }, f.type = 'circle', q(e, f.attrs), f; }, a._engine.rect = function (a, b, c, d, e, f) { var g = q('rect'); a.canvas && a.canvas.appendChild(g); var h = new A(g, a); return h.attrs = { x: b, y: c, width: d, height: e, rx: f || 0, ry: f || 0, fill: 'none', stroke: '#000' }, h.type = 'rect', q(g, h.attrs), h; }, a._engine.ellipse = function (a, b, c, d, e) { var f = q('ellipse'); a.canvas && a.canvas.appendChild(f); var g = new A(f, a); return g.attrs = { cx: b, cy: c, rx: d, ry: e, fill: 'none', stroke: '#000' }, g.type = 'ellipse', q(f, g.attrs), g; }, a._engine.image = function (a, b, c, d, e, f) { var g = q('image'); q(g, { x: c, y: d, width: e, height: f, preserveAspectRatio: 'none' }), g.setAttributeNS(n, 'href', b), a.canvas && a.canvas.appendChild(g); var h = new A(g, a); return h.attrs = { x: c, y: d, width: e, height: f, src: b }, h.type = 'image', h; }, a._engine.text = function (b, c, d, e) { var f = q('text'); b.canvas && b.canvas.appendChild(f); var g = new A(f, b); return g.attrs = { x: c, y: d, 'text-anchor': 'middle', text: e, 'font-family': a._availableAttrs['font-family'], 'font-size': a._availableAttrs['font-size'], stroke: 'none', fill: '#000' }, g.type = 'text', w(g, g.attrs), g; }, a._engine.setSize = function (a, b) { return this.width = a || this.width, this.height = b || this.height, this.canvas.setAttribute('width', this.width), this.canvas.setAttribute('height', this.height), this._viewBox && this.setViewBox.apply(this, this._viewBox), this; }, a._engine.create = function () { var b = a._getContainer.apply(0, arguments), c = b && b.container, d = b.x, e = b.y, f = b.width, g = b.height; if (!c) throw new Error('SVG container not found.'); var h, i = q('svg'), j = 'overflow:hidden;'; return d = d || 0, e = e || 0, f = f || 512, g = g || 342, q(i, { height: g, version: 1.1, width: f, xmlns: 'http://www.w3.org/2000/svg', 'xmlns:xlink': 'http://www.w3.org/1999/xlink' }), 1 == c ? (i.style.cssText = j + 'position:absolute;left:' + d + 'px;top:' + e + 'px', a._g.doc.body.appendChild(i), h = 1) : (i.style.cssText = j + 'position:relative', c.firstChild ? c.insertBefore(i, c.firstChild) : c.appendChild(i)), c = new a._Paper, c.width = f, c.height = g, c.canvas = i, c.clear(), c._left = c._top = 0, h && (c.renderfix = function () { }), c.renderfix(), c; }, a._engine.setViewBox = function (a, b, c, d, e) { k('raphael.setViewBox', this, this._viewBox, [a, b, c, d, e]); var f, h, i = this.getSize(), j = g(c / i.width, d / i.height), l = this.top, n = e ? 'xMidYMid meet' : 'xMinYMin'; for (null == a ? (this._vbSize && (j = 1), delete this._vbSize, f = '0 0 ' + this.width + m + this.height) : (this._vbSize = j, f = a + m + b + m + c + m + d), q(this.canvas, { viewBox: f, preserveAspectRatio: n }); j && l;)h = 'stroke-width' in l.attrs ? l.attrs['stroke-width'] : 1, l.attr({ 'stroke-width': h }), l._.dirty = 1, l._.dirtyT = 1, l = l.prev; return this._viewBox = [a, b, c, d, !!e], this; }, a.prototype.renderfix = function () { var a, b = this.canvas, c = b.style; try { a = b.getScreenCTM() || b.createSVGMatrix(); } catch (d) { a = b.createSVGMatrix(); } var e = -a.e % 1, f = -a.f % 1; (e || f) && (e && (this._left = (this._left + e) % 1, c.left = this._left + 'px'), f && (this._top = (this._top + f) % 1, c.top = this._top + 'px')); }, a.prototype.clear = function () { a.eve('raphael.clear', this); for (var b = this.canvas; b.firstChild;)b.removeChild(b.firstChild); this.bottom = this.top = null, (this.desc = q('desc')).appendChild(a._g.doc.createTextNode('Created with Raphaël ' + a.version)), b.appendChild(this.desc), b.appendChild(this.defs = q('defs')); }, a.prototype.remove = function () { k('raphael.remove', this), this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas); for (var b in this) this[b] = 'function' == typeof this[b] ? a._removedFactory(b) : null; }; var C = a.st; for (var D in B) B[b](D) && !C[b](D) && (C[D] = function (a) { return function () { var b = arguments; return this.forEach(function (c) { c[a].apply(c, b); }); }; }(D));
    }
}), function (a, b) { 'function' == typeof define && define.amd ? define('raphael.vml', ['raphael.core'], function (a) { return b(a); }) : b('object' == typeof exports ? require('./raphael.core') : a.Raphael); }(this, function (a) { if (!a || a.vml) { var b = 'hasOwnProperty', c = String, d = parseFloat, e = Math, f = e.round, g = e.max, h = e.min, i = e.abs, j = 'fill', k = /[, ]+/, l = a.eve, m = ' progid:DXImageTransform.Microsoft', n = ' ', o = '', p = { M: 'm', L: 'l', C: 'c', Z: 'x', m: 't', l: 'r', c: 'v', z: 'x' }, q = /([clmz]),?([^clmz]*)/gi, r = / progid:\S+Blur\([^\)]+\)/g, s = /-?[^,\s-]+/g, t = 'position:absolute;left:0;top:0;width:1px;height:1px;behavior:url(#default#VML)', u = 21600, v = { path: 1, rect: 1, image: 1 }, w = { circle: 1, ellipse: 1 }, x = function (b) { var d = /[ahqstv]/gi, e = a._pathToAbsolute; if (c(b).match(d) && (e = a._path2curve), d = /[clmz]/g, e == a._pathToAbsolute && !c(b).match(d)) { var g = c(b).replace(q, function (a, b, c) { var d = [], e = 'm' == b.toLowerCase(), g = p[b]; return c.replace(s, function (a) { e && 2 == d.length && (g += d + p['m' == b ? 'l' : 'L'], d = []), d.push(f(a * u)); }), g + d; }); return g; } var h, i, j = e(b); g = []; for (var k = 0, l = j.length; l > k; k++) { h = j[k], i = j[k][0].toLowerCase(), 'z' == i && (i = 'x'); for (var m = 1, r = h.length; r > m; m++)i += f(h[m] * u) + (m != r - 1 ? ',' : o); g.push(i); } return g.join(n); }, y = function (b, c, d) { var e = a.matrix(); return e.rotate(-b, .5, .5), { dx: e.x(c, d), dy: e.y(c, d) }; }, z = function (a, b, c, d, e, f) { var g = a._, h = a.matrix, k = g.fillpos, l = a.node, m = l.style, o = 1, p = '', q = u / b, r = u / c; if (m.visibility = 'hidden', b && c) { if (l.coordsize = i(q) + n + i(r), m.rotation = f * (0 > b * c ? -1 : 1), f) { var s = y(f, d, e); d = s.dx, e = s.dy; } if (0 > b && (p += 'x'), 0 > c && (p += ' y') && (o = -1), m.flip = p, l.coordorigin = d * -q + n + e * -r, k || g.fillsize) { var t = l.getElementsByTagName(j); t = t && t[0], l.removeChild(t), k && (s = y(f, h.x(k[0], k[1]), h.y(k[0], k[1])), t.position = s.dx * o + n + s.dy * o), g.fillsize && (t.size = g.fillsize[0] * i(b) + n + g.fillsize[1] * i(c)), l.appendChild(t); } m.visibility = 'visible'; } }; a.toString = function () { return 'Your browser doesn’t support SVG. Falling down to VML.\nYou are running Raphaël ' + this.version; }; var A = function (a, b, d) { for (var e = c(b).toLowerCase().split('-'), f = d ? 'end' : 'start', g = e.length, h = 'classic', i = 'medium', j = 'medium'; g--;)switch (e[g]) { case 'block': case 'classic': case 'oval': case 'diamond': case 'open': case 'none': h = e[g]; break; case 'wide': case 'narrow': j = e[g]; break; case 'long': case 'short': i = e[g]; }var k = a.node.getElementsByTagName('stroke')[0]; k[f + 'arrow'] = h, k[f + 'arrowlength'] = i, k[f + 'arrowwidth'] = j; }, B = function (e, i) { e.attrs = e.attrs || {}; var l = e.node, m = e.attrs, p = l.style, q = v[e.type] && (i.x != m.x || i.y != m.y || i.width != m.width || i.height != m.height || i.cx != m.cx || i.cy != m.cy || i.rx != m.rx || i.ry != m.ry || i.r != m.r), r = w[e.type] && (m.cx != i.cx || m.cy != i.cy || m.r != i.r || m.rx != i.rx || m.ry != i.ry), s = e; for (var t in i) i[b](t) && (m[t] = i[t]); if (q && (m.path = a._getPath[e.type](e), e._.dirty = 1), i.href && (l.href = i.href), i.title && (l.title = i.title), i.target && (l.target = i.target), i.cursor && (p.cursor = i.cursor), 'blur' in i && e.blur(i.blur), (i.path && 'path' == e.type || q) && (l.path = x(~c(m.path).toLowerCase().indexOf('r') ? a._pathToAbsolute(m.path) : m.path), e._.dirty = 1, 'image' == e.type && (e._.fillpos = [m.x, m.y], e._.fillsize = [m.width, m.height], z(e, 1, 1, 0, 0, 0))), 'transform' in i && e.transform(i.transform), r) { var y = +m.cx, B = +m.cy, D = +m.rx || +m.r || 0, E = +m.ry || +m.r || 0; l.path = a.format('ar{0},{1},{2},{3},{4},{1},{4},{1}x', f((y - D) * u), f((B - E) * u), f((y + D) * u), f((B + E) * u), f(y * u)), e._.dirty = 1; } if ('clip-rect' in i) { var G = c(i['clip-rect']).split(k); if (4 == G.length) { G[2] = +G[2] + +G[0], G[3] = +G[3] + +G[1]; var H = l.clipRect || a._g.doc.createElement('div'), I = H.style; I.clip = a.format('rect({1}px {2}px {3}px {0}px)', G), l.clipRect || (I.position = 'absolute', I.top = 0, I.left = 0, I.width = e.paper.width + 'px', I.height = e.paper.height + 'px', l.parentNode.insertBefore(H, l), H.appendChild(l), l.clipRect = H); } i['clip-rect'] || l.clipRect && (l.clipRect.style.clip = 'auto'); } if (e.textpath) { var J = e.textpath.style; i.font && (J.font = i.font), i['font-family'] && (J.fontFamily = '"' + i['font-family'].split(',')[0].replace(/^['"]+|['"]+$/g, o) + '"'), i['font-size'] && (J.fontSize = i['font-size']), i['font-weight'] && (J.fontWeight = i['font-weight']), i['font-style'] && (J.fontStyle = i['font-style']); } if ('arrow-start' in i && A(s, i['arrow-start']), 'arrow-end' in i && A(s, i['arrow-end'], 1), null != i.opacity || null != i['stroke-width'] || null != i.fill || null != i.src || null != i.stroke || null != i['stroke-width'] || null != i['stroke-opacity'] || null != i['fill-opacity'] || null != i['stroke-dasharray'] || null != i['stroke-miterlimit'] || null != i['stroke-linejoin'] || null != i['stroke-linecap']) { var K = l.getElementsByTagName(j), L = !1; if (K = K && K[0], !K && (L = K = F(j)), 'image' == e.type && i.src && (K.src = i.src), i.fill && (K.on = !0), (null == K.on || 'none' == i.fill || null === i.fill) && (K.on = !1), K.on && i.fill) { var M = c(i.fill).match(a._ISURL); if (M) { K.parentNode == l && l.removeChild(K), K.rotate = !0, K.src = M[1], K.type = 'tile'; var N = e.getBBox(1); K.position = N.x + n + N.y, e._.fillpos = [N.x, N.y], a._preload(M[1], function () { e._.fillsize = [this.offsetWidth, this.offsetHeight]; }); } else K.color = a.getRGB(i.fill).hex, K.src = o, K.type = 'solid', a.getRGB(i.fill).error && (s.type in { circle: 1, ellipse: 1 } || 'r' != c(i.fill).charAt()) && C(s, i.fill, K) && (m.fill = 'none', m.gradient = i.fill, K.rotate = !1); } if ('fill-opacity' in i || 'opacity' in i) { var O = ((+m['fill-opacity'] + 1 || 2) - 1) * ((+m.opacity + 1 || 2) - 1) * ((+a.getRGB(i.fill).o + 1 || 2) - 1); O = h(g(O, 0), 1), K.opacity = O, K.src && (K.color = 'none'); } l.appendChild(K); var P = l.getElementsByTagName('stroke') && l.getElementsByTagName('stroke')[0], Q = !1; !P && (Q = P = F('stroke')), (i.stroke && 'none' != i.stroke || i['stroke-width'] || null != i['stroke-opacity'] || i['stroke-dasharray'] || i['stroke-miterlimit'] || i['stroke-linejoin'] || i['stroke-linecap']) && (P.on = !0), ('none' == i.stroke || null === i.stroke || null == P.on || 0 == i.stroke || 0 == i['stroke-width']) && (P.on = !1); var R = a.getRGB(i.stroke); P.on && i.stroke && (P.color = R.hex), O = ((+m['stroke-opacity'] + 1 || 2) - 1) * ((+m.opacity + 1 || 2) - 1) * ((+R.o + 1 || 2) - 1); var S = .75 * (d(i['stroke-width']) || 1); if (O = h(g(O, 0), 1), null == i['stroke-width'] && (S = m['stroke-width']), i['stroke-width'] && (P.weight = S), S && 1 > S && (O *= S) && (P.weight = 1), P.opacity = O, i['stroke-linejoin'] && (P.joinstyle = i['stroke-linejoin'] || 'miter'), P.miterlimit = i['stroke-miterlimit'] || 8, i['stroke-linecap'] && (P.endcap = 'butt' == i['stroke-linecap'] ? 'flat' : 'square' == i['stroke-linecap'] ? 'square' : 'round'), 'stroke-dasharray' in i) { var T = { '-': 'shortdash', '.': 'shortdot', '-.': 'shortdashdot', '-..': 'shortdashdotdot', '. ': 'dot', '- ': 'dash', '--': 'longdash', '- .': 'dashdot', '--.': 'longdashdot', '--..': 'longdashdotdot' }; P.dashstyle = T[b](i['stroke-dasharray']) ? T[i['stroke-dasharray']] : o; } Q && l.appendChild(P); } if ('text' == s.type) { s.paper.canvas.style.display = o; var U = s.paper.span, V = 100, W = m.font && m.font.match(/\d+(?:\.\d*)?(?=px)/); p = U.style, m.font && (p.font = m.font), m['font-family'] && (p.fontFamily = m['font-family']), m['font-weight'] && (p.fontWeight = m['font-weight']), m['font-style'] && (p.fontStyle = m['font-style']), W = d(m['font-size'] || W && W[0]) || 10, p.fontSize = W * V + 'px', s.textpath.string && (U.innerHTML = c(s.textpath.string).replace(/</g, '&#60;').replace(/&/g, '&#38;').replace(/\n/g, '<br>')); var X = U.getBoundingClientRect(); s.W = m.w = (X.right - X.left) / V, s.H = m.h = (X.bottom - X.top) / V, s.X = m.x, s.Y = m.y + s.H / 2, ('x' in i || 'y' in i) && (s.path.v = a.format('m{0},{1}l{2},{1}', f(m.x * u), f(m.y * u), f(m.x * u) + 1)); for (var Y = ['x', 'y', 'text', 'font', 'font-family', 'font-weight', 'font-style', 'font-size'], Z = 0, $ = Y.length; $ > Z; Z++)if (Y[Z] in i) { s._.dirty = 1; break; } switch (m['text-anchor']) { case 'start': s.textpath.style['v-text-align'] = 'left', s.bbx = s.W / 2; break; case 'end': s.textpath.style['v-text-align'] = 'right', s.bbx = -s.W / 2; break; default: s.textpath.style['v-text-align'] = 'center', s.bbx = 0; }s.textpath.style['v-text-kern'] = !0; } }, C = function (b, f, g) { b.attrs = b.attrs || {}; var h = (b.attrs, Math.pow), i = 'linear', j = '.5 .5'; if (b.attrs.gradient = f, f = c(f).replace(a._radial_gradient, function (a, b, c) { return i = 'radial', b && c && (b = d(b), c = d(c), h(b - .5, 2) + h(c - .5, 2) > .25 && (c = e.sqrt(.25 - h(b - .5, 2)) * (2 * (c > .5) - 1) + .5), j = b + n + c), o; }), f = f.split(/\s*\-\s*/), 'linear' == i) { var k = f.shift(); if (k = -d(k), isNaN(k)) return null; } var l = a._parseDots(f); if (!l) return null; if (b = b.shape || b.node, l.length) { b.removeChild(g), g.on = !0, g.method = 'none', g.color = l[0].color, g.color2 = l[l.length - 1].color; for (var m = [], p = 0, q = l.length; q > p; p++)l[p].offset && m.push(l[p].offset + n + l[p].color); g.colors = m.length ? m.join() : '0% ' + g.color, 'radial' == i ? (g.type = 'gradientTitle', g.focus = '100%', g.focussize = '0 0', g.focusposition = j, g.angle = 0) : (g.type = 'gradient', g.angle = (270 - k) % 360), b.appendChild(g); } return 1; }, D = function (b, c) { this[0] = this.node = b, b.raphael = !0, this.id = a._oid++, b.raphaelid = this.id, this.X = 0, this.Y = 0, this.attrs = {}, this.paper = c, this.matrix = a.matrix(), this._ = { transform: [], sx: 1, sy: 1, dx: 0, dy: 0, deg: 0, dirty: 1, dirtyT: 1 }, !c.bottom && (c.bottom = this), this.prev = c.top, c.top && (c.top.next = this), c.top = this, this.next = null; }, E = a.el; D.prototype = E, E.constructor = D, E.transform = function (b) { if (null == b) return this._.transform; var d, e = this.paper._viewBoxShift, f = e ? 's' + [e.scale, e.scale] + '-1-1t' + [e.dx, e.dy] : o; e && (d = b = c(b).replace(/\.{3}|\u2026/g, this._.transform || o)), a._extractTransform(this, f + b); var g, h = this.matrix.clone(), i = this.skew, j = this.node, k = ~c(this.attrs.fill).indexOf('-'), l = !c(this.attrs.fill).indexOf('url('); if (h.translate(1, 1), l || k || 'image' == this.type) if (i.matrix = '1 0 0 1', i.offset = '0 0', g = h.split(), k && g.noRotation || !g.isSimple) { j.style.filter = h.toFilter(); var m = this.getBBox(), p = this.getBBox(1), q = m.x - p.x, r = m.y - p.y; j.coordorigin = q * -u + n + r * -u, z(this, 1, 1, q, r, 0); } else j.style.filter = o, z(this, g.scalex, g.scaley, g.dx, g.dy, g.rotate); else j.style.filter = o, i.matrix = c(h), i.offset = h.offset(); return null !== d && (this._.transform = d, a._extractTransform(this, d)), this; }, E.rotate = function (a, b, e) { if (this.removed) return this; if (null != a) { if (a = c(a).split(k), a.length - 1 && (b = d(a[1]), e = d(a[2])), a = d(a[0]), null == e && (b = e), null == b || null == e) { var f = this.getBBox(1); b = f.x + f.width / 2, e = f.y + f.height / 2; } return this._.dirtyT = 1, this.transform(this._.transform.concat([['r', a, b, e]])), this; } }, E.translate = function (a, b) { return this.removed ? this : (a = c(a).split(k), a.length - 1 && (b = d(a[1])), a = d(a[0]) || 0, b = +b || 0, this._.bbox && (this._.bbox.x += a, this._.bbox.y += b), this.transform(this._.transform.concat([['t', a, b]])), this); }, E.scale = function (a, b, e, f) { if (this.removed) return this; if (a = c(a).split(k), a.length - 1 && (b = d(a[1]), e = d(a[2]), f = d(a[3]), isNaN(e) && (e = null), isNaN(f) && (f = null)), a = d(a[0]), null == b && (b = a), null == f && (e = f), null == e || null == f) var g = this.getBBox(1); return e = null == e ? g.x + g.width / 2 : e, f = null == f ? g.y + g.height / 2 : f, this.transform(this._.transform.concat([['s', a, b, e, f]])), this._.dirtyT = 1, this; }, E.hide = function () { return !this.removed && (this.node.style.display = 'none'), this; }, E.show = function () { return !this.removed && (this.node.style.display = o), this; }, E.auxGetBBox = a.el.getBBox, E.getBBox = function () { var a = this.auxGetBBox(); if (this.paper && this.paper._viewBoxShift) { var b = {}, c = 1 / this.paper._viewBoxShift.scale; return b.x = a.x - this.paper._viewBoxShift.dx, b.x *= c, b.y = a.y - this.paper._viewBoxShift.dy, b.y *= c, b.width = a.width * c, b.height = a.height * c, b.x2 = b.x + b.width, b.y2 = b.y + b.height, b; } return a; }, E._getBBox = function () { return this.removed ? {} : { x: this.X + (this.bbx || 0) - this.W / 2, y: this.Y - this.H, width: this.W, height: this.H }; }, E.remove = function () { if (!this.removed && this.node.parentNode) { this.paper.__set__ && this.paper.__set__.exclude(this), a.eve.unbind('raphael.*.*.' + this.id), a._tear(this, this.paper), this.node.parentNode.removeChild(this.node), this.shape && this.shape.parentNode.removeChild(this.shape); for (var b in this) this[b] = 'function' == typeof this[b] ? a._removedFactory(b) : null; this.removed = !0; } }, E.attr = function (c, d) { if (this.removed) return this; if (null == c) { var e = {}; for (var f in this.attrs) this.attrs[b](f) && (e[f] = this.attrs[f]); return e.gradient && 'none' == e.fill && (e.fill = e.gradient) && delete e.gradient, e.transform = this._.transform, e; } if (null == d && a.is(c, 'string')) { if (c == j && 'none' == this.attrs.fill && this.attrs.gradient) return this.attrs.gradient; for (var g = c.split(k), h = {}, i = 0, m = g.length; m > i; i++)c = g[i], c in this.attrs ? h[c] = this.attrs[c] : a.is(this.paper.customAttributes[c], 'function') ? h[c] = this.paper.customAttributes[c].def : h[c] = a._availableAttrs[c]; return m - 1 ? h : h[g[0]]; } if (this.attrs && null == d && a.is(c, 'array')) { for (h = {}, i = 0, m = c.length; m > i; i++)h[c[i]] = this.attr(c[i]); return h; } var n; null != d && (n = {}, n[c] = d), null == d && a.is(c, 'object') && (n = c); for (var o in n) l('raphael.attr.' + o + '.' + this.id, this, n[o]); if (n) { for (o in this.paper.customAttributes) if (this.paper.customAttributes[b](o) && n[b](o) && a.is(this.paper.customAttributes[o], 'function')) { var p = this.paper.customAttributes[o].apply(this, [].concat(n[o])); this.attrs[o] = n[o]; for (var q in p) p[b](q) && (n[q] = p[q]); } n.text && 'text' == this.type && (this.textpath.string = n.text), B(this, n); } return this; }, E.toFront = function () { return !this.removed && this.node.parentNode.appendChild(this.node), this.paper && this.paper.top != this && a._tofront(this, this.paper), this; }, E.toBack = function () { return this.removed ? this : (this.node.parentNode.firstChild != this.node && (this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild), a._toback(this, this.paper)), this); }, E.insertAfter = function (b) { return this.removed ? this : (b.constructor == a.st.constructor && (b = b[b.length - 1]), b.node.nextSibling ? b.node.parentNode.insertBefore(this.node, b.node.nextSibling) : b.node.parentNode.appendChild(this.node), a._insertafter(this, b, this.paper), this); }, E.insertBefore = function (b) { return this.removed ? this : (b.constructor == a.st.constructor && (b = b[0]), b.node.parentNode.insertBefore(this.node, b.node), a._insertbefore(this, b, this.paper), this); }, E.blur = function (b) { var c = this.node.runtimeStyle, d = c.filter; return d = d.replace(r, o), 0 !== +b ? (this.attrs.blur = b, c.filter = d + n + m + '.Blur(pixelradius=' + (+b || 1.5) + ')', c.margin = a.format('-{0}px 0 0 -{0}px', f(+b || 1.5))) : (c.filter = d, c.margin = 0, delete this.attrs.blur), this; }, a._engine.path = function (a, b) { var c = F('shape'); c.style.cssText = t, c.coordsize = u + n + u, c.coordorigin = b.coordorigin; var d = new D(c, b), e = { fill: 'none', stroke: '#000' }; a && (e.path = a), d.type = 'path', d.path = [], d.Path = o, B(d, e), b.canvas.appendChild(c); var f = F('skew'); return f.on = !0, c.appendChild(f), d.skew = f, d.transform(o), d; }, a._engine.rect = function (b, c, d, e, f, g) { var h = a._rectPath(c, d, e, f, g), i = b.path(h), j = i.attrs; return i.X = j.x = c, i.Y = j.y = d, i.W = j.width = e, i.H = j.height = f, j.r = g, j.path = h, i.type = 'rect', i; }, a._engine.ellipse = function (a, b, c, d, e) { { var f = a.path(); f.attrs; } return f.X = b - d, f.Y = c - e, f.W = 2 * d, f.H = 2 * e, f.type = 'ellipse', B(f, { cx: b, cy: c, rx: d, ry: e }), f; }, a._engine.circle = function (a, b, c, d) { { var e = a.path(); e.attrs; } return e.X = b - d, e.Y = c - d, e.W = e.H = 2 * d, e.type = 'circle', B(e, { cx: b, cy: c, r: d }), e; }, a._engine.image = function (b, c, d, e, f, g) { var h = a._rectPath(d, e, f, g), i = b.path(h).attr({ stroke: 'none' }), k = i.attrs, l = i.node, m = l.getElementsByTagName(j)[0]; return k.src = c, i.X = k.x = d, i.Y = k.y = e, i.W = k.width = f, i.H = k.height = g, k.path = h, i.type = 'image', m.parentNode == l && l.removeChild(m), m.rotate = !0, m.src = c, m.type = 'tile', i._.fillpos = [d, e], i._.fillsize = [f, g], l.appendChild(m), z(i, 1, 1, 0, 0, 0), i; }, a._engine.text = function (b, d, e, g) { var h = F('shape'), i = F('path'), j = F('textpath'); d = d || 0, e = e || 0, g = g || '', i.v = a.format('m{0},{1}l{2},{1}', f(d * u), f(e * u), f(d * u) + 1), i.textpathok = !0, j.string = c(g), j.on = !0, h.style.cssText = t, h.coordsize = u + n + u, h.coordorigin = '0 0'; var k = new D(h, b), l = { fill: '#000', stroke: 'none', font: a._availableAttrs.font, text: g }; k.shape = h, k.path = i, k.textpath = j, k.type = 'text', k.attrs.text = c(g), k.attrs.x = d, k.attrs.y = e, k.attrs.w = 1, k.attrs.h = 1, B(k, l), h.appendChild(j), h.appendChild(i), b.canvas.appendChild(h); var m = F('skew'); return m.on = !0, h.appendChild(m), k.skew = m, k.transform(o), k; }, a._engine.setSize = function (b, c) { var d = this.canvas.style; return this.width = b, this.height = c, b == +b && (b += 'px'), c == +c && (c += 'px'), d.width = b, d.height = c, d.clip = 'rect(0 ' + b + ' ' + c + ' 0)', this._viewBox && a._engine.setViewBox.apply(this, this._viewBox), this; }, a._engine.setViewBox = function (b, c, d, e, f) { a.eve('raphael.setViewBox', this, this._viewBox, [b, c, d, e, f]); var g, h, i = this.getSize(), j = i.width, k = i.height; return f && (g = k / e, h = j / d, j > d * g && (b -= (j - d * g) / 2 / g), k > e * h && (c -= (k - e * h) / 2 / h)), this._viewBox = [b, c, d, e, !!f], this._viewBoxShift = { dx: -b, dy: -c, scale: i }, this.forEach(function (a) { a.transform('...'); }), this; }; var F; a._engine.initWin = function (a) { var b = a.document; b.styleSheets.length < 31 ? b.createStyleSheet().addRule('.rvml', 'behavior:url(#default#VML)') : b.styleSheets[0].addRule('.rvml', 'behavior:url(#default#VML)'); try { !b.namespaces.rvml && b.namespaces.add('rvml', 'urn:schemas-microsoft-com:vml'), F = function (a) { return b.createElement('<rvml:' + a + ' class="rvml">'); }; } catch (c) { F = function (a) { return b.createElement('<' + a + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">'); }; } }, a._engine.initWin(a._g.win), a._engine.create = function () { var b = a._getContainer.apply(0, arguments), c = b.container, d = b.height, e = b.width, f = b.x, g = b.y; if (!c) throw new Error('VML container not found.'); var h = new a._Paper, i = h.canvas = a._g.doc.createElement('div'), j = i.style; return f = f || 0, g = g || 0, e = e || 512, d = d || 342, h.width = e, h.height = d, e == +e && (e += 'px'), d == +d && (d += 'px'), h.coordsize = 1e3 * u + n + 1e3 * u, h.coordorigin = '0 0', h.span = a._g.doc.createElement('span'), h.span.style.cssText = 'position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;', i.appendChild(h.span), j.cssText = a.format('top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden', e, d), 1 == c ? (a._g.doc.body.appendChild(i), j.left = f + 'px', j.top = g + 'px', j.position = 'absolute') : c.firstChild ? c.insertBefore(i, c.firstChild) : c.appendChild(i), h.renderfix = function () { }, h; }, a.prototype.clear = function () { a.eve('raphael.clear', this), this.canvas.innerHTML = o, this.span = a._g.doc.createElement('span'), this.span.style.cssText = 'position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;', this.canvas.appendChild(this.span), this.bottom = this.top = null; }, a.prototype.remove = function () { a.eve('raphael.remove', this), this.canvas.parentNode.removeChild(this.canvas); for (var b in this) this[b] = 'function' == typeof this[b] ? a._removedFactory(b) : null; return !0; }; var G = a.st; for (var H in E) E[b](H) && !G[b](H) && (G[H] = function (a) { return function () { var b = arguments; return this.forEach(function (c) { c[a].apply(c, b); }); }; }(H)); } }), function (a, b) { if ('function' == typeof define && define.amd) define('raphael', ['raphael.core', 'raphael.svg', 'raphael.vml'], function (c) { return a.Raphael = b(c); }); else if ('object' == typeof exports) { var c = require('raphael.core'); require('raphael.svg'), require('raphael.vml'), module.exports = b(c); } else a.Raphael = b(a.Raphael); }(this, function (a) { return a.ninja(); });