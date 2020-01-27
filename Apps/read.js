   // Cesium.BingMapsApi.defaultKey = 'YourPersonalKeyFromBing';
   var timeshift = 1000;
   var rec = false;
   var save= false;
	var viewer = new Cesium.Viewer('cesiumContainer');
	var handler = new Cesium.CameraEventAggregator(viewer.scene.canvas);
	
	var last = Date.now();
var akt;
var idm = 0;
var ida = 0;
var pos;

// Get the transform from local east-north-up at cartographic (-74.01881302800248, 40.69114333714821) to Earth's fixed frame.
var center = Cesium.Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821);
var locToGlobtransform = Cesium.Transforms.eastNorthUpToFixedFrame(center);

//Inverse: GlobToLoc
var transform = Cesium.Matrix4.inverse(locToGlobtransform,new Cesium.Matrix4());
var matricies = {
mats:[]
}
var events = {
	userInputs:[]
}
	
	
	document.addEventListener('keydown', function(e) {
		const keyName = e.key;
		console.log(keyName);
		if (keyName == "r"){
		rec = !rec;
		if(!rec){
			save= true;
		}
		}
	
});


function scrollInput (e) {
	 console.log("Scroll");
	 pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
	 events.userInputs.push({ID:ida, Time: Date.now(), MouseDown: "Wheel", KeyboardDown: "None", Position: pos});
	 console.log(events);
	 ida++;
}

document.addEventListener('wheel', scrollInput);
document.addEventListener('mousewheel', scrollInput);
document.addEventListener('DOMMouseScroll', scrollInput);


var lastAnyDown = false;
var actAnyDown = false;

	viewer.scene.postRender.addEventListener(function(s,t) {
	var actAnyDown = handler.anyButtonDown;
	akt = Date.now();
	if(rec){
	if( akt-last>timeshift){
	if(handler.isButtonDown(Cesium.CameraEventType.LEFT_DRAG)){
		pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
		events.userInputs.push({ID:ida, MatID:idm, Time: akt, MouseDown: "LeftDown", KeyboardDown: "None", Position: pos});
	}
	
	if(handler.isButtonDown(Cesium.CameraEventType.RIGHT_DRAG)){
		pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
		events.userInputs.push({ID:ida, MatID:idm, Time: akt, MouseDown: "RightDown", KeyboardDown: "None", Position: pos});
	}
	
	if(handler.isButtonDown(Cesium.CameraEventType.MIDDLE_DRAG)){
		pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
		events.userInputs.push({ID:ida, MatID:idm, Time: akt, MouseDown: "MiddleDown", KeyboardDown: "None", Position: pos});
	}
	if(handler.isButtonDown(Cesium.CameraEventType.LEFT_DRAG, Cesium.KeyboardEventModifier.CTRL)||handler.isButtonDown(Cesium.CameraEventType.RIGHT_DRAG, Cesium.KeyboardEventModifier.CTRL)){
		pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
		events.userInputs.push({ID:ida, MatID:idm, Time: akt, MouseDown: "Left/RightDown", KeyboardDown: "Ctrl", Position: pos});
	}
	if(handler.isButtonDown(Cesium.CameraEventType.LEFT_DRAG, Cesium.KeyboardEventModifier.SHIFT)){
		pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
		events.userInputs.push({ID:ida, MatID:idm, Time: akt, MouseDown: "LeftDown", KeyboardDown: "Shift", Position: pos});
	}
	
	
	if((lastAnyDown==true)&&(actAnyDown==false)){
		ida++;
		console.log(events);
	}
	lastAnyDown=actAnyDown;
	
	
	var globCameraMatrix = Cesium.Matrix4.clone(viewer.camera.inverseViewMatrix);
	var locCameraMatrix= Cesium.Matrix4.clone(Cesium.Matrix4.multiply(transform,globCameraMatrix,new Cesium.Matrix4()));
	matricies.mats.push({ID:idm, Time: akt, globCameraMatrix, locCameraMatrix}); 
	last = akt;
	idm++;
	}
	}
	if(save){
		var jsonM = JSON.stringify(matricies);
		var jsonI = JSON.stringify(events);
		console.log(jsonM);
		
		var sampleBytes = new Int8Array(4096);

var saveByteArray = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
	
    return function (data, name) {
        var blob = new Blob([jsonM], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

saveByteArray([sampleBytes], 'CameraMatricies.txt');

var saveByteArray = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
	
    return function (data, name) {
        var blob = new Blob([jsonI], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

saveByteArray([sampleBytes], 'UserInputs.txt');		
		
		//var fs = require('fs');
		//fs.writeFile('jsonmats.json', json, 'utf8', callback);
		save= false;
	}
	});