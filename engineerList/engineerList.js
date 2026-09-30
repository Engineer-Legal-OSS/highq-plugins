/* EngineerList - a HighQ plugin

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

var engineerListVersion = '5.0.0';

function engineerList(userOptions) {
    let $rootContainer;
    let listHeader;
    let listBody;
    let $legendContainer;
    let rawXmlData;
    let tableData;
    let headersData = new Map();
    let nameColumnData = {};
    let listData = new Map();
    let legend = new Map();
    let choroplethCountData = new Map();
    let groupColumnsCount = new Map();
    let selectedQuickViewItems = new Map();
    let filterSelectedColumns = new Map();
    let options = new ListOptions(userOptions);
    let tableOptions = new TableOptions(options.iSheetViewLink, userOptions.tableOptions);
    let statusColumn;
    let firstChoice;
    let siteUsersByEmail = null;
    let siteUsersById = null;
    let fetchingSiteUsers = false;
    let avatarQueue = [];
    let processingAvatarQueue = false;
    const panelClass = 'list-panel-title';
    const panelOtherVal = 'other-value';
    if ($e('#engineerliststyles').length == 0) {
        $e('<style id=engineerliststyles>.list-group-item{min-height:40px;overflow:hidden}.list-panel-title{display:block}.list-title-below{clear:left}.list-title-right{white-space:pre-wrap;vertical-align:top}.list-title-spacer{display:block;clear:left}.list-image-container{float:left;margin-right:4px}.list-badge{margin-left:1em;max-width:50%;white-space:break-spaces;line-height:1.2}.list-group>li.list-item-on{background:#f0f0fc}.list-item-on.solid-color>.list-panel-title::after{content:">>"}.filter-button,.clear-filter{margin-right:10px}li.list-group-item.list-hero>div.list-image-container{float:none}.list-legend-item{display:inline-block;margin-right:10px}.panel-body .form-check-input{margin-right:4px;display:inline-block}.panel-body .form-check-label{display:inline-block;width:88%;vertical-align:middle}h4.list-contact-name{margin:5px 0}.list-contact-image{border-radius:3px}.list-contact-image-container{text-align:center}</style>').appendTo('head');
    }
    if ($e('#engineerliststyles-' + options.container).length == 0) {
        $e('<style id=engineerliststyles' + options.container + '>.list-group>li.list-item-on{background:' + options.clickColor + ';}</style>').appendTo('head');
    }
    options.tableOptions = tableOptions;
    window.engineerLegalPlugins.list[options.container] = options;
    if (options.showTable == 'true') {
        try {
            if (window['engineerTable']) {
                createQuickViewUI();
            } else {
                throw new Error('engineerTable not loaded');
            }
        } catch (error) {
            try {
                engineercore_load('table').then(function () {
                    createQuickViewUI();
                });
            } catch (error) {
                console.warn('engineercore_load, requires engineerCore version > 4.0.0 ');
                console.error('Unable to load engineerTable, it may not be loaded into the page or correctly installed: \n' + error);
                console.warn('Continuing to load list without table features...');
                tableOptions.showTable = false;
                options.panelLinks = 'isheet';
                tableOptions = {};
                createQuickViewUI();
            }
        }
    } else if (options.contactCards == 'true') {
            fetchSiteUsers(options.siteID);
            createQuickViewUI();
    } else {
        createQuickViewUI();
    }

    function ListOptions(customOptions) {
        this.container = customOptions.container ? customOptions.container : null;
        if (!this.container) {
            throw new Error('Option `container` is requred.');
        }
        this.quickViewLink = customOptions.listViewLink ? customOptions.listViewLink : null;
        if (!this.quickViewLink) {
            this.quickViewLink = customOptions.quickViewLink ? customOptions.quickViewLink : null;
        }
        if (!this.quickViewLink) {
            try {
                this.quickViewLink = engineercore_getLink(this.container);
            } catch (error) {
                console.log('Cannot use engineercore_getLink, requires engineerCore version 1.2.1');
                return;
            }
        }
        if (!this.quickViewLink) {
            try {
                this.quickViewLink = engineercore_getLinkByClass(customOptions.linkClass);
            } catch (error) {
                console.log('Cannot use engineercore_getLinkByClass, requires engineerCore version 4.2.0');
                return;
            }
        }
        if (!this.quickViewLink) {
            throw new Error('Either a link to an iSheet view must be created in this section or Option "quickViewLink" or "listViewLink" must be set.');
        }
        this.iSheetViewLink = customOptions.tableViewLink ? customOptions.tableViewLink : null;
        if (!this.iSheetViewLink) {
            this.iSheetViewLink = customOptions.iSheetViewLink ? customOptions.iSheetViewLink : null;
        }
        if (!this.iSheetViewLink) {
            try {
                if (customOptions.tableOptions.tableElement) {
                    this.iSheetViewLink = engineercore_getLink(customOptions.tableOptions.tableElement);
                }
                else if (customOptions.tableOptions.container) {
                    this.iSheetViewLink = engineercore_getLink(customOptions.tableOptions.container);
                }
            } catch (error) {
                console.log('Cannot locate second iSheet link, using same data as panels');
            }
        }
        if (!this.iSheetViewLink) {
            this.iSheetViewLink = customOptions.iSheetViewLink ? customOptions.iSheetViewLink : this.quickViewLink;
        }
        this.viewLink = customOptions.viewLink ? customOptions.viewLink : this.iSheetViewLink;
        this.iSheetViewUrl = new URL(this.iSheetViewLink);
        this.siteID = this.iSheetViewUrl.searchParams.get('metaData.siteID');
        this.sheetID = this.iSheetViewUrl.searchParams.get('metaData.sheetId');
        this.sheetViewID = this.iSheetViewUrl.searchParams.get('metaData.sheetViewID');
        this.showTable = customOptions.showTable ? customOptions.showTable : 'false';
        this.nameColumn = customOptions.nameColumn ? customOptions.nameColumn : '0';
        this.panelLimit = customOptions.panelLimit ? Number.parseInt(customOptions.panelLimit) : 0;
        // Possible values are the numeric column index ('0','1', '2', etc.) or 'false' to not append a flag image but leave the DIV in place
        this.imageColumn = customOptions.imageColumn ? customOptions.imageColumn : 'auto';
        this.imageColumn = customOptions.flagColumn ? customOptions.flagColumn : this.imageColumn;
        // Numeric column index ('0','1', etc.) or 'false' to group all rows under a Default group, or 'status' to group by each entities status pill
        this.groupColumn = customOptions.groupColumn ? customOptions.groupColumn : 'false';
        this.statusColumn = customOptions.statusColumn ? customOptions.statusColumn : 'false';
        this.hideGroupColumn = customOptions.hideGroupColumn ? customOptions.hideGroupColumn : 'true';
        this.groupSort = customOptions.groupSort ? customOptions.groupSort : 'a-z';
        this.otherColumns = customOptions.otherColumns ? customOptions.otherColumns : 'false';
        this.disableHyperlinks = customOptions.disableHyperlinks ? customOptions.disableHyperlinks : 'false';
        this.hyperlinkColumn = customOptions.hyperlinkColumn ? customOptions.hyperlinkColumn : 'auto';
        this.showOtherColumnHeaders = customOptions.showOtherColumnHeaders ? customOptions.showOtherColumnHeaders : 'true';
        this.listHeight = customOptions.listHeight ? customOptions.listHeight : 'unlimited';

        // panels with full width images - 0, a number of panles or 'all'
        this.heroPanels = customOptions.heroPanels ? customOptions.heroPanels : '0';
        this.colorPanelBackground = customOptions.colorPanelBackground ? customOptions.colorPanelBackground : 'false';

        this.imageWidth = customOptions.imageWidth ? customOptions.imageWidth : '64px';
        this.imageHeight = customOptions.imageHeight ? customOptions.imageHeight : '';
        // Panel titles can display above, below or right of the panel image
        this.titleLocation = customOptions.titleLocation ? customOptions.titleLocation : 'right';
        // Other columns can display below or right of the panel image
        this.otherColumnLocation = customOptions.otherColumnLocation ? customOptions.otherColumnLocation : 'right';
        this.buttonText = customOptions.buttonText ? customOptions.buttonText : 'Quick Views';
        this.showQuickViewButton = customOptions.showQuickViewButton ? customOptions.showQuickViewButton : 'true';
        if (this.statusColumn != 'false') {
            this.showQuickViewButton = 'false';
        }
        this.showTableFilters = customOptions.showTableFilters ? customOptions.showTableFilters : 'collapse';
        this.scoreSections = customOptions.scoreSections ? customOptions.scoreSections : 'true';
        this.filterText = customOptions.filterText ? customOptions.filterText : 'Filters';
        this.filterDefaultText = customOptions.filterDefaultText ? customOptions.filterDefaultText : 'Background';
        // accept viewItem, isheet, default, table, tableAll, compare, filter, join
        this.panelLinks = customOptions.panelLinks ? customOptions.panelLinks : 'false';
        this.panelFunction = customOptions.panelFunction ? customOptions.panelFunction : null;
        if (this.panelLinks == 'table' || this.panelLinks == 'tableAll' || this.panelLinks == 'compare' || this.panelLinks == 'filter' || this.panelLinks == 'join') {
            this.showTable = 'true';
            this.disableHyperlinks = 'true';
        }
        if (this.panelLinks == 'join' && !customOptions.iSheetViewLink) {
            throw new Error('panelLinks: "join" requires a table div and HighQ link to another iSheet view using iSheetViewLink');
        }
        this.clickFade = customOptions.clickFade ? customOptions.clickFade : 'false';
        this.clickColor = customOptions.clickColor ? customOptions.clickColor : '#f0f0fc';
        // join takes the nameColumn value as the join value and passes it to the joinColumn column in the table
        this.joinColumn = customOptions.joinColumn ? customOptions.joinColumn : '0';
        this.groupFilters = customOptions.groupFilters ? customOptions.groupFilters : 'false';
        this.showScrollButton = customOptions.showScrollButton ? customOptions.showScrollButton : 'true';
        this.scrollButtonText = customOptions.scrollButtonText ? customOptions.scrollButtonText : 'View Table';
        this.scrollButtonRight = customOptions.scrollButtonRight ? customOptions.scrollButtonRight : '1em';
        this.scrollButtonBottom = customOptions.scrollButtonBottom ? customOptions.scrollButtonBottom : '1em';
        this.itemsPerColumnLimit = customOptions.itemsPerColumnLimit ? Number.parseInt(customOptions.itemsPerColumnLimit) : 1;
        this.singleColumn = customOptions.singleColumn ? customOptions.singleColumn : 'false';
        if (this.singleColumn == 'true') { this.itemsPerColumnLimit = 2000; }
        this.quickViewSearchEnabled = customOptions.quickViewSearchEnabled ? customOptions.quickViewSearchEnabled : 'true';
        this.filtersSearchEnabled = customOptions.filtersSearchEnabled ? customOptions.filtersSearchEnabled : 'true';
        this.searchDelay = customOptions.searchDelay ? customOptions.searchDelay : 500;
        // Enable collapsable groups (group will use all the available rows columns)
        this.collapsibleGroups = customOptions.collapsibleGroups ? customOptions.collapsibleGroups : 'false';
        // Make better use of horizonal width with collapsible groups enabled
        if (customOptions.collapsibleGroups != 'false') {
            customOptions.itemsPerColumnLimit = 1;
        }
        // When collapsable groups are enabled define which groups will be expanded by default
        // Posible options: 'open', 'closed' and 'first'.
        this.groupCollapseDefault = customOptions.groupCollapseDefault ? customOptions.groupCollapseDefault : 'first';
        this.isChoropleth = customOptions.isChoropleth ? customOptions.isChoropleth : 'false';
        this.countChoices = customOptions.countChoices ? customOptions.countChoices : 'false';
        this.countChoicesLegend = customOptions.countChoicesLegend ? customOptions.countChoicesLegend : 'false';
        this.sumColumn = customOptions.sumColumn ? Number.parseInt(customOptions.sumColumn) : -1;
        if (this.countChoices != 'false' || this.sumColumn > -1) {
            this.isChoropleth = 'true';
        }
        this.sumColumnDecimal = 2;
        this.sortPanels = customOptions.sortPanels ? customOptions.sortPanels : null;
        // Possible values are the numeric column index ('0', '1', '2', etc.) or 'false' to not redirect to search link
        this.taskSearch = customOptions.taskSearch ? customOptions.taskSearch : 'false';
        // Possible values are blank or self
        this.linkTab = customOptions.linkTab ? customOptions.linkTab : 'blank';
        this.filterPanels = customOptions.filterPanels ? customOptions.filterPanels : 'false';
        this.filterPanelsPlaceholder = customOptions.filterPanelsPlaceholder ? customOptions.filterPanelsPlaceholder : 'Panel Filter';
        this.filterPanelsButtonText = customOptions.filterPanelsButtonText ? customOptions.filterPanelsButtonText : 'Filter';
        this.filterPanelsClearText = customOptions.filterPanelsClearText ? customOptions.filterPanelsClearText : 'Clear';
        this.filterPanelNoResultCallback = customOptions.filterPanelNoResultCallback ? customOptions.filterPanelNoResultCallback : function (filterTerm) { alert('Filter value ' + filterTerm + ' not found'); };
        this.filterGroups = customOptions.filterGroups ? customOptions.filterGroups : 'false';
        this.filterGroupsPlaceholder = customOptions.filterGroupsPlaceholder ? customOptions.filterGroupsPlaceholder : 'Group Filter';
        this.filterGroupsButtonText = customOptions.filterGroupsButtonText ? customOptions.filterGroupsButtonText : 'Filter';
        this.filterGroupsClearText = customOptions.filterGroupsClearText ? customOptions.filterGroupsClearText : 'Clear';
        this.filterGroupNoResultCallback = customOptions.filterGroupNoResultCallback ? customOptions.filterGroupNoResultCallback : function (filterTerm) { alert('Filter value ' + filterTerm + ' not found'); };
        if (this.taskSearch != 'false') {
            this.showTable = 'false';
        }
        this.choiceEmptyText = customOptions.choiceEmptyText ? customOptions.choiceEmptyText : 'None';
        this.choiceEmptyColor = customOptions.choiceEmptyColor ? customOptions.choiceEmptyColor : '#aaabbb';
        this.lookupEmptyText = customOptions.lookupEmptyText ? customOptions.lookupEmptyText : 'None';


        this.contactCards = customOptions.contactCards ? customOptions.contactCards : 'false';
        this.ccShowEmail = customOptions.ccShowEmail ? customOptions.ccShowEmail : 'true';
        this.ccShowPhone = customOptions.ccShowPhone ? customOptions.ccShowPhone : 'true';
        this.ccShowMobile = customOptions.ccShowMobile ? customOptions.ccShowMobile : 'true';
        this.ccShowJobTitle = customOptions.ccShowJobTitle ? customOptions.ccShowJobTitle : 'true';
        this.ccShowDepartment = customOptions.ccShowDepartment ? customOptions.ccShowDepartment : 'true';
        this.ccShowAddress = customOptions.ccShowAddress ? customOptions.ccShowAddress : 'true';
        this.ccShowCompany = customOptions.ccShowCompany ? customOptions.ccShowCompany : 'true';
        this.ccShowImage = customOptions.ccShowImage ? customOptions.ccShowImage : 'true';
        this.ccShowBioButton = customOptions.ccShowBioButton ? customOptions.ccShowBioButton : 'true';
        this.ccImagePostion = customOptions.ccImagePostion ? customOptions.ccImagePostion : 'left';

        this.cachedData = customOptions.cachedData ? customOptions.cachedData : null;
        this.onRender = customOptions.onRender ? customOptions.onRender : function (listid) { };
        this.onDataLoad = customOptions.onDataLoad ? customOptions.onDataLoad : function (data) { return data; };
    }

    function TableOptions(iSheetViewLink, tableOptions) {
        tableOptions = tableOptions !== undefined ? tableOptions : {};
        Object.assign(this, tableOptions);
        this.iSheetViewLink = iSheetViewLink || null;
        if (tableOptions.tableElement) {
            this.tableElement = tableOptions.tableElement;
        } else if (tableOptions.container) {
            this.tableElement = tableOptions.container;
        }
        if (!this.tableElement) {
            this.tableElement = tableOptions.container ? tableOptions.container : null;
        }
        if (!this.tableElement) {
            this.tableElement = options.container + '-table';
            this.generateTable = true;
        }
        this.selectedColumns = tableOptions.selectedColumns ? tableOptions.selectedColumns : null;
        this.selectedRows = null;
        this.parentPlugin = { [options.container]: 'list' };
    }

    /**
     * jQuery function that checks if the element is visible in the viewport of the browser
    */
    jQuery.fn.isInViewport = function () {
        let elementTop = $e(this).offset().top;
        let elementBottom = elementTop + $e(this).outerHeight();
        let viewportTop = $e(window).scrollTop();
        let viewportBottom = viewportTop + $e(window).height();
        return elementBottom > viewportTop && elementTop < viewportBottom;
    };
    function checkEngineerTableIsVisible() {
        $e('#' + tableOptions.tableElement).each(function () {
            if ($e(this).isInViewport()) {
                $e('#quickViewScroll').hide();
            } else {
                $e('#quickViewScroll').show();
            }
        });
    }
    $e(window).on('resize scroll', function () {
        checkEngineerTableIsVisible();
    });

    /**
     * Loads XML doc to build UI based on loaded data
     */
    function createQuickViewUI() {
        listHeader = document.createElement('div');
        listHeader.id = options.container + '-listHeader';
        listBody = document.createElement('div');
        listBody.id = options.container + '-listBody';
        listBody.className = 'container-fluid';
        $e(listBody).css({'padding-top': '1em', 'overflow': 'hidden', 'overflow-y': 'auto'})
        if (options.listHeight !== 'unlimited') {
            $e(listBody).css('max-height', options.listHeight);
        }
        $rootContainer = $e('#' + options.container);
        $rootContainer.empty();
        $rootContainer.append(listHeader);
        $rootContainer.append(listBody);
        if (options.showTable == 'true' && tableOptions.generateTable) {
            $e('<div>')
                .attr('id', options.container + '-table')
                .css('padding-top', '1em')
                .appendTo($rootContainer);
        }
        if (options.cachedData) {
            try {
                rawXmlData = engineercore_getCache(options.cachedData);
                parseQuickViewData();
            } catch (error) {
                console.error('Error using cached data, loading from source - ' + error);
                loadDoc(options.quickViewLink, buildQuickViewUI);
                buildQuickFilter(listHeader);
            }
        } else {
            loadDoc(options.quickViewLink, buildQuickViewUI);
            buildQuickFilter(listHeader);
        }
    }

    /**
     * Builds UI based on XML data
     */
    function buildQuickViewUI(xmlDoc) {
        rawXmlData = xmlToObj(xmlDoc);
        rawXmlData = options.onDataLoad(rawXmlData);
        parseQuickViewData();
    }

    /**
     * Builds quick filter menus and adds to header
     */
    function buildQuickFilter(menuDiv) {
        if (options.filterPanels != 'false') {
            const panelSelector = '#' + options.container + ' .' + panelClass;
            let filterInput = $e('<input>');
            let $menuDiv = $e(menuDiv);
            let filterClearButton = $e('<button>');
            filterInput.attr('id', options.container + '-panelfilter');
            filterInput.attr('placeholder', options.filterPanelsPlaceholder);
            filterInput.css('height', '32px');
            filterInput.keydown(function (key) {
                if (key.keyCode == '13') {
                    runPanelFilter();
                }
            });
            let filterButton = $e('<button>');
            filterButton.text(options.filterPanelsButtonText);
            filterButton.addClass('btn btn-default filter-button');
            filterButton.click(function () {
                runPanelFilter();
            });
            filterClearButton.text(options.filterPanelsClearText);
            filterClearButton.addClass('btn btn-default clear-filter');
            filterClearButton.hide();
            filterClearButton.click(function () {
                $e(panelSelector).parent().show();
                filterInput.val('');
                filterClearButton.hide();
            });
            $menuDiv.append(filterInput);
            $menuDiv.append(filterButton);
            $menuDiv.append(filterClearButton);
        }

        if (options.filterGroups != 'false') {
            const groupNameSelector = '#' + options.container + ' .group-label';
            let filterInput = $e('<input>');
            let $menuDiv = $e(menuDiv);
            let filterClearButton = $e('<button>');
            filterInput.attr('id', options.container + '-groupfilter');
            filterInput.attr('placeholder', options.filterGroupsPlaceholder);
            filterInput.css('height', '32px');
            filterInput.keydown(function (key) {
                if (key.keyCode == '13') {
                    runGroupFilter();
                }
            });
            let filterButton = $e('<button>');
            filterButton.text(options.filterGroupsButtonText);
            filterButton.addClass('btn btn-default filter-button');
            filterButton.click(function () {
                runGroupFilter();
            });
            filterClearButton.text(options.filterGroupsClearText);
            filterClearButton.addClass('btn btn-default clear-group-filter');
            filterClearButton.hide();
            filterClearButton.click(function () {
                $e(groupNameSelector).parent().show();
                filterInput.val('');
                filterClearButton.hide();
            });
            $menuDiv.append(filterInput);
            $menuDiv.append(filterButton);
            $menuDiv.append(filterClearButton);
        }
    }

    // --- Contact card helpers (HighQ users & avatars) ---

    function fetchSiteUsers(siteID) {
        // default to configured siteID when not provided
        siteID = siteID || options.siteID;
        if (!siteID) {
            siteUsersByEmail = new Map();
            siteUsersById = new Map();
            return Promise.resolve();
        }
        // if we've already fetched (or intentionally set) users, do nothing
        if (siteUsersByEmail !== null) {
            return Promise.resolve();
        }
        if (fetchingSiteUsers) {
            return new Promise((resolve) => {
                let waiter = setInterval(function () {
                    if (!fetchingSiteUsers) {
                        clearInterval(waiter);
                        resolve();
                    }
                }, 100);
            });
        }
        fetchingSiteUsers = true;
        return fetch('./api/20/sites/' + siteID + '/users', {
            headers: { 'Accept': 'application/json' }
        }).then(function (resp) {
            if (!resp.ok) throw resp;
            return resp.json();
        }).then(function (json) {
            siteUsersByEmail = new Map();
            siteUsersById = new Map();
            if (json?.user && Array.isArray(json.user)) {
                json.user.forEach(function (u) {
                    try {
                        if (u.email) {
                            siteUsersByEmail.set(u.email.toLowerCase(), u);
                        }
                        if (u.userid !== undefined && u.userid !== null) {
                            siteUsersById.set(String(u.userid), u);
                        }
                    } catch (e) { }
                });
            }
            fetchingSiteUsers = false;
        }).catch(function () {
            fetchAllKnownUsers().then(function () {
                fetchingSiteUsers = false;
            });
        });
    }

    function fetchAllKnownUsers() {
        if (siteUsersByEmail !== null) {
            return Promise.resolve();
        }
        return fetch('./api/20/users?limit=1000', {
            headers: { 'Accept': 'application/json' }
        }).then(function (resp) {
            if (!resp.ok) throw resp;
            return resp.json();
        }).then(function (json) {
            siteUsersByEmail = new Map();
            siteUsersById = new Map();
            if (json?.user && Array.isArray(json.user)) {
                json.user.forEach(function (u) {
                    try {
                        if (u.email) {
                            siteUsersByEmail.set(u.email.toLowerCase(), u);
                        }
                        if (u.userid !== undefined && u.userid !== null) {
                            siteUsersById.set(String(u.userid), u);
                        }
                    } catch (e) { }
                });
            }
            fetchingSiteUsers = false;
        }).catch(function () {
            fetchingSiteUsers = false;
            siteUsersByEmail = new Map();
            siteUsersById = new Map();
        });
    }

    // Fetch full user profile (includes avatar URL and bio)
    function fetchAvatar(userid) {
        return fetch('./api/20/users/' + userid, { headers: { 'Accept': 'application/json' } }).then(function (resp) {
            if (!resp.ok) return null;
            return resp.json().then(function (json) {
                return json;
            });
        }).catch(function () { return null; });
    }

    // Enqueue avatar/profile request; accept optional listItem for adding bio button
    function enqueueAvatarRequest(userid, imgEl, listItem) {
        avatarQueue.push({ userid: userid, imgEl: imgEl, listItem: listItem });
        if (!processingAvatarQueue) processAvatarQueue();
    }

    function processAvatarQueue() {
        if (processingAvatarQueue) return;
        processingAvatarQueue = true;
        (function next() {
            if (avatarQueue.length === 0) {
                processingAvatarQueue = false;
                return;
            }
            const req = avatarQueue.shift();
            fetchAvatar(req.userid).then(function (user) {
                try {
                    if (user && req.listItem && user.bio && options.ccShowBioButton === 'true') {
                        createBioButton(req.listItem, user);
                    }
                } catch (e) { }
                if (user && req.imgEl) {
                    try {
                        let imgUrl = user.img || '';
                        if (user?.img) {
                            // ensure requested size matches configured imageWidth
                            const size = (options.imageWidth || '64px').split('px')[0];
                            if (/([?&])size=\d+/.test(user.img)) {
                                imgUrl = user.img.replace(/([?&])size=\d+/, '$1size=' + size);
                            } else {
                                imgUrl = user.img + (user.img.indexOf('?') > -1 ? '&' : '?') + 'size=' + size;
                            }
                        }
                        $e(req.imgEl).attr('src', imgUrl || req.imgEl.attr('src'));
                    } catch (e) { }
                }
                // small backoff between avatar requests
                setTimeout(next, 50);
            }).catch(function () { setTimeout(next, 150); });
        })();
    }

    // Create bio/profile button under avatar and wire modal
    function createBioButton(listItem, user) {
        try {
            // avoid duplicate buttons for same user on same listItem
            if ($e(listItem).find('.list-contact-bio-button[data-userid="' + user.userid + '"]').length > 0) return;
            const $btn = $e('<button>')
                .addClass('btn btn-default list-contact-bio-button')
                .attr('type', 'button')
                .attr('data-userid', user.userid)
                .text('Bio');
            $e(listItem).find('.list-contact-image-container').append($btn);
            $btn.click(function () {
                ensureProfileModal();
                openUserProfileModal(user);
                $e('#' + options.container + '-userProfileModal').modal('show');
            });
        } catch (e) { }
    }

    // Ensure modal exists in DOM
    function ensureProfileModal() {
        const modalId = options.container + '-userProfileModal';
        if ($e('#' + modalId).length > 0) return;
        const modal = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog">' +
            '<div class="modal-dialog modal-lg" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<h5 class="modal-title" style="display:inline-block"></h5>' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '</div>' +
            '<div class="modal-body"></div>' +
            '<div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button></div>' +
            '</div></div></div>';
        $e('body').append(modal);
    }

    // Populate and show profile modal
    function openUserProfileModal(user) {
        try {
            const modalId = options.container + '-userProfileModal';
            const $modal = $e('#' + modalId);
            const $title = $modal.find('.modal-title');
            const $body = $modal.find('.modal-body');
            const name = (user.firstname || '') + ' ' + (user.lastname || '');
            $title.text(name.trim() || user.email || 'User Profile');
            // Helper to linkify URLs in bio text
            function linkify(text) {
                if (!text) return '';
                // escape HTML
                const esc = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                // linkify http/https
                return esc.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g, '<br>');
            }
            let html = '<div class="row">';
            html += '<div class="col-md-4 text-center">';
            if (user.img) {
                html += '<img src="' + user.img + '" class="img-fluid img-thumbnail" alt="' + (name || '') + '" style="max-width:100%;"/>';
            }
            html += '</div>';
            html += '<div class="col-md-8">';
            if (user.jobtitle) html += '<p><strong>Title:</strong> ' + user.jobtitle + '</p>';
            if (user.department) html += '<p><strong>Department:</strong> ' + user.department + '</p>';
            if (user.email) html += '<p><strong>Email:</strong> <a href="mailto:' + user.email + '" target="_blank">' + user.email + '</a></p>';
            if (user.phone) {
                const phone = normalizePhone(user.phone);
                if (phone) {
                    html += '<p><strong>Phone:</strong> <a href="tel:' + phone + '">' + phone + '</a></p>';
                }
            }
            if (user.address) {
                const addr = (user.address.addressline1 ? user.address.addressline1 + ', ' : '') +
                    (user.address.city ? user.address.city + ', ' : '') + (user.address.country ? user.address.country : '');
                html += '<p><strong>Address:</strong> ' + addr + '</p>';
            }
            if (user.bio) html += '<hr/><div><strong>Bio</strong><div style="margin-top:0.5em">' + linkify(user.bio) + '</div></div>';
            html += '</div></div>';
            $body.html(html);
        } catch (e) { }
    }

    // Helper: normalize phone/mobile fields (replace '$' with space, collapse whitespace)
    function normalizePhone(value) {
        if (!value || value == '$' || value == '$$') return '';
        let phoneParts = value.split('$');
        if (phoneParts[0].length > 0) {
            phoneParts[0] = '+' + phoneParts[0];
        }
        return phoneParts.join(' ');
    }

    // Helper: normalize address and filter out unknown values
    function normalizeAddress(raw) {
        if (!raw && raw !== 0) return '';
        const addr = String(raw).replace(/,\s*/g, ', ').replace(/,\s*$/g, '').trim();
        return /Unknown/i.test(addr) ? '' : addr;
    }

    // Helper: create placeholder avatar image element
    function createPlaceholderAvatar(fullname) {
        return $e('<img>')
            .addClass('media-object list-contact-image')
            .attr('alt', fullname)
            .css('max-width', options.imageWidth || '64px')
            .attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
    }

    function buildContactCard(user, itemData, listItem) {
        try {
            $e(listItem).empty();
            const first = user?.name?.firstname ?? '';
            const last = user?.name?.lastname ?? '';
            const fullname = (first || last) ? (first + ' ' + last).trim() : (user?.name?.userDisplayName ?? itemData.name);

            const $card = $e('<div>').addClass('list-contact-card media');
            const imagePanel = $e('<div>').addClass('list-contact-image-container' + (options.ccImagePostion === 'right' ? ' media-right' : ' media-left'));
            let $img;
            if (options.ccShowImage != 'false') {
                $img = createPlaceholderAvatar(fullname);
                imagePanel.append($img);
                if (options.ccImagePostion !== 'right') {
                    $card.append(imagePanel);
                }
            }

            const $body = $e('<div>').addClass('media-body');
            const $h4 = $e('<h4>').addClass('list-contact-name').text(fullname);
            $body.append($h4);

            const roleParts = [];
            if (user?.jobtitle && options.ccShowJobTitle === 'true') roleParts.push(user.jobtitle);
            if (user?.department && options.ccShowDepartment === 'true') {
                if (roleParts.length > 0) {
                    roleParts.push(', ');
                }
                roleParts.push(user.department);
            }

            $body.append($e('<div>').addClass('list-contact-role').text(roleParts.join('')));

            if (user?.organisation?.orgname && options.ccShowCompany === 'true') {
                $body.append($e('<div>').addClass('list-contact-company').text(user.organisation.orgname));
            }

            if (user?.email && options.ccShowEmail === 'true') {
                $body.append($e('<div>').addClass('list-contact-email').html('<a href="mailto:' + user.email + '">' + user.email + '</a>'));
            }

            const phone = normalizePhone(user?.phone);
            if (phone && options.ccShowPhone === 'true') $body.append($e('<div>').addClass('list-contact-phone').html('Phone: <a href="tel:' + phone + '">' + phone + '</a>'));

            const mobile = normalizePhone(user?.mobile);
            if (mobile && options.ccShowMobile === 'true') $body.append($e('<div>').addClass('list-contact-mobile').html('Mobile: <a href="tel:' + mobile + '">' + mobile + '</a>'));

            const rawAddress = user?.organisation?.orgaddress ?? user?.location?.city;
            const address = normalizeAddress(rawAddress);
            if (address && options.ccShowAddress === 'true') $body.append($e('<div>').text(address));

            $card.append($body);
            if (options.ccShowImage != 'false' && options.ccImagePostion === 'right') {
                $card.append(imagePanel);
            }

            $e(listItem).append($card);

            if (user?.userid) {
                enqueueAvatarRequest(user.userid, $img, listItem);
            }
        } catch (e) {
            // fallback: do nothing
        }
    }

    function runPanelFilter() {
        let filterTerm = $e('#' + options.container + '-panelfilter').val();
        let panelSelector = '#' + options.container + ' .' + panelClass + ':icontains(' + filterTerm + ')';
        if (options.otherColumns != 'false') {
            panelSelector += ',#' + options.container + ' .' + panelOtherVal + ':icontains(' + filterTerm + ')';
        }
        const items = $e(panelSelector);
        if (items.length > 0) {
            $e('#' + options.container + ' .list-group-item').hide();
            $e(items).closest('.list-group-item').show();
            $e('#' + options.container + ' .clear-filter').show();
        } else {
            $e('#' + options.container + '-panelfilter').val('');
            options.filterPanelNoResultCallback(filterTerm);
        }
    }

    function runGroupFilter() {
        const groupSelector = '#' + options.container + ' .group-label';
        let filterTerm = $e('#' + options.container + '-groupfilter').val();
        const groups = $e(groupSelector + ':icontains(' + filterTerm + ')');
        if (groups.length > 0) {
            $e(groupSelector).parent().hide();
            $e(groups).parent().show();
            $e('#' + options.container + ' .clear-group-filter').show();
        } else {
            options.filterPanelNoResultCallback(filterTerm);
        }
    }

    /**
     * Parses XML data to local objects
     */
    function parseQuickViewData(colId) {
        let listMap = new Map();
        groupColumnsCount.clear();
        choroplethCountData.clear();
        let additionalColumns = [];
        if (options.otherColumns != 'false') {
            let opts = options.otherColumns.split(',');
            additionalColumns = opts.map(v => Number.parseInt(v, 10));
        }
        if (colId) {
            statusColumn = colId;
        } 
        console.log('Parsing data with nameColumn: ' + options.nameColumn + ', groupColumn: ' + options.groupColumn + ', sumColumn: ' + options.sumColumn);
        if (rawXmlData.view.head?.headColumn) {
            for (let i = 0; i < rawXmlData.view.head.headColumn.length; i++) {
                let header = rawXmlData.view.head.headColumn[i];
                if (i == options.sumColumn) {
                    for (const element of header.properties.property) {
                        const prop = element;
                        if (prop.propertyTypeAlias == 'SHEET_COL_PROP_TYPE_DECIMAL_PLACES') {
                            options.sumColumnDecimal = Number.parseInt(prop.cdata);
                            break;
                        }
                    }
                }
                if (i == Number.parseInt(options.nameColumn)) {
                    nameColumnData = {
                        index: i,
                        rawData: header,
                        name: header.columnValue.cdata,
                        id: header.columnid,
                        typeAlias: header.columnTypeAlias
                    };
                } else {
                    if (header.columnTypeAlias === 'SHEET_COLUMN_TYPE_CHOICE' || (header.columnTypeAlias === 'SHEET_COLUMN_TYPE_HYPERLINK' && options.disableHyperlinks == 'false')) {
                        if (firstChoice === undefined) {
                            firstChoice = i;
                        }
                        // exclude certain columns from the dropdown
                        if ((i == Number.parseInt(options.groupColumn) && options.hideGroupColumn == 'true') || additionalColumns.includes(i)) {
                            //skip
                        } else {
                            headersData.set(i, {
                                index: i,
                                rawData: header,
                                name: header.columnValue.cdata,
                                id: header.columnid,
                                typeAlias: header.columnTypeAlias
                            });
                        }
                    }
                    if (header.columnTypeAlias === 'SHEET_COLUMN_TYPE_IMAGE' && options.imageColumn == 'auto') {
                        options.imageColumn = i;
                    }
                }
            }
        }
        if (rawXmlData.view.data?.item) {
            let numberOfPanels;
            if (options.isChoropleth != 'true' && (options.panelLimit > 0 && options.panelLimit < rawXmlData.view.data.item.length)) {
                numberOfPanels = options.panelLimit;
            } else {
                numberOfPanels = rawXmlData.view.data.item.length;
            }
            for (let i = 0; i < numberOfPanels; i++) {
                let row = rawXmlData.view.data.item[i];
                if (row.column[options.nameColumn]?.rawData) {
                    let name = getValue(options.nameColumn, row, options.contactCards == 'true');
                    if (typeof name === 'object') {
                        if (name.length > 1) {
                            options.isChoropleth = 'true';
                            console.warn('Multiple values found in nameColumn, switching isChoropleth to true');
                        }
                    }
                    if (!name) {
                        name = '';
                    }
                    let id = row.itemID.cdata;
                    let groupColumn;
                    if (options.groupColumn != 'false') {
                        if (options.groupColumn == 'status') {
                            if (!statusColumn) {
                                groupColumn = getValue(firstChoice, row);
                                statusColumn = firstChoice;
                            } else {
                                groupColumn = getValue(statusColumn, row);
                            }
                            if (!groupColumn) {
                                groupColumn = 'Default';
                            }
                        } else {
                            groupColumn = getValue(options.groupColumn, row);
                            if (!groupColumn) {
                                groupColumn = 'Default';
                            }
                        }
                        if (typeof groupColumn === 'object' && groupColumn.length > 0) {
                            groupColumn = groupColumn[0];
                        }
                    } else {
                        groupColumn = 'Default';
                    }
                    let groupIdentifier;
                    let rowCalcValue;
                    if (options.sumColumn > -1) {
                        rowCalcValue = getValue(options.sumColumn, row, true);
                        if (rowCalcValue) {
                            rowCalcValue = parseFloat(rowCalcValue);
                        } else {
                            rowCalcValue = 0;
                        }
                    }
                    if (options.isChoropleth == 'true') {
                        if (typeof name === 'object') {
                            name.forEach(function (element) {
                                groupIdentifier = element + '-' + groupColumn;
                                addToListData(groupIdentifier, element);
                            });
                        } else {
                            groupIdentifier = name + '-' + groupColumn;
                            addToListData(groupIdentifier, name);
                        }
                    } else {
                        groupIdentifier = id + '-' + groupColumn;
                        if (typeof name === 'object') {
                            name = name[0];
                        }
                        addToListData(groupIdentifier, name);
                    }
                    function addToListData(groupIdentifier, name) {
                        if (!choroplethCountData.has(groupIdentifier)) {
                            let groupColumnCount = groupColumnsCount.has(groupColumn) ? groupColumnsCount.get(groupColumn) : 0;
                            if (options.sumColumn > -1) {
                                choroplethCountData.set(groupIdentifier, rowCalcValue);
                            } else {
                                choroplethCountData.set(groupIdentifier, 1);
                            }
                            listData.set(i, {
                                index: i,
                                rawData: row,
                                name: name,
                                groupIdentifier: groupIdentifier,
                                groupData: {
                                    groupColumnId: groupColumn.replace(/\W/g, ''),
                                    groupColumnValue: groupColumn
                                },
                                choices: []
                            });
                            groupColumnCount++;
                            groupColumnsCount.set(groupColumn, groupColumnCount);
                            listMap.set(groupIdentifier, i);
                        } else if (options.sumColumn > -1) {
                            let nameCount = choroplethCountData.get(groupIdentifier) + rowCalcValue;
                            choroplethCountData.set(groupIdentifier, nameCount);
                        } else {
                            let nameCount = choroplethCountData.get(groupIdentifier) + 1;
                            choroplethCountData.set(groupIdentifier, nameCount);
                        }
                    }

                    let choiceVal;
                    if (options.countChoices == 'true') {
                        if (!statusColumn) {
                            statusColumn = firstChoice;
                        }
                        choiceVal = getValue(statusColumn, row);
                        let listIndex = listMap.get(groupIdentifier);
                        let listItem = listData.get(listIndex);
                        listItem.choices.push({ [choiceVal]: i });
                    }
                }
            }

            if (options.sortPanels) {
                let sortedListData = new Map();
                if (options.sortPanels == 'pill') {
                    choroplethCountData = (new Map([...choroplethCountData.entries()].sort((a, b) => b[1] - a[1])));
                    choroplethCountData.keys().forEach((group, i) => {
                        for (const [j, element] of listData) {
                            if (element.groupIdentifier == group) {
                                sortedListData.set(i, listData.get(j));
                            }
                        }
                    });
                } else if (options.sortPanels == 'name') {
                    sortedListData = new Map([...listData.entries()].sort((a, b) => String(a[1].name).localeCompare(b[1].name)));
                }
                listData = sortedListData;
            }
            if (options.isChoropleth == 'true' && options.panelLimit > 0) {
                listData.keys().forEach((element, i) => {
                    if (i >= options.panelLimit) {
                        listData.delete(element);
                    }
                });
            }

            let groupColumnsCountArr = Array.from(groupColumnsCount, entry => entry);
            groupColumnsCount = new Map(groupColumnsCountArr.toSorted(function (left, right) {
                if (options.groupSort == 'a-z') {
                    return left[0].localeCompare(right[0]);
                } else if (options.groupSort == 'z-a') {
                    return right[0].localeCompare(left[0]);
                }
            }));
            if (options.panelLinks == 'filter') {
                for (let i = 0; i < rawXmlData.view.recordCount; i++) {
                    selectedQuickViewItems.set(i, i);
                }
            }
        }
        if (colId) {
            changeQuickViewColumn(options.container + 'quickViewSelector', colId);
        } else {
            renderQuickViewUI();
        }
    }

    /**
     * Creates html markup based on parsed data
     */
    function renderQuickViewUI() {
        // Add "Quick Views" to menu button
        let items = [];
        for (let header of headersData.values()) {
            if (options.statusColumn == 'false' || header.index == Number.parseInt(options.statusColumn)) {
                items.push({
                    id: header.index,
                    name: header.name
                });
            }
        }
        if (items.length > 0 && (options.isChoropleth == 'false' || options.countChoices == 'true')) {
            buildQuickViewButton(options.container + 'quickViewSelector', items);
        } else {
            changeQuickViewColumn(options.container + 'quickViewSelector', options.nameColumn);
        }
    }

    /**
     * Creates html markup for quickview button
     */
    function buildQuickViewButton(buttonId, items) {
        if (options.showQuickViewButton == 'true' && items.length > 1) {
            let buttonContainer = document.createElement('div');
            let button = document.createElement('button');
            let caret = document.createElement('span');
            let optionsContainer = document.createElement('ul');
            let selectedQuickViewLabel = document.createElement('span');
            let callFirstQuickView = null;
            caret.className = 'caret';
            button.textContent = options.buttonText;
            button.append(caret);
            button.id = buttonId;
            button.className = 'btn btn-danger dropdown-toggle';
            button.setAttribute('type', 'button');
            button.setAttribute('aria-haspopup', 'true');
            button.setAttribute('aria-expanded', 'false');
            button.style = 'float:left; margin-right:10px';
            button.dataset.toggle = 'dropdown';
            button.dataset.haspopup = 'true';
            optionsContainer.className = 'dropdown-menu';
            optionsContainer.style = 'max-width: 90%;';
            optionsContainer.setAttribute('aria-labelledby', buttonId);
            // Create search box for typeahead
            const listItem = document.createElement('li');
            const typeAheadInput = document.createElement('input');
            const listSelector = '#' + listHeader.id + ' ul li.quickview-item';
            let searchHandler;
            if (options.quickViewSearchEnabled != 'false') {
                typeAheadInput.placeholder = 'Filter';
                typeAheadInput.className = 'form-control';
                typeAheadInput.style = 'margin: 10px 20px; width: 50%';
                $e(typeAheadInput).keyup(function () {
                    const term = $e(this).val();
                    if (searchHandler) {
                        clearTimeout(searchHandler);
                    }
                    if (term.length > 0) {
                        searchHandler = setTimeout(function () {
                            const $items = $e(listSelector + ':icontains(' + term + ')');
                            $e(listSelector).hide();
                            $items.show();
                        }, options.searchDelay);
                    } else {
                        $e(listSelector).show();
                    }
                });
                listItem.append(typeAheadInput);
                optionsContainer.append(listItem);
            }
            // Create menu item for each quick view
            items.forEach(function (item) {
                let listItem = document.createElement('li');
                let link = document.createElement('a');
                listItem.className = 'quickview-item';
                link.style = 'white-space: normal;';
                link.href = '#';
                link.textContent = item.name;
                $e(link).click(function () {
                    changeQuickViewColumn(buttonId, item.id);
                });
                if (callFirstQuickView === null) {
                    callFirstQuickView = function () {
                        changeQuickViewColumn(buttonId, item.id);
                    };
                }
                listItem.append(link);
                optionsContainer.append(listItem);
            });
            selectedQuickViewLabel.id = buttonId + 'Label';
            selectedQuickViewLabel.textContent = '';
            buttonContainer.id = listHeader.id + 'Menu';
            buttonContainer.className = 'dropdown';
            buttonContainer.style = 'min-height:35px';
            buttonContainer.append(button);
            buttonContainer.append(selectedQuickViewLabel);
            buttonContainer.append(optionsContainer);
            $e(listHeader).append(buttonContainer);
            $e('.dropdown-toggle').dropdown();
            if (options.quickViewSearchEnabled != 'false') {
                // Focus sarch input when opning dropdown
                $e('#' + buttonContainer.id).on('shown.bs.dropdown', function () {
                    $e(typeAheadInput).focus();
                });
                // Remove search term when closing dropdown
                $e('#' + buttonContainer.id).on('hide.bs.dropdown', function () {
                    $e(listSelector).show();
                    $e(typeAheadInput).val('');
                });
            }
            callFirstQuickView();
        } else {
            changeQuickViewColumn(options.container + 'quickViewSelector', items[0].id);
        }
    }

    /**
     * Creates event for quick view button click
     */
    function changeQuickViewColumn(buttonId, columnId) {
        legend.clear();
        if (options.groupColumn == 'status' || options.countChoices == 'true') {
            if (statusColumn != columnId) {
                parseQuickViewData(columnId);
                return;
            }
        }
        let expandedGroupNames = [];
        if (options.collapsibleGroups != 'false') {
            let expandedGroups = $e('#' + options.container + ' .listGroupHeader[aria-expanded=true]');
            if (expandedGroups.length == 0) {
                expandedGroups = null;
            } else {
                expandedGroups.each(function (i, v) {
                    expandedGroupNames.push(v.attributes['data-target'].value);
                });
            }
        }
        let header = headersData.get(columnId);
        if (columnId == options.nameColumn) {
            header = nameColumnData;
        }
        let windowLimit = 992;
        $e('#' + buttonId + 'Label').empty();
        $e('#' + buttonId + 'Label').append('<strong>' + header.name + '</strong>');
        $e(listBody).empty();
        $e(listBody).hide();
        let topLevelRow = document.createElement('div');
        let firstGroupCollapsed = true;
        topLevelRow.className = 'row';
        $e(listBody).append(topLevelRow);
        for (let values of groupColumnsCount.entries()) {
            let group = values[0];
            let groupCount = values[1];
            let columnsLimit = window.innerWidth <= windowLimit ? 2 : 3;
            if (options.singleColumn == 'true') {
                columnsLimit = 1;
            }
            let columnsPerRow;
            if (groupCount <= options.itemsPerColumnLimit) {
                columnsPerRow = 1;
            } else if (groupCount <= (options.itemsPerColumnLimit * 2)) {
                columnsPerRow = 2;
            } else {
                columnsPerRow = columnsLimit;
            }
            if (options.collapsibleGroups != 'false') {
                columnsPerRow = columnsLimit;
            }
            // Create row for one group
            let groupColumn = document.createElement('div');
            let groupRow = document.createElement('div');
            let groupLabel = document.createElement('a');
            let caret = document.createElement('span');
            let label = document.createElement('strong');
            let separator = document.createElement('hr');
            let columnSize = 12 / columnsPerRow;
            let mobileColSize = columnsPerRow == 1 ? 12 : 6;
            if (options.singleColumn == 'true') {
                groupColumn.className = 'list-group col-md-' + mobileColSize + ' col-sm-' + mobileColSize;
            } else {
                groupColumn.className = 'list-group col-md-' + (columnsPerRow * 4) + ' col-sm-' + mobileColSize;
            }
            label.textContent = group;
            // Create collapsible link for group
            if (options.collapsibleGroups != 'false') {
                groupRow.id = group.replace(/\W/g, '') + 'Collapse'; // id to be referenced by link
                caret.className = 'caret';
                groupLabel.href = 'javascript:void(0)';
                groupLabel.className = 'listGroupHeader';
                groupLabel.setAttribute('aria-controls', 'collapseGroups');
                groupLabel.dataset.toggle = 'collapse';
                groupLabel.dataset.target = '#' + groupRow.id;
                // By default collapse group content
                groupRow.className = 'row collapse';
                groupLabel.setAttribute('aria-expanded', 'false');
                // Define which groups will be expanded according to the passed option
                if (options.groupColumn != 'status' && expandedGroupNames.length > 0) {
                    if (expandedGroupNames.includes(groupLabel.dataset.target)) {
                        groupRow.className = 'row collapse in';
                        groupLabel.setAttribute('aria-expanded', 'true');
                    }
                } else {
                    if (options.groupCollapseDefault == 'open') {
                        groupRow.className = 'row collapse in';
                        groupLabel.setAttribute('aria-expanded', 'true');
                    }
                    if (options.groupCollapseDefault == 'first' && firstGroupCollapsed) {
                        groupRow.className = 'row collapse in';
                        groupLabel.setAttribute('aria-expanded', 'true');
                        firstGroupCollapsed = false;
                    }
                }
                $e(groupLabel).append(caret);
                $e(groupLabel).append(label);
            } else {
                groupRow.className = 'group-row';
                groupLabel = document.createElement('strong');
                groupLabel.textContent = group;
            }
            // Append group row to DOM
            if (options.groupColumn != 'false') {
                $e(groupLabel).addClass('group-label');
                $e(groupLabel).css('margin-left', '15px');
                $e(separator).css('margin', '2px 0px 0px 0px');
                $e(groupColumn).append(groupLabel);
                $e(groupColumn).append(separator);
            }
            $e(groupColumn).append(groupRow);
            $e(topLevelRow).append(groupColumn);
            // Create columns for one group
            for (let currentGroupCounter = 1; currentGroupCounter <= columnsPerRow; currentGroupCounter++) {
                let col = document.createElement('div');
                let groupList = document.createElement('ul');
                col.className = 'list-column col-md-' + columnSize + ' col-sm-' + mobileColSize;
                groupList.id = options.container + group.replace(/\W/g, '') + currentGroupCounter;
                groupList.className = 'list-group';
                $e(col).append(groupList);
                $e(groupRow).append(col);
            }
        }
        // Asign every row from the data to the corresponding group column
        let columnGroupCurrentItem = new Map();
        let panelIdx = 0;
        let noOfHeroPanels = Number.parseInt(options.heroPanels);
        for (let itemData of listData.values()) {
            let group = itemData.groupData;
            let currentColumnGroupNumber;
            if (columnGroupCurrentItem.has(group.groupColumnValue)) {
                let currentRankCount = columnGroupCurrentItem.get(group.groupColumnValue) + 1;
                columnGroupCurrentItem.set(group.groupColumnValue, currentRankCount);
            } else {
                columnGroupCurrentItem.set(group.groupColumnValue, 1);
            }
            let totalGroupCount = groupColumnsCount.get(group.groupColumnValue);
            let divisor;
            if (window.innerWidth <= windowLimit || totalGroupCount <= options.itemsPerColumnLimit) {
                divisor = 1;
            } else if (totalGroupCount > 2 * options.itemsPerColumnLimit || options.collapsibleGroups != 'false') {
                divisor = 3;
            } else {
                divisor = 2;
            }
            const currentItemOrder = columnGroupCurrentItem.get(group.groupColumnValue);
            const wholeTotalGroupCount = totalGroupCount % divisor == 0
                ? totalGroupCount
                : totalGroupCount + (divisor - (totalGroupCount % divisor));
            if (currentItemOrder <= (wholeTotalGroupCount / divisor)) {
                currentColumnGroupNumber = 1;
            } else if (currentItemOrder <= (wholeTotalGroupCount / divisor * 2)) {
                currentColumnGroupNumber = 2;
            } else if (divisor > 2 && currentItemOrder <= (wholeTotalGroupCount / divisor * 3.00)) {
                currentColumnGroupNumber = 3;
            } else {
                console.error('Could not add panel');
                break;
            }
            let containerId = options.container + group.groupColumnId + currentColumnGroupNumber;
            let containerSelector = '#' + containerId;
            let listItem = document.createElement('li');
            let clickable = false;
            let isHero;
            listItem.className = 'list-group-item';
            if (options.colorPanelBackground != 'false') {
                $e(listItem).addClass('solid-color');
            }
            if (options.heroPanels != '0') {
                if (options.heroPanels == 'all') {
                    isHero = true;
                } else if (!Number.isNaN(noOfHeroPanels)) {
                    if (panelIdx < noOfHeroPanels) {
                        isHero = true;
                    }
                }

            }
            if (isHero) {
                listItem.className += ' list-hero';
            }
            listItem.dataset.regionIndex = itemData.index;
            listItem.dataset.taskSearch = options.taskSearch == 'false' ? '' : itemData.rawData.column[options.taskSearch].displayData.cdata;
            listItem.dataset.columnId = header.id;
            listItem.dataset.itemId = itemData.rawData.itemID.cdata;
            listItem.dataset.columnTypeAlias = header.typeAlias;
            listItem.dataset.searchText = itemData.name;
            listItem.dataset.groupColumn = group.groupColumnValue;
            if (options.hyperlinkColumn != 'auto') {
                try {
                    if (rawXmlData.view.head.headColumn[options.hyperlinkColumn]) {
                        if (itemData.rawData.column[options.hyperlinkColumn].rawData.linkDisplayURL) {
                            listItem.dataset.itemurl = itemData.rawData.column[options.hyperlinkColumn].rawData.linkDisplayURL.cdata;
                            clickable = true;
                        } else if (isValidURL(itemData.rawData.column[options.hyperlinkColumn].displayData.cdata)) {
                            listItem.dataset.itemurl = itemData.rawData.column[options.hyperlinkColumn].displayData.cdata;
                            clickable = true;
                        } else {
                            listItem.dataset.itemurl = '';
                        }
                    }
                } catch (error) {
                    listItem.dataset.itemurl = '';
                    clickable = false;
                }
            }
            else if (header.typeAlias == 'SHEET_COLUMN_TYPE_HYPERLINK') {
                try {
                    listItem.dataset.itemurl = itemData.rawData.column[columnId].rawData.linkDisplayURL.cdata;
                    clickable = true;
                } catch (error) {
                    listItem.dataset.itemurl = '';
                    clickable = false;
                }
            }
            if (options.showTable != 'false' || options.panelLinks != 'false' || options.isChoropleth != 'false' || options.taskSearch != 'false' || options.panelFunction) {
                clickable = true;
            }
            if (clickable) {
                $e(listItem).css('cursor', 'pointer');
            }
            let domName = itemData.name.replace(/\W/g, '');
            $e(listItem).addClass(selectedQuickViewItems.has(itemData.index) ? 'list-item-on' : 'list-item-off')
                .attr('id', options.container + containerId + domName);
            let $title = options.hyperlinkColumn != 'auto' && clickable ? $e('<a>') : $e('<div>');
            $title.addClass(panelClass)
                .html(itemData.name);
            if (options.hyperlinkColumn != 'auto') {
                $title.attr('href', listItem.dataset.itemurl)
                    .attr('target', options.linkTab);
            }

            if (options.titleLocation == 'above') {
                $e(listItem).append($title);
                $e(listItem).append('<span class="list-title-spacer"></span>');
            }
            let $imageDiv = $e('<div>');
            $imageDiv.addClass('engListFlag list-image-container ' + engineercore_safeCSS(itemData.name));
            if (options.imageColumn != 'false' && options.imageColumn != 'auto') {
                let image = itemData.rawData.column[options.imageColumn].displayData.cdata;
                if (image) {
                    let $imageElement = $e('<img>')
                        .addClass('el-image')
                        .attr('src', image)
                        .width(isHero ? '100%' : options.imageWidth);
                    if (!isHero && options.imageHeight) {
                        $imageElement.height(options.imageHeight);
                    }
                    $imageDiv.append($imageElement);
                } else {
                    $imageDiv.addClass('el-placeholder');
                }
            }
            $e(listItem).append($imageDiv);
            // Appending badge with choropleth mode count if applicable
            if (header.typeAlias == 'SHEET_COLUMN_TYPE_CHOICE' || options.isChoropleth != 'false') {
                let badgeText;
                if (options.isChoropleth == 'false') {
                    badgeText = getValue(columnId.toString(), itemData.rawData, true);
                } else if (options.sumColumn == -1) {
                    badgeText = choroplethCountData.get(itemData.groupIdentifier);
                } else {
                    badgeText = choroplethCountData.get(itemData.groupIdentifier).toFixed(options.sumColumnDecimal);
                }
                if (badgeText) {
                    if (typeof badgeText === 'object') {
                        badgeText.forEach(function (badge) {
                            let color = getChoiceTypeColumnStyle(itemData.rawData.column[columnId].rawData, badge);
                            $e(listItem).append('<div class="badge listBadge list-badge" style="background: '
                                + color + '">'
                                + badge + '</div>');
                            if (options.colorPanelBackground != 'false') {
                                $e(listItem).css({ 'background-color': color, 'color': '#fff' });
                            }
                        });
                    }
                    else if (options.countChoices == 'true') {
                        let choiceMap = new Map();
                        itemData.choices.forEach(element => {
                            let choiceVal = Object.keys(element)[0];
                            let itemPos = Object.values(element)[0];
                            if (!choiceMap.get(choiceVal)) {
                                let color = getChoiceTypeColumnStyle(rawXmlData.view.data.item[itemPos].column[columnId].rawData);
                                choiceMap.set(choiceVal, { color: color, name: choiceVal, item: itemPos, count: 1 });
                            } else {
                                let addToMap = choiceMap.get(choiceVal);
                                addToMap.count++;
                                choiceMap.set(choiceVal, addToMap);
                            }
                        });
                        choiceMap.forEach(element => {
                            let $badgeTitle;
                            if (options.countChoicesLegend == 'false') {
                                $badgeTitle = $e('<div>')
                                    .addClass('badge-title')
                                    .text(element.name);
                            }
                            let $badgeValue = $e('<div>')
                                .addClass('badge-value')
                                .text(element.count);
                            $e('<div>')
                                .addClass('badge listBadge list-badge')
                                .css('background-color', element.color)
                                .append($badgeTitle || '')
                                .append($badgeValue)
                                .appendTo($e(listItem));
                        });
                    } else {
                        let color = getChoiceTypeColumnStyle(itemData.rawData.column[columnId].rawData, itemData.name);
                        $e(listItem).append('<div class="badge listBadge list-badge" style="background: '
                            + color + '">'
                            + badgeText + '</div>');
                        if (options.colorPanelBackground != 'false') {
                            $e(listItem).css({ 'background-color': color, 'color': '#fff' });
                        }
                    }
                }
            }

            if (options.titleLocation == 'right') {
                $title.addClass('list-title-right');
                $e(listItem).append($title);
                if (options.otherColumnLocation == 'below' || isHero) {
                    $e(listItem).append('<span class="list-title-spacer"></span>');
                }
            }


            if (options.otherColumns != 'false') {
                if ((options.otherColumnLocation == 'below' && options.titleLocation == 'below') || isHero) {
                    $e(listItem).append('<span class="list-title-spacer"></span>');
                    $title.addClass('list-title-below');
                    $e(listItem).append($title);
                }
                let additionalColumn = options.otherColumns.split(',');
                let $otherColumns = $e('<div>')
                    .addClass('list-other-columns ');
                additionalColumn.forEach(colIndex => {
                    if (!$e.isEmptyObject(itemData.rawData.column[colIndex].displayData)) {
                        let $otherHeader;
                        let $otherCol = $e('<div>')
                            .addClass('list-other ' + 'col-' + engineercore_safeCSS(rawXmlData.view.head.headColumn[colIndex].columnValue.cdata));
                        if (options.showOtherColumnHeaders == 'true') {
                            $otherHeader = $e('<span>')
                                .addClass('other-header')
                                .text(rawXmlData.view.head.headColumn[colIndex].columnValue.cdata + ': ');
                            $otherCol.append($otherHeader);
                        }
                        let $otherVal = $e('<span>')
                            .addClass(panelOtherVal)
                            .html(getValue(colIndex, itemData.rawData).toString());
                        $otherCol.append($otherVal);
                        $otherColumns.append($otherCol);
                    }
                });
                $e(listItem).append($otherColumns);
            }
            if (options.titleLocation == 'below' && !isHero) {
                $e(listItem).append('<span class="list-title-spacer"></span>');
                $title.addClass('list-title-below');
                $e(listItem).append($title);
            }
            // If contactCards are enabled and this is a lookup name column, try to replace list item with a contact card
            if (options.contactCards == 'true' && header.typeAlias == 'SHEET_COLUMN_TYPE_LOOKUP') {
                // Attempt to get raw lookup value (getValue with raw=true returns rawData.lookup.cdata for single lookups)
                let lookupVal = itemData.name;
                if (lookupVal) {
                    // ensure users are loaded, then build card if match found
                    if (siteUsersByEmail === null) {
                        // show placeholder now and update when users arrive
                        $e(listItem).append($e('<div>').addClass('contact-loading').text('Loading contact...'));
                        fetchSiteUsers(options.siteID).then(function () {
                            const u = siteUsersByEmail.get(String(lookupVal).toLowerCase());
                            if (u) {
                                buildContactCard(u, itemData, listItem);
                            }
                        });
                    } else {
                        const u = siteUsersByEmail.get(String(lookupVal).toLowerCase());
                        if (u) {
                            buildContactCard(u, itemData, listItem);
                        }
                    }
                }
            }
            panelIdx++;
            $e(containerSelector).append(listItem);
        }
        if (options.panelFunction) {
            $e('#' + options.container + ' .list-group-item').on('click', function () {
                let $panel = $e(this);
                let originalColor = $panel.css('background-color');
                $panel.css('background-color', options.clickColor);
                $panel.animate({ backgroundColor: originalColor }, 'slow');
                options.panelFunction($e(this).prop('dataset'), this);
            });
        } else {
            $e('#' + options.container + ' .list-group-item').on('click', function () {
                let index = $e(this).data('regionIndex');
                let taskSearch = encodeURIComponent($e(this).data('taskSearch'));
                let itemId = $e(this).data('itemId');
                let columnTypeAlias = $e(this).data('columnTypeAlias');
                let searchText = $e(this).data('searchText');
                let itemurl = $e(this).data('itemurl');
                let groupColumn = $e(this).data('groupColumn');
                if (options.taskSearch != 'false') {
                    window.open('./taskHome.action?metaData.siteID=' + options.siteID
                        + '&searchText="' + taskSearch + '"', '_' + options.linkTab).focus();
                } else if (columnTypeAlias == 'SHEET_COLUMN_TYPE_HYPERLINK') {
                    if (itemurl != '') {
                        window.open(itemurl, '_' + options.linkTab).focus();
                    } else {
                        return;
                    }
                } else if (options.isChoropleth != 'false') {
                    if (options.showTable == 'false') {
                        let iDColumn = rawXmlData.view.head.headColumn[options.nameColumn];
                        let advancedSearchColumn = 'filterValue_' + iDColumn.columnid + '_';
                        advancedSearchColumn += iDColumn.columnTypeAlias == 'SHEET_COLUMN_TYPE_CHOICE' ? '3' : '1';
                        let res = options.viewLink.replace('sheetViewExportXML', 'sheetHome');
                        if (options.panelLinks == 'default') {
                            res = res.replace(/metaData.sheetViewID=\d*/i, '');
                        }
                        let link = res.replace('&metaData.isheetExportType=xml', '');
                        if (iDColumn.columnTypeAlias == 'SHEET_COLUMN_TYPE_CHOICE') {
                            link += '&advanceSearch=true' + '&' + advancedSearchColumn + '=' + encodeURIComponent(searchText);
                        } else {
                            link += '&advanceSearch=true' + '&' + advancedSearchColumn + '="' + encodeURIComponent(searchText) + '"';
                        }
                        window.open(link, '_' + options.linkTab).focus();
                    } else {
                        let removeItems = false;
                        if (selectedQuickViewItems.has(index)) {
                            $e(this).removeClass('list-item-on');
                            $e(this).addClass('list-item-off');
                            selectedQuickViewItems.delete(index);
                            if (options.panelLinks != 'table') {
                                removeItems = true;
                            }
                        } else {
                            if (options.panelLinks == 'table' || options.panelLinks == 'tableAll') {
                                $e('#' + options.container + ' .list-item-on').addClass('list-item-off').removeClass('list-item-on');
                                selectedQuickViewItems.clear();
                            }
                            $e(this).removeClass('list-item-off');
                            $e(this).addClass('list-item-on');
                            selectedQuickViewItems.set(index, index);
                        }
                        let selectedRows = [];
                        let priorSelection = [];
                        if (tableOptions.selectedRows && tableOptions.selectedRows.length > 0) {
                            priorSelection = tableOptions.selectedRows.split(',');
                        } else if (options.panelLinks == 'filter') {
                            for (let i = 0; i < rawXmlData.view.recordCount; i++) {
                                priorSelection.push(i.toString());
                            }
                        }
                        rawXmlData.view.data.item.forEach(function (region, i) {
                            let matchData = getValue(options.nameColumn, region);
                            if (typeof matchData == 'object') {
                                for (const element of matchData) {
                                    if (searchText == element) {
                                        if (options.groupColumn != 'false') {
                                            if (groupColumn == region.column[options.groupColumn].displayData.cdata) {
                                                selectedRows.push(i.toString());
                                            }
                                        } else {
                                            selectedRows.push(i.toString());
                                        }
                                    }
                                }
                            }
                            else if (searchText == matchData) {
                                if (options.groupColumn != 'false') {
                                    if (groupColumn == region.column[options.groupColumn].displayData.cdata) {
                                        selectedRows.push(i.toString());
                                    }
                                } else {
                                    selectedRows.push(i.toString());
                                }
                            }
                        });
                        if (removeItems) {
                            let newArr = [];
                            priorSelection.forEach(function (v) {
                                if (!selectedRows.includes(v)) {
                                    newArr.push(v);
                                }
                            });
                            tableOptions.selectedRows = newArr.toString();
                        } else if (options.panelLinks == 'table' || options.panelLinks == 'tableAll') {
                            tableOptions.selectedRows = selectedRows.join();
                        } else {
                            tableOptions.selectedRows = priorSelection.concat(selectedRows).join();
                        }
                    }
                    if (selectedQuickViewItems.size === 0 && options.panelLinks != 'tableAll') {
                        $e('#' + tableOptions.tableElement).hide();
                        $e('#' + options.container + '-tableColumnFilters').hide();
                        $e('#quickViewScroll').hide();
                    } else {
                        renderEngineerTable();
                        $e('#' + tableOptions.tableElement).show();
                        $e('#' + options.container + '-tableColumnFilters').show();
                    }
                } else if (options.panelLinks == 'print') {
                    let res = options.viewLink.replace('sheetViewExportXML', 'sheetPrintItem');
                    let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + itemId + '&view=readonly&injectSheetLinkView=true&isPrintPreview=true');
                    window.open(link, '_blank').focus();
                } else if (options.panelLinks == 'isheet') {
                    let res = options.viewLink.replace('sheetViewExportXML', 'sheetHome');
                    let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + itemId);
                    window.open(link, '_' + options.linkTab).focus();
                } else if (options.panelLinks == 'search') {
                    let iDColumn = rawXmlData.view.head.headColumn[options.nameColumn];
                    let advancedSearchColumn = 'filterValue_' + iDColumn.columnid + '_';
                    advancedSearchColumn += iDColumn.columnTypeAlias == 'SHEET_COLUMN_TYPE_CHOICE' ? '3' : '1';
                    let res = options.viewLink.replace('sheetViewExportXML', 'sheetHome');
                    let link = res.replace('&metaData.isheetExportType=xml', '');
                    if (iDColumn.columnTypeAlias == 'SHEET_COLUMN_TYPE_CHOICE') {
                        link += '&advanceSearch=true' + '&' + advancedSearchColumn + '=' + searchText;
                    } else {
                        link += '&advanceSearch=true' + '&' + advancedSearchColumn + '="' + searchText + '"';
                    }
                    window.open(link, '_' + options.linkTab).focus();
                } else if (options.panelLinks == 'default') {
                    let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetHome');
                    res = res.replace(/metaData.sheetViewID=\d*/i, '');
                    let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + itemId);
                    window.open(link, '_' + options.linkTab).focus();
                } else if (options.panelLinks == 'viewItem') {
                    const itemBtn = document.createElement('A');
                    itemBtn.className = 'CKContextLink hidden';
                    itemBtn.textContent = 'LINK';
                    itemBtn.setAttribute('id', '{"linkType":"iSheetItem","siteID":"' + options.siteID + '","contextID":"' + options.sheetID + '","sheetItemID":"' + itemId + '","sheetViewID":"0","viewMode":"0","linkedFromCKEditor":false}');
                    let tableBtnLink = buildISheetUrl('injectColumnViewItemPage', itemId, true, {
                        'metaData.viewMode': '0',
                        'view': 'readonly',
                        'sheetItemLinkView': 'false',
                    });
                    itemBtn.setAttribute('href', tableBtnLink);
                    $e('#' + options.container).append(itemBtn);
                    rebindCKContentLink();
                    itemBtn.click();
                    itemBtn.remove();
                } else if (options.panelLinks == 'join') {
                    if (selectedQuickViewItems.has(index)) {
                        $e(this).removeClass('list-item-on');
                        $e(this).addClass('list-item-off');
                        selectedQuickViewItems.delete(index);
                    } else {
                        $e('#' + options.container + ' .list-item-on').addClass('list-item-off').removeClass('list-item-on');
                        selectedQuickViewItems.clear();
                        $e(this).removeClass('list-item-off');
                        $e(this).addClass('list-item-on');
                        selectedQuickViewItems.set(index, index);
                    }
                    tableOptions.filterTerm = searchText;
                    tableOptions.filterColumn = options.joinColumn;
                    renderEngineerTable();
                    $e('#' + tableOptions.tableElement).show();
                    $e('#' + options.container + '-tableColumnFilters').show();
                } else if (options.panelLinks == 'table') {
                    let $panel = $e(this);
                    if (selectedQuickViewItems.has(index)) {
                        if (options.clickFade == 'false') {
                            $panel.removeClass('list-item-on');
                            $panel.addClass('list-item-off');
                        }
                        selectedQuickViewItems.delete(index);
                    } else {
                        $e('#' + options.container + ' .list-item-on').addClass('list-item-off').removeClass('list-item-on');
                        selectedQuickViewItems.clear();
                        if (options.clickFade == 'false') {
                            $panel.removeClass('list-item-off');
                            $panel.addClass('list-item-on');
                        } else {
                            let originalColor = $panel.css('background-color');
                            $panel.css('background-color', options.clickColor);
                            $panel.animate({ backgroundColor: originalColor }, 'slow');
                        }
                        selectedQuickViewItems.set(index, index);
                    }
                    let selectedRows = [];
                    for (let row of selectedQuickViewItems.keys()) {
                        selectedRows.push(row);
                    }
                    tableOptions.selectedRows = selectedRows.toString();
                    if (tableOptions.selectedRows.length === 0) {
                        $e('#' + tableOptions.tableElement).hide();
                        $e('#' + options.container + '-tableColumnFilters').hide();
                        $e('#quickViewScroll').hide();
                    } else {
                        renderEngineerTable();
                        $e('#' + tableOptions.tableElement).show();
                        $e('#' + options.container + '-tableColumnFilters').show();
                    }
                } else if (options.showTable == 'true') {
                    if (selectedQuickViewItems.has(index)) {
                        $e(this).removeClass('list-item-on');
                        $e(this).addClass('list-item-off');
                        selectedQuickViewItems.delete(index);
                    } else {
                        $e(this).removeClass('list-item-off');
                        $e(this).addClass('list-item-on');
                        selectedQuickViewItems.set(index, index);
                    }
                    let selectedRows = [];
                    for (let row of selectedQuickViewItems.keys()) {
                        selectedRows.push(row);
                    }
                    tableOptions.selectedRows = selectedRows.toString();
                    if (tableOptions.selectedRows.length === 0) {
                        $e('#' + tableOptions.tableElement).hide();
                        $e('#' + options.container + '-tableColumnFilters').hide();
                        $e('#quickViewScroll').hide();
                    } else {
                        renderEngineerTable();
                        $e('#' + tableOptions.tableElement).show();
                        $e('#' + options.container + '-tableColumnFilters').show();
                    }
                } else {
                    return;
                }
            });
            if (selectedQuickViewItems.size === 0 && options.panelLinks != 'tableAll') {
                $e('#' + tableOptions.tableElement).hide();
                $e('#' + options.container + '-tableColumnFilters').hide();
                $e('#quickViewScroll').hide();
            } else {
                renderEngineerTable();
                $e('#' + tableOptions.tableElement).show();
                $e('#' + options.container + '-tableColumnFilters').show();
            }
        }
        if (options.countChoicesLegend != 'false') {
            $e(listHeader).find('.legendPanel').remove();
            $legendContainer = $e('<div class="legendPanel"/>')
                .css('text-align', 'right')
                .prepend($e('<span class="legendTitle" style="font-weight:600">Legend: </span>'));
            $e(listHeader).append($legendContainer);
            legend.forEach(buildLegendItem);
        }
        $e(listBody).slideDown();
        options.onRender(options.container);
    }

    function buildLegendItem(value, key) {
        let classId = engineercore_safeCSS(key);
        let $legendElement = $e('<span>')
            .addClass('list-legend-item ' + classId);
        let $colorBlock = $e('<span>')
            .addClass('legendcolor')
            .text(' █ ')
            .css('color', value);
        let $textBlock = $e('<span>')
            .addClass('legendText')
            .text(key);
        $legendElement.append($colorBlock);
        $legendElement.append($textBlock);
        $legendContainer.append($legendElement);
    }

    /**
     * Call EngineerTable library with configured filters
     */
    function renderEngineerTable() {
        if (options.showTable == 'true') {
            if (options.iSheetViewLink == options.quickViewLink) {
                if (tableOptions.selectedColumns === null) {
                    let columns = [];
                    for (let col = 0; col < rawXmlData.view.head.headColumn.length; col++) {
                        columns.push(col);
                    }
                    tableOptions.selectedColumns = columns.toString();
                }
                buildTable(rawXmlData, tableOptions);
                buildFilterButton(options.container + '-quickViewFilter', rawXmlData);
                buildScrollButton('quickViewScroll');
            } else if (!tableData) {
                loadDoc(options.iSheetViewLink, function (xmlDoc) {
                    tableData = xmlToObj(xmlDoc);
                    if (tableOptions.selectedColumns === null) {
                        let columns = [];
                        for (let col = 0; col < tableData.view.head.headColumn.length; col++) {
                            columns.push(col);
                        }
                        tableOptions.selectedColumns = columns.toString();
                    }
                    buildTable(tableData, tableOptions);
                    buildFilterButton(options.container + '-quickViewFilter', tableData);
                    buildScrollButton('quickViewScroll');
                });
            } else {
                buildTable(tableData, tableOptions);
                buildFilterButton(options.container + '-quickViewFilter', tableData);
                buildScrollButton('quickViewScroll');
            }

        }
    }

    /**
     * Creates filter options based in complete data
     */
    function buildFilterButton(buttonId, xmlObj) {
        if (options.showTableFilters == 'false') {
            return;
        }
        let filterColumns = new Map();
        let filterColumnsSections = new Map();
        let filterColumnsCounter = 1;
        let buttonContainer = document.createElement('div');
        let button = document.createElement('button');
        let caret = document.createElement('span');
        let collapseContainer = document.createElement('div');
        let panelContainer = document.createElement('div');
        let checkboxContainer = document.createElement('div');
        let checkboxCount = 0;
        let topLinks = document.createElement('div');
        let selectAllLink = document.createElement('a');
        let clearAllLink = document.createElement('a');
        buttonContainer.id = options.container + '-tableColumnFilters';
        filterColumnsSections.set(filterColumnsCounter, options.filterDefaultText);
        // Identify columns that are headers for the filters columns (SHEET_COLUMN_TYPE_SCORE)
        if (xmlObj.view.head?.headColumn) {
            let currentSectionColumn = 0;
            for (let i = 0; i < xmlObj.view.head.headColumn.length; i++) {
                let columnType = xmlObj.view.head.headColumn[i].columnTypeAlias;
                if (columnType === 'SHEET_COLUMN_TYPE_SCORE' && options.scoreSections == 'true') {
                    currentSectionColumn = i;
                    filterColumnsCounter++;
                    filterColumnsSections.set(filterColumnsCounter, xmlObj.view.head.headColumn[i].columnValue.cdata);
                } else {
                    let columnFilterObject = {
                        columnName: xmlObj.view.head.headColumn[i].columnValue.cdata,
                        columnIndex: i,
                        columnId: xmlObj.view.head.headColumn[i].columnid,
                        sectionIndex: currentSectionColumn
                    };
                    if (filterColumns.has(filterColumnsCounter)) {
                        filterColumns.get(filterColumnsCounter).push(columnFilterObject);
                    } else {
                        filterColumns.set(filterColumnsCounter, [columnFilterObject]);
                    }
                }
            }
        }
        caret.className = 'caret';
        button.textContent = options.filterText;
        button.append(caret);
        button.id = buttonId;
        button.className = 'btn btn-danger';
        button.setAttribute('type', 'button');
        button.setAttribute('aria-controls', 'collapseFilters');
        button.setAttribute('aria-expanded', 'false');
        button.dataset.toggle = 'collapse';
        button.dataset.target = '#' + buttonId + 'Collapse';
        $e(button).css('margin-top', '1em');
        if (options.showTableFilters != 'collapse') {
            $e(button).css('display', 'none');
        }
        collapseContainer.id = buttonId + 'Collapse';
        if (options.showTableFilters == 'collapse') {
            collapseContainer.className = 'collapse';
        }
        panelContainer.className = 'panel';
        checkboxContainer.id = buttonId + 'Checkboxes';
        checkboxContainer.className = 'panel-body row';
        // Create search box to reduce shown checkboxes filters
        const searchContainer = document.createElement('div');
        const typeAheadInput = document.createElement('input');
        const checkboxSelector = '#' + listBody.id + ' .filter-checkbox';
        let searchHandler;
        if (options.filtersSearchEnabled != 'false') {
            typeAheadInput.placeholder = 'Filter';
            typeAheadInput.className = 'form-control';
            typeAheadInput.style = 'width: 30%';
            $e(typeAheadInput).keyup(function () {
                const term = $e(this).val();
                if (searchHandler) {
                    clearTimeout(searchHandler);
                }
                if (term.length > 0) {
                    searchHandler = setTimeout(function () {
                        const items = $e(checkboxSelector + ':icontains(' + term + ')');
                        $e(checkboxSelector).hide();
                        items.each(function () {
                            $e(this).show();
                        });
                    }, options.searchDelay);
                } else {
                    $e(checkboxSelector).show();
                }
            });
            searchContainer.append(typeAheadInput);
            checkboxContainer.append(searchContainer);
        }
        // Add select all and select none links
        selectAllLink.id = 'selectAllFiltersLink';
        selectAllLink.href = 'javascript:void(0);';
        selectAllLink.textContent = 'Select all';
        $e(selectAllLink).css('padding-right', '4px');
        clearAllLink.id = 'clearAllFiltersLink';
        clearAllLink.href = 'javascript:void(0);';
        clearAllLink.textContent = 'Clear all';
        $e(clearAllLink).css('padding-left', '4px');
        $e(clearAllLink).css('border-left', '2px solid #f0f0f0');
        topLinks.append(selectAllLink);
        topLinks.append(clearAllLink);
        checkboxContainer.append(topLinks);
        for (let filterColumn of filterColumnsSections.entries()) {
            let filterSection = document.createElement('div');
            let filterLabel = document.createElement('strong');
            filterSection.id = buttonId + 'Section' + filterColumn[0];
            if (options.singleColumn != 'true') {
                filterSection.className = 'col-md-4 col-sm-6';
            }
            filterSection.append(filterLabel);
            filterLabel.textContent = filterColumn[1];
            $e(filterLabel).addClass('group-label');
            checkboxContainer.append(filterSection);
            if (options.groupFilters == 'true') {
                let input = document.createElement('input');
                input.id = 'groupCheckbox' + filterColumn[0];
                input.className = 'group-filter-checkbox';
                input.type = 'checkbox';
                input.checked = true;
                $e(input).css('margin-right', '4px');
                $e(input).css('display', 'inline-block');
                $e(filterSection).prepend(input);
                $e(input).change(function () {
                    if (this.checked) {
                        $e(this).parent().find('input.form-check-input.table-column-filter-checkbox').prop('checked', true);
                        renderTable(xmlObj, tableOptions);
                    } else {
                        $e(this).parent().find('input.form-check-input.table-column-filter-checkbox').each(function () {
                            if ($e(this).data('columnIndex') != options.nameColumn) {
                                $e(this).prop('checked', false);
                            }
                        });
                        renderTable(xmlObj, tableOptions);
                    }
                });
            }
        }
        buttonContainer.className = 'dropdown';
        buttonContainer.append(button);
        panelContainer.append(checkboxContainer);
        collapseContainer.append(panelContainer);
        buttonContainer.append(collapseContainer);
        $e('#' + options.container + '-tableColumnFilters').remove();
        $e(listBody).append(buttonContainer);
        // Add filters for each column
        let emptyColumns = filterSelectedColumns.size === 0;
        for (let filterColumn of filterColumns.entries()) {
            for (let item of filterColumn[1]) {
                checkboxCount++;
                let checkbox = document.createElement('div');
                let input = document.createElement('input');
                let label = document.createElement('label');
                checkbox.className = 'form-check filter-checkbox';
                input.id = 'filterCheckbox' + checkboxCount;
                input.className = 'form-check-input table-column-filter-checkbox';
                input.type = 'checkbox';
                input.dataset.columnIndex = item.columnIndex;
                input.dataset.sectionIndex = item.sectionIndex;
                if (emptyColumns) {
                    filterSelectedColumns.set(item.columnIndex, item.columnIndex);
                }
                input.checked = filterSelectedColumns.has(item.columnIndex);
                if (item.columnIndex == options.nameColumn) {
                    input.disabled = true;
                }
                label.textContent = item.columnName;
                label.className = 'form-check-label';
                label.setAttribute('for', 'filterCheckbox' + checkboxCount);
                checkbox.append(input);
                checkbox.append(label);
                $e('#' + buttonId + 'Section' + filterColumn[0]).append(checkbox);
                $e('#filterCheckbox' + checkboxCount).change(function () {
                    renderTable(xmlObj, tableOptions);
                });
                if (options.groupFilters == 'true') {
                    $e(checkbox).css('display', 'none');
                }
            }
        }
        if (options.groupFilters == 'false') {
            $e('#selectAllFiltersLink').on('click', function () {
                $e('.table-column-filter-checkbox').prop('checked', true);
                renderTable(xmlObj, tableOptions);
            });
            $e('#clearAllFiltersLink').on('click', function () {
                $e('.table-column-filter-checkbox').each(function () {
                    if ($e(this).data('columnIndex') != options.nameColumn) {
                        $e(this).prop('checked', false);
                    }
                });
                renderTable(xmlObj, tableOptions);
            });
        } else {
            $e('#selectAllFiltersLink').on('click', function () {
                $e('.group-filter-checkbox').prop('checked', true);
                $e('.table-column-filter-checkbox').prop('checked', true);
                renderTable(xmlObj, tableOptions);
            });
            $e('#clearAllFiltersLink').on('click', function () {
                $e('.group-filter-checkbox').prop('checked', false);
                $e('.table-column-filter-checkbox').each(function () {
                    if ($e(this).data('columnIndex') != options.nameColumn) {
                        $e(this).prop('checked', false);
                    }
                });
                renderTable(xmlObj, tableOptions);
            });
        }
        $e('.dropdown-toggle').dropdown();
        if (options.filtersSearchEnabled != 'false') {
            // Focus sarch input when collapsing down
            $e('#' + buttonContainer.id).on('shown.bs.collapse', function () {
                $e(typeAheadInput).focus();
            });
            // Remove search term when collapsing up
            $e('#' + buttonContainer.id).on('hide.bs.collapse', function () {
                $e(checkboxSelector).show();
                $e(typeAheadInput).val('');
            });
            // Avoid scrollbars when spellchecker container is injected by HighQ
            $e('.ms-editor-squiggles-container').css('display', 'list-item');
            $e('.ms-editor-squiggles-container').css('max-width', '90%');
        }
    }

    function renderTable(xmlObj, tableOptions) {
        filterSelectedColumns = new Map();
        $e('.table-column-filter-checkbox').each(function () {
            if (this.checked) {
                filterSelectedColumns.set($e(this).data('columnIndex'), $e(this).data('columnIndex'));
                filterSelectedColumns.set($e(this).data('sectionIndex'), $e(this).data('sectionIndex'));
            }
        });
        tableOptions.selectedColumns = Array.from(filterSelectedColumns.values()).toString();
        buildTable(xmlObj, tableOptions);
    }

    /**
     * Creates button to scroll to the bottom of the page
     */
    function buildScrollButton(buttonId) {
        if (options.showScrollButton == 'true') {
            let button = document.createElement('button');
            let icon = document.createElement('span');
            let text = document.createElement('span');
            button.id = buttonId;
            button.className = 'btn btn-danger';
            $e(button).css('position', 'fixed');
            $e(button).css('bottom', options.scrollButtonBottom);
            $e(button).css('right', options.scrollButtonRight);
            $e(button).click(function () {
                document.getElementById(tableOptions.tableElement).scrollIntoView();
            });
            icon.className = 'icon icon-arrow-down';
            $e(icon).css('font-size', '14px');
            $e(icon).css({ 'color': 'white', 'margin-right': '3px' });
            text.textContent = options.scrollButtonText;
            button.append(icon);
            button.append(text);
            $e('#' + buttonId).remove();
            $e('body').append(button);
            checkEngineerTableIsVisible();
        }
    }

    function isValidURL(url) {
        const regex = /([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;
        return regex.test(url);
    }

    /**
     * Queries a choice column style with back-compatiblity between engineerCore versions
     * 
     * @param object rawData
     * @returns string
     */
    function getChoiceTypeColumnStyle(rawData, choice) {
        let style = '#000';
        let title;
        if (rawData.choice) {
            if (rawData.choice[0]) {
                if (choice) {
                    rawData.choice.forEach(function (c) {
                        if (c.cdata == choice) {
                            style = c.style.substr(-7);
                            title = c.cdata;
                        }
                    });
                } else {
                    style = rawData.choice[0].style.substr(-7);
                    title = rawData.choice[0].cdata;
                }
            } else {
                style = rawData.choice.style.substr(-7);
                title = rawData.choice.cdata;
            }
        } else {
            style = options.choiceEmptyColor;
            title = options.choiceEmptyText;
        }
        if (options.countChoicesLegend != 'false') {
            if (!legend.has(title)) {
                legend.set(title, style);
            }
        }
        return style;
    }

    /**
     * Returns the value of an iSheet cell
     * 
     * @param string column
     * @param object row
     * @param boolean raw
     * @returns string
     */
    function getValue(column, row, raw) {
        let dataType = raw ? 'rawData' : 'displayData';
        let columnTypeAlias = rawXmlData.view.head.headColumn[column].columnTypeAlias;
        let columnValue;
        switch (columnTypeAlias) {
            case 'SHEET_COLUMN_TYPE_CHOICE': {
                if (row.column[column].rawData.choice) {
                    if (row.column[column].rawData.choice[0]) {
                        columnValue = [];
                        row.column[column].rawData.choice.forEach(choice => {
                            columnValue.push(choice.cdata);
                        });
                    } else {
                        columnValue = row.column[column].rawData.choice.cdata;
                    }
                } else {
                    columnValue = options.choiceEmptyText;
                }
                break;
            }
            case 'SHEET_COLUMN_TYPE_LOOKUP': {
                if (row.column[column].displayData.lookupuser) {
                    if (dataType == 'displayData') {
                        if (row.column[column].displayData.lookupuser[0] && dataType == 'displayData') {
                            columnValue = [];
                            row.column[column].displayData.lookupuser.forEach(user => {
                                columnValue.push(user.userDisplayName.cdata);
                            });
                        } else {
                            columnValue = row.column[column].displayData.lookupuser.userDisplayName.cdata;
                        }
                    } else if (dataType == 'rawData') {
                        if (row.column[column].rawData.lookup[0]) {
                            columnValue = [];
                            row.column[column].rawData.lookup.forEach(user => {
                                columnValue.push(user.cdata);
                            });
                        } else {
                            columnValue = row.column[column].rawData.lookup.cdata;
                        }
                    }
                } else {
                    columnValue = options.lookupEmptyText;
                }
                break;
            }
            default:
                columnValue = row.column[column][dataType].cdata;
                break;
        }
        return columnValue;
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

// eslint-disable-next-line no-unused-vars
function EngineerList(customOptions) {
    engineerList(customOptions);
}

if (!window.engineerLegalPlugins) {
    window.engineerLegalPlugins = {};
}
if (!window.engineerLegalPlugins.list) {
    window.engineerLegalPlugins.list = { status: 1, version: engineerListVersion };
} else if (!window.engineerLegalPlugins.list.version) {
    window.engineerLegalPlugins.list.version = engineerListVersion;
}
