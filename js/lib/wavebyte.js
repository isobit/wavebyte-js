/*
 * An audio spectrum visualizer built with HTML5 Audio API
 * Extended from Wayou's HTML5 Audio Visualizer:
 *		For more infomation or support you can:
 *			view the project page:https://github.com/Wayou/HTML5_Audio_Visualizer/
 *			view online demo:http://wayouliu.duapp.com/mess/audio_visualizer.html
 */

define([], function() {

	var wavebyte = {};

	wavebyte.Analyzer = function(opts) {
		var self = this;

		this.audioContext = null;
		this.source = null; //the audio source
		this.analyser = null;
		this.playing = false; // is the audio playing?

		this.dataLength = 0;

		//fix browser vender for AudioContext and requestAnimationFrame
		window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
		window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
		window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
		try {
			self.audioContext = new AudioContext();
		} catch (e) {
			alert('Your browser does not support AudioContext!');
			console.log(e);
		}

		this.registerFileInput = function(elem) {
			//listen the file upload
			elem.onchange = function() {
				if (self.audioContext===null) {return;};

				if (elem.files.length !== 0) {
					//only process the first file
					self.loadFile(elem.files[0]);
				};
			};
		};

		this.loadFile = function(file) {
			if (self.playing) { self.stop(); }

			var fr = new FileReader();
			fr.onload = function(e) {
				var fileResult = e.target.result;
				var audioContext = self.audioContext;
				if (audioContext === null) {
					return;
				};
				console.log('Decoding audio...');
				audioContext.decodeAudioData(fileResult, function(buffer) {
					var audioBufferSourceNode = self.audioContext.createBufferSource();
					audioBufferSourceNode.buffer = buffer;
					self.source = audioBufferSourceNode;
					console.log('Decode succussful');
				}, function(e) {
					console.log(e);
				});
			};
			fr.onerror = function(e) {
				alert('Failed to read the file ' + file.name + '!');
				console.log(e);
				self.stop();
			};
			console.log('Reading file...');
			fr.readAsArrayBuffer(file);
		};

		this.start = function() {
			if (self.playing) { self.stop(); }
			if (self.source == null) {
				alert('No source loaded!');
				self.stop();
				return;
			}

			self.analyser = self.audioContext.createAnalyser();
			//connect the source to the analyser
			self.source.connect(self.analyser);

			if (opts.delay != null) {
				var delay = self.audioContext.createDelay(opts.delay);
				self.analyser.connect(delay);
				delay.connect(self.audioContext.destination);
			} else {
				//connect the analyser to the destination(the speaker), or we won't hear the sound
				self.analyser.connect(self.audioContext.destination);
			}

			self.dataLength = self.analyser.frequencyBinCount;
			self._initData();

			//play the source
			if (!self.source.start) {
				self.source.start = self.source.noteOn //in old browsers use noteOn method
				self.source.stop = self.source.noteOff //in old browsers use noteOn method
			};

			self.source.start(0);

			self.playing = true;

			self.source.onended = function() {
				self.stop();
			};
			console.log('Playing');
		};

		this.stop = function() {
			console.log('Stopping');
			self.playing = false;
			//stop the previous sound if any
			if (self.source !== null) {
				self.source.stop(0);
			}
			//@TODO remove this
			document.getElementById('startButton').disabled = true;
		};

		if (opts.useFloats) {
			self._initData = function() {
				self._freqDataArray = new Float32Array(self.dataLength);
				self._timeDataArray = new Float32Array(self.dataLength);
			}

			self.freqData = function() {
				if (!self.playing) { return; }
				self.analyser.getFloatFrequencyData(self._freqDataArray);
				return self._freqDataArray;
			};
			self.timeData = function() {
				if (!self.playing) { return; }
				self.analyser.getFloatTimeDomainData(self._timeDataArray);
				return self._timeDataArray;
			};

		} else {
			self._initData = function() {
				self._freqDataArray = new Uint8Array(self.dataLength);
				self._timeDataArray = new Uint8Array(self.dataLength);
			}
			self.freqData = function() {
				if (!self.playing) { return; }
				self.analyser.getByteFrequencyData(self._freqDataArray);
				return self._freqDataArray;
			};
			self.timeData = function() {
				if (!self.playing) { return; }
				self.analyser.getByteTimeDomainData(self._timeDataArray);
				return self._timeDataArray;
			};
		}


		if (opts.bpmEnabled) {
			console.log("Enabling BPM history");

			//self.volumeHistory = new Array(100);
			//self.cutoffHistory = new Array(100);
			//self.hist = function() {
			//var v = self.volumeHistory;
			//var c = self.cutoffHistory;
			//console.log(v);
			//console.log(c);
			//}

			//BPM STUFF
			self.BEAT_DECAY_RATE = 0.995;
			self.BEAT_RANGE_LOW = 0.25;
			self.BEAT_RANGE_HIGH = 0.5;
			self.BEAT_MIN = 0.49; //level less than this is no beat
			var beatCutOff = 0;

			if (opts.onBeat != null) {
				self.onBeat = opts.onBeat;
			} else {
				self.onBeat = function() {}
			}

			self.update = function() {
				var freqData = self.freqData();
				var timeData = self.timeData();

				// Average
				// -------
				var low_i = Math.round(self.BEAT_RANGE_LOW * self.dataLength);
				var high_i = Math.round(self.BEAT_RANGE_HIGH * self.dataLength);
				var sum = 0;
				for(var i = low_i; i < high_i; i++) {
					sum += freqData[i];
				}
				volume = (sum / (high_i - low_i)) / 256.0;

				//self.volumeHistory.push(volume);
				//self.volumeHistory.shift(1);
				//self.cutoffHistory.push(beatCutOff);
				//self.cutoffHistory.shift(1);

				// Beat detection
				// --------------
				if (volume  > beatCutOff && volume > self.BEAT_MIN){
					self.onBeat();
					beatCutOff = volume * 1.1;
				} else {
					beatCutOff *= self.BEAT_DECAY_RATE;
					beatCutOff = Math.max(beatCutOff, self.BEAT_MIN);
				}
			}
		}
	};

	return wavebyte;
});
