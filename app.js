/*jshint esversion: 6 */

Event.preventDefault = true;

//DATAS

articles = [
    { "name" : "article 1", "contenu" : "contenu de l'article n°1 contenu de l'article n°1 contenu de l'article n°1 contenu de l'article n°1 contenu de l'article n°1", "img" :  'https://via.placeholder.com/150'},
    { "name" : "article 2", "contenu" : "contenu de l'article n°2", "img" :  'https://via.placeholder.com/180'},
    { "name" : "article 3", "contenu" : "contenu de l'article n°3", "img" :  'https://via.placeholder.com/200'},
    { "name" : "article 4", "contenu" : "contenu de l'article n°4", "img" :  'https://via.placeholder.com/100'},
    { "name" : "article 5", "contenu" : "contenu de l'article n°5", "img" :  'https://via.placeholder.com/250'},
    { "name" : "article 6", "contenu" : "contenu de l'article n°6", "img" :  'https://via.placeholder.com/350'},
    { "name" : "article 7", "contenu" : "contenu de l'article n°7", "img" :  'https://via.placeholder.com/850'}
];

//CONSTANTS
const canvas = document.getElementById('canvas'); // recuperation du bloc
const tooltip = document.querySelector('.tooltip');
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000 );
const raycaster = new THREE.Raycaster();

let tooltipActive = false;
// CONTROLS
const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.rotateSpeed = 0.2;
controls.enableZoom = false;
controls.autoRotate = false; // see what is better...
controls.touches = {
	ONE: THREE.TOUCH.ROTATE,
	TWO: THREE.TOUCH.DOLLY_PAN
}
camera.position.set( -1, 0, 0 ); // x = -1 to look at the front position of the texture
controls.update();

// main loop
function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );
}

// OBJECTS and SHADERS
const geometry = new THREE.SphereBufferGeometry( 50, 32, 32 );
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./img/360.jpg');
texture.wrapS = THREE.RepeatWrapping;
texture.repeat = new THREE.Vector2(-1,1 ); // flip the texture on x axis (due to the placement of the texture inside the sphere )
const material = new THREE.MeshBasicMaterial( {
    map: texture,
    side: THREE.DoubleSide // to see the inner side
    } );
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

// SPRITES for tooltips
addTooltip(new THREE.Vector3( 24, 6, 45),'article 1');
addTooltip(new THREE.Vector3( -2, 12, -48),'article 2');
addTooltip(new THREE.Vector3( 14, 4.5, -47),'article 3');
addTooltip(new THREE.Vector3( 44, 5, 21),'article 4');
addTooltip(new THREE.Vector3( - 42, 5, 26.5),'article 5');
addTooltip(new THREE.Vector3( - 45.7, 8.78, -17.78),'article 6');
addTooltip(new THREE.Vector3( -7, -43, 23),'article 7');

// RENDER 
renderer.setSize( canvas.clientWidth, canvas.clientHeight );
canvas.appendChild(renderer.domElement);

//CALL THE MAIN LOOP
animate();

// FUNCTIONS
function addTooltip(position, name){
    //todo decalage du sprite
    let spriteMap = new THREE.TextureLoader().load( "./img/sprite_icon.png" );
    let spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap } );
    let sprite = new THREE.Sprite( spriteMaterial );
    sprite.name = name;
    // to avoid pb on vector must clone the vector's position (pour eviter que ce soit la position qui soit modifiée)
    sprite.position.copy(position.clone().normalize().multiplyScalar(30)) ;
    sprite.scale.multiplyScalar(2); // taille de la tooltips
    scene.add( sprite );
}
function onResize(){
    // re-calculate the camera
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight; 
    //Updates the camera projection matrix. Must be called after any change of parameters. 
    camera.updateProjectionMatrix(); 
}

function onClick(e){ // catch the position of the raycaster
    let mouse = new THREE.Vector2();
    

    mouse.x = ( e.clientX / canvas.clientWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / canvas.clientHeight ) * 2 + 1;
  
    raycaster.setFromCamera( mouse, camera );
    // recuperer la position du clic de souris sur le canvas
    let intersects = raycaster.intersectObjects(scene.children); // intersect with all objects that are children of my scene
    intersects.forEach(function(intersect)  {
        if (intersect.object.type === 'Sprite'){ 
            console.log(intersect.object.name);
            changeArticle(intersect.object.name);
        }else{
            //console.log("raycast dist ", intersect.distance," points : ", intersect.point);
        }
    });

    //console.log(intersects)
    //let intersects = raycaster.intersectObject(sphere); // intersect with the sphere
    // debugger; 
    // if(intersects.length > 0){
    //     console.log('raycaster position : ' , intersects[0].point);
    //     //addTooltip(intersects[0].point); // add a new tooltip on the vector3's position
    // }
}
function onMouseMove(e){
    let mouse = new THREE.Vector2();
    let foundSprite = false;
    if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
        // touch management
        var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
        var touch = evt.touches[0] || evt.changedTouches[0];
        mouse.x = + (touch.pageX / canvas.clientWidth) * 2 - 1;
        mouse.y = - (touch.pageY / canvas.clientHeight) * 2 - 1;
    }else  if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
        // mouse managememnt
        mouse.x = ( e.clientX / canvas.clientWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / canvas.clientHeight ) * 2 + 1;
    }


    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach(function(intersect)  {
        if (intersect.object.type === 'Sprite'){ 
            p = intersect.object.position.clone().project(camera); // attention a ne pas muter le vector3 -> clone()
            //console.log(p);
            // position a reporter en pos html (transform to html position)
            tooltip.style.top = ( - 1 * p.y +1 ) * canvas.clientHeight/2 + "px";
            tooltip.style.left = ( p.x +1 ) * canvas.clientWidth/2 + "px";
            tooltip.classList.add('is-active'); // add class .is-active
            tooltip.innerHTML = intersect.object.name;   
            tooltipActive = true;
            foundSprite = true;
            //console.log(tooltip.style.top);
        }
    });
    if (foundSprite === false && tooltipActive){
        tooltip.classList.remove('is-active'); // remove class .is-active
    }
}
function changeArticle(name){
    let myTitle = document.querySelector('h2');
    let myContent = document.querySelector('p');
    //console.log(myTitle);
    myTitle.innerHTML = name;
    articles.forEach(function (article){
        if(article.name == name){
            myContent.innerHTML = article.contenu;
            let myImg =  document.createElement('img');
            myImg.className = 'article_img';
            myImg.src = article.img;
            //debugger;
            console.log(myImg);
            myContent.appendChild(myImg);
        }
    });
}
// ADD EVENT
window.addEventListener('resize', onResize);
canvas.addEventListener('click', onClick);
canvas.addEventListener('touchstart', onclick); // ! obligé de commenter "event.preventDefault();" à la ligne 52208 de three.js pour que ça marche
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('touchmove', onMouseMove);

