define(["threejs"], function(THREE) {

	var glimpse = {};

	if ( !window.requestAnimationFrame ) {
		window.requestAnimationFrame = ( function() {
			return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
				window.setTimeout( callback, 1000 / 60 );
			};
		} )();
	}

	function GlimpseView(model, element, params) {
		var self = this;
		this.model = model;
		this.element = element;

		this.renderer = new THREE.WebGLRenderer({alpha: true});
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(params.fov, 1, 1, 10000);
		this.camera.position.z = 750;
		this.camera.lookAt(this.scene.position);
		this.start = Date.now();

		this.render = function() {
			this.renderer.render(this.scene, this.camera);
		};

		this.animate = function() {
			self.model.update.apply(self, [Date.now() - self.start]);
			self.render();
			requestAnimationFrame(self.animate);
		};

		this.resize = function(width, height) {
			this.model.resize.apply(this, [width, height]);
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
		};

		this.model.init.apply(this);
		this.element.appendChild(this.renderer.domElement);
	}

	glimpse.GlimpseFactory = function(opts) {
		var self = this;
		this.init = opts.init;
		this.update = opts.update;
		this.resize = opts.resize;

		opts.view = opts.view || {};
		var viewParams = {
			fov: opts.view.fov || 45
		};

		this.createView = function(element) {
			var view = new GlimpseView(self, element, viewParams);
			view.animate();
			return view;
		};
	};

	return glimpse;
});
