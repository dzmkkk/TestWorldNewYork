// Recording Inputs per timeshift in milliseconds
var timeshift = 0;
// total recording time after first user input in seconds
var totalTime = 60000
var rec = false;
var save= false;
// A demo of interactive 3D Tiles styling
// Styling language Documentation: https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification/Styling
// Building data courtesy of NYC OpenData portal: http://www1.nyc.gov/site/doitt/initiatives/3d-building.page
var viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain()
});

viewer.scene.globe.depthTestAgainstTerrain = true;
var handler = new Cesium.CameraEventAggregator(viewer.scene.canvas);
var startTime;	
var last = Date.now();
var akt;
var idm = 0;
var ida = 0;
var pos;
var matricies = {
mats:[]
}
var events = {
	userInputs:[]
}




// Set the initial camera view to look at Manhattan
var initialPosition = Cesium.Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 753);
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);

viewer.scene.camera.setView({
    destination: initialPosition,
    orientation: initialOrientation,
    endTransform: Cesium.Matrix4.IDENTITY
});

// Get the transform from local east-north-up at cartographic (-74.01881302800248, 40.69114333714821) to Earth's fixed frame.
var center = Cesium.Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821);
var locToGlobtransform = Cesium.Transforms.eastNorthUpToFixedFrame(center);

//Inverse: GlobToLoc
var transform = Cesium.Matrix4.inverse(locToGlobtransform,new Cesium.Matrix4());

// Load the NYC buildings tileset.
var tileset = new Cesium.Cesium3DTileset({ url: Cesium.IonResource.fromAssetId(5741) });
viewer.scene.primitives.add(tileset);

// Color buildings based on their height.
function colorByHeight() {
    tileset.style = new Cesium.Cesium3DTileStyle({
        color: {
            conditions: [
                ['${height} >= 300', 'rgba(45, 0, 75, 0.5)'],
                ['${height} >= 200', 'rgb(102, 71, 151)'],
                ['${height} >= 100', 'rgb(170, 162, 204)'],
                ['${height} >= 50', 'rgb(224, 226, 238)'],
                ['${height} >= 25', 'rgb(252, 230, 200)'],
                ['${height} >= 10', 'rgb(248, 176, 87)'],
                ['${height} >= 5', 'rgb(198, 106, 11)'],
                ['true', 'rgb(127, 59, 8)']
            ]
        }
    });
}


colorByHeight();


function scrollInput (e) {
	if(!rec){
		rec=true;
		startTime=Date.now();
	}
	if(rec){
	 pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
	 events.userInputs.push({ID:ida, Time: Date.now(), MouseDown: "Wheel", KeyboardDown: "None", Position: pos});
	 ida++;
	}
}

document.addEventListener('wheel', scrollInput);
document.addEventListener('mousewheel', scrollInput);
document.addEventListener('DOMMouseScroll', scrollInput);

var lastAnyDown = false;
var actAnyDown = false;

viewer.scene.postUpdate.addEventListener(function(s,t) {
	var actAnyDown = handler.anyButtonDown;
	akt = Date.now();
	//if(rec){
		if( akt-last>timeshift){
			if(akt-startTime>totalTime){
				save=true;
				startTime=Number.MAX_VALUE;
			}
			if(handler.isButtonDown(Cesium.CameraEventType.LEFT_DRAG)){
				if(!rec){
					rec=true;
					startTime=Date.now();
				}
				if(rec){
					pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
					events.userInputs.push({ID:ida, MatID:idm, Time: akt, MouseDown: "LeftDown", KeyboardDown: "None", Position: pos});
				}
			}
	
			if(handler.isButtonDown(Cesium.CameraEventType.RIGHT_DRAG)){
				if(!rec){
					rec=true;
					startTime=Date.now();
				}
				if(rec){
				pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
				events.userInputs.push({ID:ida, MatID:idm, Time: akt, MouseDown: "RightDown", KeyboardDown: "None", Position: pos});
				}
			}
	
			if(handler.isButtonDown(Cesium.CameraEventType.MIDDLE_DRAG)){
				if(!rec){
					rec=true;
					startTime=Date.now();
				}
				if(rec){
				pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
				events.userInputs.push({ID:ida, MatID:idm, Time: akt, MouseDown: "MiddleDown", KeyboardDown: "None", Position: pos});
				}
			}
	
			if(handler.isButtonDown(Cesium.CameraEventType.LEFT_DRAG, Cesium.KeyboardEventModifier.CTRL)||handler.isButtonDown(Cesium.CameraEventType.RIGHT_DRAG, Cesium.KeyboardEventModifier.CTRL)){
				if(!rec){
					rec=true;
					startTime=Date.now();
				}
				if(rec){
				pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
				events.userInputs.push({ID:ida, MatID:idm, Time: akt, MouseDown: "Left/RightDown", KeyboardDown: "Ctrl", Position: pos});
				}
			}
	
			if(handler.isButtonDown(Cesium.CameraEventType.LEFT_DRAG, Cesium.KeyboardEventModifier.SHIFT)){
				if(!rec){
					rec=true;
					startTime=Date.now();
				}
				if(rec){
				pos = Cesium.Cartesian2.clone(handler.currentMousePosition);
				events.userInputs.push({ID:ida, MatID:idm, Time: akt, MouseDown: "LeftDown", KeyboardDown: "Shift", Position: pos});
				}
			}
	
			
			if(rec){
				if((lastAnyDown==true)&&(actAnyDown==false)){
					ida++;
				}
				lastAnyDown=actAnyDown;
				
		
				var globCameraMatrix = Cesium.Matrix4.clone(viewer.camera.inverseViewMatrix);
				var locCameraMatrix= Cesium.Matrix4.clone(Cesium.Matrix4.multiply(transform,globCameraMatrix,new Cesium.Matrix4()));
				matricies.mats.push({ID:idm, Time: akt, globCameraMatrix, locCameraMatrix});
				last = akt;
				idm++;
			}
		}
	//}
	if(save){
		var jsonM = JSON.stringify(matricies);
		var jsonI = JSON.stringify(events);
		
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

		saveByteArray([sampleBytes], 'CameraMatrices.txt');

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

