/**
 * @author Josh Glendenning
 */

define([
    "lib/AudioContext"
], function(
    AudioContext
) {
    var BeatNode = function(getFreqData, onBeat){
        var self = this;

        console.log("Setting up beat nodes");
        // Set up audio nodes
        console.log(AudioContext);
        self.input = AudioContext.createGain();
        var scriptProcessor = AudioContext.createScriptProcessor(4096, 1, 1);


        // Beat detection parameters
        self.BEAT_DECAY_RATE = 0.995;
        self.BEAT_RANGE_LOW = 0.2;
        self.BEAT_RANGE_HIGH = 0.7;
        self.BEAT_MIN = 0.49;

        self.onBeat = onBeat || function() {};

        // Beat detection state vars
        var beatCutOff = 0;
        var freqData = getFreqData();
        var binCount = freqData.length;
        var low_i = Math.round(self.BEAT_RANGE_LOW * binCount);
        var high_i = Math.round(self.BEAT_RANGE_HIGH * binCount);

        scriptProcessor.onaudioprocess = function() {

            var freqData = getFreqData();

            // Average
            // -------
            var sum = 0;
            for(var i = low_i; i < high_i; i++) {
                sum += freqData[i];
            }
            var volume = (sum / (high_i - low_i));

            // Beat detection
            // --------------
            if (volume  > beatCutOff && volume > self.BEAT_MIN){
                self.onBeat();
                beatCutOff = volume * 1.1;
            } else {
                beatCutOff *= self.BEAT_DECAY_RATE;
                beatCutOff = Math.max(beatCutOff, self.BEAT_MIN);
            }

        };
        console.log(scriptProcessor);

        // Audio node wiring
        self.input.connect(scriptProcessor);

        var dummyGain = AudioContext.createGain();
        dummyGain.gain.value = 0;
        scriptProcessor.connect(dummyGain);
        dummyGain.connect(AudioContext.destination);

    };

    return BeatNode;
});
