import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';

function init() {
    let pos = {x:0,y:0,xf:0,yf:0,deltaX:0,deltaY:0};
    const logoScale = 13;
    let speed = 0;
    let accel = .008;
    let decel = .0005;
    let initial = true;

    let isDown = false;

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
    let renderer = new THREE.WebGLRenderer({antialias:true});
    let camMatrix = new THREE.Matrix4();
    let camEuler = new THREE.Euler();
    
    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.position.z = 1;

    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;

    document.body.appendChild( renderer.domElement );

    scene.background = new THREE.Color("white");

    var loader = new GLTFLoader();
    let logo;

    loader.load( 'models/mp-logo.glb', function ( gltf ) {

        logo = gltf.scene;

        scene.add( logo );
        
        logo.children[0].material = new THREE.MeshStandardMaterial( { color:0xA9273D });
        logo.children[1].material = new THREE.MeshStandardMaterial( { color:0x808184 });

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        directionalLight.position.set(0, 0.5, 1)
        scene.add( directionalLight );
        directionalLight.target = logo;

        camera.lookAt(logo.position);

        console.log(scene);

        initSize();
        render();
    } );

    function render() {
        let rotScale = .4;
        let rads = Math.PI * 2 * rotScale * -1;
        camera.position.set(0, 0, 1);
        camMatrix.identity();
        camEuler.set(pos.yf * rads, pos.xf * rads, 0)
        camMatrix.makeRotationFromEuler(camEuler);
        camera.position.applyMatrix4(camMatrix);
        camera.lookAt(logo.position);

        if (isDown) {
            if (pos.deltaX > 0) {
                speed -= accel;
            } else if (pos.deltaX < 0) {
                speed += accel;
            }
        } else if (speed != 0) {
            if (speed < 0) {
                speed = Math.min(0, speed + decel);
            } else if (speed > 0) {
                speed = Math.max(0, speed - decel);
            }
        }
        logo.rotation.y += speed;

        document.getElementById("output").innerHTML = "speed: " + speed + " y: " + logo.rotation.y;

        renderer.render(scene, camera);
        window.requestAnimationFrame(render);
    }

    function initSize(evt) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );

        let visibleWidth = visibleWidthAtZDepth(0, camera);
        let visibleHeight = visibleHeightAtZDepth(0, camera);
        let min = Math.min(visibleHeight, visibleWidth);
        let logoSize = logoScale * min;
        console.log(min);
        console.log(logoSize);

        logo.scale.set(logoSize, logoSize, logoSize);
    }

    window.addEventListener("resize", initSize);

    window.addEventListener("deviceorientation", function(evt) {
        let x = evt.beta;
        let y = evt.gamma;

        if (x > 90) { x = 90 };
        if (x < -90) { x = -90};

        x += 90;
        y += 90;

        // Seems dimensions are somehow swapped
        pos.xf = y / 180 - .5;
        pos.yf = x / 180 - .5;
    });

    window.addEventListener("mousemove", function(evt) {
        if (!initial) {
            pos.deltaX = pos.x - evt.pageX;
            pos.deltaY = pos.y - evt.pageY;
        }
        initial = false;

        pos.x = evt.pageX;
        pos.y = evt.pageY;

        pos.xf = pos.x / window.innerWidth - .5;
        pos.yf = pos.y / window.innerHeight - .5;
    });

    window.addEventListener("touchmove", function(evt) {
        if (!initial) {
            pos.deltaX = pos.x - evt.changedTouches[0].pageX;
            pos.deltaY = pos.y - evt.changedTouches[0].pageY;
        }
        initial = false;

        let lastTouch = evt.changedTouches[evt.changedTouches.length - 1];
        pos.x = lastTouch.pageX;
        pos.y = lastTouch.pageX;

        pos.xf = pos.x / window.innerWidth - .5;
        pos.yf = pos.y / window.innerHeight - .5;
    });

    window.addEventListener("touchstart", function(evt) {
        evt.preventDefault();
        isDown = true;
    });

    window.addEventListener("mousedown", function(evt) {
        evt.preventDefault();
        isDown = true;
    });

    window.addEventListener("touchend", function(evt) {
        isDown = false;
    });

    window.addEventListener("mouseup", function(evt) {
        isDown = false;
    });

    const visibleHeightAtZDepth = ( depth, camera ) => {
        // compensate for cameras not positioned at z=0
        const cameraOffset = camera.position.z;
        if ( depth < cameraOffset ) depth -= cameraOffset;
        else depth += cameraOffset;
      
        // vertical fov in radians
        const vFOV = camera.fov * Math.PI / 180; 
      
        // Math.abs to ensure the result is always positive
        return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
      };
      
      const visibleWidthAtZDepth = ( depth, camera ) => {
        const height = visibleHeightAtZDepth( depth, camera );
        return height * camera.aspect;
      };
      
}

init();