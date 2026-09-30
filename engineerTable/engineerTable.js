/* EngineerTable - a HighQ plugin

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

*/

var engineerTableVersion = '5.0.0';

function engineerTable(tableOptions, parentElement) {
    let uuid;
    if (tableOptions.tableElement) {
        uuid = tableOptions.tableElement;
    } else if (tableOptions.container) {
        uuid = tableOptions.container;
    } else {
        throw new Error('"container" option is required - create a div with a unique id');
    }
    if (!tableOptions.iSheetViewLink) {
        try {
            tableOptions.iSheetViewLink = engineercore_getLink(uuid);
        } catch (error) {
            console.warn('Cannot use getLink, requires engineerCore version 1.2.1');
        }
    }
    if (tableOptions.linkClass) {
        try {
            tableOptions.iSheetViewLink = engineercore_getLinkByClass(tableOptions.linkClass);
        } catch (error) {
            console.warn('Cannot use getLinkByClass');
        }
    }
    if (!tableOptions.iSheetViewLink) {
        throw new Error('Unable to locate an iSheetViewLink');
    }
    if ($e('#' + uuid + ' .el-loading').length < 1) {
        let $elloader = $e('<img>')
            .addClass('el-loading')
            .attr('title', 'Loading...')
            .attr('src', './images/gray-loader.gif');
        $e('#' + uuid).append($elloader);
    } else {
        $e('#' + uuid + ' .el-loading').show();
    }

    // Passes the sheet view XML link the support function and uses a callback to build the table.
    engineercore_loadDoc(tableOptions.iSheetViewLink, parseiSheet);
    function parseiSheet(xmlDoc) {
        let xmlObj = engineercore_xmlToObj(xmlDoc);
        buildTable(xmlObj, tableOptions, parentElement);
    }
}

function EngineerTable(tableOptions) {
    engineerTable(tableOptions);
}

if (!window.engineerLegalPlugins) {
    window.engineerLegalPlugins = {};
}
if (!window.engineerLegalPlugins.table) {
    window.engineerLegalPlugins.table = { status: 1, version: engineerTableVersion };
} else if (!window.engineerLegalPlugins.table.version) {
    window.engineerLegalPlugins.table.version = engineerTableVersion;
}

// Global reference to allow call from generated HTML buttons
window.engineerLegalPlugins.table.buildFoldSection = window.engineerLegalPlugins.table.buildFoldSection === undefined ? new Map() : window.engineerLegalPlugins.table.buildFoldSection;

/**
 * Takes the Object containing the iSheet XML data and builds a table from it.
 */
function buildTable(xmlObj, tableOptions, parentElement) {
    // Create table options object from custom user options.
    class TableOptions {
        constructor(customOptions) {
            // Required options.
            this.tableElement = customOptions.tableElement ? customOptions.tableElement : null;
            if (this.tableElement === null) {
                this.tableElement = customOptions.container ? customOptions.container : null;
            }
            if (this.tableElement === null) { throw new Error('"container" option is required - create a div with a unique id'); }
            this.iSheetViewLink = customOptions.iSheetViewLink;
            this.viewLink = customOptions.viewLink ? customOptions.viewLink : customOptions.iSheetViewLink;
            this.editLink = customOptions.editLink ? customOptions.editLink : customOptions.iSheetViewLink;
            // Dynamic options from required params.
            this.iSheetViewUrl = new URL(this.iSheetViewLink);
            this.siteID = this.iSheetViewUrl.searchParams.get('metaData.siteID');
            this.sheetID = this.iSheetViewUrl.searchParams.get('metaData.sheetId');
            this.sheetViewID = this.iSheetViewUrl.searchParams.get('metaData.sheetViewID');
            this.highqAPIVersion = 20;
            this.headerColor = customOptions.headerColor ? customOptions.headerColor : '#fff';
            this.headerTextColor = customOptions.headerTextColor ? customOptions.headerTextColor : '#343434';
            this.showHeaders = customOptions.showHeaders ? customOptions.showHeaders : 'true';
            this.stickyHeaders = customOptions.stickyHeaders ? customOptions.stickyHeaders : 'false';
            this.tableHeight = customOptions.tableHeight ? customOptions.tableHeight : null;
            this.showLastModified = customOptions.showLastModified ? customOptions.showLastModified : 'false';
            this.recordLimit = customOptions.recordLimit ? Number.parseInt(customOptions.recordLimit, 10) : 0;
            // recordLimitOverride will display all records even if File/Folder links or attachments are present.
            this.recordLimitOverride = customOptions.recordLimitOverride ? customOptions.recordLimitOverride : 'false';
            this.selectedColumns = customOptions.selectedColumns ? customOptions.selectedColumns.split(',') : [];
            this.selectedRows = customOptions.selectedRows ? customOptions.selectedRows.split(',') : [];
            this.rowButtonText = customOptions.rowButtonText ? customOptions.rowButtonText : 'More Details';
            this.rowButtonWidth = customOptions.rowButtonWidth ? Number.parseInt(customOptions.rowButtonWidth, 10) : 100;
            this.defaultColWidth = customOptions.defaultColWidth ? Number.parseInt(customOptions.defaultColWidth, 10) : 150;
            this.contactCardWidth = customOptions.contactCardWidth ? Number.parseInt(customOptions.contactCardWidth, 10) : 300;
            this.verticalAlign = customOptions.verticalAlign ? customOptions.verticalAlign : 'false';
            this.freezeColumns = customOptions.freezeColumns ? Number.parseInt(customOptions.freezeColumns) : 0;
            this.debug = customOptions.debug ? customOptions.debug : null;
            this.debugURL = customOptions.debugURL ? customOptions.debugURL : null;
            this.noDataText = customOptions.noDataText ? customOptions.noDataText : 'No data to display';
            this.quickFilter = customOptions.quickFilter ? customOptions.quickFilter : 'false';
            this.quickFilterPlaceholder = customOptions.quickFilterPlaceholder ? customOptions.quickFilterPlaceholder : 'Quick Filter';
            this.quickFilterButtonText = customOptions.quickFilterButtonText ? customOptions.quickFilterButtonText : 'Filter';
            this.quickFilterClearText = customOptions.quickFilterClearText ? customOptions.quickFilterClearText : 'Clear';
            this.filterNoResultCallback = customOptions.filterNoResultCallback ? customOptions.filterNoResultCallback : function (filterTerm) { alert('Filter value ' + filterTerm + ' not found'); };
            this.useSelector = customOptions.useSelector ? customOptions.useSelector.split(',') : []; //set by other Engineer.Legal library
            this.overrideSelector = customOptions.overrideSelector ? customOptions.overrideSelector : '';
            this.appendSelector = customOptions.appendSelector ? customOptions.appendSelector : '';
            this.contactsMode = customOptions.contactsMode ? customOptions.contactsMode : 'false';
            this.contactImageWidth = customOptions.contactImageWidth ? customOptions.contactImageWidth : '46px';
            this.contactPlaceholder = customOptions.contactPlaceholder ? customOptions.contactPlaceholder : './images/griffin/socialdealroom/avatar_v4/32avatar.png';
            this.contactCards = customOptions.contactCards !== undefined ? customOptions.contactCards : 'true';
            this.flexColumns = customOptions.flexColumns ? customOptions.flexColumns : 'true';
            // collapse empty "row", "column" or "both"
            this.collapse = customOptions.collapse ? customOptions.collapse : 'false';
            // crop - trim the contact card with CSS ellipsis, wrap - wrap overflow to next line or flex - allow overflow and enable scroll
            this.contactCardStyle = customOptions.contactCardStyle ? customOptions.contactCardStyle : 'crop';
            if (this.contactCardStyle == 'flex') {
                this.flexColumns = 'false';
            }
            if (this.freezeColumns > 0) {
                this.flexColumns = 'false';
            }
            this.topScrollbar = customOptions.topScrollbar ? customOptions.topScrollbar : 'true';
            this.requireXmlGrid = customOptions.requireXmlGrid ? customOptions.requireXmlGrid : false;
            this.recordLinks = customOptions.recordLinks ? customOptions.recordLinks : 'false';
            this.recordMenu = customOptions.recordMenu ? customOptions.recordMenu : [];
            this.menuViewIsheetTitle = customOptions.menuViewIsheetTitle ? customOptions.menuViewIsheetTitle : 'View in iSheet';
            this.menuViewDefaultTitle = customOptions.menuViewDefaultTitle ? customOptions.menuViewDefaultTitle : 'View in iSheet Default View';
            this.menuViewItemTitle = customOptions.menuViewItemTitle ? customOptions.menuViewItemTitle : 'View';
            this.menuPrintTitle = customOptions.menuPrintTitle ? customOptions.menuPrintTitle : 'Print';
            this.menuEditTitle = customOptions.menuEditTitle ? customOptions.menuEditTitle : 'Edit';
            this.menuEditModalTitle = customOptions.menuEditModalTitle ? customOptions.menuEditModalTitle : 'Edit';

            this.addItemButton = customOptions.addItemButton ? customOptions.addItemButton : 'false';
            this.addItemTitle = customOptions.addItemTitle ? customOptions.addItemTitle : 'Add Record';

            this.showApiIds = customOptions.showApiIds ? customOptions.showApiIds : 'false';
            this.showAPIPayloads = customOptions.showAPIPayloads ? customOptions.showAPIPayloads : 'false';
            this.useHighQAPIFunctions = customOptions.useHighQAPIFunctions ? customOptions.useHighQAPIFunctions : 'false';
            if (this.recordLinks == 'editInline' || this.recordMenu.includes('editInline')) {
                this.showApiIds = 'true';
                this.inlineEdit = true;
            }
            this.pdfOptions = customOptions.pdfOptions ? customOptions.pdfOptions : {};
            if (this.recordLinks == 'fillPDF' || this.recordMenu.includes('fillPDF')) {
                this.showApiIds = 'true';
                this.fillPDF = true;
                if ($e.isEmptyObject(this.pdfOptions)) {
                    console.error('PDF options are required for fillPDF');
                }
            }
            //comma separated array of column names
            this.inlineEditColumns = customOptions.inlineEditColumns ? customOptions.inlineEditColumns.split(',') : [];
            this.inlineEditBlacklist = customOptions.inlineEditBlacklist ? customOptions.inlineEditBlacklist.split(',') : [];
            if (customOptions.compareMode) {
                this.compareMode = customOptions.compareMode;
            } else if (customOptions.transposeTable) {
                this.compareMode = customOptions.transposeTable;
            } else {
                this.compareMode = 'false';
            }
            if (this.freezeColumns > 0 && this.compareMode != 'false') {
                this.freezeColumns = 0;
                this.transposeFreeze = true;
            }
            this.transposeButtonPosition = customOptions.transposeButtonPosition ? customOptions.transposeButtonPosition : 'bottom'; //top, bottom
            this.buttonTab = customOptions.buttonTab ? customOptions.buttonTab : 'blank'; //blank,self,modal
            this.modalWidth = customOptions.modalWidth ? customOptions.modalWidth : '1000';
            this.modalHeight = customOptions.modalHeight ? customOptions.modalHeight : '500';
            this.editModalWidth = customOptions.editModalWidth ? customOptions.editModalWidth : '650';
            this.editModalHeight = customOptions.editModalHeight ? customOptions.editModalHeight : '768';
            this.editInlineHeight = customOptions.editInlineHeight ? customOptions.editInlineHeight : 'auto';
            this.exportButton = customOptions.exportButton ? customOptions.exportButton : 'false';
            this.exportOptions = customOptions.exportOptions ? customOptions.exportOptions : {};
            // If option `foldSection` is set, change `recordLinks` to "fold" and create `foldSections` array.
            this.foldSection = customOptions.foldSection ? customOptions.foldSection : null;
            this.recordLinks = this.foldSection ? 'fold' : this.recordLinks;
            this.foldSections = this.foldSection ? this.foldSection.split(',') : [];
            // Images in choice columns need to be pulled from the xml render grid,
            // limiting the number of records pulled to 100. If required this flag must be set to true.
            this.choiceImages = customOptions.choiceImages ? customOptions.choiceImages : 'false';
            this.groupHeaders = customOptions.groupHeaders ? customOptions.groupHeaders : 'false';
            this.watermarkText = customOptions.watermarkText ? customOptions.watermarkText : '';
            this.watermarkColor = customOptions.watermarkColor ? customOptions.watermarkColor : 'lightgray';
            this.watermarkSize = customOptions.watermarkSize ? customOptions.watermarkSize : '4px';
            this.watermarkRotation = customOptions.watermarkRotation ? customOptions.watermarkRotation : '-35deg';
            this.linkTab = customOptions.linkTab ? customOptions.linkTab : 'blank';
            this.filterId = customOptions.filterId ? customOptions.filterId : null;
            this.filterColumn = customOptions.filterColumn ? customOptions.filterColumn : 'false';
            this.filterTerm = customOptions.filterTerm ? customOptions.filterTerm.toUpperCase() : [];
            this.filterTermFuzzy = customOptions.filterTermFuzzy ? customOptions.filterTermFuzzy : 'false';
            this.sortColumn1 = customOptions.sortColumn1 ? customOptions.sortColumn1 : null;
            this.sortColumn2 = customOptions.sortColumn2 ? customOptions.sortColumn2 : null;
            this.sortColumn3 = customOptions.sortColumn3 ? customOptions.sortColumn3 : null;
            this.sortOrder1 = customOptions.sortOrder1 ? customOptions.sortOrder1 : 'a';
            this.sortOrder2 = customOptions.sortOrder2 ? customOptions.sortOrder2 : 'a';
            this.sortOrder3 = customOptions.sortOrder3 ? customOptions.sortOrder3 : 'a';
            this.userSort = customOptions.userSort ? customOptions.userSort : 'false';
            this.truncateText = Number.parseInt(customOptions.truncateText) ? customOptions.truncateText : null;
            this.showMoreTitle = customOptions.showMoreTitle ? customOptions.showMoreTitle : 'Show More';
            this.showLessTitle = customOptions.showLessTitle ? customOptions.showLessTitle : 'Show Less';
            this.clickHighlight = customOptions.clickHighlight ? customOptions.clickHighlight : 'false';

            this.sumColumns = customOptions.sumColumns ? customOptions.sumColumns.split(',') : [];
            this.sumColumnsPrefix = customOptions.sumColumnsPrefix ? customOptions.sumColumnsPrefix : 'Total: ';
            this.meanColumns = customOptions.meanColumns ? customOptions.meanColumns.split(',') : [];
            this.meanColumnsPrefix = customOptions.meanColumnsPrefix ? customOptions.meanColumnsPrefix : 'Mean: ';
            this.meanIgnoreBlanks = customOptions.meanIgnoreBlanks ? customOptions.meanIgnoreBlanks : 'true';
            this.mathColumns = [];
            if (this.sumColumns.length > 0 || this.meanColumns.length > 0) {
                this.mathColumns = [...new Set([...this.sumColumns, ...this.meanColumns])];
            }
            if (this.compareMode != 'false' && this.mathColumns.length > 0) {
                this.sumColumns = [];
                this.meanColumns = [];
                this.mathColumns = [];
                console.warn('sumColumns and meanColumns is not currently compatible with transposeTable');
            }
            // headerMessage option allowing join to display join from data etc.
            this.headerMessage = customOptions.headerMessage ? customOptions.headerMessage : null;
            this.numberAlign = customOptions.numberAlign ? customOptions.numberAlign : 'right';
            this.editReload = customOptions.editReload ? customOptions.editReload : 'true';
            this.parentPlugin = customOptions.parentPlugin ? customOptions.parentPlugin : null;

            this.progressColumns = customOptions.progressColumns ? customOptions.progressColumns.split(',') : [];
            this.progressColorComplete = customOptions.progressColorComplete ? customOptions.progressColorComplete : '#50bb50';
            this.progressColor = customOptions.progressColor ? customOptions.progressColor : '#7dabbf';
            this.progressColorExceeded = customOptions.progressColorExceeded ? customOptions.progressColorExceeded : '#e77171';
            this.progress3d = customOptions.progress3d ? customOptions.progress3d : true;
            this.choiceBadges = customOptions.choiceBadges ? customOptions.choiceBadges : 'true';
            this.showDefaultChoiceBadges = customOptions.showDefaultChoiceBadges ? customOptions.showDefaultChoiceBadges : 'false';
            this.trimChoiceBadges = customOptions.trimChoiceBadges ? customOptions.trimChoiceBadges : 'false';

            this.awaitJoin = customOptions.awaitJoin ? customOptions.awaitJoin : 'false';
            this.joinTable = customOptions.joinTable ? customOptions.joinTable : null;
            this.joinColumn = customOptions.joinColumn ? customOptions.joinColumn : null;
            this.joins = customOptions.joins ? customOptions.joins : []; //e.g. ['tasks_containerid':'View Tasks','contacts_containerid':'View Contacts']
            this.joinAll = customOptions.joinAll ? customOptions.joinAll : []; //e.g. [{'Drilldown':['contacts_containerid','tasks_containerid']}]'
            if (this.joins.length > 0 || this.recordMenu.length > 0) {
                if (this.recordLinks != 'false' && this.recordLinks != 'menu') {
                    if (!this.recordMenu.includes(this.recordLinks)) {
                        this.recordMenu.push(this.recordLinks);
                    }
                }
                this.recordLinks = 'menu';
                this.rowButtonText = '▼';
                this.rowButtonWidth = '38';
            }
            this.openModal = customOptions.openModal ? customOptions.openModal : null;
            this.onRender = customOptions.onRender ? customOptions.onRender : function (tableid) { };
            this.onDataLoad = customOptions.onDataLoad ? customOptions.onDataLoad : function (data) { return data; };
            this.parsed = true;
        }
    }
    let options;
    const frozen = 'frozen';
    const cellPaddingLR = 4;
    const borderSpacing = 0;
    let contactCardEventsBound = false;
    let activeContactPopup = null;
    let activeContactLink = null;
    if (tableOptions.parsed) {
        options = tableOptions;
    } else {
        options = new TableOptions(tableOptions);
    }
    xmlObj = options.onDataLoad(xmlObj);
    options.parsedData = xmlObj;
    if (options.debug) {
        console.log('EngineerTable Debug Mode');
        console.log('Options:', options);
        console.log('XML Object:', xmlObj);
    }
    let topMessage = options.headerMessage;
    if (options.filterTerm && options.filterTerm.length > 0) {
        if (topMessage) {
            topMessage = 'Filtered: "' + options.filterTerm + '" - ' + topMessage;
        } else {
            topMessage = 'Filtered: "' + options.filterTerm + '"';
        }
    }
    checkCreateGlobalTables();
    window.engineerLegalPlugins.table[options.tableElement] = options;
    if (options.inlineEdit) {
        getAPIColumnDetails();
    }
    if (options.fillPDF) {
        if (typeof engineerPDF === 'undefined') {
            try {
                engineercore_load('pdf').then(function () {
                    console.log('engineerPDF imported successfully');
                });
            } catch (error) {
                console.error('engineerPDF not loaded' + error);
                if (options.recordLinks == 'fillPDF') {
                    options.recordLinks = '';
                } else if (options.recordMenu.indexOf('fillPDF') > -1) {
                    options.recordMenu[options.recordMenu.indexOf('fillPDF')] = '';
                }
            }
        }
    }
    if (options.awaitJoin == 'true') {
        hideLoading();
        console.log('Table awaiting join: ' + options.tableElement);
        return;
    }
    if ($e('#engineertablestyles').length == 0) {
        $e('<style id=engineertablestyles>.engineerContainer,.engineerContainer .table{position:relative}.engineerContainer table, .engineerContainer tr, .engineerContainer td{border-collapse: collapse;}.engTableFixed{overflow-y:scroll}.engTableFixed .table{table-layout:fixed!important}.engineerContainer .table>thead>tr>th,.table>tbody>tr>td{padding:6px ' + cellPaddingLR + 'px;border-spacing:' + borderSpacing + 'px}.engineerContainer th{z-index:1}.engineerContainer .table tbody tr .engFoldCol{column-count:2;column-gap:10px}.engineerContainer .table tbody tr .engFoldCol .engFoldPanel{margin:0 0 1em;width:100%;page-break-inside:avoid;break-inside:avoid;-webkit-column-break-inside:avoid}.engineerContainer .table tbody tr .engFoldCol .engFoldPanel .panel-heading pre{color:#000!important}.engineerContainer .table tbody tr .engFoldCol .engFoldBody{display:inline-block}.eng-table-export{float:right}.engineerContainer .contactsModeImage{float:left;width:46px;margin-right:3px}.engineer-table-contact-details p{margin:0}.contacts-crop{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.contacts-wrap{overflow:visible;line-break:anywhere}.contacts-flex{overflow-x:auto;scrollbar-width:thin;text-wrap:nowrap}.table-menu-button{background-color:#fff}.engineerContainer a:hover,.engineerContainer a:focus,.engtable-menu a:hover,.engtable-menu a:focus{text-decoration:none}.edit-hide{display:none}.engtable-menu{display:flex; margin:2px 0px;}.engtable-menu .btn{margin-right:5px}.table-progress{padding:2px 2px 1px 2px;border:solid 2px #686868;font-weight:600;border-radius:10px;text-shadow:0 0 5px #fff}.frozen{position:sticky;background-color:#eee!important;z-index:2}th.frozen{z-index:3}.form-control.multi-select{margin-right:2px;height:53px;overflow:revert;background-image:none}.form-control.multi-select:hover{height:100px}.el-loading{width:20px}.el-menu-item{height:32px}.el-message{margin:0;padding:4px 5px;overflow:auto;min-height:32px;}.el-message:before{display:none}.engineerContainer a.el-table-showmore{background-color:transparent;}.engineerContainer td.eng-table-button-cell{padding: 10px 0px;z-index:50;text-align: center;}.btn.inline-save,.btn.inline-cancel{margin-right:2px; height:34px; width:36px;} .engineerContainer .imgIcon{width: 18px} .engineerContainer a.icon-cross { color: red; }tr.clicked {backdrop-filter: brightness(0.95);} .eng-contact-link{text-decoration:underline}.eng-sort-icons{cursor:pointer;filter:saturate(0.1)}.el-file-link{display:block;margin-bottom: 2px;}.el-file-link:hover{text-decoration:underline!important}.el-file-link>.icon-folder{height:15px;font-size:15px;padding-right:2px}.el-file-link>.imgIcon{margin-bottom:0px;padding-right:2px}.user-chip{padding:4px;cursor:default;font-weight:normal}</style>').appendTo('head');
    }
    if (options.trimChoiceBadges == 'true') {
        $e('#engineertablestyles').append('<style>.engineerContainer .badge{overflow: hidden;max-width: -webkit-fill-available;text-overflow: ellipsis;}</style>');
    } else {
        $e('#engineertablestyles').append('<style>.engineerContainer .badge{max-width: -webkit-fill-available; white-space: break-spaces;}</style>');
    }

    if (options.verticalAlign != 'false') {
        if ($e('#' + options.tableElement + 'engineertablestyles').length == 0) {
            $e('<style id=' + options.tableElement + 'engineertablestyles>.engineerContainer td{vertical-align:' + options.verticalAlign + ' !important}</style>').appendTo('head');
        }
    }
    // Table view from loaded XML data.
    class TableView {
        constructor() {
            // Table state.
            this.columns = new Map();
            this.rows = [];
            this.selectedColumns = options.selectedColumns;
            this.selectedRows = options.selectedRows;
            this.rowReset = [];
            this.fileLinkMap = [];
            this.fileLinkObj = {};
            this.totalWidth = 0;
            this.recordsCount = xmlObj.view.recordCount;
            this.xmlGridObj = null;
            this.selector = options.overrideSelector ? options.overrideSelector : options.appendSelector;
            // Contacts mode state.
            this.isContactsMode = options.contactsMode == 'true';
            this.contactCardFields = ['First Name', 'Last Name', 'Role', 'Title', 'Email', 'Image', 'Telephone', 'Mobile', 'Tel', 'Cell', 'Notes'];
            // HTML table content.
            this.tableContainer = $e('<div>');
            this.table = $e('<table>');
            this.columnsContent = [];
            this.rowsContent = [];
            this.maxColSpan = 0;
            this.headId = '';
            this.setRootContainer();
            this.setSelectedColumns();
            this.setTableCssSelectors();
        }

        setRootContainer() {
            if (options.tableElement) {
                this.callElement = $e('#' + options.tableElement);
                if (this.callElement === undefined) {
                    throw new Error('Destination element does not exists.');
                }
            } else if (parentElement) {
                this.callElement = $e('#' + parentElement);
            } else {
                throw new Error('No destination element specified.');
            }
            this.id = this.callElement.attr('id');
            this.headId = this.id + ' .engineerContainer thead';
            if ($e('#engTableContainer' + this.id).length > 0) {
                this.tableContainer = $e('#engTableContainer' + this.id);
            }
            if ($e('#engTable' + this.id).length > 0) {
                this.table = $e('#engTable' + this.id);
            }
        }

        setSelectedColumns() {
            if (this.selectedColumns.length == 0) {
                for (let i = 0; i < xmlObj.view.head.headColumn.length; i++) {
                    this.selectedColumns.push(i.toString());
                }
            }
            // Clean fold sections array string that have override selectors.
            if (this.selector.length > 0) {
                for (let i = 0; i < options.foldSections.length; i++) {
                    options.foldSections[i] = options.foldSections[i].replace(this.selector, '');
                }
            }
        }

        setTableCssSelectors() {
            this.tableContainer.addClass('engineerContainer')
                .attr('id', 'engTableContainer' + this.id);
            this.table.addClass('table engTableSticky')
                .attr('id', 'engTable' + this.id)
                .attr('data-sheetid', options.sheetID)
                .attr('data-viewid', options.sheetViewID);
            if (options.watermarkText.length > 0) {
                this.table.className += ' engineerTableWatermark';
            }
            if (options.tableHeight) {
                this.tableContainer.css('max-height', options.tableHeight)
                    .css('overflow-y', 'auto');
            }
            if (options.compareMode == 'true') {
                this.tableContainer.css('overflow-x', 'auto');
            }
        }

        isRowVisible(rowIndex) {
            let filteredOut, userMulti;
            let filterColumnValue = '';
            let filterArray = [];
            if (options.filterColumn != 'false' && options.filterTerm.length > 0) {
                let cellContent = xmlObj.view.data.item[rowIndex].column[options.filterColumn];
                if (cellContent.displayData.lookupuser !== undefined) {
                    if (cellContent.displayData.lookupuser.userDisplayName !== undefined) {
                        filterColumnValue = cellContent.displayData.lookupuser.email.cdata;
                    } else {
                        cellContent.displayData.lookupuser.forEach(user => {
                            filterArray.push(user.email.cdata.toUpperCase());
                            userMulti = true;
                        });
                    }
                } else {
                    filterColumnValue = cellContent.displayData.cdata;
                }
                if (filterColumnValue) {
                    filterColumnValue = filterColumnValue.toUpperCase();
                    if (options.filterTermFuzzy == 'false') {
                        if (filterColumnValue != options.filterTerm) {
                            filteredOut = true;
                        }
                    } else if (!filterColumnValue.includes(options.filterTerm)) {
                        filteredOut = true;
                    }
                } else if (userMulti) {
                    if (!filterArray.includes(options.filterTerm)) {
                        filteredOut = true;
                    }
                }
                else {
                    filteredOut = true;
                }
            } else if (options.filterId) {
                let filterValue = xmlObj.view.data.item[rowIndex].itemID.cdata;
                if (filterValue != options.filterId) {
                    filteredOut = true;
                }
            }

            if (!filteredOut) {
                return true;
            }
        }
    }
    let tView = new TableView();
    // Transform and render HTML table if not in edit mode.
    if ($e('.dashboardEdit').length == 0) {
        window.engineerLegalPlugins.table.buildFoldSection.set(tView.id + 'FoldFn', buildFoldSectionRow);
        buildTableViewHeader();
        setLastModifiedNotice();
        buildTableMenu();
        buildTableViewBody();
        if (options.sortColumn1) {
            sortTable();
        }
        overrideColumnsTableView();
        enableContactsModeTableView();
        transposeCompareModeTableView();
        renderHtmlTableView(tView);
        hideLoading();
        buildTable[options.tableElement] = {};
        buildTable[options.tableElement].openRowMenu = openRowMenu;
    }

    function checkCreateGlobalTables() {
        if (!window.engineerLegalPlugins.table) {
            window.engineerLegalPlugins.table = {};
        }
    }

    /**
     * Fills data for the html table thead from XML data.
     */
    function buildTableViewHeader() {
        const columnTypeMap = {
            'SHEET_COLUMN_TYPE_SINGLE_LINE_TEXT': 1,
            'SHEET_COLUMN_TYPE_MULTIPLE_LINE_TEXT': 2,
            'SHEET_COLUMN_TYPE_CHOICE': 3,
            'SHEET_COLUMN_TYPE_NUMBER': 4,
            'SHEET_COLUMN_TYPE_DATE_AND_TIME': 5,
            'SHEET_COLUMN_TYPE_ATTACHMENT': 9
        };
        // Calculate the total width of all the iSheet columns to build relative column widths.
        xmlObj.view.head.headColumn.forEach(function (item, colIndex) {
            let col = colIndex.toString();
            if (tView.selectedColumns.includes(col)) {
                if (!item.properties.property) {
                    tView.totalWidth += options.defaultColWidth;
                } else {
                    tView.totalWidth += Number.parseInt(item.properties.property['0'].cdata, 10);
                }
                if (options.contactsMode == 'true') {
                    tView.totalWidth += options.contactCardWidth;
                }
            }
        });
        // Parse each head column in the XML data.
        let groupHeader;
        let selecterBucket = -1;
        xmlObj.view.head.headColumn.forEach(function (item, colIndex) {
            // Set column reference object.
            const col = colIndex.toString();
            const columnValue = item.columnValue.cdata;
            const columnReference = {
                columnName: columnValue,
                headerGroupText: columnValue,
                columnID: item.columnid,
                type: columnTypeMap[item.columnTypeAlias],
                columnPos: col,
                relativeWidth: 0,
                fixedWidth: 0,
                recordLinksXMLColumn: -1,
                headerClass: '',
                headerCSSProperties: {},
                isVisible: false,
                xmlReference: item,
                sum: 0,
            };
            // Set column CSS class.
            columnReference.headerClass = 'engineertable-' + columnValue.replace(/[^/\sa-z0-9A-Z]/g, '').replace(/\s/g, '-').toLowerCase();
            // Set column inline headerStyles, it depends of variable XML data, so it cannot be set in a separated CSS file.
            columnReference.headerCSSProperties['background-color'] = options.headerColor;
            columnReference.headerCSSProperties['color'] = options.headerTextColor;
            // Set column relative width based in original XML column width.
            let relativeWidth = 0;
            let fixedWidth;
            if (!item.properties.property) {
                fixedWidth = options.defaultColWidth;
            } else {
                fixedWidth = Number.parseInt(item.properties.property['0'].cdata, 10);
            }
            if (Object.keys(item.properties).length > 0) {
                relativeWidth = Math.floor(fixedWidth / tView.totalWidth * 100);
            } else {
                // Add an exception for join columns which do not pass width property
                relativeWidth = Math.floor(options.defaultColWidth / tView.totalWidth * 100);
            }
            columnReference.relativeWidth = relativeWidth;
            columnReference.fixedWidth = fixedWidth;
            // Set column visibility given the `selectedColumns` and `foldSection` options.
            const foldColumnSearch = tView.selector.length > 0 ? columnValue.replace(tView.selector, '') : columnValue;
            columnReference.isVisible = (tView.selectedColumns.length == 0 || tView.selectedColumns.indexOf(col) > -1)
                && !options.foldSections.includes(foldColumnSearch);
            // Force loading of XMLGrid for some column types.
            const columnsIsLink = item.columnTypeAlias == 'SHEET_COLUMN_TYPE_DOCUMENT_LINK' || item.columnTypeAlias == 'SHEET_COLUMN_TYPE_FOLDER_LINK' || item.columnTypeAlias == 'SHEET_COLUMN_TYPE_ATTACHMENT' || item.columnTypeAlias == 'SHEET_COLUMN_TYPE_JOIN';
            const columnIsChoiceWithImages = (item.columnTypeAlias == 'SHEET_COLUMN_TYPE_CHOICE' && options.choiceImages) == 'true';
            if (columnsIsLink || columnIsChoiceWithImages) {
                options.requireXmlGrid = true;
                tView.fileLinkMap.push(columnReference);
            }
            // Group headers if option is true - remove choice column name from subsequent column titles
            if (options.groupHeaders == 'true') {
                if (options.useSelector.length < 1) {
                    if (['SHEET_COLUMN_TYPE_CHOICE', 'SHEET_COLUMN_TYPE_HYPERLINK'].includes(item.columnTypeAlias)) {
                        groupHeader = columnValue.toLowerCase();
                    } else {
                        let newColumnName = columnValue;
                        if (groupHeader && groupHeader.length != columnValue.toLowerCase().length) {
                            const groupHeaderStrIndex = columnValue.toLowerCase().indexOf(groupHeader);
                            if (groupHeaderStrIndex > 0) {
                                newColumnName = columnValue.substr(0, groupHeaderStrIndex)
                                    + columnValue.substr(groupHeaderStrIndex + groupHeader.length);
                            } else if (groupHeaderStrIndex == 0) {
                                newColumnName = columnValue.substr(groupHeaderStrIndex + groupHeader.length);
                            }
                            columnReference.headerGroupText = newColumnName;
                        }
                    }
                } else if (options.useSelector.includes(columnValue)) {
                    groupHeader = columnValue;
                    selecterBucket++;
                } else {
                    let newColumnName = columnValue;
                    if (selecterBucket > -1) {
                        const groupHeaderStrIndex = columnValue.indexOf(options.useSelector[selecterBucket]);
                        if (groupHeaderStrIndex > 0) {
                            newColumnName = columnValue.substr(0, groupHeaderStrIndex)
                                + columnValue.substr(groupHeaderStrIndex + options.useSelector[selecterBucket].length);
                        } else if (groupHeaderStrIndex == 0) {
                            newColumnName = columnValue.substr(groupHeaderStrIndex + options.useSelector[selecterBucket].length);
                        }
                        columnReference.headerGroupText = newColumnName;
                    }
                }

            }
            // Add column reference to the html table view object
            tView.columns.set(columnReference.columnName, columnReference);
            tView.columnsContent.push(columnReference.columnName);
        });
    }

    /**
     * Fills data for the html table tbody from XML data.
     */
    function buildTableViewBody() {
        tView.rows = [];
        tView.rowsContent = [];
        let rIndex = 0;
        if (xmlObj.view.data.item) {
            for (const element of xmlObj.view.data.item) {
                addRow(element);
            }
            window.engineerLegalPlugins.table[options.tableElement].tView = tView;
        }
        function addRow(xmlDataItem) {
            if (options.selectedRows.length > 0 && !options.selectedRows.includes(rIndex.toString())) {
                rIndex++;
                return;
            }
            let freezeCount = 0;
            const row = {};
            let freezeLeft = options.recordLinks == 'false' && !options.recordMenu.length ? borderSpacing : Number.parseInt(options.rowButtonWidth) + (borderSpacing * 2);//row button, plus button padding and border???, plus cell spacing either side
            xmlDataItem.column.forEach(addCell);
            function addCell(xmlDataItemColumn, colIndex) {
                const colName = xmlObj.view.head.headColumn[colIndex].columnValue.cdata;
                let className = '';
                let style = '';
                if (options.freezeColumns > 0 && freezeCount < options.freezeColumns && tView.columns.get(colName).isVisible) {
                    className = frozen;
                    style = 'left:' + freezeLeft + 'px;';
                    freezeLeft += (tView.columns.get(colName).fixedWidth + borderSpacing);
                    freezeCount++;
                }
                let cell = {
                    plainData: '',
                    rawData: [],
                    displayData: [],
                    style: style,
                    className: className,
                    columnTypeAlias: xmlObj.view.head.headColumn[colIndex].columnTypeAlias,
                    columnName: colName,
                    columnReference: tView.columns.get(colName),
                    columnIndex: colIndex,
                    rowIndex: rIndex,
                    itemid: xmlDataItem.itemID.cdata
                };
                cell.plainData = xmlDataItemColumn.cdata ? xmlDataItemColumn.cdata : '';
                cell.rawData = xmlDataItemColumn.rawData === undefined ? [] : xmlDataItemColumn.rawData;
                cell.displayData = xmlDataItemColumn.displayData === undefined ? [] : xmlDataItemColumn.displayData;
                row[colName] = cell;
            }
            tView.rows.push(row);
            addRowContent(row, rIndex);
            rIndex++;
        }

        function addRowContent(rowItem, rowIndex) {
            const row = {};
            for (let columnName in rowItem) {
                if (!rowItem[columnName]) {
                    continue;
                }
                row[columnName] = selectCellContent(rowItem[columnName], columnName, rowItem, rowIndex);
            }
            tView.rowsContent.push(row);
        }
    }

    /**
     * Replaces (or appends) some columns with another column value with the same name and
     * a prefix character defined by the option `overrideSelector` (or `appendSelector`).
     * 
     * For example: given two columns "Title" and "*Title", and given the
     * option `overrideSelector` with a value of `*`, this function will replace
     * the value of the column "Title" with the value of the column "*Title".
     * 
     */
    function overrideColumnsTableView() {
        const columnsToOverride = [];
        if (tView.selector.length == 0) {
            return;
        }
        xmlObj.view.head.headColumn.forEach(findOverridenColumn);
        function findOverridenColumn(overrideItem, overrideIndex) {
            if (overrideItem.columnValue.cdata.indexOf(tView.selector) > -1) {
                const overriddenColumnName = overrideItem.columnValue.cdata.replace(tView.selector, '');
                xmlObj.view.head.headColumn.forEach(function (sourceItem, sourceIndex) {
                    if (sourceItem.columnValue.cdata == overriddenColumnName) {
                        columnsToOverride.push({
                            from: overrideIndex,
                            to: sourceIndex,
                        });
                    }
                });
            }
        }
        columnsToOverride.forEach(overrideColumn);
        function overrideColumn(column) {
            const columnFrom = xmlObj.view.head.headColumn[column.from].columnValue.cdata;
            const columnTo = xmlObj.view.head.headColumn[column.to].columnValue.cdata;
            tView.columns.get(columnFrom).isVisible = false;
            tView.rowsContent.forEach(function (rowCells, rowIndex) {
                for (let columnName in rowCells) {
                    if (!rowCells[columnName] || !rowCells[columnFrom] || columnName != columnTo) {
                        continue;
                    }
                    if (options.overrideSelector != null) {
                        if (rowCells[columnFrom].plainData) {
                            rowCells[columnTo].plainData = rowCells[columnFrom].plainData;
                        }
                        if (rowCells[columnFrom].rawData.cdata) {
                            rowCells[columnTo].rawData.cdata = rowCells[columnFrom].rawData.cdata;
                        }
                        if (rowCells[columnFrom].displayData.cdata) {
                            rowCells[columnTo].displayData.cdata = rowCells[columnFrom].displayData.cdata;
                        }
                    } else if (options.appendSelector != null) {
                        rowCells[columnTo].plainData += ' ' + rowCells[columnFrom].plainData;
                        if (!rowCells[columnTo].rawData.cdata) {
                            rowCells[columnTo].rawData.cdata = rowCells[columnFrom].rawData.cdata;
                        } else {
                            rowCells[columnTo].rawData.cdata += ' ' + rowCells[columnFrom].rawData.cdata;
                        }
                        if (!rowCells[columnTo].displayData.cdata) {
                            rowCells[columnTo].displayData.cdata = rowCells[columnFrom].displayData.cdata;
                        } else {
                            rowCells[columnTo].displayData.cdata += ' ' + rowCells[columnFrom].displayData.cdata;
                        }
                    }
                    rowCells[columnTo] = selectCellContent(rowCells[columnTo], columnName, rowCells, rowIndex);
                }
            });
        }
    }

    /**
     * Enables contact mode in the table
     */
    function enableContactsModeTableView() {
        if (tView.isContactsMode) {
            for (let i = 1; i < tView.contactCardFields.length; i++) {
                if (tView.columns.has(tView.contactCardFields[i])) {
                    tView.columns.get(tView.contactCardFields[i]).isVisible = false;
                }
            }
        }
    }

    /**
     * Transposes columns and rows for easy comparison between named rows.
     * Columns headers become the first column values, the first column values become the new headers.
     * In this mode original header is hidden and everything is rendered in the body.
     */
    function transposeCompareModeTableView() {
        if (options.compareMode == 'true') {
            const transposedRows = [];
            tView.columns.forEach(function (colReference) {
                if (colReference.isVisible) {
                    let colContent = colReference.columnName;
                    if (tView.isContactsMode && tView.contactCardFields[0] == colReference.columnName) {
                        colContent = 'Contact';
                    }
                    const cellTemplate = {
                        content: colContent,
                        style: '',
                        columnReference: colReference,
                        columnIndex: -1,
                        rowIndex: transposedRows.length,
                        isHeaderTemplate: true
                    };
                    transposedRows.push([cellTemplate]);
                }
            });
            tView.rowsContent.forEach(function (rowCells) {
                const rowIndex = rowCells[Object.keys(rowCells)[0]] ? rowCells[Object.keys(rowCells)[0]].rowIndex : undefined;
                if (rowIndex === undefined || !tView.isRowVisible(rowIndex)) {
                    return;
                }

                let rowCounter = 0;
                for (const element of tView.columnsContent) {
                    const columnName = element;
                    if (!rowCells[columnName] || rowCounter >= transposedRows.length) {
                        continue;
                    }
                    if (rowCells[columnName].columnReference.isVisible) {
                        rowCells[columnName].style = 'width:' + options.defaultColWidth + 'px';
                        transposedRows[rowCounter].push(rowCells[columnName]);
                        rowCounter++;
                    }
                }

            });
            tView.rowsContent = transposedRows;
        }
    }

    /**
     * Create an HTML table with native DOM using our `TableView` object.
     */
    function renderHtmlTableView(tView) {
        tView.table.empty();
        $e('.eng-table-row-dropdown').remove();
        if (options.flexColumns == 'false') {
            tView.table.width('max-content')
                .css('max-width', 'unset');
        }
        if (options.watermarkText.length > 0) {
            const watermarkStyle = $e('<style>');
            const svgText = 'data:image/svg+xml;utf8,<svg style="transform:rotate(' + options.watermarkRotation + ')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 60"><text x="5" y="25" fill="' + options.watermarkColor + '" font-size="' + options.watermarkSize + '" font-family="arial,sans-serif">' + options.watermarkText + '</text></svg>';
            // eslint-disable-next-line quotes
            watermarkStyle.innerHTML = "#" + tView.id + " .engineerTableWatermark { background: url('" + svgText + "') 0 0/50% 50vh }";
            tView.tableContainer.append(watermarkStyle);
        }
        // Render THEAD
        let tableHead = $e('<thead>');
        let previousColumnWidth = borderSpacing;
        let freezeCount = 0;
        if (options.compareMode == 'true') {
            tView.maxColSpan = tView.recordsCount;
        } else {
            const headerRow = $e('<tr>');
            if (options.recordLinks != 'false' || options.recordMenu.length) {
                const $recordLinksHeader = $e('<th>');
                if (options.freezeColumns > 0) {
                    $recordLinksHeader.addClass(frozen)
                        .css('left', previousColumnWidth);
                }
                previousColumnWidth += Number.parseInt(options.rowButtonWidth) + (borderSpacing);
                const firstColumn = tView.columns.entries().next().value[1];
                let css = {};
                for (let ruleKey in firstColumn.headerCSSProperties) {
                    if (firstColumn.headerCSSProperties[ruleKey]) {
                        css[ruleKey] = firstColumn.headerCSSProperties[ruleKey];
                    }
                }
                $recordLinksHeader.css(css);
                $recordLinksHeader.width(options.rowButtonWidth + 'px');
                $e($recordLinksHeader).append('<div style="width:' + options.rowButtonWidth + 'px"></div>');
                $recordLinksHeader.addClass(tView.id + 'rowButtonHeader');
                if (options.tableHeight != null) {
                    $recordLinksHeader.css({ 'position': 'sticky', 'top': 0 });
                }
                if (options.showHeaders != 'true') {
                    $recordLinksHeader.css({ 'height': '0px', 'line-height': '0px', 'padding': '0px' });
                }
                headerRow.append($recordLinksHeader);
                tView.maxColSpan++;
            }
            let visibleColumnWidth = 0;
            let columnWidthFactor = 1;
            tView.columnsContent.forEach(function (columnName) {
                if (tView.columns.get(columnName).isVisible) {
                    if (options.mathColumns.length > 0) {
                        if (options.mathColumns.includes(tView.columns.get(columnName).columnPos)) {
                            tView.columns.get(columnName).sum = 0;
                            tView.columns.get(columnName).blanks = 0;
                        }
                    }
                    tView.maxColSpan++;
                    visibleColumnWidth += tView.columns.get(columnName).relativeWidth;
                }
            });
            if (options.flexColumns == 'true') {
                if (visibleColumnWidth < 100) {
                    columnWidthFactor = 100 / visibleColumnWidth;
                }
            }
            tView.columnsContent.forEach(function (columnName, i) {
                let column = tView.columns.get(columnName);
                if (column.isVisible) {
                    const $headerItem = $e('<th>');
                    const isContactCardHeader = tView.isContactsMode && tView.contactCardFields[0] == columnName;
                    // Transform header text according to options: contactsMode, overrideSelector and groupHeaders.
                    let columnText = isContactCardHeader ? 'Contact' : columnName;
                    columnText = options.groupHeaders == 'true' ? column.headerGroupText : columnText;
                    columnText = tView.selector.length > 0 ? columnText.replace(tView.selector, '') : columnText;
                    $headerItem.text(columnText)
                        .attr('data-i', i)
                        .attr('data-col-width', column.fixedWidth);
                    // Apply CSS headerStyles from XML file to header.
                    let css = {};
                    for (let ruleKey in column.headerCSSProperties) {
                        if (column.headerCSSProperties[ruleKey]) {
                            css[ruleKey] = column.headerCSSProperties[ruleKey];
                        }
                    }
                    $headerItem.css(css);

                    if (options.freezeColumns > 0 && freezeCount < options.freezeColumns) {
                        $headerItem.addClass(frozen)
                            .css('left', previousColumnWidth + 'px');
                        freezeCount++;
                    }

                    if (options.flexColumns == 'true') {
                        if (columnText == 'Contact' && options.contactsMode == 'true') {
                            const relativeWidth = Math.floor(options.contactCardWidth / tView.totalWidth * 100) * columnWidthFactor;
                            $headerItem.width(relativeWidth.toFixed(2) + '%');
                        } else {
                            const relativeWidth = column.relativeWidth * columnWidthFactor;
                            $headerItem.width(relativeWidth.toFixed(2) + '%');
                        }
                    } else if (columnText == 'Contact' && options.contactsMode == 'true') {
                        $headerItem.width(options.contactCardWidth + 'px');
                    } else {
                        $headerItem.width(column.fixedWidth + 'px');
                    }
                    previousColumnWidth += $headerItem.width() + borderSpacing;
                    if (column.xmlReference.columnTypeAlias == 'SHEET_COLUMN_TYPE_NUMBER' || column.xmlReference.columnTypeAlias == 'SHEET_COLUMN_TYPE_FORMULA') {
                        $headerItem.css({ 'text-align': options.numberAlign, 'padding-right': '11px' });
                    }
                    $headerItem.className = column.headerClass;
                    if (options.tableHeight != null) {
                        $headerItem.css({ 'position': 'sticky', 'top': 0 });
                    }
                    if (options.showHeaders != 'true') {
                        $headerItem.css({ 'height': '0px', 'line-height': '0px', 'padding': '0px' });
                    } else if (options.userSort != 'false') {
                        if (column.xmlReference.columnTypeAlias == 'SHEET_COLUMN_TYPE_IMAGE') {
                            // Do not allow sorting on image columns
                        } else {
                            let sortIcon = '↕️';
                            if (options.sortColumn1 === column.columnName) {
                                sortIcon = options.sortOrder1 === 'd' ? '⬇️' : '⬆️';
                            }
                            const $sortIcons = $e('<a>')
                                .addClass('eng-sort-icons')
                                .text(sortIcon)
                                .attr('title', 'Sort by ' + column.columnName)
                                .attr('onclick', 'engineerTable_sortColumn(\'' + column.columnName + '\',\'' + options.tableElement + '\');');
                            $headerItem.append($sortIcons);
                        }
                    }
                    headerRow.append($headerItem);
                }
            });
            tableHead.append(headerRow);
            if (options.showHeaders != 'true') {
                tableHead.css('visibility', 'hidden');
            }
            tView.table.append(tableHead);
        }
        // Render TBODY.
        const tableBody = $e('<tbody>');
        let renderedRows = 0;
        if (tView.recordsCount == 0) {
            appendNoDataRow();
            renderedRows++;
        } else {
            let $currTableRow;
            let lastRow;
            let lastRowIndex;
            tView.rowsContent.forEach(function (rowCells) {
                let rowIndex;
                if (options.compareMode == 'true' && Array.isArray(rowCells)) {
                    rowIndex = rowCells[0]?.rowIndex;
                } else {
                    rowIndex = rowCells[Object.keys(rowCells)[0]].rowIndex;
                }
                if (options.compareMode != 'true' && options.recordLimit > 0 && renderedRows >= options.recordLimit) {
                    return;
                }
                if (options.compareMode != 'true' && !tView.isRowVisible(rowIndex)) {
                    return;
                }
                lastRowIndex = rowIndex;
                let firstColumn = true;
                $currTableRow = $e('<tr>')
                    .addClass('table-row-' + rowIndex)
                    .attr('index', rowIndex);
                // Render a column with row link if compare mode is disabled.
                if (options.recordLinks != 'false' && options.compareMode != 'true') {
                    $currTableRow.append(buildRowLink(rowIndex));
                }
                let rowCellsArr = Object.values(rowCells).filter(Boolean);
                rowCellsArr.sort((a, b) => Number.parseFloat(a.columnIndex ?? -1) - Number.parseFloat(b.columnIndex ?? -1));
                lastRow = rowCellsArr;
                for (const [colIndex, element] of rowCellsArr.entries()) {
                    if (!element) {
                        continue;
                    }
                    const cellContent = element;
                    if (cellContent.columnReference.isVisible) {
                        if (options.compareMode == 'true' && options.recordLimit > 0 && colIndex > options.recordLimit) {
                            continue;
                        }
                        let $bodyItem;
                        if (firstColumn && options.compareMode == 'true') {
                            $bodyItem = $e('<th>')
                                .addClass(cellContent.columnReference.headerClass)
                                .attr('data-i', rowIndex)
                                .attr('data-col-width', options.defaultColWidth)
                                .width((options.defaultColWidth * 0.66) + 'px');
                            let css = {};
                            for (let ruleKey in cellContent.columnReference.headerCSSProperties) {
                                if (cellContent.columnReference.headerCSSProperties[ruleKey]) {
                                    css[ruleKey] = cellContent.columnReference.headerCSSProperties[ruleKey];
                                }
                            }
                            $bodyItem.css(css);
                            if (options.transposeFreeze && colIndex == 0) {
                                $bodyItem.addClass(frozen)
                                    .css('left', '0px');
                            }
                            if (rowIndex == 0) {
                                $bodyItem.addClass(tView.id + 'firstCompareModeHeader')
                                    .attr('id', tView.id + 'sticky-header')
                                    .css('top', '0px');
                            }

                            cellContent.content = options.groupHeaders == 'true' ? tView.columns.get(cellContent.content).headerGroupText : cellContent.content;
                            cellContent.content = cellContent.content.replace(options.overrideSelector, '').replace(options.appendSelector, '');
                            $bodyItem.html(cellContent.content);
                            if (options.showHeaders != 'true') {
                                $bodyItem.css({ 'width': '0px', 'visibility': 'hidden', 'line-height': '0px', 'padding': '0px' });
                            } else if (options.userSort != 'false') {
                                if (cellContent.columnReference.xmlReference.columnTypeAlias == 'SHEET_COLUMN_TYPE_IMAGE') {
                                    // Do not allow sorting on image columns
                                } else {
                                    let sortIcon = '↕️';
                                    if (options.sortColumn1 === cellContent.columnReference.columnName) {
                                        sortIcon = options.sortOrder1 === 'd' ? '⬇️' : '⬆️';
                                    }
                                    const $sortIcons = $e('<a>')
                                        .addClass('eng-sort-icons')
                                        .text(sortIcon)
                                        .attr('title', 'Sort by ' + cellContent.columnReference.columnName)
                                        .attr('onclick', 'engineerTable_sortColumn(\'' + cellContent.columnReference.columnName + '\',\'' + options.tableElement + '\');');
                                    $bodyItem.append($sortIcons);
                                }
                            }
                        } else {
                            $bodyItem = $e('<td>')
                                .addClass(cellContent.className);
                            if (cellContent.style) {
                                $bodyItem.attr('style', cellContent.style);
                            }
                            if (options.showApiIds == 'true') {
                                $bodyItem.attr('data-cid', cellContent.columnReference.columnID)
                                    .attr('data-iid', cellContent.itemid);
                            }
                            if (rowIndex == 0 && options.compareMode == 'true') {
                                $bodyItem.addClass(tView.id + 'firstCompareModeHeader')
                                    .css('top', '0px');
                            }
                            $bodyItem.html(cellContent.content);
                        }
                        $currTableRow.append($bodyItem);
                        if (options.mathColumns.length > 0) {
                            if (options.mathColumns.includes(cellContent.columnReference.columnPos)) {
                                if (cellContent.numeric) {
                                    let colSum = tView.columns.get(cellContent.columnName);
                                    colSum.sum += cellContent.numeric;
                                    tView.columns.set(cellContent.columnName, colSum);
                                } else if (Number.isNaN(cellContent.numeric)) {
                                    let colSum = tView.columns.get(cellContent.columnName);
                                    colSum.blanks += 1;
                                    tView.columns.set(cellContent.columnName, colSum);
                                }
                            }
                        }
                        firstColumn = false;
                    }
                }
                tableBody.append($currTableRow);
                renderedRows++;
            });
            if (options.recordLinks != 'false' && options.compareMode == 'true') {
                let buttonRow;
                $currTableRow = $e('<tr>');
                $currTableRow.className = 'table-row-' + (lastRowIndex + 1);
                let firstColumn = true;
                let renderedColumns = 0; //no link rendered for header row
                for (let columnName in lastRow) {
                    if (options.recordLimit > 0 && renderedColumns >= options.recordLimit) {
                        continue;
                    }
                    if (!lastRow[columnName]) {
                        continue;
                    }
                    if (firstColumn) {
                        $currTableRow.append($e('<th class="firstCompareModeHeader"></th>')
                            .width((options.defaultColWidth * 0.66) + 'px'));
                        firstColumn = false;
                        continue;
                    }
                    let $buttonCell = buildRowLink(lastRow[columnName].rowIndex);
                    $buttonCell.width((options.defaultColWidth) + 'px');
                    $currTableRow.append($buttonCell);
                    renderedColumns++;
                    buttonRow = true;
                }
                if (buttonRow && options.transposeButtonPosition != 'bottom') {
                    tableBody.prepend($currTableRow);
                } else {
                    tableBody.append($currTableRow);
                }
            }
            // If no rows have been appended due to filtering or selecting
            if (lastRowIndex === undefined) {
                appendNoDataRow();
                renderedRows++;
            } else {
                if (options.sumColumns.length > 0) {
                    appendSumRow();
                }
                if (options.meanColumns.length > 0) {
                    appendMeanRow();
                }
            }
        }
        tView.table.append(tableBody);
        // Append TABLE to `callElement`.
        if (tView.callElement.children().length > 0) {
            tView.callElement.children().each(function (i, child) {
                if (child.className == 'engineerContainer') {
                    $e(child).empty();
                }
            });
        }
        tView.tableContainer.append(tView.table);
        tView.callElement.css('overflow-x', 'hidden')
            .append(tView.tableContainer);
        integrateWithHighQ();
        if (options.topScrollbar == 'true' && options.flexColumns == 'false') {
            if ($e('#' + tView.id + '-topscroll').length > 0) {
                $e('#' + tView.id + '-topscroll').remove();
            }
            let $topScrollInner = $e('<div>')
                .attr('id', tView.id + '-scrollinner')
                .height('20px')
                .width(Math.floor(tView.table[0].scrollWidth - 4) + 'px');
            let $topScrollWrapper = $e('<div>')
                .attr('id', tView.id + '-topscroll')
                .css('overflow', 'auto hidden')
                .append($topScrollInner);
            $topScrollWrapper.insertBefore(tView.tableContainer);
            tView.tableContainer
                .css('overflow-x', 'auto');
        }
        if (options.clickHighlight != 'false') {
            tableBody.on('click', 'tr', function () {
                $e(this).siblings().removeClass('clicked');
                $e(this).addClass('clicked');
            });
        }
        if (options.truncateText) {
            attachShowMore();
        }
        if (options.collapse != 'false') {
            collapseTable();
        }
        options.tView = tView;
        options.onRender(options.tableElement);

        function appendNoDataRow() {
            const bodyRow = $e('<tr>');
            const bodyItem = $e('<td>');
            bodyItem.attr('colSpan', tView.maxColSpan);
            bodyItem.text(options.noDataText);
            bodyItem.css('textAlign', 'center');
            bodyRow.append(bodyItem);
            tableBody.append(bodyRow);
        }

        function appendSumRow() {
            const bodyRow = $e('<tr>');
            bodyRow.addClass('sum-row');
            if (options.recordLinks != 'false') {
                const bodyItem = $e('<td>');
                bodyRow.append(bodyItem);
            }
            tView.columns.forEach(column => {
                if (column.isVisible) {
                    const bodyItem = $e('<td>');
                    if (options.sumColumns.includes(column.columnPos)) {
                        bodyItem.text(options.sumColumnsPrefix + column.sum.toLocaleString());
                        bodyItem.css({ 'text-align': 'right', 'font-weight': 'bold' });
                    }
                    bodyRow.append(bodyItem);
                }
            });
            tableBody.append(bodyRow);
        }

        function appendMeanRow() {
            const bodyRow = $e('<tr>');
            bodyRow.className = 'mean-row';
            if (options.recordLinks != 'false') {
                const bodyItem = $e('<td>');
                bodyRow.append(bodyItem);
            }
            tView.columns.forEach(column => {
                if (column.isVisible) {
                    const bodyItem = $e('<td>');
                    if (options.meanColumns.includes(column.columnPos)) {
                        let visible = tView.recordsCount;
                        if (options.meanIgnoreBlanks == 'true') {
                            visible = visible - column.blanks;
                        }
                        bodyItem.text(options.meanColumnsPrefix + (column.sum / visible).toLocaleString());
                        bodyItem.css({ 'text-align': 'right', 'font-weight': 'bold' });
                    }
                    bodyRow.append(bodyItem);
                }
            });
            tableBody.append(bodyRow);
        }
    }

    /**
     * Hide empty rows or columns from the table
     */
    function collapseTable() {
        if (options.collapse == 'row' || options.collapse == 'both') {
            $e('#' + options.tableElement + ' table tbody tr').each(function () {
                let row = $e(this);
                if (options.compareMode == 'true') {
                    if ($e(this).find('.eng-table-button-cell').length > 0) {
                        return;
                    }
                }
                if (row.find('td:not(.eng-table-button-cell)').filter((i, e) => $e.trim($e(e).text())).length == 0 && $e(this).find('img').length === 0) {
                    row.hide();
                }
            });
        }
        if (options.collapse == 'column' || options.collapse == 'both') {
            let index = options.compareMode == 'true' ? 2 : 1;
            $e('#' + options.tableElement + ' table tbody tr').each(function () {
                $e('#' + options.tableElement + ' table tr:first-child td').each(function (i) {
                    if ($e.trim($e(this).text()).length == 0 && $e('#' + options.tableElement + 'table td:nth-child(' + (i + index) + ') img').length === 0) {
                        $e('#' + options.tableElement + ' table td:nth-child(' + (i + index) + '),#' + options.tableElement + ' table th:nth-child(' + (i + index) + ')').hide();
                    }
                });
            });
        }
    }

    /**
     * Makes changes to enable/disable some HighQ features.
     */
    function integrateWithHighQ() {
        // Call the HighQ function to rebind CKEditor links - needed for linking to isheet modal.
        if (options.recordLinks == 'viewItem' || options.addItemButton != 'false') {
            rebindCKContentLink();
        }
        // The table sticky table headers need the HighQ header to not be fixed for table sticky headers to work.
        if (options.stickyHeaders == 'true') {
            $e('.engTableSticky .' + tView.id + 'firstCompareModeHeader').css('z-index', 999);
            $e('.engTableSticky .' + tView.id + 'firstCompareModeHeader').css('position', 'sticky');
            if (options.tableHeight == null) {
                // Make table headers sticky.
                const fixedHeaderId = tView.id + 'fixedHeaderTable';
                const onScrollFunction = function onTableHeaderScroll() {
                    let header = options.compareMode == 'true' ? tView.id + 'sticky-header' : tView.headId;
                    if (isElementWithinScrollView(tView.id, true)) {
                        if (!isElementWithinScrollView(header)) {
                            $e('#' + fixedHeaderId).remove();
                            const headerTable = $e('<table>');
                            const fixedOffsetLeft = $e('#' + tView.id).offset().left;
                            headerTable.attr('id', fixedHeaderId);
                            headerTable.css({
                                'background-color': options.headerColor,
                                'color': options.headerTextColor,
                                'table-layout': 'fixed',
                                'position': options.tableHeight != null ? 'absolute' : 'fixed',
                                'top': 0,
                                'left': fixedOffsetLeft.toFixed(2) + 'px',
                                'width': $e('#' + tView.headId).width() + 'px',
                                'z-index': 1000,
                            });
                            $e('#' + tView.headId).clone().appendTo(headerTable);
                            $e(headerTable).appendTo('#' + tView.id + ' .engineerContainer');
                            $e('#' + fixedHeaderId + ' .' + tView.id + 'firstCompareModeHeader').css('z-index', 100);
                            $e('#' + fixedHeaderId + ' .' + tView.id + 'firstCompareModeHeader').css('position', 'relative');
                        } else if ($e('#' + fixedHeaderId).length != 0) $e('#' + fixedHeaderId).hide();
                    } else if ($e('#' + fixedHeaderId).length != 0) $e('#' + fixedHeaderId).hide();
                };
                document.removeEventListener('scroll', onScrollFunction);
                document.addEventListener('scroll', onScrollFunction);
                $e('.header').css('position', 'relative');
                $e('.topHeader').css('position', 'absolute');
            }
        }
        if (options.topScrollbar == 'true') {
            $e(function () {
                $e('#' + tView.id + '-topscroll').scroll(function () {
                    $e('#' + 'engTableContainer' + tView.id)
                        .scrollLeft($e('#' + tView.id + '-topscroll').scrollLeft());
                });
                $e('#' + 'engTableContainer' + tView.id).scroll(function () {
                    $e('#' + tView.id + '-topscroll')
                        .scrollLeft($e('#' + 'engTableContainer' + tView.id).scrollLeft());
                });
            });
        }
    }

    /**
     * Checks if the table headers are within the scroll view.
     */
    function isElementWithinScrollView(elementId, isTable) {
        const $elem = $e('#' + elementId);
        if ($elem.length) {
            const docViewTop = $e(window).scrollTop();
            const docViewBottom = docViewTop + $e(window).height();
            const elemTop = $e('#' + elementId).offset().top;
            const elemBottom = elemTop + $e('#' + elementId).height();
            if (isTable) {
                return docViewTop < elemBottom && elemTop < docViewTop;
            } else {
                return (elemBottom <= docViewBottom) && (elemTop >= docViewTop);
            }
        }
    }

    /**
     * Adds a link to the row according to the `recordsLink` option.
     */
    function buildRowLink(rowIndex) {
        // Check if there's data to generate link.
        let hasData = false;
        if (options.foldSections.length > 0) {
            options.foldSections.forEach(fold => {
                const foldVisible = tView.rows[rowIndex][fold] && options.selectedColumns.includes(tView.rows[rowIndex][fold].columnReference.columnPos);
                if (foldVisible && Object.keys(tView.rows[rowIndex][fold].displayData).length > 0 && checkForEmptyTags(tView.rows[rowIndex][fold].content)) {
                    hasData = true;
                }
            });
            if (!hasData) {
                return $e('<td>');
            }
        }

        let rowButtonItem = $e('<td>')
            .addClass('eng-table-button-cell ');
        if (options.freezeColumns > 0) {
            rowButtonItem.addClass(frozen)
                .css('left', borderSpacing);
        }
        let itemBtn = $e('<a>');
        if (options.recordLinks != 'false' && xmlObj.view.data.item[rowIndex]) {
            itemBtn.text(options.rowButtonText);
            itemBtn.addClass('btn btn-default table-view detailBtn' + rowIndex);
            itemBtn.css('width', options.rowButtonWidth + 'px');
            let tableBtnLink = '';
            const itemId = xmlObj.view.data.item[rowIndex].itemID.cdata;
            if (options.showApiIds == 'true') {
                rowButtonItem.attr('data-iid', itemId);
            }
            if (options.recordLinks == 'menu') {
                itemBtn.attr('title', 'More actions')
                    .addClass('table-menu-button');
                itemBtn.attr('onclick', 'buildTable[\'' + options.tableElement + '\'].openRowMenu(this, ' + itemId + ', ' + rowIndex + ')');
            } else if (typeof options.recordLinks === 'function') {
                let functionName = options.tableElement + '_rowFunction';
                window.engineerLegalPlugins.table[functionName] = function (rowIdx) {
                    options.recordLinks(xmlObj.view.data.item[rowIdx]);
                };

                itemBtn.attr('onclick', 'window.engineerLegalPlugins.table.' + functionName + '(\'' + rowIndex + '\')');
            } else if (options.recordLinks == 'fold') {
                itemBtn.on('click', function () {
                    window.engineerLegalPlugins.table.buildFoldSection.get(tView.id + 'FoldFn')(rowIndex);
                });
            } else if (options.recordLinks == 'join') {
                let functionName = options.tableElement + '_' + options.joinTable;
                window.engineerLegalPlugins.table[options.tableElement + '_joinId'] = xmlObj.view.data.item[rowIndex];
                window.engineerLegalPlugins.table[functionName] = function (joinTerm) {
                    let joinOptions = window.engineerLegalPlugins.table[options.joinTable];
                    joinOptions.awaitJoin = null;
                    joinOptions.filterTerm = joinTerm.toUpperCase();
                    if (joinOptions.openModal == 'true') {
                        joinOptions.iSheetViewLink = engineercore_getLink(joinOptions.tableElement);
                        joinOptions.tableElement = 'engModalBody';
                        engineercore_modal('Table');
                        $e('#engineerModal .modal-body')
                            .attr('id', 'engModalBody');
                    }
                    engineerTable(joinOptions);
                    if (joinOptions.openModal == 'true') {
                        $e('#engineerModal').modal();
                    }
                };
                itemBtn.attr('onclick', 'window.engineerLegalPlugins.table.' + functionName + '(\'' + xmlObj.view.data.item[rowIndex].column[options.joinColumn].displayData.cdata + '\')');
            } else {
                itemBtn = buildRowButtonLink(options.recordLinks, tableBtnLink, itemId, itemBtn);
                if (options.recordLinks == 'isheet' || options.recordLinks == 'default') {
                    if (options.buttonTab == 'blank' || options.buttonTab == 'self') {
                        itemBtn.attr('target', '_' + options.buttonTab);
                    }
                    if (options.buttonTab == 'modal') {
                        let link = itemBtn.attr('href');
                        itemBtn.removeAttr('href');
                        itemBtn.on('click', function () {
                            let windowFeatures = 'width=' + options.modalWidth + ',height=' + options.modalHeight + ',top=100,left=100';
                            window.open(link, '_blank', windowFeatures);
                        });
                    }
                }
            }
        }
        rowButtonItem.append(itemBtn);
        return rowButtonItem;
    }

    function buildRowButtonLink(linkType, tableBtnLink, itemId, itemBtn) {
        switch (linkType) {
            case 'print':
            case 'true':
                tableBtnLink = engineerLegal_buildISheetUrl(options.viewLink, 'sheetPrintItem', itemId, false, {
                    'view': 'readonly',
                    'injectSheetLinkView': 'true',
                    'isPrintPreview': 'true',
                });
                itemBtn.attr('href', tableBtnLink);
                break;
            case 'fillPDF':
                itemBtn.attr('onclick', 'engineerLegal_fillPDF(\'' + options.viewLink + '\', ' + itemId + ',\'' + options.tableElement + '\')');
                break;
            case 'isheet':
                tableBtnLink = engineerLegal_buildISheetUrl(options.viewLink, 'sheetHome', itemId, false);
                itemBtn.attr('href', tableBtnLink);
                break;
            case 'default':
                tableBtnLink = engineerLegal_buildISheetUrl(options.iSheetViewLink, 'sheetHome', itemId, true);
                itemBtn.attr('href', tableBtnLink);
                break;
            case 'viewItem':
                itemBtn.addClass('CKContextLink');
                itemBtn.attr('id', '{"linkType":"iSheetItem","siteID":"' + options.siteID + '","contextID":"' + options.sheetID + '","sheetItemID":"' + itemId + '","sheetViewID":"0","viewMode":"0","linkedFromCKEditor":false}');
                tableBtnLink = engineerLegal_buildISheetUrl(options.iSheetViewLink, 'injectColumnViewItemPage', itemId, true, {
                    'metaData.viewMode': '0',
                    'view': 'readonly',
                    'sheetItemLinkView': 'false',
                });
                itemBtn.attr('href', tableBtnLink);
                break;
            case 'timeline':
                console.log('Coming soon');
                break;
            case 'edit':
                tableBtnLink = engineerLegal_buildISheetUrl(options.editLink, 'sheetHome', itemId, false);
                itemBtn.attr('onclick', 'engineerLegal_launchEditModal(\'' + tableBtnLink + '\', ' + itemId + ',\'' + options.tableElement + '\')');
                itemBtn.text(options.rowButtonText != 'More Details' ? options.rowButtonText : 'Edit');
                break;
            case 'editInline':
                itemBtn.text(options.rowButtonText != 'More Details' ? options.rowButtonText : 'Edit')
                    .addClass('inline-edit');
                if (options.inlineEdit) {
                    tableBtnLink = engineerLegal_buildISheetUrl(options.iSheetViewLink, 'sheetHome', itemId, false);
                    itemBtn.attr('onclick', 'engineerLegal_tableEditInline(\'' + tableBtnLink + '\', ' + itemId + ',\'' + options.tableElement + '\')');
                } else {
                    itemBtn.addClass('disabled');
                }
                break;
        }
        return itemBtn;
    }


    /**
    * Build fold section on demand, if it already is rendered, just toggle it instead.
    */
    function buildFoldSectionRow(rowIndex) {
        if (options.foldSections.length == 0) {
            return;
        }
        if (options.compareMode == 'true') {
            options.foldSections.forEach(function (foldColumn) {
                if (tView.columns.has(foldColumn)) {
                    if (tView.selectedColumns.includes(tView.columns.get(foldColumn).columnPos)) {
                        tView.columns.get(foldColumn).isVisible = !tView.columns.get(foldColumn).isVisible;
                    }
                }
            });
            buildTableViewBody();
            overrideColumnsTableView();
            transposeCompareModeTableView();
            renderHtmlTableView(tView);
        } else {
            if ($e('.hr' + tView.id + rowIndex).length > 0) {
                $e('.hr' + tView.id + rowIndex).toggle();
                return;
            }
            const bodyRow = $e('<tr>');
            bodyRow.addClass('hr' + tView.id + rowIndex);
            const bodyItem = $e('<td>');
            bodyItem.attr('colSpan', tView.maxColSpan);
            bodyRow.append(bodyItem);
            const columnContainer = $e('<div>');
            columnContainer.addClass('engFoldCol');
            bodyItem.append(columnContainer);
            let foldCount = 0;
            options.foldSections.forEach(fold => {
                const foldVisible = tView.rows[rowIndex][fold] && options.selectedColumns.includes(tView.rows[rowIndex][fold].columnReference.columnPos);
                if (foldVisible && Object.keys(tView.rows[rowIndex][fold].displayData).length > 0 && checkForEmptyTags(tView.rows[rowIndex][fold].content)) {
                    const panel = $e('<div>');
                    panel.addClass('panel panel-default engFoldPanel');
                    const panelHead = $e('<div>');
                    panelHead.addClass('panel-heading');
                    let columnText = tView.columns.get(fold).columnName;
                    columnText = tView.selector.length > 0 ? columnText.replace(tView.selector, '') : columnText;
                    panelHead.html('<pre>' + columnText + '</pre>');
                    const panelBody = $e('<div>');
                    panelBody.addClass('panel-body engFoldBody');
                    panelBody.html('<div>' + tView.rows[rowIndex][fold].content + '</div>');
                    panel.append(panelHead);
                    panel.append(panelBody);
                    columnContainer.append(panel);
                    foldCount++;
                }
            });
            if (foldCount == 1) {
                columnContainer.css('column-count', 1);
            }
            $e(bodyRow).insertAfter($e('#' + tView.id + ' .table-row-' + rowIndex));
        }
    }

    function checkForEmptyTags(rawData) {
        const $rawData = $e(rawData);
        $rawData.find('*:empty').remove();
        return $rawData.html().length > 0;
    }

    function sortTable() {
        // Helper to locate a cell by column name in an object row or transposed array row
        function getRowCell(row, col) {
            if (!row) return undefined;
            if (Array.isArray(row)) {
                return row.find(cell => cell && !cell.isHeaderTemplate && cell.columnReference && cell.columnReference.columnName === col);
            }
            return row[col];
        }

        // Helper to get value and handle numeric/text
        function getValue(row, col, isNumeric) {
            const cell = getRowCell(row, col);
            if (!cell) return '';
            // Use rawData for date columns
            if (cell.columnTypeAlias === 'SHEET_COLUMN_TYPE_DATE_AND_TIME') {
                return cell.rawData?.cdata || '';
            }
            return isNumeric ? cell.numeric?.toString() : cell.displayData?.cdata || '';
        }

        // Helper to compare two values with order
        function compareValues(a, b, isNumeric, order) {
            if (a.length < 1) return 1;
            if (b.length < 1) return -1;
            if (order === 'a') {
                return a.localeCompare(b, undefined, isNumeric ? { numeric: true } : undefined);
            } else {
                return b.localeCompare(a, undefined, isNumeric ? { numeric: true } : undefined);
            }
        }

        // Build sort levels
        const sortLevels = [];
        function buildSortLevel(columnName, sortOrder) {
            const sampleRow = tView.rowsContent.find(row => getRowCell(row, columnName));
            const sampleCell = getRowCell(sampleRow, columnName);
            sortLevels.push({
                col: columnName,
                order: sortOrder,
                isNumeric: sampleCell ? Object.hasOwn(sampleCell, 'numeric') : false
            });
        }
        if (options.sortColumn1) {
            buildSortLevel(options.sortColumn1, options.sortOrder1);
        }
        if (options.sortColumn2) {
            buildSortLevel(options.sortColumn2, options.sortOrder2);
        }
        if (options.sortColumn3) {
            buildSortLevel(options.sortColumn3, options.sortOrder3);
        }

        if (sortLevels.length === 0) return;

        tView.rowsContent.sort(function (a, b) {
            for (const element of sortLevels) {
                const { col, order, isNumeric } = element;
                const vA = getValue(a, col, isNumeric);
                const vB = getValue(b, col, isNumeric);
                const cmp = compareValues(vA, vB, isNumeric, order);
                if (cmp !== 0) return cmp;
            }
            return 0;
        });
    }

    function buildTableMenu() {
        let $menuDiv = $e('#' + options.tableElement + '-menu');
        if ($menuDiv.length < 1) {
            $menuDiv = $e('<div>')
                .attr('id', options.tableElement + '-menu')
                .addClass('engtable-menu');
            $e('#' + options.tableElement).append($menuDiv);
            buildAddButton($menuDiv);
            buildQuickFilter($menuDiv);
            buildExportButton($menuDiv);
        }
        addTableHeaderMessage($menuDiv);
        if ($e('#' + options.tableElement + '-filter').val()) {
            runTableFilter(options.tableElement);
        }
    }

    function addTableHeaderMessage(menuDiv) {
        $e('#' + options.tableElement + ' .el-message').remove();
        if (topMessage) {
            const headerMessage = $e('<div>')
                .text(topMessage)
                .addClass('alert alert-info el-message el-menu-item');
            menuDiv.append(headerMessage);
        }
    }

    function buildExportButton(menuDiv) {
        if (options.exportButton != 'false') {
            if ($e('#' + options.tableElement + '-export').length < 1) {
                const exportButton = $e('<button>')
                    .attr('id', options.tableElement + '-export')
                    .text('Export Chart')
                    .addClass('btn btn-default eng-table-export el-menu-item')
                    .on('click', function () {
                        if (options.exportButton != 'excel') {
                            exportTableToCSV(options.tableElement);
                        } else {
                            exportTableToExcel(options.tableElement);
                        }
                    });
                menuDiv.append(exportButton);
            }
        }
    }

    function downloadCSV(csv) {
        let filename = 'HighQ Export';
        let csvFile;
        let downloadLink;
        csvFile = new Blob([csv], { type: 'text/csv' });
        downloadLink = document.createElement('a');
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = 'none';
        document.body.append(downloadLink);
        downloadLink.click();
        downloadLink.remove();
    }

    function exportTableToCSV(id) {
        let csv = [];
        let rows = $e('#' + id + ' table tr:not(:hidden)');
        let startCol = 0;
        if (options.recordLinks != 'false' && options.compareMode != 'true') {
            startCol = 1;
        } else if (options.recordLinks != 'false' && options.compareMode == 'true') {
            if (options.transposeButtonPosition == 'top') {
                rows.splice(0, 1);
            } else {
                rows.splice(-1, 1);
            }
        }
        for (const element of rows) {
            let row = [], cols = element.querySelectorAll('td, th');
            for (let j = startCol; j < cols.length; j++)
                if (cols[j].querySelector('.el-table-fullcontent')) {
                    row.push('"' + cols[j].querySelector('.el-table-fullcontent').innerText.replace(/"/g, '""') + '"');
                } else {
                    row.push('"' + cols[j].innerText.replaceAll('"', '""') + '"');
                }
            csv.push(row.join(','));
        }
        downloadCSV(csv.join('\n'));
    }

    function rgbToHex(rgb) {
        const [r, g, b] = rgb.match(/\d+/g).map(x => Number.parseInt(x));
        return `FF${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }

    function parseTextAlign(align) {
        const map = { left: 'left', center: 'center', right: 'right', justify: 'justify' };
        return map[align] || 'left';
    }

    function exportTableToExcel(id) {
        try {
            if (ExcelJS) {
                console.log('ExcelJS already loaded');
                runExcelExport(id, options.exportOptions);
            }
        } catch (error) {
            try {
                engineercore_load('excel').then(function () {
                    console.log('ExcelJS imported successfully');
                    runExcelExport(id, options.exportOptions);
                });
            } catch (error) {
                console.error('ExcelJS not loaded');
                return;
            }
        }
        function runExcelExport(id, exportOptions) {
            class Opts {
                constructor(exportOpts) {
                    this.fileName = exportOpts.fileName || `HighQ_Export_${Date.now()}`;
                    this.sheetName = exportOpts.sheetName || 'HighQ Export';
                    this.columnRenameMap = exportOpts.columnRenameMap || {};
                }
            }
            let exportOpts = new Opts(exportOptions);

            let rows = $e('#' + id + ' table tr:not(:hidden)');
            let $inputHeaderCells = $e('#' + id + ' table th:not(:hidden)');
            const $lastcell = $inputHeaderCells.last();
            const headerStyles = {
                font: {
                    name: 'Calibri',
                    bold: $lastcell.css('font-weight') === 'bold',
                    size: Number.parseInt($lastcell.css('font-size')),
                    color: { argb: rgbToHex($lastcell.css('color')) },
                },
                alignment: {
                    horizontal: parseTextAlign($lastcell.css('text-align')),
                    vertical: 'middle'
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: rgbToHex($lastcell.css('background-color')) }
                }
            };

            let startCol = 0;
            if (options.recordLinks != 'false' && options.compareMode != 'true') {
                startCol = 1;
            } else if (options.recordLinks != 'false' && options.compareMode == 'true') {
                rows.splice(-1, 1);
            }

            const fileName = exportOpts.fileName + '.xlsx';
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet(exportOpts.sheetName);

            const headerIndex = 1;
            let rowIndex = headerIndex;
            if (options.recordLinks != 'false' && options.compareMode != 'true') {
                startCol = 1;
            } else if (options.recordLinks != 'false' && options.compareMode == 'true') {
                if (options.transposeButtonPosition == 'top') {
                    rows.splice(0, 1);
                } else {
                    rows.splice(-1, 1);
                }
            }
            for (const element of rows) {
                const row = ws.getRow(rowIndex);
                let cellArray = [];
                let cols = element.querySelectorAll('td, th');
                for (let j = startCol; j < cols.length; j++) {
                    let cellValue = cols[j].querySelector('.el-table-fullcontent')
                        ? cols[j].querySelector('.el-table-fullcontent').innerText.replace('\n', '\r\n')
                        : cols[j].innerText.replace('\n', '\r\n');
                    if (rowIndex == headerIndex) {
                        if (exportOpts.columnRenameMap[cellValue]) {
                            cellValue = exportOpts.columnRenameMap[cellValue];
                        }
                    }
                    cellArray.push(cellValue);
                }
                row.values = cellArray;
                row.alignment = { wrapText: true };
                rowIndex++;
            }

            if (options.compareMode != 'true') {
                ws.columns.forEach(function (column, i) {
                    column.width = ($inputHeaderCells.eq(i).attr('data-col-width') / 7) || 20;
                    const cell = ws.getRow(headerIndex).getCell(i + 1);
                    Object.assign(cell, headerStyles);
                });
            } else {
                ws.columns.forEach(function (column, i) {
                    column.width = 22;
                });
            }
            // handle sum columns
            //const sumCell = ws.getCell('B' + rowIndex);
            //sumCell.value = { formula: 'SUM(B' + (headerIndex + 1) + ':B' + (rowIndex - 1) + ')' };
            wb.xlsx
                .writeBuffer(fileName)
                .then(buffer => download(new Blob([buffer]), fileName))
                .catch(err => console.log('Error writing Excel export', err));
        }
    }

    function buildAddButton(menuDiv) {
        if (options.addItemButton != 'false') {
            let addButton = $e('<a>')
                .text(options.addItemTitle)
                .addClass('btn btn-default CKContextLink add-button el-menu-item')
                .attr('href', engineerLegal_buildISheetUrl(options.iSheetViewLink, 'sheetHome', false, false))
                .attr('id', '{"linkType":"iSheetAddItem","siteID":"' + options.siteID + '","contextID":"' + options.sheetID + '","sheetViewID":"' + options.sheetViewID + '","linkedFromCKEditor":true}')
                .attr('target', '_SELF')
                .attr('onclick', 'engineertable_watchAddModal("' + options.tableElement + '")');
            menuDiv.append(addButton);
        }
    }

    function buildQuickFilter(menuDiv) {
        if (options.quickFilter != 'false') {
            let filterInput = $e('<input>')
                .attr('id', options.tableElement + '-filter')
                .attr('placeholder', options.quickFilterPlaceholder)
                .addClass('el-menu-item')
                .css('height', '32px')
                .keydown(function (key) {
                    if (key.keyCode == '13') {
                        runTableFilter(options.tableElement);
                    }
                });
            let filterButton = $e('<button>')
                .text(options.quickFilterButtonText)
                .addClass('btn btn-default filter-button el-menu-item')
                .click(function () {
                    runTableFilter(options.tableElement);
                });
            let filterClearButton = $e('<button>')
                .text(options.quickFilterClearText)
                .addClass('btn btn-default clear-filter')
                .hide()
                .click(function () {
                    window.engineerLegalPlugins.table[options.tableElement].tView.selectedRows = window.engineerLegalPlugins.table[options.tableElement].selectedRows;
                    topMessage = null;
                    addHeaderMessage(window.engineerLegalPlugins.table[options.tableElement].headerMessage);
                    options.selectedRows = [];
                    buildTableViewBody();
                    transposeCompareModeTableView();
                    renderHtmlTableView(window.engineerLegalPlugins.table[options.tableElement].tView);
                    filterInput.val('');
                    filterClearButton.hide();
                });
            menuDiv.append(filterInput);
            menuDiv.append(filterButton);
            menuDiv.append(filterClearButton);
        }
    }

    function runTableFilter(tableElement) {
        let filterTerm = $e('#' + tableElement + '-filter').val();
        let $match = $e('#' + tableElement + ' tbody tr:icontains(' + filterTerm + ')');
        if ($match.length > 0) {
            addHeaderMessage('Filtered: ' + filterTerm);
            if (options.compareMode == 'false') {
                let rows = [];
                $e('#' + tableElement + ' tbody tr:icontains(' + filterTerm + ')').closest('tr').each(function () {
                    let idx = $e(this).attr('index');
                    if (idx) {
                        rows.push(idx);
                    }
                });
                options.selectedRows = rows;
                buildTableViewBody();
                renderHtmlTableView(window.engineerLegalPlugins.table[tableElement].tView);
            } else {
                let colArr = [];
                $e('#' + tableElement).find('td:icontains(' + filterTerm + ')').each(function () {
                    colArr.push($e(this).index() + 1);
                });
                $e('#' + tableElement + ' tr td').hide();
                colArr.forEach(colIndex => {
                    $e('#' + tableElement + ' tr td:nth-child(' + colIndex + ')').show();
                });
            } $e('#' + tableElement + ' .clear-filter').show();
        } else {
            options.filterNoResultCallback(filterTerm);
        }
    }

    /**
    * Chooses which content to show for a cell based in its column type.
    */
    function escapeHtml(text) {
        return text
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll('\'', '&#039;');
    }

    function buildContactCard(user, id) {
        const org = user.orgName?.cdata || '';
        const email = user.email?.cdata || '';
        return `
            <div id='${id}' class='eng-contact-card-popup' style='display:none; position:absolute; z-index:9999; background:#fff; border:1px solid #ccc; padding:5px; box-shadow:0 2px 8px rgba(0,0,0,0.15); min-width:220px;'>
                <div><strong class='eng-contact-org' style='user-select:text;'>${escapeHtml(org)}</strong></div>
                <div><a href='mailto:${escapeHtml(email)}' class='eng-contact-email' style='user-select:text;'>${escapeHtml(email)}</a></div>
            </div>
        `;
    }

    function bindContactCardEvents() {
        if (contactCardEventsBound) {
            return;
        }
        contactCardEventsBound = true;
        $e(document).off('click.engContactCard', '.eng-contact-link').on('click.engContactCard', '.eng-contact-link', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const $link = $e(this);
            const $wrapper = $link.closest('.eng-contact-link-wrapper');
            const popupId = $link.attr('data-popup-id');
            const popupSelector = '#' + popupId;
            const $popup = $wrapper.find(popupSelector);
            const org = $link.attr('data-contact-org') || '';
            const email = $link.attr('data-contact-email') || '';

            $e('.eng-contact-card-popup').not($popup).remove();
            if ($popup.length === 0) {
                const user = { orgName: { cdata: org }, email: { cdata: email } };
                $wrapper.append(buildContactCard(user, popupId));
                activeContactPopup = $wrapper.find(popupSelector);
            } else {
                activeContactPopup = $popup;
            }
            activeContactLink = $link;
            activeContactPopup.show();
            const popupWidth = activeContactPopup.outerWidth();
            activeContactPopup.css({
                left: -popupWidth / 3.3,
                display: 'block'
            });
            $e(document).off('mousedown.engContactCard').on('mousedown.engContactCard', function (ev) {
                if (activeContactPopup && !activeContactPopup.is(ev.target) && activeContactPopup.has(ev.target).length === 0 && (!activeContactLink || !activeContactLink.is(ev.target)) && (!activeContactLink || activeContactLink.has(ev.target).length === 0)) {
                    activeContactPopup.remove();
                    activeContactPopup = null;
                    activeContactLink = null;
                    $e(document).off('mousedown.engContactCard');
                }
            });
        });
    }

    function selectCellContent(cellContent, columnName, fullRow, rowIndex) {
        if (options.debug == 'debug') console.log('Cell content', tView.id, rowIndex, cellContent.columnReference.columnName, cellContent);
        // Contacts mode cell parsing
        if (tView.isContactsMode) {
            if (columnName == tView.contactCardFields[0]) {
                const contentItem = $e('<div>')
                    .addClass('engineer-table-contact-card')
                    .css('display', 'flex');
                const imageColumn = $e('<div>')
                    .addClass('engineer-table-contact-image')
                    .css('min-width', options.contactImageWidth);
                const textColumn = $e('<div>')
                    .addClass('engineer-table-contact-details')
                    .css('margin-left', '3px');
                if (options.contactCardStyle == 'crop') {
                    textColumn.addClass('contacts-crop');
                } else if (options.contactCardStyle == 'flex') {
                    textColumn.addClass('contacts-flex');
                } else if (options.contactCardStyle == 'wrap') {
                    textColumn.addClass('contacts-wrap');
                }
                const nameItem = $e('<div>')
                    .addClass('contactsModeName contacts-mode-name');
                const imageElement = $e('<img>')
                    .addClass('contactsModeImage contacts-mode-image')
                    .width(options.contactImageWidth);
                const roleItem = $e('<div>')
                    .addClass('contacts-mode-role');
                if (options.contactCardStyle == 'crop') {
                    roleItem.addClass('contacts-crop');
                } else if (options.contactCardStyle == 'flex') {
                    roleItem.addClass('contacts-flex');
                } else if (options.contactCardStyle == 'wrap') {
                    roleItem.addClass('contacts-wrap');
                }
                let showRole;
                const emailItem = $e('<div>')
                    .addClass('contacts-mode-email');
                if (options.contactCardStyle == 'crop') {
                    emailItem.addClass('contacts-crop');
                } else if (options.contactCardStyle == 'flex') {
                    emailItem.addClass('contacts-flex');
                } else if (options.contactCardStyle == 'wrap') {
                    emailItem.addClass('contacts-wrap');
                }
                let showEmail;
                let firstNameItem;
                let lastNameItem;
                let showNotes;
                const noteItem = $e('<div>');
                noteItem.addClass('contacts-mode-notes');
                const cardItem = $e('<div>');
                for (const element of tView.contactCardFields) {
                    const contactField = element;
                    if (contactField == 'Image') {
                        if (!fullRow[contactField] || Object.keys(fullRow[contactField].displayData).length == 0) {
                            if (options.contactPlaceholder != 'false') {
                                imageElement.attr('src', options.contactPlaceholder);
                            }
                        } else {
                            imageElement.attr('src', fullRow[contactField].displayData.cdata);
                        }
                    } else {
                        if (!fullRow[contactField] || !tView.selectedColumns.includes(fullRow[contactField].columnReference.columnPos)) {
                            continue;
                        }
                        if ($e.isEmptyObject(fullRow[contactField].displayData)) {
                            continue;
                        }
                        switch (contactField) {
                            case 'First Name':
                            case 'Name':
                                firstNameItem = $e('<span>')
                                    .html(fullRow[contactField].displayData.cdata + ' ');
                                nameItem.prepend(firstNameItem);
                                break;
                            case 'Last Name':
                                lastNameItem = $e('<span>')
                                    .html(fullRow[contactField].displayData.cdata);
                                nameItem.append(lastNameItem);
                                break;
                            case 'Role':
                            case 'Title':
                                roleItem.html(fullRow[contactField].displayData.cdata);
                                showRole = true;
                                break;
                            case 'Email':
                                if (fullRow[contactField].displayData.cdata) {
                                    emailItem.html('<a class = "' + engineercore_safeCSS(contactField) + '" title = "' + fullRow[contactField].displayData.cdata + '" href = "mailto:' + fullRow[contactField].displayData.cdata + '">'
                                        + fullRow[contactField].displayData.cdata + '</a>');
                                } else {
                                    emailItem.html('<a class = "' + engineercore_safeCSS(contactField) + '" title = "' + fullRow[contactField].rawData.lookup.cdata + '" href = "mailto:' + fullRow[contactField].rawData.lookup.cdata + '">'
                                        + fullRow[contactField].rawData.lookup.cdata + '</a>');
                                }
                                showEmail = true;
                                break;
                            case 'Telephone':
                            case 'Mobile':
                            case 'Cell':
                            case 'Tel': {
                                const phone = fullRow[contactField].displayData.cdata;
                                const trimmedPhone = phone.replaceAll(' ', '');
                                cardItem.html('<div><a class = "' + engineercore_safeCSS(contactField) + '" title = "' + trimmedPhone + '" href = "tel:' + trimmedPhone + '">' + phone + '</a></div>');
                                break;
                            }
                            case 'Notes':
                                noteItem.html('<pre>' + fullRow[contactField].displayData.cdata + '</pre>');
                                showNotes = true;
                                break;
                            default:
                                cardItem.html('<pre>' + fullRow[contactField].displayData.cdata + '</pre>');
                        }
                    }
                }
                imageColumn.append(imageElement);
                textColumn.append(nameItem);
                if (showRole) {
                    textColumn.append(roleItem);
                }
                if (showEmail) {
                    textColumn.append(emailItem);
                }
                textColumn.append(cardItem);
                if (showNotes) {
                    textColumn.append(noteItem);
                }
                contentItem.append(imageColumn);
                contentItem.append(textColumn);
                cellContent.content = contentItem.prop('outerHTML');
                cellContent.rowIndex = rowIndex;
                return cellContent;
            }
        }
        // Default cell parsing
        cellContent.content = '';
        switch (cellContent.columnTypeAlias) {
            case 'SHEET_COLUMN_TYPE_SCORE':
            case 'SHEET_COLUMN_TYPE_CHOICE': {
                if (options.choiceImages == 'true') {
                    cellContent.content = xmlGridObj.rows.row[rowIndex].cell[tView.fileLinkObj[cellContent.columnIndex]].cdata;
                } else if (cellContent.rawData.choice) {
                    if (Array.isArray(cellContent.rawData.choice)) {
                        cellContent.rawData.choice.forEach(choice => {
                            if (!choice.cdata) {
                                cellContent.content += '<div class="table-view"></div>';
                            } else if (choice.style && (options.choiceBadges == 'true' && !choice.style.includes('#000000')) || (options.choiceBadges == 'true' && choice.style.includes('#000000') && options.showDefaultChoiceBadges != 'false')) {
                                let color = choice.style.split(':')[1] || '#000000';
                                cellContent.content += '<div class="table-view badge" title="' + choice.cdata + '" style="background-color:' + color + '; color:' + (function () { try { return engineercore_getForeground(color).color; } catch (e) { return '#fff'; } })() + '">' + choice.cdata + '</div>';
                            } else {
                                cellContent.content += '<div class="table-view" style="' + choice.style + '">' + choice.cdata + '</div>';
                            }
                        });
                    }
                } else {
                    cellContent.content += '<div class="table-view"></div>';
                }
                break;
            }
            case 'SHEET_COLUMN_TYPE_LOOKUP': {
                let userContent = '';
                let rawContent = '';
                const enableContactCards = options.contactCards !== false && options.contactCards !== 'false';
                let users = [];
                if (cellContent.displayData.lookupuser) {
                    if (cellContent.displayData.lookupuser.userDisplayName) {
                        users = [cellContent.displayData.lookupuser];
                    } else {
                        users = cellContent.displayData.lookupuser;
                    }
                }

                if (enableContactCards) {
                    bindContactCardEvents();
                    let userLinks = users.map((user, idx) => {
                        const name = user.userDisplayName?.cdata || '';
                        const org = user.orgName?.cdata || '';
                        const email = user.email?.cdata || '';
                        const cssId = engineercore_safeCSS(email);
                        const popupId = `eng-contact-card-popup-${options.tableElement}-${idx}-${cssId}`;
                        return `
                            <span class='eng-contact-link-wrapper' style='position:relative;'>
                                <a href='#' class='eng-contact-link' data-popup-id='${popupId}' data-contact-org='${escapeHtml(org)}' data-contact-email='${escapeHtml(email)}'>${escapeHtml(name)}</a>
                            </span>
                        `;
                    });
                    userContent = userLinks.join(userLinks.length > 1 ? ', ' : '');
                } else {
                    userContent = users.map(user => {
                        const name = user.userDisplayName?.cdata || '';
                        let email = user.email?.cdata || '';
                        if (email) {
                            email = ' '+escapeHtml(email)
                        }
                        return `${escapeHtml(name)}${email}`;
                    }).join(users.length > 1 ? ', ' : '');
                }
                rawContent = users.map(user => user.email?.cdata || '').join(users.length > 1 ? ', ' : '');
                cellContent.content = `<div class="table-view" data-user='${escapeHtml(rawContent)}'>${userContent}</div>`;
                break;
            }
            case 'SHEET_COLUMN_TYPE_HYPERLINK': {
                let link = '';
                if (!cellContent.rawData.linkDisplayName) {
                    // taskmetadata isheet pass the Task Title as a link but with no linkDisplayURL.
                }
                else if (cellContent.rawData.linkDisplayURL) {
                    link = '<a target="_' + options.linkTab + '" href =' + cellContent.rawData.linkDisplayURL.cdata + '>' + cellContent.rawData.linkDisplayName.cdata + '</a>';
                } else {
                    link = '<pre>' + cellContent.rawData.linkDisplayName.cdata + '</pre>';
                }
                cellContent.content = link;
                break;
            }
            case 'SHEET_COLUMN_TYPE_IMAGE': {
                if (cellContent.rawData.cdata !== undefined) {
                    cellContent.content = '<a href=' + cellContent.rawData.cdata + '><img src=' + cellContent.rawData.cdata + '></a>';
                }
                break;
            }
            case 'SHEET_COLUMN_TYPE_AUTO_INCREMENT':
            case 'SHEET_COLUMN_TYPE_FORMULA':
            case 'SHEET_COLUMN_TYPE_NUMBER': {
                let defaultContent = cellContent.displayData?.cdata ? cellContent.displayData.cdata : '';
                cellContent.numeric = '';
                if (defaultContent) {
                    let decimals = defaultContent.split('.')[1];
                    let decimalPlaces = decimals ? decimals.length : 0;
                    cellContent.numeric = Number.parseFloat(Number.parseFloat(cellContent.rawData.cdata).toFixed(decimalPlaces));
                }
                if (options.progressColumns.length == 0 || !options.progressColumns.includes(cellContent.columnReference.columnPos)) {
                    cellContent.content = '<div class="table-view" data-value="' + cellContent.numeric + '" style="text-align:' + options.numberAlign + ';padding-right:3px;">' + defaultContent + '</div>';
                } else if (options.progressColumns.includes(cellContent.columnReference.columnPos)) {
                    if (defaultContent.length == 0) {
                        cellContent.content = '<div class="table-view">' + defaultContent + '</div>';
                    } else {
                        let barColor;
                        if (cellContent.numeric < 100) {
                            barColor = options.progressColor;
                        } else if (cellContent.numeric == 100) {
                            barColor = options.progressColorComplete;
                        }
                        else {
                            barColor = options.progressColorExceeded;
                        }
                        cellContent.content = '<div class="table-view table-progress" data-value="' + cellContent.numeric + '" style="background:' + (options.progress3d === true ? 'linear-gradient(0deg, transparent 70%, #ffffff8c),' : '') + ' linear-gradient(90deg, ' + barColor + ' ' + cellContent.numeric + '%, transparent 0);">' + defaultContent + '</div>';
                    }
                }
                break;
            }
            case 'SHEET_COLUMN_TYPE_DOCUMENT_LINK':
            case 'SHEET_COLUMN_TYPE_FOLDER_LINK':
            case 'SHEET_COLUMN_TYPE_ATTACHMENT':
            case 'SHEET_COLUMN_TYPE_JOIN': {
                // Render clickable links that will fetch the item via API and open the correct URL
                const itemId = (xmlObj?.view?.data?.item?.[rowIndex]?.itemID?.cdata) ? xmlObj.view.data.item[rowIndex].itemID.cdata : '';
                const makeOnclick = function (fileName, fileExt) {
                    return "window.engineerLegalPlugins.table.openColumnLink('" + options.highqAPIVersion + "'," + options.sheetID + "," + options.sheetViewID + "," + itemId + ",'" + cellContent.columnReference.columnID + "','" + cellContent.columnTypeAlias + "','" + fileName + "','" + fileExt + "'); return false;";
                };

                let anchors = [];
                // Attachments
                if (cellContent.columnTypeAlias == 'SHEET_COLUMN_TYPE_ATTACHMENT') {
                    const rawAttach = cellContent.rawData?.attachment;
                    if (rawAttach) {
                        const arr = Array.isArray(rawAttach) ? rawAttach : [rawAttach];
                        arr.forEach(a => {
                            const name = a?.attachmentName.cdata;
                            if (!name) {
                                return;
                            }
                            const ext = a?.attachmentExtension?.cdata;
                            const iconHtml = '<img class="imgIcon tooltipShow" src="./images/fileicon/large_' + ext + '.svg" alt="' + ext + '" title="" data-original-title="' + ext + '">';
                            anchors.push('<a href="#" class="table-view el-file-link" onclick="' + makeOnclick(name, ext) + '">' + iconHtml + name + '</a>');
                        });
                    }
                }

                    // Document links
                    if (cellContent.columnTypeAlias == 'SHEET_COLUMN_TYPE_DOCUMENT_LINK') {
                        const rawDoc = cellContent.rawData?.document;
                        if (rawDoc) {
                            const arr = Array.isArray(rawDoc) ? rawDoc : [rawDoc];
                            arr.forEach(d => {
                                const name = d?.docName?.cdata;
                                if (!name) {
                                    return;
                                }
                                const ext = d?.docExtension?.cdata;
                                const safeExt = (ext || '').toString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'file';
                                const iconHtml = '<img class="imgIcon tooltipShow" src="./images/fileicon/large_' + safeExt + '.svg" alt="' + safeExt + '" title="" data-original-title="' + safeExt + '">';
                                anchors.push('<a href="#" class="table-view el-file-link" onclick="' + makeOnclick(name, safeExt) + '">' + iconHtml + ' ' + escapeHtml(name) + '</a>');
                            });
                        }
                    }

                    // Folder links
                    if (cellContent.columnTypeAlias == 'SHEET_COLUMN_TYPE_FOLDER_LINK') {
                        const rawFolder = cellContent.rawData?.folder;
                        if (rawFolder) {
                            const arr = Array.isArray(rawFolder) ? rawFolder : [rawFolder];
                            arr.forEach(f => {
                                let name = f?.folderName?.cdata;
                                if (!name) {
                                    return;
                                }
                                name = name.replace('/', '');
                                if (name.length < 1) {
                                    return;
                                }
                                const iconHtml = '<span class="icon-folder"></span>';
                                anchors.push('<a href="#" class="table-view el-file-link" onclick="' + makeOnclick(name, '') + '">' + iconHtml + ' ' + escapeHtml(name) + '</a>');
                            });
                        }
                    }

                    // Join (single value) or fallback
                    if (cellContent.columnTypeAlias == 'SHEET_COLUMN_TYPE_JOIN' && cellContent.rawData?.cdata) {
                        anchors.push('<a href="#" class="table-view el-join el-file-link" onclick="' + makeOnclick('', '') + '">' + escapeHtml(cellContent.rawData.cdata) + '</a>');
                    }

                    if (anchors.length > 0) {
                        cellContent.content = '<div class="table-view">' + anchors.join(' ') + '</div>';
                    } else {
                        cellContent.content = '<div class="table-view"></div>';
                    }
                    break;
                
            }
            case 'SHEET_COLUMN_TYPE_MULTIPLE_LINE_TEXT': {
                let defaultContent = cellContent.displayData?.cdata ? cellContent.displayData.cdata : '';
                let containerType;
                if (cellContent.rawData.richHtml?.cdata == 'NO') {
                    containerType = 'pre';
                } else {
                    containerType = 'div';
                }
                if (options.truncateText && defaultContent.length > options.truncateText) {
                    let truncatedContent = defaultContent.substr(0, options.truncateText);
                    let temp = document.createElement(containerType);
                    temp.innerHTML = truncatedContent;
                    truncatedContent = temp.innerHTML;
                    cellContent.content = '<div class="table-view"><' + containerType + ' class="el-table-fullcontent hidden">' + defaultContent + '</' + containerType + '><' + containerType + ' class="el-table-truncated">' + truncatedContent + '...</' + containerType + '><a class="el-table-showmore">' + options.showMoreTitle + '</a></div>';
                } else {
                    cellContent.content = '<' + containerType + ' class="table-view"><div class="el-table-fullcontent">' + defaultContent + '</div></' + containerType + '>';
                }
                break;
            }
            case 'SHEET_COLUMN_TYPE_SINGLE_LINE_TEXT': {
                let defaultContent = cellContent.displayData?.cdata ? cellContent.displayData.cdata : '';
                if (options.truncateText && defaultContent.length > options.truncateText) {
                    let truncatedContent = defaultContent.substr(0, options.truncateText);
                    let temp = document.createElement('div');
                    temp.innerHTML = truncatedContent;
                    truncatedContent = temp.innerHTML;
                    cellContent.content = '<div><div class="el-table-fullcontent hidden">' + defaultContent + '</div><div class="el-table-truncated">' + truncatedContent + '...</div><a class="el-table-showmore">' + options.showMoreTitle + '</a></div>';
                } else {
                    cellContent.content = '<div class="table-view">' + defaultContent + '</div>';
                }
                break;
            }
            case 'SHEET_COLUMN_TYPE_DATE_AND_TIME': {
                let defaultContent = cellContent.displayData?.cdata ? cellContent.displayData.cdata : '';
                let rawContent = cellContent.rawData?.cdata ? cellContent.rawData.cdata : '';
                if (defaultContent != rawContent) {
                    cellContent.content = '<div class="table-view" data-date="' + rawContent + '">' + defaultContent + '</div>';
                } else if (cellContent.columnReference.xmlReference.properties.property[1].propertyTypeAlias == 'SHEET_COL_PROP_TYPE_DATE_FORMAT') {
                    cellContent.content = '<div class="table-view" data-date="' + parseDate(defaultContent, cellContent.columnReference.xmlReference.properties.property[1].cdata) + '">' + defaultContent + '</div>';
                } else {
                    cellContent.content = '<div class="table-view">' + defaultContent + '</div>';
                }
                break;
            }
            default: {
                let defaultContent = cellContent.displayData?.cdata ? cellContent.displayData.cdata : '';
                if (options.truncateText && defaultContent.length > options.truncateText) {
                    let truncatedContent = defaultContent.substr(0, options.truncateText);
                    let temp = document.createElement('div');
                    temp.innerHTML = truncatedContent;
                    truncatedContent = temp.innerHTML;
                    cellContent.content = '<div><div class="el-table-fullcontent hidden">' + defaultContent + '</div><div class="el-table-truncated">' + truncatedContent + '...</div><a class="el-table-showmore">' + options.showMoreTitle + '</a></div>';
                } else {
                    cellContent.content = '<div>' + defaultContent + '</div>';
                }
            }
        }
        cellContent.rowIndex = rowIndex;
        return cellContent;
    }

    function parseDate(rawDateStr, formatStr) {
        if (rawDateStr == '') {
            return '';
        }
        const monthMap = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };

        const separators = [' ', '.', '/', ':'];
        const formatParts = formatStr.split(/[^a-zA-Z]+/);
        const rawParts = rawDateStr.split(new RegExp(`[${separators.join('')}]`));

        let day, month, year, hours = rawParts[3] ? Number.parseInt(rawParts[3], 10) : 0, minutes = rawParts[4] ? Number.parseInt(rawParts[4], 10) : 0;
        formatParts.forEach((part, i) => {
            const value = rawParts[i];
            switch (part) {
                case 'dd':
                    day = Number.parseInt(value, 10);
                    break;
                case 'mm':
                    month = Number.parseInt(value, 10) - 1;
                    break;
                case 'MMM':
                    month = monthMap[value];
                    break;
                case 'yyyy':
                    year = Number.parseInt(value, 10);
                    break;
            }
        });

        const dateObj = new Date(Date.UTC(year, month, day, hours, minutes));
        return dateObj.toISOString().replace('Z', '');
    }

    function attachShowMore() {
        $e('#' + options.tableElement + ' .el-table-showmore')
            .attr('href', '#')
            .on('click', function () {
                if ($e(this).text() == options.showMoreTitle) {
                    $e(this).text(options.showLessTitle);
                } else {
                    $e(this).text(options.showMoreTitle);
                }
                let $parenttd = $e(this).closest('td');
                $parenttd.find('.el-table-fullcontent').toggleClass('hidden');
                $parenttd.find('.el-table-truncated').toggleClass('hidden');
            });
    }

    function openRowMenu(dropdownButton, itemId, rowIndex) {
        // build menu
        let buttonPos = $e(dropdownButton).offset();
        buttonPos.top = buttonPos.top + $e(dropdownButton).height() * 2;
        if ($e('.eng-table-row-dropdown.' + itemId).length > 0) {
            $e('.eng-table-row-dropdown').remove();
        } else {
            if ($e('.eng-table-row-dropdown').length > 0) {
                $e('.eng-table-row-dropdown').remove();
            }
            let tableBtnLink = '';
            let dropdown = $e('<div>')
                .addClass('dropdown eng-table-row-dropdown ' + itemId)
                .css({ 'position': 'absolute', 'top': buttonPos.top, 'left': buttonPos.left });
            let dropdownMenu = $e('<ul class="dropdown-menu" style="top:unset; margin:0"></ul>');
            options.recordMenu.forEach(menuItemType => {
                let invalid;
                let $menuItem = $e('<li>');
                let $menuLink = $e('<a>');
                if (typeof menuItemType === 'function') {
                    menuItemType(dropdownMenu, xmlObj.view.data.item[rowIndex]);
                } else {
                    switch (menuItemType) {
                        case 'print':
                            $menuLink = buildRowButtonLink(menuItemType, tableBtnLink, itemId, $menuLink);
                            $menuLink.text(options.menuPrintTitle);
                            break;
                        case 'fillPDF':
                            $menuLink = buildRowButtonLink(menuItemType, tableBtnLink, itemId, $menuLink);
                            $menuLink.text(options.menuPDFTitle);
                            break;
                        case 'isheet':
                            $menuLink = buildRowButtonLink(menuItemType, tableBtnLink, itemId, $menuLink);
                            $menuLink.text(options.menuViewIsheetTitle);
                            $menuLink.attr('target', '_' + options.buttonTab);
                            break;
                        case 'default':
                            $menuLink = buildRowButtonLink(menuItemType, tableBtnLink, itemId, $menuLink);
                            $menuLink.text(options.menuViewDefaultTitle);
                            $menuLink.attr('target', '_' + options.buttonTab);
                            break;
                        case 'viewItem':
                            $menuLink = buildRowButtonLink(menuItemType, tableBtnLink, itemId, $menuLink);
                            $menuLink.text(options.menuViewItemTitle);
                            break;
                        case 'edit':
                            $menuLink = buildRowButtonLink(menuItemType, tableBtnLink, itemId, $menuLink);
                            $menuLink.text(options.menuEditModalTitle);
                            break;
                        case 'editInline':
                            if (options.inlineEdit) {
                                $menuLink = buildRowButtonLink(menuItemType, tableBtnLink, itemId, $menuLink);
                                $menuLink.text(options.menuEditTitle)
                                    .addClass('inline-edit');
                            }
                            break;
                        default:
                            invalid = true;
                            break;
                    }
                }
                if (!invalid) {
                    $menuItem.append($menuLink);
                    dropdownMenu.append($menuItem);
                }
            });
            options.joins.forEach((joinObj) => {
                let $menuItem = $e('<li>');
                let $menuLink = $e('<a>');
                let joinTerm = xmlObj.view.data.item[rowIndex].column[options.joinColumn].displayData.cdata;
                let linkTitle = Object.values(joinObj)[0];
                let joinTable = Object.keys(joinObj)[0];
                $menuLink.text(linkTitle);
                let functionName = 'tableJoin' + options.tableElement + '_' + joinTable;
                functionName = engineercore_safeCSS(functionName).replace('-', '_');
                window.engineerLegalPlugins.table[functionName] = function (joinParam) {
                    window.engineerLegalPlugins.table[options.tableElement + '_join'] = xmlObj.view.data.item[rowIndex];
                    let joinOptions = window.engineerLegalPlugins.table[joinTable];
                    joinOptions.awaitJoin = null;
                    joinOptions.filterTerm = joinParam.toUpperCase();
                    if (joinOptions.openModal == 'true') {
                        joinOptions.iSheetViewLink = engineercore_getLink(joinTable);
                        joinOptions.tableElement = 'engModalBody';
                        engineercore_modal('Table');
                        $e('#engineerModal .modal-body')
                            .attr('id', 'engModalBody');
                    }
                    engineerTable(joinOptions);
                    if (joinOptions.openModal == 'true') {
                        $e('#engineerModal').modal();
                    }
                };
                $menuLink.attr('onclick', 'window.engineerLegalPlugins.table.' + functionName + '(\'' + joinTerm + '\')');


                $menuItem.append($menuLink);
                dropdownMenu.append($menuItem);
            });

            // process joinAll option. This should work like options.joins but should call functions from a single link in the recordMenu
            options.joinAll.forEach((joinObj) => {
                let $menuItem = $e('<li>');
                let $menuLink = $e('<a>');
                let joinTerm = xmlObj.view.data.item[rowIndex].column[options.joinColumn].displayData.cdata;
                let linkTitle = Object.keys(joinObj)[0];
                let joinTables = joinObj[linkTitle]; // array of join table names

                $menuLink.text(linkTitle);
                let functionName = 'tableJoinAll' + options.tableElement + '_' + linkTitle;
                functionName = engineercore_safeCSS(functionName).replace('-', '_');
                window.engineerLegalPlugins.table[functionName] = function (joinParam, joinTables) {
                    window.engineerLegalPlugins.table[options.tableElement + '_join'] = xmlObj.view.data.item[rowIndex];
                    let joinTablesArray = JSON.parse(joinTables);
                    for (const element of joinTablesArray) {
                        let jt = element.trim();
                        let joinOptions = window.engineerLegalPlugins.table[jt];
                        joinOptions.awaitJoin = null;
                        joinOptions.filterTerm = joinParam.toUpperCase();
                        engineerTable(joinOptions);
                    }
                };
                $menuLink.attr('onclick', 'window.engineerLegalPlugins.table.' + functionName + '(\'' + joinTerm + '\', \'' + JSON.stringify(joinTables) + '\')');


                $menuItem.append($menuLink);
                dropdownMenu.append($menuItem);
            });

            dropdown.append(dropdownMenu);
            $e('body').append(dropdown);
            dropdownMenu.addClass('show');
            rebindCKContentLink();
            dropdownMenu.find('a').on('click', function () {
                setTimeout(() => {
                    $e('.eng-table-row-dropdown').hide();
                }, 300);
                setTimeout(() => {
                    $e('.eng-table-row-dropdown').remove();
                }, 5000);
            });
        }
    }

    function parseJSON(jsonFile) {
        options.columnAPIDetails = JSON.parse(jsonFile);
    }

    function getAPIColumnDetails() {
        if (options.debug) {
            engineercore_loadDoc(options.debugURL, parseJSON);
            return;
        }
        if (options.useHighQAPIFunctions == 'true') {

            let highqPayload = {
                'REQUEST_TYPE': 'GET',
                'REQUEST_URL': './api/' + options.highqAPIVersion + '/isheets/admin/' + options.sheetID + '/columns?sheetviewid=' + options.sheetViewID,
                'HEADERS': { 'Accept': 'application/json' }
            };

            try {
                GriffinCommon.customAjaxSubmit(highqPayload, data => parseColumns(data));
            } catch (error) {
                options.useHighQAPIFunctions = 'false';
                console.error('Error calling HighQ API using GriffinCommon.customAjaxSubmit, falling back to fetch: ' + error);
                getAPIColumnDetails();
            }


        } else {
            let requestOptions = {
                method: 'GET',
                headers: engineerAPI_Headers()
            };

            fetch('./api/' + options.highqAPIVersion + '/isheets/admin/' + options.sheetID + '/columns?sheetviewid=' + options.sheetViewID, requestOptions)
                .then(response => response.json())
                .then(data => parseColumns(data))
                .catch(error => {
                    console.error(error);
                });
        }

        function parseColumns(data) {
            options.columnAPIDetails = data;
            let columnNotEditable = 0;
            options.columnAPIDetails.column.forEach((column, i) => {
                if (!inlineEditSupported(column) || column.editpermission == 0) {
                    columnNotEditable++;
                } else if (options.inlineEditColumns.length > 0) {
                    if (!options.inlineEditColumns.includes(column.name)) {
                        columnNotEditable++;
                    }
                } else if (options.inlineEditBlacklist.length > 0) {
                    if (options.inlineEditColumns.includes(column.name)) {
                        columnNotEditable++;
                    }
                }
                if (columnNotEditable == options.columnAPIDetails.column.length) {
                    options.inlineEdit = false;
                    console.warn('User does not have have rights for inline edit');
                    $e('#' + options.tableElement + ' .inline-edit').addClass('disabled');
                }
            });
        }
    }

    function addHeaderMessage(text) {
        if (topMessage) {
            topMessage += ' - ' + text;
        } else {
            topMessage = text;
        }
        addTableHeaderMessage($e('#' + options.tableElement + '-menu'));
    }

    function setLastModifiedNotice() {
        if (options.showLastModified == 'true') {
            addHeaderMessage('Last modified: ' + engineercore_getLastModifiedDate(xmlObj));
        }
    }

    function hideLoading() {
        $e('#' + options.tableElement + ' .el-loading').hide();
    }

    // Global helper to fetch an item via API and open file/document/folder/join links
    try {
        window.engineerLegalPlugins = window.engineerLegalPlugins || {};
        window.engineerLegalPlugins.table = window.engineerLegalPlugins.table || {};
        window.engineerLegalPlugins.table.openColumnLink = function (apiVersion, sheetId, viewId, itemId, columnId, columnTypeAlias, fileName, fileExt) {
            const endpoint = './api/' + apiVersion + '/isheet/' + sheetId + '/items/' + itemId + '?sheetviewid=' + viewId;
            const headers = engineerAPI_Headers();
            fetch(endpoint, { method: 'GET', headers: headers })
                .then(resp => {
                    if (!resp.ok) throw new Error('Network response was not ok');
                    return resp.json();
                })
                .then(data => {
                    const cols = data?.isheet?.data?.item?.column;
                    if (!cols) {
                        console.error('No column data returned for item', itemId);
                        return;
                    }
                    const arr = Array.isArray(cols) ? cols : [cols];
                    const col = arr.find(c => String(c.attributecolumnid || c.columnid) === String(columnId));
                    if (!col) {
                        console.error('Column not found in item payload', columnId, arr);
                        return;
                    }
                    let targetUrl;
                    switch (columnTypeAlias) {
                        case 'SHEET_COLUMN_TYPE_ATTACHMENT': {
                            const attach = col.displaydata.attachments?.attachment;
                            if (attach) {
                                const arr = Array.isArray(attach) ? attach : [attach];
                                let chosen;
                                chosen = arr.find(att => {
                                    const nameMatch = att.attachmentname ? fileName === att.attachmentname : true;
                                    const extMatch = fileExt ? fileExt === att.attachmentnxtension : true;
                                    return nameMatch && extMatch;
                                });
                                if (!chosen) {
                                    throw new Error('Attachment not found with specified name and extension');
                                }
                                try {
                                    const tempAnchor = document.createElement('a');
                                    tempAnchor.style.display = 'none';
                                    const site = options.siteID;
                                    const sid = JSON.stringify(sheetId);
                                    const chosenId = Number.parseInt(chosen.id || chosen.attachmentid || 0);
                                    const iid = JSON.stringify(itemId);
                                    const cid = Number.parseInt(columnId);
                                    const onclick = `GriffinCommon.openAdeptolDialogForExternal(this,${site},${chosenId},${iid},${cid},${sid});`;
                                    console.log('Triggering Adeptol dialog with onclick:', onclick);
                                    tempAnchor.setAttribute('onclick', onclick);
                                    document.body.appendChild(tempAnchor);
                                    tempAnchor.click();
                                    tempAnchor.remove();
                                    return;
                                } catch (err) {
                                    console.error('Failed to trigger Adeptol dialog for attachment', err);
                                }
                            }
                            break;
                        }
                        case 'SHEET_COLUMN_TYPE_DOCUMENT_LINK': {
                            const doc = col.displaydata?.documents?.document;
                            if (doc) {
                                const arr = Array.isArray(doc) ? doc : [doc];
                                let chosen;
                                chosen = arr.find(x => {
                                    const nameMatch = x.docname === fileName;
                                    const extMatch = x.docextension === fileExt;
                                    return nameMatch && extMatch;
                                });
                                if (!chosen) {
                                    throw new Error('Document not found with specified name and extension');
                                }
                                let $clickableLink = $e('<a>')
                                    .attr('href', './documentHome.action?metaData.siteID=' + options.siteID + '&amp;metaData.documentID=' + chosen.docid)
                                    .attr('target', '_self')
                                    .attr('id', '{"linkType":"document","siteID":"' + options.siteID + '","contextID":"' + chosen.docid + '"}')
                                    .addClass('CKContextLink el-temp-link')
                                    .appendTo('body')
                                console.log('Simulating click on document link:', $clickableLink);
                                rebindCKContentLink();
                                $clickableLink
                                    .click()
                                    .remove();
                            }
                            break;
                        }
                        case 'SHEET_COLUMN_TYPE_FOLDER_LINK': {
                            const folder = col.displaydata && (col.displaydata.folders?.folder || col.displaydata.folder);
                            if (folder) {
                                const arr = Array.isArray(folder) ? folder : [folder];
                                let chosen;
                                if (fileName) {
                                    const fn = fileName.toString().toLowerCase().trim();
                                    chosen = arr.find(f => ((f.foldername || f.folderName || '').toString().toLowerCase().trim()) === fn);
                                }
                                if (!chosen) chosen = arr[0];
                                let httplink = chosen.httplink || chosen.apiurl || chosen.apilink || '';
                                if (httplink && chosen.folderid) {
                                    httplink = httplink.replace(/(parentFolderID=)(\d+)/, `$1${chosen.folderid}`);
                                }
                                targetUrl = httplink;
                            }
                            break;
                        }
                        case 'SHEET_COLUMN_TYPE_JOIN': {
                            const isheet = col.displaydata?.isheetitem;
                            if (isheet) {
                                const it = Array.isArray(isheet) ? isheet[0] : isheet;
                                targetUrl = it.httplink;
                            }
                            break;
                        }
                        default:
                            console.warn('Unsupported column type for openColumnLink:', columnTypeAlias);
                    }
                    if (targetUrl) {
                        window.open(targetUrl, '_blank');
                    } else {
                        console.warn('No URL found for column', columnId, col);
                    }
                })
                .catch(err => console.error('Error fetching item for openColumnLink', err));
        };
    } catch (e) { console.error('Failed to register openColumnLink', e); }
}

function inlineEditSupported(column) {
    switch (column.type) {
        case 2:
            if (column.columnspecificdetail.allowrichhtmltext == '0') {
                return true;
            } else {
                console.warn('Inline edit of HTML Multiline Text columns are not currently supported');
                return false;
            }
        case 1:
        case 3:
        case 4:
        case 9:
        case 17:
            return true;
        case 6:
            return column.columnspecificdetail.sheetlookup == 'SHEET_LOOKUP_ALL_SYSTEM_USERS' || column.columnspecificdetail.sheetlookup == 'SHEET_LOOKUP_ALL_SITE_USERS';
        case 5:
            return !(column.name == 'Modified date' || column.name == 'Created date');

        default:
            console.warn('Inline edit of column type ' + column.type + ' is not currently supported');
            return false;
    }
}

function engineerLegal_tableEditInline(tableBtnLink, itemId, uuid) {
    let options = window.engineerLegalPlugins.table[uuid];
    const editMode = 'edit-mode';
    const _slt = 1;
    const _mlt = 2;
    const _cho = 3;
    const _num = 4;
    const _dat = 5;
    const _usr = 6;
    const _att = 9;
    const _sco = 17;
    let fileCount = 0;
    let fileUploads = 0;
    let colMap = new Map();

    cancelEdit();

    if (!options.columnAPIDetails && !options.debug) {
        alert('Awaiting HighQ permissions check, please try again');
        return;
    }

    let $editCells = $e('#' + uuid + ' [data-iid = ' + itemId + ']');

    // Fetch the full item payload once and reuse for user lookups and attachments
    let itemApiData = null;
    const _itemEndpoint = './api/' + options.highqAPIVersion + '/isheet/' + options.sheetID + '/items/' + itemId + '?sheetviewid=' + options.sheetViewID;
    const _itemHeaders = engineerAPI_Headers();

    function renderEditCells() {
        $editCells.each(function (i, cell) {
            let $cell = $e(cell);
            let $cellContent = $cell.find('.table-view');
            let APIColumn;

            if ($cell.hasClass('eng-table-button-cell')) {
                $cellContent.addClass('edit-hide');
                $cell.append($e('<button>')
                    .addClass('btn inline-save btn-success ' + editMode)
                    .attr('title', 'Save')
                    .attr('aria-label', 'Save')
                    .css('padding', '6px 4px')
                    .html('<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M13.2 3.5 6.1 10.6 2.8 7.3l-1.1 1.1 4.4 4.4 8.2-8.2z" fill="currentColor"/></svg>')
                    .click(function () {
                        engineerUpdateRow();
                    })
                );
                $cell.append($e('<button>')
                    .addClass('btn inline-cancel btn-warning ' + editMode)
                    .attr('title', 'Cancel edit')
                    .attr('aria-label', 'Cancel edit')
                    .css('padding', '6px 4px')
                    .html('<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M4.1 3.5 8 7.4l3.9-3.9 1.1 1.1L9.1 8.5l3.9 3.9-1.1 1.1L8 9.6 4.1 13.5 3 12.4l3.9-3.9L3 4.6z" fill="currentColor"/></svg>')
                    .click(function () {
                        cancelEdit();
                    })
                );
                $cell.append($e('<img>')
                    .attr('src', './images/gray-loader.gif')
                    .addClass('running ' + editMode)
                    .css({ 'width': '34px', 'height': '34px', 'display': 'none' })
                );
            } else if ($cellContent.length) {
                for (const column of options.columnAPIDetails.column) {
                    if (column.columnid == Number.parseInt($cell.attr('data-cid'))) {
                        if (column.editpermission == 0) {
                            console.warn('Column "' + column.name + '" cannot be edited inline due to lack of user permission');
                            return;
                        }
                        if (column.parentColumnID) {
                            console.warn('Column "' + column.name + '" cannot be edited as it is part of a lookup');
                            return;
                        }
                        if (!inlineEditSupported(column)) {
                            console.warn('Column "' + column.name + '" cannot be edited as this column type is not suported');
                            return;
                        }
                        if (options.inlineEditColumns.length > 0) {
                            if (!options.inlineEditColumns.includes(column.name)) {
                                console.warn('Column "' + column.name + '" cannot be edited as it is excluded by the inlineEditColumns option');
                                return;
                            }
                        } else if (options.inlineEditBlacklist.length > 0) {
                            if (options.inlineEditBlacklist.includes(column.name)) {
                                console.warn('Column "' + column.name + '" cannot be edited as it is excluded by the inlineEditBlacklist option');
                                return;
                            }
                        }
                        APIColumn = column;
                    }
                }
                if (APIColumn) {
                    $cellContent.addClass('edit-hide');
                    let cellType = APIColumn.type;
                    let cellcontent = $cellContent.text();
                    let fileIds = [];
                    switch (cellType) {
                        case _slt:
                            $cell.append($e('<div>')
                                .addClass('form-group ' + editMode)
                                .append($e('<input>')
                                    .addClass('form-control etile')
                                    .attr('maxlength', APIColumn.columnspecificdetail.maxchars)
                                    .val(cellcontent)
                                )
                            );
                            break;
                        case _mlt:
                            $cell.append($e('<div>')
                                .addClass('form-group ' + editMode)
                                .append($e('<textarea>')
                                    .addClass('form-control etile')
                                    .height(options.editInlineHeight)
                                    .val($cellContent.find('.el-table-fullcontent').text())
                                )
                            );
                            break;
                        case _num: {
                            $cell.append($e('<div>')
                                .addClass('form-group ' + editMode)
                                .append($e('<input>')
                                    .addClass('form-control etile')
                                    .val($cellContent.attr('data-value'))
                                    .on('keyup', function () {
                                        if (!/^[0-9.,]+$/.test($e(this).val())) {
                                            $e(this).closest('.form-group').addClass('has-error');
                                            $e('#' + options.tableElement + ' .inline-save').prop('disabled', true);
                                        } else {
                                            $e(this).closest('.form-group').removeClass('has-error');
                                            $e('#' + options.tableElement + ' .inline-save').prop('disabled', false);
                                        }
                                    })
                                )
                            );
                            break;
                        }
                        case _sco:
                        case _cho: {
                            let $select;
                            let coldetails = APIColumn.columnspecificdetail;
                            let cellChoices = [];
                            let otherVal;
                            for (let cell of $cellContent) {
                                cellChoices.push(cell.innerText);
                            }
                            let apiChoices = [];
                            if (coldetails.displaymethod == 'DROPDOWN' || coldetails.displaymethod == 'RADIO') {
                                $select = $e('<select>');
                                $select.css({ 'margin-right': '2px', 'width': '100%' })
                                    .addClass('form-control etile');
                                if (coldetails.mandatory == 0) {
                                    $select.append('<option value="">     </option>');
                                }
                                $select.append(function () {
                                    let dropdownOptions = '';
                                    coldetails.choices.choice.forEach(element => {
                                        let label = engineerAPI_removeCdata(element.label);
                                        apiChoices.push(label);
                                        let selected = '';
                                        if (cellcontent == label) {
                                            selected = ' selected';
                                        }
                                        dropdownOptions += '<option' + selected + ' value="' + element.id + '">' + label + '</option>';
                                    });
                                    cellChoices.forEach(cellVal => {
                                        if (apiChoices.indexOf(cellVal) == -1) {
                                            otherVal = cellVal;
                                        }
                                    });
                                    if (coldetails.includeotheroption == '1') {
                                        let selected = '';
                                        if (otherVal) {
                                            selected = ' selected';
                                        }
                                        dropdownOptions += '<option' + selected + ' value="-1">Other</option>';
                                    }
                                    return dropdownOptions;
                                });
                            } else if (coldetails.displaymethod == 'CHECKBOX') {
                                $select = $e('<select multiple>');
                                $select.addClass('form-control etile multi-select')
                                    .attr('title', 'Use CTRL or Command + Left Click to select multiple')
                                    .height(options.editInlineHeight)
                                    .append(function () {
                                        let dropdownOptions = '';
                                        coldetails.choices.choice.forEach(element => {
                                            let label = engineerAPI_removeCdata(element.label);
                                            apiChoices.push(label);
                                            let selected = '';
                                            if ($cellContent.length > 0) {
                                                if (cellChoices.includes(label)) {
                                                    selected = ' selected';
                                                }
                                            }
                                            dropdownOptions += '<option' + selected + ' value="' + element.id + '">' + label + '</option>';
                                        });
                                        cellChoices.forEach(cellVal => {
                                            if (!apiChoices.includes(cellVal)) {
                                                otherVal = cellVal;
                                            }
                                        });
                                        if (coldetails.includeotheroption == '1') {
                                            let selected = '';
                                            if (otherVal) {
                                                selected = ' selected';
                                            }
                                            dropdownOptions += '<option' + selected + ' value="-1">Other</option>';
                                        }
                                        return dropdownOptions;
                                    });
                            }
                            let $cellForm = $e('<div>')
                                .addClass('form-group ' + editMode)
                                .append($select);

                            if (coldetails.includeotheroption == '1') {
                                let $otherInput = $e('<input>')
                                    .css({ 'margin-right': '2px', 'width': '100%', 'height': '32px' })
                                    .attr('id', options.uuid + '-' + APIColumn.columnid + '-other')
                                    .attr('placeholder', 'Other')
                                    .addClass('form-control el-other');
                                if (!otherVal) {
                                    $otherInput.attr('disabled', 'true');
                                } else {
                                    $otherInput.val(otherVal);
                                }
                                $cellForm.append($otherInput);
                                $select.on('change', function () {
                                    if ($e(this).val() == -1 || $e(this).val().indexOf('-1') > -1) {
                                        $e('#' + options.uuid + '-' + APIColumn.columnid + '-other').removeAttr('disabled');
                                    } else {
                                        $e('#' + options.uuid + '-' + APIColumn.columnid + '-other').attr('disabled', 'true');
                                    }
                                });
                            }
                            $cell.append($cellForm);
                            break;
                        }
                        case _dat: {
                            let dateOnly = APIColumn.columnspecificdetail.formattype == 'DATE_ONLY';
                            let datetime = $cellContent.attr('data-date');
                            let date = datetime.split('T')[0];
                            $cell.append($e('<div>')
                                .addClass('form-group ' + editMode)
                                .append($e('<input>')
                                    .val(dateOnly ? date : datetime)
                                    .attr('type', dateOnly ? 'date' : 'datetime-local')
                                    .addClass('form-control etile')
                                    .css({ 'margin-right': '2px', 'width': '125px' }))
                            );
                            break;
                        }
                        case _usr: {
                            // User lookup typeahead (single or multiple)
                            let coldetails = APIColumn.columnspecificdetail;
                            let allowMultiple = coldetails.allowmultipleusers == '1';

                            let $wrapper = $e('<div>').addClass('form-group ' + editMode).css({ 'position': 'relative' });
                            let $chips = $e('<div>').addClass('user-chips').css({ 'min-height': '34px', 'display': 'flex', 'flex-wrap': 'wrap', 'gap': '4px', 'align-items': 'center' });
                            let $input = $e('<input>')
                                .addClass('form-control etile user-typeahead')
                                .attr('type', 'text')
                                .attr('placeholder', allowMultiple ? 'Search users (multiple allowed)' : 'Search users')
                                .css({ 'flex': '1 0 150px', 'min-width': '120px' });
                            let $list = $e('<ul>').addClass('user-suggest-list').css({ 'position': 'absolute', 'z-index': 9999, 'background': '#fff', 'list-style': 'none', 'padding': '4px', 'margin': 0, 'border': '1px solid #ccc', 'width': '100%', 'max-height': '200px', 'overflow': 'auto', 'display': 'none' });

                            // Parse existing users from display (try to extract user ids from anchors if present)
                            let existingIds = [];

                            if (existingIds.length === 0 && itemApiData) {
                                try {
                                    const cols = itemApiData?.isheet?.data?.item?.column;
                                    const arr = Array.isArray(cols) ? cols : (cols ? [cols] : []);
                                    const col = arr.find(c => String(c.attributecolumnid || c.columnid) === String(APIColumn.columnid));
                                    if (col) {
                                        const lookups = col.displaydata?.lookupusers?.lookupuser;
                                        const lkArr = Array.isArray(lookups) ? lookups : (lookups ? [lookups] : []);
                                        lkArr.forEach(l => {
                                            const uid = l?.apiurl?.split('/').pop();
                                            const label = l?.fielddisplay == 'Username' ? l?.userdisplayname : l?.email;
                                            if (uid) existingIds.push({ uid, label });
                                        });
                                    }
                                } catch (e) {
                                    console.error('Error extracting user lookups from item payload', e);
                                }
                            }

                            function addChip(id, label) {
                                if (!allowMultiple) {
                                    $chips.find('.user-chip').remove();
                                }
                                // avoid dupes
                                if ($chips.find('[data-uid="' + id + '"]').length) return;
                                let $chip = $e('<span>').addClass('user-chip badge')
                                    .attr('data-uid', id)
                                    .text(label)
                                    .append($e('<a>').attr('href', '#').css({ 'margin-left': '6px', 'color': '#fff' }).text('×').on('click', function (ev) {
                                        ev.preventDefault();
                                        $chip.remove();
                                        updateInputIds();
                                    }));
                                $chips.append($chip);
                                updateInputIds();
                            }

                            function updateInputIds() {
                                let ids = [];
                                $chips.find('.user-chip').each(function () { ids.push($e(this).attr('data-uid')); });
                                $input.attr('data-user-ids', ids.join(','));
                                // If this is single-select, disable the input when a user is selected
                                if (!allowMultiple) {
                                    if (ids.length > 0) {
                                        $input.prop('disabled', true)
                                            .attr('title', 'Single user only.\n Remove the selected user to input a different one');
                                        $input.css('opacity', '0.6');
                                    } else {
                                        $input.prop('disabled', false).removeAttr('title').css('opacity', '');
                                    }
                                }
                            }

                            // populate existing
                            if (existingIds.length) {
                                existingIds.forEach((id) => addChip(id.uid, id.label));
                            }

                            // debounce helper
                            let debounceTimer;
                            $input.on('input', function () {
                                clearTimeout(debounceTimer);
                                let term = $e(this).val();
                                if (!term || term.length < 1) {
                                    $list.hide();
                                    return;
                                }
                                debounceTimer = setTimeout(function () {
                                    let lookupAlias = encodeURIComponent(coldetails.sheetlookup);
                                    let url = './lookupDetailAutoSuggest.action?searchText=' + encodeURIComponent(term) + '&metaData.siteID=' + encodeURIComponent(options.siteID) + '&metaData.sheetId=' + encodeURIComponent(options.sheetID) + '&isheetColumn.columnID=' + encodeURIComponent(APIColumn.columnid) + '&lookupAlias=' + lookupAlias + '&displayField=' + encodeURIComponent(coldetails.fielddisplay);
                                    fetch(url, { method: 'GET', headers: engineerAPI_Headers() })
                                        .then(r => r.json())
                                        .then(list => {
                                            console.log('Lookup results for', term, list);
                                            $list.empty();
                                            if (!Array.isArray(list) || list.length === 0) { $list.hide(); return; }
                                            list.forEach(item => {
                                                if (item.classname && item.classname === 'autosuggestHeader') return; // skip header
                                                let uid = item.value;
                                                //if uid already in a user chip, skip it in the suggestions
                                                if ($chips.find('[data-uid="' + uid + '"]').length) return;
                                                let label = item.label || item.name || item.value;
                                                let $li = $e('<li>').css({ 'padding': '6px', 'cursor': 'pointer' }).text(label).attr('data-uid', uid)
                                                    .on('click', function (ev) {
                                                        ev.preventDefault();
                                                        addChip(uid, label);
                                                        $input.val('');
                                                        $list.hide();
                                                    });
                                                $list.append($li);
                                            });
                                            $list.show();
                                        })
                                        .catch(err => { console.error('User lookup error', err); $list.hide(); });
                                }, 250);
                            });

                            // hide suggestions when clicking elsewhere
                            $e(document).on('click', function (ev) {
                                if ($e(ev.target).closest($wrapper).length == 0) {
                                    $list.hide();
                                }
                            });

                            $wrapper.append($chips).append($input).append($list);
                            $cell.append($wrapper);
                            break;
                        }
                        case _att:
                            fileIds = [];
                            (function () {
                                const colID = APIColumn.columnid;
                                function processData(data) {
                                    try {
                                        const cols = data?.isheet?.data?.item?.column;
                                        const arr = Array.isArray(cols) ? cols : (cols ? [cols] : []);
                                        const col = arr.find(c => String(c.attributecolumnid || c.columnid) === String(colID));
                                        const $filesFrag = $e('<div>');
                                        if (col?.displaydata?.attachments) {
                                            const attach = col.displaydata.attachments?.attachment;
                                            const atts = attach ? (Array.isArray(attach) ? attach : [attach]) : [];
                                            atts.forEach(att => {
                                                const aid = att.id;
                                                const name = att.attachmentname;
                                                const ext = att.attachmentnxtension;
                                                if (aid && !fileIds.includes(String(aid))) fileIds.push(String(aid));
                                                const $div = $e('<div>').addClass('d-flex');
                                                const $a = $e('<a>').attr('id', 'attachment_' + aid).attr('href', '#').text(name + '.' + ext);
                                                const $icon = $e('<a>').addClass('icon-cross').attr('href', '#').attr('title', 'Remove');
                                                $div.append($a).append($icon);
                                                $filesFrag.append($div);
                                            });
                                        }

                                        $filesFrag.find('.icon-cross')
                                            .on('click', function () {
                                                $e(this).parent().css('text-decoration', 'line-through');
                                                let docid = $e(this).siblings('a').attr('id').split('_')[1];
                                                let $input = $e(this).closest('td').find('input');
                                                let currentDocs = ($input.attr('data-att-id') || '').split(',').filter(Boolean);
                                                let index = currentDocs.indexOf(docid);
                                                if (index > -1) {
                                                    currentDocs.splice(index, 1);
                                                }
                                                $input.attr('data-att-id', currentDocs.toString());
                                            });

                                        $cell.append($e('<div>')
                                            .addClass('form-group ' + editMode)
                                            .append($filesFrag.children())
                                            .append($e('<input>')
                                                .attr('type', 'file')
                                                .attr('multiple', 'true')
                                                .attr('data-att-id', fileIds.toString())
                                                .addClass('etile form-control btn btn-default')
                                                .css({ 'padding': '1px', 'height': 'auto' })
                                            )
                                        );
                                    } catch (err) {
                                        console.error('Error building attachment list from API response', err);
                                    }
                                }

                                if (itemApiData) {
                                    processData(itemApiData);
                                } else {
                                    // fallback to per-case fetch if preload failed
                                    fetch(_itemEndpoint, { method: 'GET', headers: _itemHeaders })
                                        .then(r => {
                                            if (!r.ok) throw new Error('Network response was not ok');
                                            return r.json();
                                        })
                                        .then(processData)
                                        .catch(err => {
                                            console.error('Failed to fetch attachments for item', err);
                                        });
                                }
                            })();
                            break;

                        default:
                            break;
                    }
                } else {
                    console.warn('Could not find column details for column ID ' + $cell.attr('data-cid'));
                }
            }
        });
    }

    // Try to preload the item payload; if it fails, still render the edit cells (per-case fetch will fallback)
    fetch(_itemEndpoint, { method: 'GET', headers: _itemHeaders })
        .then(r => {
            if (!r.ok) throw new Error('Network response was not ok');
            return r.json();
        })
        .then(data => {
            itemApiData = data;
            renderEditCells();
        })
        .catch(err => {
            console.error('Failed to fetch item payload for inline edit, falling back to per-case fetch', err);
            renderEditCells();
        });

    function cancelEdit() {
        $e('#' + uuid + ' .edit-mode').remove();
        $e('#' + uuid + ' .edit-hide').removeClass('edit-hide');
    }

    function engineerUpdateRow(callFromUpload) {
        $e('#' + uuid + ' button.edit-mode').hide();
        $e('#' + uuid + ' .running').show();
        let $updateInputs = $e('#' + uuid + ' .etile');
        let item = [];
        let columntemplate = {};
        let columns = [];
        let val;

        if (!callFromUpload) {
            $updateInputs.each(function (i, input) {
                let colID = $e(input).closest('td').attr('data-cid');
                let colType;
                for (const element of options.columnAPIDetails.column) {
                    let APIColumn = element;
                    if (APIColumn.columnid == Number.parseInt(colID)) {
                        colType = APIColumn.type;
                        colMap.set(colID, APIColumn);
                        break;
                    }
                }
                if (colType == _att) {
                    if ($e(input).val()) {
                        for (let file of input.files) {
                            fileCount++;
                            uploadFile(input, file);
                        }
                    }
                }
            });

            if (fileCount == 0) {
                buildPayload();
            }
        } else if (fileUploads == fileCount) {
            buildPayload();
        }

        function buildPayload() {
            $updateInputs.each(function (i, input) {
                let colID = $e(input).closest('td').attr('data-cid');
                let APIColumn = colMap.get(colID);
                let colType = APIColumn.type;
                let inputVal = $e(input).val();
                let date, time;
                let column = {
                    'attributecolumnid': colID,
                    'rawdata': {}
                };

                switch (colType) {
                    case 5:
                        if (APIColumn.columnspecificdetail.formattype == 'DATE_ONLY') {
                            date = engineerAPI_parseIsheetDate(inputVal, APIColumn.columnspecificdetail.dateformat);
                            column.rawdata.date = date;
                        } else {
                            date = engineerAPI_parseIsheetDate(inputVal.split('T')[0], APIColumn.columnspecificdetail.dateformat);
                            time = inputVal.split('T')[1] ? inputVal.split('T')[1] : '00:00';
                            column.rawdata.date = date;
                            column.rawdata.time = time;
                        }
                        break;
                    case 9:
                        column.rawdata.attachments = {};
                        column.rawdata.attachments.attachment = [];
                        if ($e(input).attr('data-att-id')) {
                            $e(input).attr('data-att-id').split(',').forEach(att => {
                                let aitem = {
                                    'id': att
                                };
                                column.rawdata.attachments.attachment.push(aitem);
                            });
                        }
                        break;
                    case 3:
                    case 17: {
                        column.rawdata.choices = {};
                        column.rawdata.choices.choice = [];
                        val = inputVal;
                        if (typeof (val) === 'string' || typeof (val) === 'number') {
                            let citem = {
                                'id': val
                            };
                            if (val == -1) {
                                citem.label = $e('#' + options.uuid + '-' + APIColumn.columnid + '-other').val();
                            }
                            column.rawdata.choices.choice.push(citem);
                        } else if (typeof (val) === 'object') {
                            val.forEach(choice => {
                                let citem = {
                                    'id': choice
                                };
                                if (choice == -1) {
                                    citem.label = $e('#' + options.uuid + '-' + APIColumn.columnid + '-other').val();
                                }
                                column.rawdata.choices.choice.push(citem);
                            });
                        }
                        break;
                    }
                    case 6: {
                        column.rawdata.lookups = {};
                        column.rawdata.lookups.lookup = [];
                        // support our typeahead which stores selected ids in data-user-ids
                        let idsAttr = $e(input).attr('data-user-ids');
                        if (idsAttr) {
                            idsAttr.split(',').forEach(uid => {
                                if (uid && uid !== '') {
                                    column.rawdata.lookups.lookup.push({ 'id': uid });
                                }
                            });
                        } else if (inputVal) {
                            let citem = { 'id': inputVal };
                            column.rawdata.lookups.lookup.push(citem);
                        }
                        break;
                    }
                    default:
                        val = inputVal;
                        column.rawdata.value = val;
                        break;
                }
                columns.push(column);
            });

            columntemplate.column = columns;
            item.push(columntemplate);


            let reqBody = {
                'data': {
                    'item': item
                }
            };

            function parsePutResponse(response) {
                if (!response || response.status == 200) {
                    $e('#' + uuid + ' button.edit-mode').closest('tr').addClass('list-group-item-success');
                    cancelEdit();
                    $e('#' + uuid + ' .running').hide();
                    engineertable_afterEditAction(options);
                } else {
                    alert('Update row failed - HighQ API error');
                    $e('#' + uuid + ' button.edit-mode').show();
                    $e('#' + uuid + ' .running').hide();
                }
            }

            function sendPutUpdateRequest() {
                let requestOptions = {
                    method: 'PUT',
                    headers: engineerAPI_Headers(),
                    body: JSON.stringify(reqBody)
                };

                if (options.showAPIPayloads == 'true') {
                    console.log('PUT payload for item ' + itemId + ':', reqBody);
                }

                if (!options.debug) {
                    fetch('./api/' + options.highqAPIVersion + '/isheet/' + options.sheetID + '/items/' + itemId, requestOptions)
                        .then(response => {
                            if (response.status == 200) {
                                $e('#' + uuid + ' button.edit-mode').closest('tr').addClass('list-group-item-success');
                                cancelEdit();
                                $e('#' + uuid + ' .running').hide();
                                engineertable_afterEditAction(options);
                            } else {
                                return response.json();
                            }
                        })
                        .then(result => {
                            if (!result) {
                                return;
                            } else {
                                let errorText = '';
                                if (result.columns?.column) {
                                    result.columns.column.forEach(col => {
                                        errorText += col.message + '\n';
                                    });
                                } else {
                                    errorText = 'Server Error';
                                }
                                alert('Update row failed - HighQ API error:\n\n ' + errorText);
                                $e('#' + uuid + ' button.edit-mode').show();
                                $e('#' + uuid + ' .running').hide();
                            }
                        })
                        .catch(error => {
                            alert('Update row failed - HighQ API error: ' + error);
                            $e('#' + uuid + ' button.edit-mode').show();
                            $e('#' + uuid + ' .running').hide();
                            console.error(error);
                        });
                } else {
                    console.log(JSON.stringify(reqBody));
                    $e('#' + uuid + ' button.edit-mode').show();
                    $e('#' + uuid + ' .running').hide();
                    engineertable_afterEditAction(options);
                }
            }

            if (options.useHighQAPIFunctions == 'true') {

                let highqPayload = {
                    'REQUEST_TYPE': 'PUT',
                    'REQUEST_URL': './api/' + options.highqAPIVersion + '/isheet/' + options.sheetID + '/items/' + itemId,
                    'HEADERS': { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    'FORM_DATA': JSON.stringify(reqBody)
                };

                if (options.showAPIPayloads == 'true') {
                    console.log('HighQ API payload for item ' + itemId + ':', highqPayload);
                }

                try {
                    GriffinCommon.customAjaxSubmit(highqPayload, function (response) {
                        parsePutResponse(response);
                    }, null, function (response) { parsePutResponse(response); });
                } catch (error) {
                    options.useHighQAPIFunctions = 'false';
                    console.error('Error calling HighQ API using GriffinCommon.customAjaxSubmit, falling back to fetch: ' + error);
                    sendPutUpdateRequest();
                }
            } else {
                sendPutUpdateRequest();
            }
        }

    }

    function uploadFile(input, file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', file.name.substring(0, file.name.lastIndexOf('.')));

        let headers = new Headers();
        headers.append('Accept', 'application/json');

        let requestOptions = {
            method: 'POST',
            headers: headers,
            body: formData
        };

        if (options.showAPIPayloads == 'true') {
            console.log('File upload payload for file ' + file.name + ':', formData);
        }

        fetch('./api/' + options.highqAPIVersion + '/isheet/' + options.sheetID + '/attachment', requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log('Response:', data);
                if (data.progressivekeystatus == 'INPROGRESS') {
                    engineerAPI_progressiveKey(data.progressivekey, null, options).then(
                        function (response) {
                            let atts = $e(input).attr('data-att-id');
                            if (atts) {
                                $e(input).attr('data-att-id', atts + ',' + response.attachment.id);
                            } else {
                                $e(input).attr('data-att-id', response.attachment.id);
                            }
                            fileUploads++;
                            engineerUpdateRow(true);
                        },
                        function (error) {
                            alert('Update row failed - File upload error: ' + error);
                            $e('#' + uuid + ' button.edit-mode').show();
                            $e('#' + uuid + ' .running').hide();
                            console.error(error);
                        }
                    );
                } else if (data.progressivekeystatus == 'DONE') {
                    //Unlikely
                } else throw new Error(data);

            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

function engineertable_watchAddModal(uuid) {
    let options = window.engineerLegalPlugins.table[uuid];

    let pollAttempts = 0;
    let addModal = '#isheet_module_addItem_modal_BODY label';
    function componentPoll() {
        console.log('component poll executed for: ' + addModal);
        if ($e(addModal).length > 0) {
            addRefresh();
        } else {
            pollAttempts++;
            if (pollAttempts > 9) {
                console.error('engineerLegal_waitForComponent failed to locate ' + addModal + ' after ' + pollAttempts + ' attempts');
            } else {
                setTimeout(componentPoll, 1000);
            }
        }
    }
    componentPoll();

    function addRefresh() {
        $e('body').on('hidden.bs.modal', function (event) {
            if ($e(event.target).attr('id') == 'isheet_module_addItem_modal') {
                engineertable_afterEditAction(options);
            }
        });
    }
}

// parses date from YYYY-MM-DD into the correct format to write to an iSheet depending on the format
// eslint-disable-next-line no-unused-vars
function engineerAPI_parseIsheetDate(value, format) {
    if (!value) {
        return;
    }
    let dateSplit = value.split('-');
    let y = dateSplit[0];
    let m = dateSplit[1];
    let d = dateSplit[2];
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    format = engineerAPI_removeCdata(format);
    let formatteddate;
    switch (format) {
        case 'DD/MM/YYYY':
            formatteddate = d + '/' + m + '/' + y;
            break;
        case 'DD.MM.YYYY':
            formatteddate = d + '.' + m + '.' + y;
            break;
        case 'DD MMM YYYY':
            formatteddate = d + ' ' + month[m - 1] + ' ' + y;
            break;
        case 'MM/DD/YYYY':
            formatteddate = m + '/' + d + '/' + y;
            break;
        case 'YYYY-MM-DD':
            formatteddate = value;
            break;
        default:
            break;
    }
    return formatteddate;
}

// Strips CDATA tags from iSheet API data
function engineerAPI_removeCdata(text) {
    if (text.search('CDATA') > -1) {
        return text.split('[')[2].split(']')[0];
    } else {
        return text;
    }
}
function engineerAPI_Headers() {
    let engineerLegalHeaders = new Headers();
    engineerLegalHeaders.append('Accept', 'application/json');
    engineerLegalHeaders.append('Content-Type', 'application/json');
    return engineerLegalHeaders;
}

function engineerAPI_progressiveKey(progressiveKey, pollTime, options) {
    if (!pollTime) {
        pollTime = 2000;
    }
    return new Promise(function (success, fail) {
        let requestOptions = {
            method: 'POST',
            headers: engineerAPI_Headers(),
        };
        function progressCall(key) {
            fetch('./api/' + options.highqAPIVersion + '/progressivekeystatus/' + key, requestOptions)
                .then(response => (response.json()))
                .then(result => {
                    console.log(result);
                    if (result.progressivekeystatus == 'INPROGRESS') {
                        setTimeout(() => {
                            progressCall(result.progressivekey);
                        }, pollTime);
                    } else if (result.progressivekeystatus == 'FAIL') {
                        fail({ 'apierror': result });
                    } else if (result.progressivekeystatus == null || result.progressivekeystatus == 'DONE') {
                        let errors = [];
                        if (result.items && result.items.item.length > 0) {
                            result.items.item.forEach(item => {
                                if (item.statuscode != '200') {
                                    errors.push({ [item.id]: item });
                                }
                            });
                        }
                        if (errors.length > 0) {
                            fail({ 'apierror': errors });
                        } else {
                            console.log('Progressive key response complete - success');
                            success(result);
                        }
                    }
                })
                .catch(error => {
                    console.error('error', error);
                    fail();
                });
        }
        progressCall(progressiveKey);
    });
}

function engineertable_afterEditAction(options) {
    if (options.editReload == 'false') {
        if ($e('#' + options.tableElement + ' .update-warning').length == 0) {
            const alertDiv = $e('<div>')
                .addClass('alert alert-info update-warning')
                .text('Source iSheet updated: ');
            const link = $e('<a>')
                .attr('href', '#')
                .addClass('alert-link')
                .text('Click here to reload');
            link.on('click', function () {
                location.reload();
            });
            alertDiv.append(link);
            $e('#' + options.tableElement).prepend(alertDiv);
        } else {
            $e('#' + options.tableElement).find('.update-warning').show();
        }
    } else if (options.parentPlugin) {
        let plugin = Object.values(options.parentPlugin)[0];
        let container = Object.keys(options.parentPlugin)[0];
        let parentOptions = window.engineerLegalPlugins[plugin][container];
        engineerLegal({
            'plugin': plugin,
            ...parentOptions
        });
    } else {
        engineerLegal({
            'plugin': 'table',
            ...options
        });
    }
}

function engineerLegal_fillPDF(tableBtnLink, itemId, uuid) {
    let pdfoptions = window.engineerLegalPlugins.table[uuid].pdfOptions;
    pdfoptions.itemID = itemId;
    pdfoptions.container = uuid;
    pdfoptions.dataType = 'table';
    engineerPDF(pdfoptions);
}

// Global function to handle column sorting for engineerTable
function engineerTable_sortColumn(columnName, uuid) {
    // Find the current options for this table instance
    let options = window.engineerLegalPlugins?.table?.[uuid];
    if (!options) return;
    let sortOrder = 'a';
    if (options.sortColumn1 === columnName && options.sortOrder1 === 'a') {
        sortOrder = 'd';
    }
    let newOptions = { ...options };
    newOptions.sortColumn1 = columnName;
    newOptions.sortOrder1 = sortOrder;
    newOptions.parsed = true;
    buildTable(newOptions.parsedData, newOptions);
}

function engineerLegal_launchEditModal(tableBtnLink, itemId, uuid) {
    let options = window.engineerLegalPlugins.table[uuid];
    let windowFeatures = 'width=' + options.editModalWidth + ',height=' + options.editModalHeight + ',top=100,left=100,popup';
    let editWin = window.open(tableBtnLink, '_blank', windowFeatures);
    let iSheetPoll;
    let url = new URL(tableBtnLink);
    let itemid = url.searchParams.get('metaData.itemId') || itemId;
    let sheetid = url.searchParams.get('metaData.sheetId') || options.sheetID;
    let siteid = url.searchParams.get('metaData.siteID') || options.siteID;
    let viewid = url.searchParams.get('metaData.sheetViewID') || options.sheetViewID;
    let timeout = 0;
    let maxTimeout = 20;
    iSheetPoll = setInterval(() => {
        if (editWin.document.querySelectorAll('#gridbox_body tr').length > 0 || editWin.$j('saf-button[a11y-aria-label="Add iSheet"]').length > 0) {
            clearInterval(iSheetPoll);
            console.log('iSheet located, opening edit modal');
            editWin.AddSheetItemCollection.editItem(itemid, sheetid, siteid, viewid);
            let formPoll;
            formPoll = setInterval(() => {
                if (editWin.document.getElementById('isheet_module_editItem_modal_add')) {
                    clearInterval(formPoll);
                    editWin.$j('body').on('hidden.bs.modal', function (event) {
                        if ($e(event.target).attr('id') == 'isheet_module_editItem_modal') {
                            setTimeout(() => { editWin.close(); }, 300);
                        }
                        engineertable_afterEditAction(options);
                    });
                }
            }, 500);
        } else if (timeout > maxTimeout) {
            clearInterval(iSheetPoll);
            editWin.alert('Unable to open iSheet edit modal automatically, please manually edit your record and close this window when done');
        }
        timeout++;
    }, 500);

}

/**
 * Creates a new iSheet URL with the specified parameters. 
 */
function engineerLegal_buildISheetUrl(link, basePath, itemId, removeViewId, extraParams) {
    const url = new URL(link.replace('sheetViewExportXML', basePath));
    url.searchParams.delete('metaData.isheetExportType');
    if (itemId) {
        url.searchParams.set('metaData.itemId', itemId);
    }
    if (removeViewId) {
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