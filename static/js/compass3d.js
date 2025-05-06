class Compass3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 5;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Load textures
        const textureLoader = new THREE.TextureLoader();
        Promise.all([
            textureLoader.loadAsync('/static/textures/earth_daymap.jpg'),
            textureLoader.loadAsync('/static/textures/earth_bumpmap.jpg'),
            textureLoader.loadAsync('/static/textures/earth_specular.jpg')
        ]).then(([earthTexture, bumpMap, specMap]) => {
            // Create Earth sphere with loaded textures
            const geometry = new THREE.SphereGeometry(2, 64, 64);
            const material = new THREE.MeshPhongMaterial({
                map: earthTexture,
                bumpMap: bumpMap,
                bumpScale: 0.05,
                specularMap: specMap,
                specular: new THREE.Color('grey'),
                shininess: 5
            });

            this.earth = new THREE.Mesh(geometry, material);
            this.scene.add(this.earth);
        });

        // Add OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;

        // Start animation
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.earth) {
            this.earth.rotation.y += 0.001;
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    updateOrientation(heading) {
        if (this.earth) {
            this.earth.rotation.y = -heading * Math.PI / 180;
        }
    }
}