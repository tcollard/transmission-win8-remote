﻿(function () {
    "use strict";

    WinJS.UI.Pages.define("/views/login.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var appName = 'loginApp';

            angular.module(appName, ['Login']);
            angular.bootstrap(element, [appName]);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();