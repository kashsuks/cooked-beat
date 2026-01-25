export class KitchenScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.stationMeshes = [];
        this.dishIndicators = new Map();
    }

    init(Container) {
        this.scene.background = new THREE.Color(0x1a1a2e);

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 6, 12);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialis: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

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
            const geo = new THREE.CylinderGeeometry(1, 1, 0.15, 32);
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

    addDishIndicator(orderId, dishColor, stationIndex) {
        const geo = new THREE.BoxGeometry(1.5, 0.3, 1.5);
        const mat = new THREE.MeshStandardMaterial({ color: dishColor });
        const indicator = new THREE.Mesh(geo, mat);
        indicator.position.set(
            this.stationMeshes[stationIndex].position.x,
            1.55,
            0
        );
        this.scene.add(indicator);
        this.dishIndicators.set(orderId, indicator);
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
            indicator.material.color.setHex(0x000000);
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