/**
 * @author Josh Glendenning
 */

define([
    "promise"
], function(promise) {
    var Soundcloud = function() {
        var client_id = '36f63884631b726469b7c1158014de16';
        this.client_id = client_id;

        this.resolve = function(url) {
            return promise.get(
                "http://api.soundcloud.com/resolve.json",
                {
                    url: url,
                    client_id: client_id
                }
            );
        };

        this.track = function(id) {
            return promise.get(
                "http://api.soundcloud.com/tracks/"+id+".json",
                {
                    client_id: client_id
                }
            );
        }
    };
    return new Soundcloud();
});
