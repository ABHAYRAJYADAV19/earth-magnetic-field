let scene, camera, renderer, earth, fieldLines, magneticArrow;

function createMagneticArrow() {
    // Remove existing arrow if any
    if (magneticArrow) {
        scene.remove(magneticArrow);
    }

    // Create arrow helper for magnetic field direction
    const origin = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(0, 1, 0);
    const length = 8;
    const color = 0xff0000;
    const headLength = 1;
    const headWidth = 0.5;

    magneticArrow = new THREE.ArrowHelper(direction, origin, length, color, headLength, headWidth);
    scene.add(magneticArrow);
}

function updateMagneticArrow(declination, inclination) {
    if (magneticArrow) {
        // Convert degrees to radians
        const decRad = (declination * Math.PI) / 180;
        const incRad = (inclination * Math.PI) / 180;

        // Calculate direction vector based on declination and inclination
        const direction = new THREE.Vector3(
            Math.sin(decRad) * Math.cos(incRad),
            Math.sin(incRad),
            Math.cos(decRad) * Math.cos(incRad)
        );
        
        magneticArrow.setDirection(direction.normalize());
    }
}

function createFieldLines() {
    if (fieldLines) {
        fieldLines.forEach(line => scene.remove(line));
    }
    fieldLines = [];

    const numLines = 24; // Increased number of lines
    const pointsPerLine = 100;
    
    for (let i = 0; i < numLines; i++) {
        const points = [];
        const startAngle = (i * 2 * Math.PI) / numLines;
        
        // Create dipole field lines
        for (let t = 0; t <= pointsPerLine; t++) {
            const theta = (t / pointsPerLine) * Math.PI;
            const r = 6 * Math.sin(theta) * Math.sin(theta);
            
            const x = r * Math.cos(startAngle);
            const y = 6 * Math.cos(theta);
            const z = r * Math.sin(startAngle);
            
            points.push(new THREE.Vector3(x, y, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x4444ff,
            opacity: 0.6,
            transparent: true,
            linewidth: 2
        });
        
        const line = new THREE.Line(geometry, material);
        fieldLines.push(line);
        scene.add(line);
    }
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    const container = document.getElementById('scene-container');
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(-5, -3, -5);
    scene.add(pointLight);

    // Earth with improved textures
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    
    Promise.all([
        textureLoader.loadAsync('/static/textures/earth_daymap.jpg'),
        textureLoader.loadAsync('/static/textures/earth_bumpmap.jpg'),
        textureLoader.loadAsync('/static/textures/earth_specular.jpg')
    ]).then(([earthTexture, bumpMap, specMap]) => {
        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpMap,
            bumpScale: 0.05,
            specularMap: specMap,
            specular: new THREE.Color('grey'),
            shininess: 5
        });
        
        earth = new THREE.Mesh(geometry, material);
        earth.castShadow = true;
        earth.receiveShadow = true;
        scene.add(earth);
        
        // Add field lines after Earth is loaded
        createFieldLines();
        createMagneticArrow();
    });

    // Add reference grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -7;
    scene.add(gridHelper);

    // Add orbit controls for better interaction
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;

    camera.position.z = 15;
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.001;
    
    // Rotate field lines with Earth
    if (fieldLines) {
        fieldLines.forEach(line => {
            line.rotation.y = earth.rotation.y;
        });
    }
    
    renderer.render(scene, camera);
}

function updateMagneticField(latitude, longitude) {
    fetch(`/api/magnetic-data?lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('declination').textContent = `${data.declination}°`;
            document.getElementById('inclination').textContent = `${data.inclination}°`;
            document.getElementById('intensity').textContent = `${data.intensity} nT`;
            
            // Update magnetic arrow direction
            updateMagneticArrow(data.declination, data.inclination);
        });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

window.addEventListener('resize', () => {
    const container = document.getElementById('scene-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Control listeners
function updateFieldLines(latitude, longitude) {
    if (fieldLines) {
        // Update field line rotation based on latitude and longitude
        fieldLines.forEach(line => {
            line.rotation.x = (latitude * Math.PI) / 180;
            line.rotation.y = (longitude * Math.PI) / 180;
        });
    }
}

// Update the existing event listeners
document.getElementById('latitude').addEventListener('input', (e) => {
    const lat = e.target.value;
    document.getElementById('lat-value').textContent = `${lat}°`;
    updateFieldLines(lat, document.getElementById('longitude').value);
    updateMagneticField(lat, document.getElementById('longitude').value);
});

document.getElementById('longitude').addEventListener('input', (e) => {
    const lon = e.target.value;
    document.getElementById('lon-value').textContent = `${lon}°`;
    updateFieldLines(document.getElementById('latitude').value, lon);
    updateMagneticField(document.getElementById('latitude').value, lon);
});
let compass3d;

document.addEventListener('DOMContentLoaded', () => {
    compass3d = new Compass3D('compass');
});

// Add zoom control handlers
document.getElementById('zoom-in').addEventListener('click', () => {
    if (compass3d && compass3d.camera) {
        compass3d.camera.position.z = Math.max(3, compass3d.camera.position.z - 1);
    }
});

document.getElementById('zoom-out').addEventListener('click', () => {
    if (compass3d && compass3d.camera) {
        compass3d.camera.position.z = Math.min(10, compass3d.camera.position.z + 1);
    }
});
