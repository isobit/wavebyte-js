var Wave = new Glimpse({
	init: function() {
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				audio: {
					type: "fv1",
					value: []
				},
				t: {
					type: "f",
					value: 0.0
				},
				dMax: {
					type: "f",
					value: 50.0
				},
				w: {
					type: "f",
					value: 0.0
				},
				h: {
					type: "f",
					value: 0.0
				}
			},
			wireframe: true,
			vertexShader:
				"uniform float audio[500];" +
				"uniform float t;" +
				"uniform float dMax;" +
				"uniform float w;" +
				"uniform float h;" +
				"varying float dr;" +
				"void main() { " +
					"float rad = distance(vec2(position.x, position.y), vec2(0, 0));" +
					"float dRad = rad / (0.6 * w);" +
					"float drAudio = audio[int(dRad * 500.0)];" +
					"dr = exp(drAudio - 0.5);" +
					"float d = dMax * dr;" +
					//"// Displace the position along its normal and project it" +
					"vec3 newPosition = position + normal * d;" +
					"gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);" +
				"}",
			fragmentShader: 
				"varying float dr;" +
				"void main() {" +
					"vec3 color = vec3(0.4 * dr, 0.6 * dr, 0.6 / dr);" +
					"gl_FragColor = vec4(color.rgb, 1.0);" +
				"}"
		});

		document.getElementById('noWebGL').style.display = 'none';
		var controls = new THREE.OrbitControls(this.camera, this.element);
		controls.noPan = true;
		controls.damping = 0.2;
		controls.addEventListener('change', this.render);
	},
	update: function(dt) {
		this.material.uniforms['t'].value = .00025 * dt;
		if (wavebyte.playing) {
			wavebyte.update();
			var wavebyteData = wavebyte.freqData();
			var audioData = new Array(500);
			//for (i = 0; i < wavebyteData.length; i++) {
			for (var i = 0; i < 500; i++) {
				audioData[i] = wavebyteData[i] / 256.0;
			}
			this.material.uniforms['audio'].value = audioData;
		}
	},
	resize: function(width, height) {
		this.material.uniforms['w'].value = width;
		this.material.uniforms['h'].value = height;
		this.material.uniforms['dMax'].value = height / 8;
		var res = 14; //15
		var dx = Math.max(40, Math.round(width / res));
		var dy = Math.max(40, Math.round(height / res));
		this.scene.remove(this.mesh);
		this.mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(width, height, dx, dy),
			this.material
		);
		this.mesh.rotation.x = Math.PI / -3;
		this.mesh.position.y = height / 10;
		this.camera.position.z = width - 400;
		this.scene.add(this.mesh);
	}
});
