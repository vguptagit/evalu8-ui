'use strict';

angular.module('evalu8Demo')

.service('CommonService', ['EnumService',function (EnumService) {
    var commonService = {};
    //search folder by giving guid or parentid;
    commonService.SearchFolder = function (folders, id) {
        var searchItem = null;
        $.each(folders, function (i, v) {
            if (v.guid == id) {
                //console.log('found', v);
                searchItem = v;
                return false;
            }
            if (v.nodes) {
                commonService.SearchFolder(v.nodes);
            }
        });
        if (searchItem != null && searchItem.nodeType === EnumService.CONTENT_TYPE.archiveRoot) {
            return null;
        }
        return searchItem;
    }

    return commonService;
}]);