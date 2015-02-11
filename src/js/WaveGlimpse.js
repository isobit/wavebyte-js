define([
	"lib/glimpse",
	"threejs",
	"lib/OrbitControls"
], function(glimpse, THREE) {

	var WaveGlimpse = function(getFreqData) {

		var audioDataLength = 200; // Default to 200 for systems with 256 max uniforms

		return new glimpse.GlimpseFactory({
			view: {
				fov: 40
			},
			init: function() {

				// Compute number of uniforms to use for audioData from the max we have available on the system
				var gl = this.renderer.context;
				var maxUniforms = gl.getParameter(gl['MAX_VERTEX_UNIFORM_VECTORS']);
				audioDataLength = Math.min(
					 maxUniforms - 100,
					400
				);
				console.log("audioDataLength", audioDataLength);

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
						radPow: {
							type: "f",
							value: 1.0
						},
						w: {
							type: "f",
							value: 0.0
						},
						minColor: {
							type: "v3",
							value: new THREE.Vector3(0, 0, 0)
						},
						maxColor: {
							type: "v3",
							value: new THREE.Vector3(1, 1, 1)
						},
                        beatColor: {
                            type: "v3",
                            value: new THREE.Vector3(1, 1, 1)
                        }
						//h: {
						//	type: "f",
						//	value: 0.0
						//}
					},
					wireframe: true,
					vertexShader:
					"uniform float audioData["+audioDataLength+"];" +
					"uniform float t;" +
					"uniform float drMax;" +
					"uniform float radPow;" +
					"uniform float w;" +
					//"uniform float h;" +
					"varying float audio;" +
					"void main() { " +
					"float rad = distance(vec2(position.x, position.y), vec2(0, 0));" +
					//"float radNorm = rad / (0.55 * w);" +
					"float radNorm = pow(rad / (0.55 * w), radPow);" +
					"audio = audioData[int(radNorm * "+audioDataLength+".0)];" +
					"float displacement = (drMax * " +
						//"pow(audio, 2.0);" +
						"audio);" +
						//"// Displace the position along its normal and project it" +
					"vec3 newPosition = position + normal * displacement;" +
					"gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);" +
					"}",
					fragmentShader:
					"uniform float t;" +
					"uniform float beat;" +
					"uniform vec3 minColor;" +
					"uniform vec3 maxColor;" +
                    "uniform vec3 beatColor;" +
					"varying float audio;" +
					"void main() {" +
					"float mix = pow(audio, 2.0);" +
					"vec3 maxColorMixed = maxColor * mix;" +
					"vec3 minColorMixed = minColor * (1.0 - mix) * (1.0 - beat);" +
                    "vec3 beatColorMixed = beatColor * beat * (1.0 - mix);" +
					"gl_FragColor = vec4(maxColorMixed + minColorMixed + beatColorMixed, 1.0);" +
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
				//this.material.uniforms['h'].value = height;
				this.material.uniforms['drMax'].value = height / 6;
				//var res = 14;
				var dxAudio = Math.round(audioDataLength / 2);
				var dimRes = 14;
				console.log("dimRes", dimRes);
				console.log("dxAudio", dxAudio, "dxDim", Math.round(width / dimRes));
				var dx = Math.min(dxAudio, Math.round(width / dimRes));
				var dy = Math.min(dxAudio * (width / height), Math.round(height / dimRes));
				console.log("dx", dx);

				this.scene.remove(this.mesh);
				this.mesh = new THREE.Mesh(
					new THREE.PlaneGeometry(width, height, dx, dy),
					this.material
				);
				this.mesh.rotation.x = -Math.PI / 2;
				this.scene.add(this.mesh);

				this.camera.position.z = width * 0.55;
				this.camera.position.y = height * 0.8;
				this.controls.update();
			}
		});
	};

	return WaveGlimpse;
});
