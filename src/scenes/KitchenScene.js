export class KitchenScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.stationMeshes = [];
        this.dishIndicators = new Map();
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {};
        this.loadTextures();
    }

    loadTextures() {
        // load the textures for each dish
        const lettuceUrl = new URL('../lettuce.png', import.meta.url).href;
        const omeleteUrl = new URL('../omelete.png', import.meta.url).href;

        this.textures.salad = this.textureLoader.load(lettuceUrl);
        this.textures.eggs = this.textureLoader.load(omeleteUrl);
        // this.textures.burger = this.textureLoader.load('src/burger.png')
    }

    init(Container) {
        this.scene.background = new THREE.Color(0x1a1a2e);

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 14, 0.01);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        Container.appendChild(this.renderer.domElement);

        this.createKitchen();
        this.createLights();
    }

    createKitchen() {
        const counterGeo = new THREE.BoxGeometry(14, 0.6, 5);
        const counterMat = new THREE.MeshStandardMaterial({ color: 0x5d4037});
        const counter = new THREE.Mesh(counterGeo, counterMat);
        counter.position.y = 1;
        this.scene.add(counter);

        //cooking position
        const positions = [-4.5, 0, 4.5];
        positions.forEach(x => {
            const geo = new THREE.CylinderGeometry(1, 1, 0.15, 32);
            const mat = new THREE.MeshStandardMaterial({ color: 0x263238 });
            const station = new THREE.Mesh(geo, mat);
            station.position.set(x, 1.4, 0);
            this.scene.add(station);
            this.stationMeshes.push(station);
        });
    }

    createLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);

        const spot = new THREE.SpotLight(0xffffff, 1);
        spot.position.set(0, 15, 8);
        this.scene.add(spot);
    }

    addDishIndicator(orderId, dishColor, stationIndex, dishKey) {
        const group = new THREE.Group();

        if (dishKey !== 'eggs' && dishKey !== 'salad') {
            const baseGeo = new THREE.BoxGeometry(1.5, 0.3, 1.5);
            const baseMat = new THREE.MeshStandardMaterial({ color: dishColor });
            const baseMesh = new THREE.Mesh(baseGeo, baseMat);
            group.add(baseMesh);
        }

        const texture = this.textures[dishKey];
        if (texture) {
            const iconGeo = new THREE.PlaneGeometry(1.4, 1.4);
            const iconMat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.2
            });
            const iconMesh = new THREE.Mesh(iconGeo, iconMat);
            iconMesh.name = 'dish-icon';
            iconMesh.rotation.x = -Math.PI / 2;
            iconMesh.position.y = (dishKey === 'eggs' || dishKey === 'salad') ? 0.05 : 0.2;
            group.add(iconMesh);
        }

        group.position.set(
            this.stationMeshes[stationIndex].position.x,
            1.55,
            0
        );
        this.scene.add(group);
        this.dishIndicators.set(orderId, group);
    }

    removeDishIndicator(orderId) {
        const indicator = this.dishIndicators.get(orderId);
        if (indicator) {
            this.scene.remove(indicator);
            this.dishIndicators.delete(orderId);
        }
    }

    setDishBurnt(orderId) {
        const indicator = this.dishIndicators.get(orderId);
        if (indicator) {
            if (indicator.isGroup) {
                indicator.children.forEach(child => {
                    if (child.material && child.material.color) {
                        child.material.color.setHex(0x222222);
                    }
                    if (child.name === 'dish-icon' && child.material) {
                        child.material.opacity = 0.6;
                    }
                });
                return;
            }

            if (indicator.material.map) {
                indicator.material.color.setHex(0x222222);
            } else {
                indicator.material.color.setHex(0x000000);
            }
        }
    }

    animate() {
        this.stationMeshes.forEach(mesh => {
            mesh.position.y = 1.4 + Math.sin(Date.now() * 0.003) * 0.05;
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this.renderer && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}