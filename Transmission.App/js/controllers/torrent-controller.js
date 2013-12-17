﻿mainApp.controller('TorrentController', function ($scope, $rootScope, $location, torrentService, statusService) {
    WinJS.Namespace.define('TorrentList', { torrents: new WinJS.Binding.List() });

    $scope.selection = [];
    $scope.$watch('selection', function (selection) {
        $rootScope.selectedTorrentIds = _.pluck(_.pluck(selection._value, 'data'), 'id');
    });

    $scope.search = { filter: '' };
    var filter = 'all';

    var clearList = function () {
        TorrentList.torrents.splice(0, TorrentList.torrents.length);
    };

    var processTorrentData = $scope.processTorrentData = function () {
        var newTorrents = torrentService.getTorrents();
        
        var filtered = newTorrents
            .filter(function (torrent) {
                switch (filter) {
                    case 'downloading':
                        return statusService.downloading(torrent);
                    case 'active':
                        return statusService.active(torrent);
                    case 'inactive':
                        return statusService.inactive(torrent);
                    case 'stopped':
                        return statusService.stopped(torrent);
                    case 'error':
                        return statusService.error(torrent);
                    default:
                        return true;
                }
            });
        
        if ($scope.search.filter !== '') {
            filtered = filtered.filter(function (torrent) {
                return torrent.name.toLowerCase().match($scope.search.filter.toLowerCase());
            });
        }

        filtered.forEach(function (newTorrent) {
                var same = TorrentList.torrents.filter(function (oldTorrent) {
                    return oldTorrent.id === newTorrent.id;
                });
                if (same.length > 0) {
                    _.extend(same[0], newTorrent);
                }
                else {
                    TorrentList.torrents.push(WinJS.Binding.as(newTorrent));
                }
            });

        var toRemove = _.differenceObjectsById(TorrentList.torrents, filtered);

        toRemove.forEach(function (rm) {
            TorrentList.torrents.forEach(function (torrent, idx) {
                if (torrent.id === rm.id) {
                    TorrentList.torrents.splice(idx, 1);
                }
            });
        });
    };

    var addTorrent = function (file) {
        Windows.Storage.FileIO.readBufferAsync(file).done(function (buffer) {
            var bytes = new Uint8Array(buffer.length);
            var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
            dataReader.readBytes(bytes);
            dataReader.close();

            torrentService.add(bytes);
        });
    };

    $scope.$on('torrents:updated', processTorrentData);
    $scope.$on('torrents:add', function (event, files) {
        files.forEach(addTorrent);
    });

    $rootScope.$on('$locationChangeSuccess', function (event) {
        filter = $location.url().match(/\/(\w+)$/)[1];
        clearList();
        processTorrentData();
    });
});