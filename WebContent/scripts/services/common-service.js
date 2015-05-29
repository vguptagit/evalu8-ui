'use strict';

angular.module('evalu8Demo')

.service('CommonService', ['EnumService',function (EnumService) {
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
        if (searchItem != null && searchItem.nodeType === EnumService.CONTENT_TYPE.archiveRoot) {
            return null;
        }
        return searchItem;
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
        if (searchItem != null && searchItem.nodeType === EnumService.CONTENT_TYPE.archiveRoot) {
            return null;
        }
        return searchItem;
    }

    return commonService;
}]);