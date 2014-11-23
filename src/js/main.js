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

	var songProgress = $('#song-progress');
	function setSongProgress(p, delay) { 
		setTimeout(function() {
			songProgress.width(p + "%");
		}, delay);
	};
	setSongProgress(10, 1000);
	setSongProgress(20, 2000);
	setSongProgress(30, 3000);
	setSongProgress(40, 4000);
	setSongProgress(50, 5000);
	setSongProgress(60, 6000);
	setSongProgress(70, 7000);
	setSongProgress(80, 8000);
	setSongProgress(90, 9000);
	setSongProgress(100, 10000);

	$(document).ready(function() {
		function showError(e) {
			$('#error-msg').text('Whoops! Something went wrong.');
			$('#error').show();
			console.error(e);
		}
		try {
			var analyzer = new wavebyte.Analyzer({
				bpmEnabled: true,
				onBeat: function() {
					setTimeout(function() { waveView.material.uniforms['beat'].value = 1.0; }, 0);
				},
				delay: 30.0
			});
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

			$('#startButton').click(function() {
				try { analyzer.start(); } catch(e) { showError(e);}
			});
			$('#stopButton').click(function() {
				try { analyzer.stop(); } catch(e) { showError(e);}
			});
		} catch(e) {
			showError(e);
		}
	});

});
