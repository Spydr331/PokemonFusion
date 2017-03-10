var inputObjects = {
  'selectPokemon1': $("#selectPokemon1"),
  'selectPokemon2': $("#selectPokemon2"),
  'btnAddImage': $("#btnAddImage"),
  'btnSwitch': $("#btnSwitch"),
  'btnLoad1': $("#btnLoad1"),
  'btnLoad2': $("#btnLoad2"),
  'veil': $(".veil")
}

var pokeObject = [];

var selPokemonId1 = null;
var selPokemon1 = null;
var selPokemonId2 = null;
var selPokemon2 = null;

var imageLoaded1 = false;
var imageLoaded2 = false;

var canvas = document.querySelector("canvas");
var context = canvas.getContext("2d");

var imageWidth = 80;
var imageHeight = 80;
var paletteCount = 5;
var calcScale = 3;
var canvasWidth = imageWidth*calcScale*2;
var canvasHeight = imageHeight*calcScale*2;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

var img1 = new Image();
var img2 = new Image();

function getPokeById (id) {
  var result = $.grep(pokeObject, function(e){ return e.id == id; });
  return result[0];
}

// Updating the pokemon Id with number of digits
function padId (str, max) {
  str = str.toString();
  return str.length < max ? padId("0" + str, max) : str;
}

function loadImages (imageURL1, imageURL2) {
  inputObjects.veil.fadeIn();
  context.clearRect(0, 0, canvas.width, canvas.height);

  img1 = new Image();
  img2 = new Image();

  img1.src = imageURL1;
  img2.src = imageURL2;

  img1.onload = function () {
    imageLoaded1 = true;
    loadFusion ();
  }

  img2.onload = function () {
    imageLoaded2 = true;
    loadFusion ();
  }
}

// Initial load of image and default object
function loadImage (imageURL) {
  inputObjects.veil.fadeIn();
  context.clearRect(0, 0, canvas.width, canvas.height);

  img1 = new Image();

  img1.src = imageURL;
  img1.onload = function () {
    //draw background image
    context.imageSmoothingEnabled = false;
    context.drawImage(img1, canvasWidth/4, canvasHeight/4, img1.width*calcScale, img1.height*calcScale);
    inputObjects.veil.fadeOut();
  }
}

function loadFusion () {
  // Draw Body Image
  context.imageSmoothingEnabled = false;
  context.drawImage(img1, canvasWidth/4, canvasHeight/4, img1.width*calcScale, img1.height*calcScale);

  selPokemonId1 = inputObjects.selectPokemon1.val();
  selPokemonId2 = inputObjects.selectPokemon2.val();

  selPokemon1 = getPokeById(selPokemonId1);
  selPokemon2 = getPokeById(selPokemonId2);

  // Get Ratio to Size Images evenly
  var displayWidthRatio = (selPokemon1.headSize.w / selPokemon2.faceSize.w);
  var displayHeightRatio = (selPokemon1.headSize.h / selPokemon2.faceSize.h);

  // Get start position for face
  var positionX = canvasWidth/4 + selPokemon1.headOrigin.x*calcScale - selPokemon2.faceOrigin.x * displayWidthRatio*calcScale;
  var positionY = canvasHeight/4 + selPokemon1.headOrigin.y*calcScale - selPokemon2.faceOrigin.y * displayHeightRatio*calcScale;

  // Swap colors
  replacePalette(selPokemon1, selPokemon2);

  // Get most recent pokemon o load
  createCookie("Pokemon1",selPokemonId1,1);
  createCookie("Pokemon2",selPokemonId2,1);

  context.save();

  // Direction check to swap image context
  if(selPokemon1.direction != selPokemon2.direction)
     context.scale(-1, 1);

  context.drawImage(img2, -(img2.width*displayWidthRatio*calcScale) - positionX, positionY, img2.width*displayWidthRatio*calcScale, img2.height*displayHeightRatio*calcScale);

  context.restore();

  inputObjects.veil.fadeOut();
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function replaceColor (oldHex, newHex) {
  if(oldHex[0] != "#" || newHex[0] != "#")
    return;

  var oldRGB = hexToRgb(oldHex);
  var newRGB = hexToRgb(newHex);

  // pull the entire image into an array of pixel data
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // examine every pixel, change any old rgb to the new-rgb
  for (var i=0;i<imageData.data.length;i+=4) {
    // is this pixel the old rgb?
    if(imageData.data[i]==oldRGB.r &&
     imageData.data[i+1]==oldRGB.g &&
     imageData.data[i+2]==oldRGB.b
    ){
      // change to your new rgb
      imageData.data[i]=newRGB.r;
      imageData.data[i+1]=newRGB.g;
      imageData.data[i+2]=newRGB.b;
    }
  }
  // put the altered data back on the canvas
  context.putImageData(imageData,0,0);
}

function replaceColors (paletteCur, paletteNew) {
  // Cycle through colors and replace
  for(var i = 0; i < paletteCount; i++) {
    replaceColor(paletteCur[i], paletteNew[i]);
  }
}

function replacePalette (pokeImage, pokePalette) {

  //TODO: Check for repeats and handle

  //update colors of primary colors
  if(!pokeImage.primaryCheck || pokeImage.primaryCheck == pokePalette.primaryCheck)
    replaceColors(pokeImage.primary, pokePalette.primary);

  //update colors of secondary colors
  if(!pokeImage.secondaryCheck || pokeImage.secondaryCheck == pokePalette.secondaryCheck)
    replaceColors(pokeImage.secondary, pokePalette.secondary);

  //update colors of tertiary colors
  if(!pokeImage.tertiaryCheck || pokeImage.tertiaryCheck == pokePalette.tertiaryCheck)
    replaceColors(pokeImage.tertiary, pokePalette.tertiary);

  //update colors of quaternary colors
  if(!pokeImage.quaternaryCheck || pokeImage.quaternaryCheck == pokePalette.quaternaryCheck)
    replaceColors(pokeImage.quaternary, pokePalette.quaternary);
}

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

$(document).ready(function(){
  // Load full pokemon object
  $.getJSON( "js/pokemon.json", function( data ) {
    $.each( data, function( key, val ) {
      pokeObject.push( val );

       if(val.id > 0) {
        inputObjects.selectPokemon1.append('<option value="' + val.id + '">' + val.name + '</option>');
        inputObjects.selectPokemon2.append('<option value="' + val.id + '">' + val.name + '</option>');
      }
    });
  }).fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
  }).done(function(){

      inputObjects.selectPokemon1.val(readCookie("Pokemon1"));
      inputObjects.selectPokemon2.val(readCookie("Pokemon2"));
  });

  inputObjects.btnAddImage.on("click", function() {
    loadImages("images/Body_" + padId(inputObjects.selectPokemon1.val(), 3) + ".png", "images/Face_" + padId(inputObjects.selectPokemon2.val(), 3) + ".png");
  });

  inputObjects.btnSwitch.on("click", function() {
    var temp = inputObjects.selectPokemon1.val();

    inputObjects.selectPokemon1.val(inputObjects.selectPokemon2.val());
    inputObjects.selectPokemon2.val(temp);
  });

  inputObjects.btnLoad1.on("click", function() {
    loadImage("images/Sprite_" + padId(inputObjects.selectPokemon1.val(), 3) + ".png");
  });

  inputObjects.btnLoad2.on("click", function() {
    loadImage("images/Sprite_" + padId(inputObjects.selectPokemon2.val(), 3) + ".png");
  });
});
