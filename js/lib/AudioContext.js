/**
 * @author Josh Glendenning
 */

define([], function() {
    var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
    return new AudioContext();
});
