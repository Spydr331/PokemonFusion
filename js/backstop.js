var pokeObject = [];
var $baseObject;
var $containObject;

var imageWidth = 80;
var imageHeight = 80;
var visualScale = 4;


// Updating the pokemon Id with number of digits
function padId (str, max) {
  str = str.toString();
  return str.length < max ? padId("0" + str, max) : str;
}

// Loading all images with direct variables for canvas and context
function loadImage ($curElement, pokeId) {
  var $canvas = $curElement.find("canvas");
  var canvas = $canvas.get(0);
  var canvasOffset = $canvas.offset();
  var offsetX = canvasOffset.left;
  var offsetY = canvasOffset.top;
  var context = canvas.getContext("2d");

  canvas.width = imageWidth*visualScale;
  canvas.height = imageHeight*visualScale;

  context.clearRect(0, 0, canvas.width, canvas.height);

  var img1 = new Image();

  img1.src = "images/Sprite_" + padId(pokeId, 3) + ".png";
  img1.onload = function () {
    //draw background image
    context.imageSmoothingEnabled = false;
    context.drawImage(img1, 0, 0, img1.width*visualScale, img1.height*visualScale);
  }
}


// Loading all images with direct variables for canvas and context
function loadFusionImages ($curElement, poke) {
  var $canvas = $curElement.find("canvas");
  var canvas = $canvas.get(0);
  var canvasOffset = $canvas.offset();
  var offsetX = canvasOffset.left;
  var offsetY = canvasOffset.top;
  var context = canvas.getContext("2d");

  canvas.width = imageWidth*visualScale;
  canvas.height = imageHeight*visualScale;

  context.clearRect(0, 0, canvas.width, canvas.height);

  var img1 = new Image();
  var img2 = new Image();

  img1.src = "images/Body_" + padId(poke.id, 3) + ".png";
  img2.src = "images/Face_" + padId(poke.id, 3) + ".png";

    $canvas.after(img1);
      $canvas.after(img2);

  img1.onload = function () {
    img2.onload = function () {
      loadFusion (poke, img1, img2, context);
    }
  }
}

function loadFusion (poke, img1, img2, context) {
  //draw background image
  context.imageSmoothingEnabled = false;
  context.drawImage(img1, 0, 0, img1.width*visualScale, img1.height*visualScale);

  var positionX = poke.headOrigin.x*visualScale - poke.faceOrigin.x * imageWidth*visualScale;
  var positionY = poke.headOrigin.y*visualScale - poke.faceOrigin.y * imageHeight*visualScale;

  context.drawImage(img2, positionX, positionY, img2.width*visualScale, img2.height*visualScale);
}

$(document).ready(function(){
  $containObject = $(".pokemonSection").first().parent();
  $baseObject = $containObject.find(".pokemonSection").clone();

  // Load full pokemon object
  $.getJSON( "js/pokemon.json", function( data ) {
    $.each( data, function( key, val ) {
      //pokeObject.push( val );
        if(val.id < 0)
          return;

        var $temp = $baseObject.clone();

        if($containObject.hasClass("ReferenceSection"))
          loadImage($temp, val.id);
        else
          loadFusionImages($temp, val);

        $containObject.append($temp);
    });
  }).fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
  });
});
