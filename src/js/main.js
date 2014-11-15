require.config({
	baseUrl: "js",
	waitSeconds: 15,
	paths: {
		"jquery": "../components/jquery/dist/jquery.min",
		"threejs": "../components/threejs/build/three.min",
		"OrbitControls": "lib/OrbitControls",
		"glimpse": "lib/glimpse",
		"wavebyte": "lib/wavebyte"
	},
	shim: {
		"threejs": {
			exports: "THREE"
		},
		"OrbitControls": ["threejs"]
	}
});

define([
	"jquery",
	"wavebyte",
	"wavevis/WaveGlimpse"
], function($, wavebyte, WaveGlimpse) {

	var analyzer = new wavebyte.Analyzer({
		bpmEnabled: true,
		onBeat: function() {
			setTimeout(function() { waveView.material.uniforms['beat'].value = 1.0; }, 0);
		},
		delay: 30.0
	});

	$(document).ready(function() {
		analyzer.registerFileInput($('#uploadedFile').get(0));

		var waveGlimpse = new WaveGlimpse(analyzer);
		var waveView = waveGlimpse.createView($('#wave').get(0));

		function resize() {
			var padding = 10;
			var w = window.innerWidth - padding;
			var h = window.innerHeight - padding;
			waveView.resize(w, h);
		}
		window.addEventListener('resize', resize, false);
		resize();

		$('#startButton').click(analyzer.start);
		$('#stopButton').click(analyzer.stop);
	});

});
