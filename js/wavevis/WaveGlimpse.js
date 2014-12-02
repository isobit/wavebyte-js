define(["glimpse", "threejs", "OrbitControls"], function(glimpse, THREE) {

	var WaveGlimpse = function(getFreqData) {

		var audioDataLength = 300;

		return new glimpse.GlimpseFactory({
			init: function() {
				this.material = new THREE.ShaderMaterial({
					uniforms: {
						audioData: {
							type: "fv1",
							value: []
						},
						beat: {
							type: 'f',
							value: 0.0
						},
						t: {
							type: "f",
							value: 0.0
						},
						drMax: {
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
					"uniform float audioData["+audioDataLength+"];" +
					"uniform float t;" +
					"uniform float drMax;" +
					"uniform float w;" +
					"uniform float h;" +
					"varying float audio;" +
					"void main() { " +
					"float rad = distance(vec2(position.x, position.y), vec2(0, 0));" +
					"float radNorm = rad / (0.55 * w);" +
					"audio = audioData[int(radNorm * "+audioDataLength+".0)];" +
					"float displacement = (drMax * pow(audio, 2.0));" +
						//"// Displace the position along its normal and project it" +
					"vec3 newPosition = position + normal * displacement;" +
					"gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);" +
					"}",
					fragmentShader:
					"uniform float t;" +
					"uniform float beat;" +
					"varying float audio;" +
					"void main() {" +
					"vec3 maxColor = vec3(0.2, 0.8, 0.2);" +
					"vec3 minColor = vec3(0.2, 0.2, 0.6);" +
					"float mix = audio + 0.1;" +
					"vec3 color = maxColor * mix + minColor;" +
					//"float alpha = audio + 0.1;" +
					"gl_FragColor = vec4(color.rgb, 1.0);" +
					"}"
				});
				this.controls = new THREE.OrbitControls(this.camera, this.element);
				this.controls.noPan = true;
				this.controls.damping = 0.2;
				this.controls.addEventListener('change', this.render);

				// @TODO Move elsewhere
				document.getElementById('error').style.display = 'none';
			},
			update: function(dt) {
				this.material.uniforms['t'].value = .00025 * dt;
				this.material.uniforms['beat'].value *= 0.95;

				var wavebyteData = getFreqData();
				var audioData = new Array(audioDataLength);
				for (var i = 0; i < audioDataLength; i++) {
					audioData[i] = wavebyteData[i] / 256.0;
				}
				this.material.uniforms['audioData'].value = audioData;
			},
			resize: function(width, height) {
				this.material.uniforms['w'].value = width;
				this.material.uniforms['h'].value = height;
				this.material.uniforms['drMax'].value = height / 6;
				var res = 14;
				var dx = Math.max(40, Math.round(width / res));
				var dy = Math.max(40, Math.round(height / res));

				this.scene.remove(this.mesh);
				this.mesh = new THREE.Mesh(
					new THREE.PlaneGeometry(width, height, dx, dy),
					this.material
				);
				this.mesh.rotation.x = -Math.PI / 2;
				this.scene.add(this.mesh);

				this.camera.position.z = width * 0.8;
				this.camera.position.y = height * 0.75;
				this.controls.update();
			}
		});
	};

	return WaveGlimpse;
});
