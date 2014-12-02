/**
 * @author Josh Glendenning
 */

define([
    "audiocontext",
    "./WaveGlimpse",
    "./BeatNode"
], function(
    AudioContext,
    WaveGlimpse,
    BeatNode
) {

    var Main = function($element, $scope) {

        function showError(e) {
            $('#error-msg').text('Whoops! Something went wrong.');
            $('#error').show();
            console.error(e);
        }

        var audio = $element.find('audio').get(0);
        var source = AudioContext.createMediaElementSource(audio);

        var analyser = AudioContext.createAnalyser();
        analyser.fftSize = 2048;
        var freqData = new Uint8Array(analyser.frequencyBinCount);
        function getFreqData() {
            analyser.getByteFrequencyData(freqData);
            return freqData;
        }
        source.connect(analyser);

        var beatAnalyser = new BeatNode(getFreqData, function() {
            setTimeout(function() { waveView.material.uniforms['beat'].value = 1.0; }, 0);
        });
        analyser.connect(beatAnalyser.input);
        //analyser.connect(AudioContext.destination);

        var delay = AudioContext.createDelay(50);
        analyser.connect(delay);
        delay.connect(AudioContext.destination);

        $scope.trackID = "174894259";
        $scope.load = function() {
            audio.src = "https://api.soundcloud.com/tracks/"+$scope.trackID+"/stream"
                + '?client_id=YOUR_CLIENT_ID';
            audio.play();
        };

        var waveGlimpse = new WaveGlimpse(getFreqData);
        var waveView = waveGlimpse.createView($element.find('#wave').get(0));

        function resize() {
            var padding = 10;
            var w = window.innerWidth - padding;
            var h = window.innerHeight - padding;
            waveView.resize(w, h);
        }
        window.addEventListener('resize', resize, false);
        resize();
    };

    return Main;
});
