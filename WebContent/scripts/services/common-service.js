'use strict';

angular.module('evalu8Demo')

.service('CommonService', ['EnumService', 'notify', function (EnumService, notify) {
    var commonService = {};

    //search folder by giving guid or parentid;
    commonService.SearchItem = function (items, id) {
        var searchItem = null;
        function recurse(items, id) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].guid == id) {
                    //console.log('found', items[i]);
                    searchItem = items[i];
                    return searchItem;
                }
                if (items[i].nodes) {
                    recurse(items[i].nodes, id);
                }
            }

        }
        recurse(items, id);
        if (searchItem != null && (searchItem.nodeType === EnumService.NODE_TYPE.archiveRoot || searchItem.nodeType === EnumService.NODE_TYPE.emptyFolder)) {
            return null;
        }
        return searchItem;
    }

    /******** ConvertToJson Starts ***********/
    var containerJson = [];
    commonService.ConvertToJson = function convertToJson(itemArray, parentid) {
        containerJson = [];
        if (itemArray) {
            containerJson = getRootItems(itemArray, parentid);
        }
        return containerJson
    }
    function getRootItems(itemArray, parentid) {
        itemArray.forEach(function (item) {
            if (item.parentId === parentid) {
                item.nodes = [];
                containerJson.push(item);
                getChildItems(itemArray, item)
            }
        });
        return containerJson
    }
    function getChildItems(itemArray, parentItem) {
        itemArray.forEach(function (item) {
            if (item.parentId === parentItem.guid) {
                if (!parentItem.nodes) {
                    parentItem.nodes = [];
                }
                parentItem.nodes.push(item);
                getChildItems(itemArray, item);
            }
        });
    }
    /******** ConvertToJson Ends ***********/

    commonService.autoScrollRightFrame = function (rootDiv, e) {
        var leftElmPos = e.pos.nowX - e.pos.offsetX;
        var topElmPos = e.pos.nowY - e.pos.offsetY;

        var treeScrollTop = rootDiv.scrollTop();
        var dragElm = e.elements.dragging;

        var dragBottom = dragElm[0].offsetTop + dragElm[0].offsetHeight;
        var treeBottom = rootDiv[0].offsetTop + rootDiv[0].offsetHeight;

        if (treeScrollTop > 0
    			&& leftElmPos > rootDiv[0].offsetWidth
    			&& ((treeScrollTop > e.pos.nowY) || (rootDiv.offset().top < e.pos.nowY))) {
            if (topElmPos < (rootDiv.offset().top + 60)) {
                rootDiv.scrollTop(treeScrollTop - 15);
            }
        }

        if (leftElmPos > rootDiv[0].offsetWidth
    			&& treeBottom + 120 < dragBottom) {
            rootDiv.scrollTop(treeScrollTop + 15);
        }
    }

    commonService.autoScrollLeftFrame = function (rootDiv, e) {
        var leftElmPos = e.pos.nowX - e.pos.offsetX;
        var topElmPos = e.pos.nowY - e.pos.offsetY;

        var treeScrollTop = rootDiv.scrollTop();
        var dragElm = e.elements.dragging;

        var dragBottom = dragElm[0].offsetTop + dragElm[0].offsetHeight;
        var treeBottom = rootDiv[0].offsetTop + rootDiv[0].offsetHeight;

        if (treeScrollTop > 0
    			&& ((treeScrollTop > e.pos.nowY) || (rootDiv.offset().top < e.pos.nowY))) {
            if (topElmPos < (rootDiv.offset().top + 60)) {
                rootDiv.scrollTop(treeScrollTop - 15);
            }
        }

        if (treeBottom + 20 < dragBottom) {
            rootDiv.scrollTop(treeScrollTop + 15);
        }
    }

    //TODO : need to find the references and replace it with "SearchItem", later remove below function. because function name is not so generic.
    //search folder by giving guid or parentid;
    commonService.SearchFolder = function (items, id) {
        var searchItem = null;
        function recurse(items, id) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].guid == id) {
                    //console.log('found', items[i]);
                    searchItem = items[i];
                    return searchItem;
                }
                if (items[i].nodes) {
                    recurse(items[i].nodes, id);
                }
            }

        }
        recurse(items, id);
        if (searchItem != null && (searchItem.nodeType === EnumService.NODE_TYPE.archiveRoot || searchItem.nodeType === EnumService.NODE_TYPE.emptyFolder)) {
            return null;
        }
        return searchItem;
    }

    commonService.getEmptyFolder = function () {

        return { "nodeType": "empty", "draggable": false, "title": "This folder is empty.", "sequence": 0 };

    }

    commonService.getArchiveRoot = function () {

        return { 'guid': null, 'nodeType': 'archiveRoot', 'draggable': false, 'droppable': false, 'title': 'Archive' };
    }

    commonService.showErrorMessage = function (msg) {

        var messageTemplate = '<p class="alert-danger"><span class="glyphicon glyphicon-alert"></span><span class="warnMessage">' + msg + '</p> ';

        notify({
            messageTemplate: messageTemplate,
            classes: 'alert alert-danger',
            position: 'center',
            duration: '4000'
        });
    };

    return commonService;
}]);