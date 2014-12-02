require.config({
	baseUrl: "js",
	waitSeconds: 15,
	paths: {
		"jquery": "../components/jquery/dist/jquery.min",
		"angular": "../components/angular/angular",
		//"vue": "../components/vue/dist/vue",
		"threejs": "../components/threejs/build/three.min",
		"OrbitControls": "lib/OrbitControls",
		"glimpse": "lib/glimpse",
		"wavebyte": "lib/wavebyte",
		"audiocontext": "lib/audiocontext"
	},
	shim: {
		"angular": {
			exports: "angular",
			deps: ["jquery"]
		},
		"threejs": {
			exports: "THREE"
		},
		"OrbitControls": ["threejs"]
	}
});

define([
	"angular",
	"wavevis/Main"
], function(angular, Main) {

	//var body = new Vue({
	//	el: 'body',
	//
	//});

	var app = angular.module('Wavebyte',[]);

	app.controller('Main', Main);

	angular.element(document).ready(function() {
		angular.bootstrap(document, ["Wavebyte"]);
	});

	//var songProgress = $('#song-progress');
	//function setSongProgress(p) {
	//	songProgress.width(p + "%");
	//};
    //
	//$(document).ready(function() {
	//	function showError(e) {
	//		$('#error-msg').text('Whoops! Something went wrong.');
	//		$('#error').show();
	//		console.error(e);
	//	}
	//	try {
	//		var analyzer = new wavebyte.Analyzer({
	//			bpmEnabled: true,
	//			onBeat: function() {
	//				setTimeout(function() { waveView.material.uniforms['beat'].value = 1.0; }, 0);
	//			},
	//			delay: 30.0
	//		});
	//		analyzer.registerFileInput($('#uploadedFile').get(0));
    //
	//		var waveGlimpse = new WaveGlimpse(analyzer);
	//		var waveView = waveGlimpse.createView($('#wave').get(0));
    //
	//		function resize() {
	//			var padding = 10;
	//			var w = window.innerWidth - padding;
	//			var h = window.innerHeight - padding;
	//			waveView.resize(w, h);
	//		}
	//		window.addEventListener('resize', resize, false);
	//		resize();
    //
	//		$('#startButton').click(function() {
	//			try { analyzer.start(); } catch(e) { showError(e);}
	//		});
	//		$('#stopButton').click(function() {
	//			try { analyzer.stop(); } catch(e) { showError(e);}
	//		});
	//	} catch(e) {
	//		showError(e);
	//	}
	//});

});
