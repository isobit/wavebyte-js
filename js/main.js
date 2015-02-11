require.config({
	baseUrl: "js",
	waitSeconds: 15,
	paths: {
		"vue": "../components/vue/dist/vue",
		"promise": "../components/promisejs/promise",
		"threejs": "../components/threejs/build/three.min",
	},
	shim: {
		"threejs": {
			exports: "THREE"
		},
		"lib/OrbitControls": ["threejs"]
	}
});

define([
	"vue",
	"threejs",
	"lib/AudioContext",
	"Soundcloud",
	"WaveGlimpse",
	"BeatNode"
], function(
	Vue,
	THREE,
	AudioContext,
	Soundcloud,
	WaveGlimpse,
	BeatNode
) {

	// UI -------------------------------------

	var page = new Vue({
		el: 'body',
		data: {
			showSidebar: false,

			scUrl: "",
			songTitle: "N/A",

			minColor: "#444444",
			maxColor: "#00FF7F",
            beatColor: "#007BC2",
			radPow: 1.5,
            beatDecay: 0.9925,

			showError: false,
			errorMsg: "Whoops! Something went wrong.",

			showLoadModal: false
		},
		methods: {
			toggleSidebar: function() {
				this.showSidebar = !this.showSidebar;
			},
			submitUrl: function(url) {
				this.loadUrl(url, true);
				this.showLoadModal = false;
			},
			loadUrl: function(url, autoPlay) {
				var self = this;
				this.scUrl = url;
				return Soundcloud.resolve(url)
					.then(function(error, response, xhr) {
						var data = JSON.parse(response);
						if (data.kind == "track") {
							if (data.streamable) {
								audio.src = data.stream_url + "?&client_id=" + Soundcloud.client_id;
								self.songTitle = data.title;
								if (autoPlay) self.play();
							} else {
								alert("Track is not streamable. Please enter a new url.");
							}
						} else {
							alert("Url is not a track. Please enter a new url.");
						}
					});
			},
			play: function() {
				console.log("Playing...");
				if (audio.src) {
					audio.play();
				} else {
					alert("No audio loaded!");
				}
			}
		}
	});

	function showError(e) {
		page.errorMsg = e;
		page.showError = true;
		console.error(e);
	}

	// Audio -------------------------------------

	// Audio control element
	var audio = document.querySelector('audio');

	// Source node
	var source = AudioContext.createMediaElementSource(audio);

	// Mic
	//navigator.getUserMedia = ( navigator.getUserMedia ||
	//navigator.webkitGetUserMedia ||
	//navigator.mozGetUserMedia ||
	//navigator.msGetUserMedia);
	//navigator.getUserMedia({audio: true},
	//	function(stream) {
	//		//set up source
	//		console.log("Got stream");
	//		var micSource = AudioContext.createMediaStreamSource(stream);
	//		console.log(micSource);
	//		micSource.connect(analyser);
	//	}, function(error) {console.log(error); console.log("2");}
	//);

	// Analyser node
	var analyser = AudioContext.createAnalyser();
	analyser.fftSize = 2048;
	var freqData = new Uint8Array(analyser.frequencyBinCount);
	function getFreqData() {
		analyser.getByteFrequencyData(freqData);
		return freqData;
	}

	// Beat analyser node
	var beatAnalyser = new BeatNode(getFreqData, function() {
		setTimeout(function() { waveView.material.uniforms['beat'].value = 1.0; }, 0);
	});

	// Delay node (to compensate for render time)
	var delay = AudioContext.createDelay(75);

	/*  Wiring diagram:
	 ____________________      __________      _______
	| MediaElementSource |--->| Analyser |--->| Delay |---> Output
	 --------------------      -----|----      -------
                             _______v______
                            | BeatDetector |
                             --------------
	 */

	source.connect(analyser);
	analyser.connect(delay);
	analyser.connect(beatAnalyser.input);
	delay.connect(AudioContext.destination);

	// Visuals --------------------------------------

	var waveGlimpse = new WaveGlimpse(getFreqData);
	var waveView = waveGlimpse.createView(document.querySelector('#wave'));

	// Colors

	function hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	function rgbToVec3(rgb) {
		var vec = new THREE.Vector3(
			rgb.r / 256,
			rgb.g / 256,
			rgb.b / 256
		);
		return vec;
	}

	page.$watch('minColor', function(val) {
		waveView.material.uniforms['minColor'].value =
			rgbToVec3(hexToRgb(val));
	}, false, true);

	page.$watch('maxColor', function(val) {
		waveView.material.uniforms['maxColor'].value =
			rgbToVec3(hexToRgb(val));
	}, false, true);

    page.$watch('beatColor', function(val) {
        waveView.material.uniforms['beatColor'].value =
            rgbToVec3(hexToRgb(val));
    }, false, true);

	page.$watch('radPow', function(val) {
		waveView.material.uniforms['radPow'].value = val;
	}, false, true);

    page.$watch('beatDecay', function(val) {
        beatAnalyser.BEAT_DECAY_RATE = val;
    }, false, true);

	// Resizing

	function resize() {
		var padding = 10;
		var w = window.innerWidth - padding;
		var h = window.innerHeight - padding;
		waveView.resize(w, h);
	}
	window.addEventListener('resize', resize, false);
	resize();

	// Final init -------------------------------------

	//page.loadUrl("https://soundcloud.com/mumbojumbo/smack-ma-glitch-up-mix");
	page.loadUrl("https://soundcloud.com/glaucus-atlanticus/paralytic-dreams");

});
