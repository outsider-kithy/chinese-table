import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let scene, camera, renderer;

function init(){
    //円周上の座標を決定
    let theta = 0;
    let step = 30 * (Math.PI / 180);
    let radius = 10;
    let center = new THREE.Vector3(0,0,0);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,1000);
    camera.position.set(0, 8, 25);
    camera.lookAt(0,0,0);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    //環境光
    let ambientLight = new THREE.AmbientLight(0xcccccc,0.1);
    scene.add(ambientLight);

    //平行光源
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 100, 0);
    scene.add(directionalLight);

    //テーブル
    let cylinderGeometry = new THREE.CylinderGeometry(radius*1.1,radius*1.1,2,32,32,false);
    let cylinderMaterial = new THREE.MeshPhongMaterial({color:0xff3333});
    let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(center.x, center.y - 1, center.z);
    scene.add(cylinder);

    let smallCylinderGeometry = new THREE.CylinderGeometry(radius*0.5, radius*0.5, 2, 32, 32, false);
    let smallCylinderMaterial = new THREE.MeshPhongMaterial({color:0xd46300});
    let smallCylinder = new THREE.Mesh(smallCylinderGeometry, smallCylinderMaterial);
    scene.add(smallCylinder);

    //モデルの読み込み
    let models = new THREE.Group();

    //マテリアルカラーを12色セット
    let colorList = [
        new THREE.Color(0x00ff00),
        new THREE.Color(0xff4422),
        new THREE.Color(0x2277ff),
        new THREE.Color(0xff19c9),
        new THREE.Color(0xff9819),
        new THREE.Color(0x53edce),
        new THREE.Color(0xfc2399),
        new THREE.Color(0x68fc23),
        new THREE.Color(0x9723fc),
        new THREE.Color(0xfc6023),
        new THREE.Color(0x7623eb),
        new THREE.Color(0x4f72ff),
    ];
    
    for (let i=0; i<colorList.length; i++){
        let neonMaterial = new THREE.MeshStandardMaterial({
            color: colorList[i],  // ネオンの色を指定
            emissive: colorList[i],  // 発光色を指定
            side: THREE.DoubleSide,  // マテリアルを両面に適用する
            flatShading: true  // フラットシェーディングを有効にする
        });

        let objLoader = new OBJLoader();
        objLoader.setPath('./models/');
        objLoader.load('text'+ i +'.obj', function(object){
            object.scale.set(2.0, 2.0, 2.0);
            
            //円周を12等分した座標x,yを求める
            theta += step;
            let x = center.x + radius * Math.cos(theta);
            let y = 0;
            let z = center.z + radius * Math.sin(theta);
            object.position.set(x,y,z);
            object.lookAt(center);

            models.add(object);
            
            object.traverse((child)=>{
                if(child instanceof THREE.Mesh){
                    child.material = neonMaterial;
                }
            });    
        });
    }

    scene.add(models);

    //ポストプロセッシング
    const renderPass = new RenderPass(scene, camera);

    //グロー効果をかける
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.0;
    bloomPass.radius = 1;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    
    document.getElementById('webgl').appendChild(renderer.domElement);

    const amplitude = 0.5; //振幅
    const frequency = 0.5; //周波数
    let time = 0;//時間経過

    render();

    function render(){
        requestAnimationFrame(render);
        time += 0.01;
        let random = Math.random() * 0.75;
        bloomPass.strength = 1 + (amplitude * Math.sin(2 * Math.PI * frequency * time) * random);
        composer.render();
        models.rotation.y += 0.01;
    }
}

window.onload = init;

