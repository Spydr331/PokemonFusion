var inputObjects = {
  'selectPokemon': $("#selectPokemon"),
  'btnShowFaceOrigin': $("#btnShowFaceOrigin"),
  'btnShowHeadOrigin': $("#btnShowHeadOrigin"),
  'btnLoadFace': $("#btnLoadFace"),
  'btnLoadBody': $("#btnLoadBody"),
  'btnLoadSprite': $("#btnLoadSprite"),
  'btnShowData': $("#btnShowData"),
  'btnNewPokemon': $("#btnNewPokemon"),
  'btnLoadFuse': $("#btnLoadFuse"),
  'btnLoad': $("#btnLoad"),
  'txtPokemonID': $("#txtPokemonID"),
  'txtPokemonName': $("#txtPokemonName"),
  'selPokemonDirection': $("#selPokemonDirection"),
  'primary0': $("#primary0"),
  'primary1': $("#primary1"),
  'primary2': $("#primary2"),
  'primary3': $("#primary3"),
  'primary4': $("#primary4"),
  'secondary0': $("#secondary0"),
  'secondary1': $("#secondary1"),
  'secondary2': $("#secondary2"),
  'secondary3': $("#secondary3"),
  'secondary4': $("#secondary4"),
  'tertiary0': $("#tertiary0"),
  'tertiary1': $("#tertiary1"),
  'tertiary2': $("#tertiary2"),
  'tertiary3': $("#tertiary3"),
  'tertiary4': $("#tertiary4"),
  'quaternary0': $("#quaternary0"),
  'quaternary1': $("#quaternary1"),
  'quaternary2': $("#quaternary2"),
  'quaternary3': $("#quaternary3"),
  'quaternary4': $("#quaternary4"),
  'primaryCheck': $("#primaryCheck"),
  'secondaryCheck': $("#secondaryCheck"),
  'tertiaryCheck': $("#tertiaryCheck"),
  'quaternaryCheck': $("#quaternaryCheck"),
  'faceSizew': $("#faceSizew"),
  'faceSizeh': $("#faceSizeh"),
  'faceOriginx': $("#faceOriginx"),
  'faceOriginy': $("#faceOriginy"),
  'headSizew': $("#headSizew"),
  'headSizeh': $("#headSizeh"),
  'headOriginx': $("#headOriginx"),
  'headOriginy': $("#headOriginy"),
  'textareaJson': $("#textareaJson"),
  'inputColor': $(".input-color"),
  'inputPositionAndSize': $(".input-position, .input-size"),
  'inputCheckboxes': $(".input-check"),
  'veil': $(".veil")
}

// Resusable Variables
var pokeObject = [];
var selPokemonId = null;
var selPokemon = null;
var curElm1 = null;
var curElmx = null;
var curElmy = null;
var curElmw = null;
var curElmh = null;
var idText = null;

// Canvas Variables
var canvas = document.querySelector("canvas");
var canvasOffset = $(canvas).offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;
var context = canvas.getContext("2d");
var startX;
var startY;
var isDown=false;

var img1 = new Image();
var img2 = new Image();

// Control Checks
var eyedropperIsActive = false;
var positionAndSizeIsActive = false;

// Size defaults
var imageWidth = 80;
var imageHeight = 80;
var visualScale = 8;
canvas.width = imageWidth*visualScale;
canvas.height = imageHeight*visualScale;

// Get Pokemon Object Id
function getPokeById (id) {
  var result = $.grep(pokeObject, function(e){ return e.id == id; });
  return result[0];
}

// Updating the pokemon Id with number of digits
function padId (str, max) {
  str = str.toString();
  return str.length < max ? padId("0" + str, max) : str;
}

// Initial load of image and default object
function loadImage (imageURL, pokemonId) {
  inputObjects.veil.fadeIn();
  context.clearRect(0, 0, canvas.width, canvas.height);

  img1 = new Image();

  selPokemon = getPokeById(pokemonId);

  clearFields();
  if(selPokemon)
    loadObject(selPokemon);
  else
    newObject(pokemonId);

  img1.src = imageURL;
  img1.onload = function () {
    //draw background image
    context.imageSmoothingEnabled = false;
    context.drawImage(img1, 0, 0, img1.width*visualScale, img1.height*visualScale);
    inputObjects.veil.fadeOut();
  }
}

function newObject(newId) {
  selPokemon = getPokeById(-1);
  selPokemonId = newId;
  selPokemon.id = newId;
}

// Return pixel color at mouse position
function getPixelColor(x, y) {
  var pxData = context.getImageData(x, y, 1, 1);
  return (rgbToHex(pxData.data[0], pxData.data[1], pxData.data[2]) );
}

// Convert R, G, or B component
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

// Convert RGB to HEX
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Handle the positioning of the mouse on the canvas
function handleMouseMove(e) {
  if (!eyedropperIsActive && !positionAndSizeIsActive) {
      return;
  }

  // Fix offset of cursor
  mouseX = parseInt(e.clientX - offsetX);
  mouseY = parseInt(e.clientY - offsetY);

  // Put your mousemove stuff here
  // Return Color to textbox
  if (eyedropperIsActive) {
    addColor(curElm1, getPixelColor(mouseX, mouseY));
  }

  // Return Size and Position to textbox
  if(positionAndSizeIsActive && isDown) {
    var curW = mouseX - startX;
    var curH = mouseY - startY;
    var curX = startX;
    var curY = startY;

    if(curW < 0) {
      curW = Math.abs(curW);
      curX = mouseX;
    }
    if(curH < 0){
      curH = Math.abs(curH);
      curY = mouseY;
    }

    curElmx.val(Math.floor( curX / visualScale ));
    curElmy.val(Math.floor( curY / visualScale ));

    selPokemon[idText.substring(0, 4) + "Origin"].x = parseInt(curElmx.val());
    selPokemon[idText.substring(0, 4) + "Origin"].y = parseInt(curElmy.val());

    var tempW = Math.floor( curW / visualScale);
    var tempH = Math.floor( curH / visualScale);

    inputObjects.faceSizew.val(tempW);
    inputObjects.faceSizeh.val(tempH);
    inputObjects.headSizew.val(tempW);
    inputObjects.headSizeh.val(tempH);

    selPokemon["faceSize"].w = tempW;
    selPokemon["faceSize"].h = tempH;
    selPokemon["headSize"].w = tempW;
    selPokemon["headSize"].h = tempH;

    showSizeAndPosition(startX, startY, (mouseX - startX), (mouseY - startY));
  }
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

function loadFusion () {
  //draw background image
  context.imageSmoothingEnabled = false;
  context.drawImage(img1, 0, 0, img1.width*visualScale, img1.height*visualScale);

  var fuseSelf1 = getPokeById(selPokemonId);
  var fuseSelf2 = getPokeById(selPokemonId);

  var displayWidthRatio = (fuseSelf1.headSize.w / fuseSelf2.faceSize.w);
  var displayHeightRatio = (fuseSelf1.headSize.h / fuseSelf2.faceSize.h);

  var positionX = fuseSelf1.headOrigin.x*visualScale - fuseSelf2.faceOrigin.x * displayWidthRatio*visualScale;
  var positionY = fuseSelf1.headOrigin.y*visualScale - fuseSelf2.faceOrigin.y * displayHeightRatio*visualScale;

  context.drawImage(img2, positionX, positionY, img2.width*displayWidthRatio*visualScale, img2.height*displayHeightRatio*visualScale);
  inputObjects.veil.fadeOut();
}

function handleMouseUp(e) {
  if (eyedropperIsActive) {
    selPokemon[idText.substring(0, idText.length - 1)][idText[idText.length - 1]] = curElm1.val();
  } else if(positionAndSizeIsActive) {
    isDown=false;
  }

  disableAllFields();
}

function handleMouseDown(e) {
  if (positionAndSizeIsActive) {
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // Put your mousedown stuff here
    startX=mouseX;
    startY=mouseY;
    isDown=true;
  }
}

// Place circle on location
function showSizeAndPosition(x,y,w,h){
  var BB=canvas.getBoundingClientRect();

  var pointX = x-BB.left;
  var pointY = y-BB.top;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img1, 0, 0, img1.width*visualScale, img1.height*visualScale);

  context.beginPath();
  context.rect(pointX,pointY,w,h);
  context.stroke();
}

// Load textboxes from the Object
function loadObject(pokemon) {
  addColor(inputObjects.primary0, pokemon.primary[0]);
  addColor(inputObjects.primary1, pokemon.primary[1]);
  addColor(inputObjects.primary2, pokemon.primary[2]);
  addColor(inputObjects.primary3, pokemon.primary[3]);
  addColor(inputObjects.primary4, pokemon.primary[4]);

  addColor(inputObjects.secondary0, pokemon.secondary[0]);
  addColor(inputObjects.secondary1, pokemon.secondary[1]);
  addColor(inputObjects.secondary2, pokemon.secondary[2]);
  addColor(inputObjects.secondary3, pokemon.secondary[3]);
  addColor(inputObjects.secondary4, pokemon.secondary[4]);

  addColor(inputObjects.tertiary0, pokemon.tertiary[0]);
  addColor(inputObjects.tertiary1, pokemon.tertiary[1]);
  addColor(inputObjects.tertiary2, pokemon.tertiary[2]);
  addColor(inputObjects.tertiary3, pokemon.tertiary[3]);
  addColor(inputObjects.tertiary4, pokemon.tertiary[4]);

  addColor(inputObjects.quaternary0, pokemon.quaternary[0]);
  addColor(inputObjects.quaternary1, pokemon.quaternary[1]);
  addColor(inputObjects.quaternary2, pokemon.quaternary[2]);
  addColor(inputObjects.quaternary3, pokemon.quaternary[3]);
  addColor(inputObjects.quaternary4, pokemon.quaternary[4]);

  inputObjects.faceSizew.val(pokemon.faceSize.w);
  inputObjects.faceSizeh.val(pokemon.faceSize.h);
  inputObjects.headSizew.val(pokemon.headSize.w);
  inputObjects.headSizeh.val(pokemon.headSize.h);

  inputObjects.faceOriginx.val(pokemon.faceOrigin.x);
  inputObjects.faceOriginy.val(pokemon.faceOrigin.y);
  inputObjects.headOriginx.val(pokemon.headOrigin.x);
  inputObjects.headOriginy.val(pokemon.headOrigin.y);

  inputObjects.txtPokemonID.val(pokemon.id);
  inputObjects.txtPokemonName.val(pokemon.name);
  inputObjects.selPokemonDirection.val(pokemon.direction);

  inputObjects.primaryCheck.checked = pokemon.primaryCheck;
  inputObjects.secondaryCheck.checked = pokemon.secondaryCheck;
  inputObjects.tertiaryCheck.checked = pokemon.tertiaryCheck;
  inputObjects.quaternaryCheck.checked = pokemon.quaternaryCheck;
}

// Add color to textbox
function addColor (input, color) {
  input.val(color).css("border", "2px solid " + color);
}

// Place current Json object into textarea
function showJson() {
  selPokemon.id = inputObjects.txtPokemonID.val();
  selPokemon.name = inputObjects.txtPokemonName.val();
  selPokemon.direction = inputObjects.selPokemonDirection.val();

  var str = JSON.stringify(selPokemon, undefined, 2);

  // display pretty printed object in text area:
  inputObjects.textareaJson.val(str);
}

function clearFields () {
  inputObjects.selectPokemon.val();
  inputObjects.txtPokemonName.val("");
  inputObjects.inputColor.val("");
  inputObjects.inputPositionAndSize.val("");
}

function disableAllFields () {
  inputObjects.inputColor.removeClass("active");
  inputObjects.inputPositionAndSize.removeClass("active");

  eyedropperIsActive = false;
  positionAndSizeIsActive = false;
  idText = null;
}

// Get the ID of the pokemon by the textboxes filled (fix for new pokemon button)
function getIDfromFields () {
  var tempID = inputObjects.txtPokemonID.val();

  if(tempID == null || tempID == "" || tempID <= 0)
    tempID = inputObjects.selectPokemon.val();

  return tempID;
}

$(document).ready(function(){
  // Load full pokemon object
  $.getJSON( "js/pokemon.json", function( data ) {
    $.each( data, function( key, val ) {
      pokeObject.push( val );

      if(val.id > 0)
        inputObjects.selectPokemon.prepend('<option value="' + val.id + '">' + val.id + '. ' + val.name + '</option>');
    });
  }).fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
  });

  // Autoselect textarea
  inputObjects.textareaJson.on("click", function () {
    this.select();
  });

  // Fill textarea
  inputObjects.btnShowData.on("click", function () {
    showJson();
  });

  // Activate canvas for color picker, selecting current element
  inputObjects.inputColor.on("click", function() {
    disableAllFields();
    if(eyedropperIsActive) {
      eyedropperIsActive = false;
    } else {
      curElm1 = $(this);
      idText = curElm1.attr("id");
      eyedropperIsActive = true;
    }
  });

  inputObjects.selectPokemon.on("change", function(){
    inputObjects.txtPokemonID.val("");
  });

  // Include mouse events for canvas
  $(canvas).on("mousemove", function (e) {
    handleMouseMove(e);
  }).on("mouseup", function (e) {
    handleMouseUp(e);
  }).on("mousedown", function (e) {
    handleMouseDown(e);
  });

  inputObjects.btnLoad.on("click", function() {
    selPokemonId = getIDfromFields();
    loadImage("images/Sprite_" + padId(selPokemonId, 3) + ".png", selPokemonId);
  });

  inputObjects.btnLoadFace.on("click", function() {
    selPokemonId = getIDfromFields();
    loadImage("images/Face_" + padId(selPokemonId, 3) + ".png", selPokemonId);
  });

  inputObjects.btnLoadBody.on("click", function() {
    selPokemonId = getIDfromFields();
    loadImage("images/Body_" + padId(selPokemonId, 3) + ".png", selPokemonId);
  });

  inputObjects.btnLoadSprite.on("click", function() {
    selPokemonId = getIDfromFields();
    loadImage("images/Sprite_" + padId(selPokemonId, 3) + ".png", selPokemonId);
  });

  inputObjects.btnNewPokemon.on("click", function(){
    var tempId = prompt("Please Enter the next Pokemon ID", "");

    loadImage("images/Sprite_" + padId(tempId, 3) + ".png", tempId);
    inputObjects.txtPokemonID.val(parseInt(tempId));
  });

  // Color only if both colors have matching "external" tags for an external area
  inputObjects.inputCheckboxes.on("change", function() {
    var id = $(this).attr("id");

    selPokemon[id] = this.checked
  });

  // On clicking the input for the position / size of the face or head, activate a box drawing control on canvas
  inputObjects.inputPositionAndSize.on("click", function() {
    disableAllFields();

    if(positionAndSizeIsActive) {
      positionAndSizeIsActive = false;
    } else {
      idText = $(this).attr("id");

      curElmx = $("#" + idText.substring(0, 4) + "Originx").addClass("active");
      curElmy = $("#" + idText.substring(0, 4) + "Originy").addClass("active");
      curElmw = $("#" + idText.substring(0, 4) + "Sizew").addClass("active");
      curElmh = $("#" + idText.substring(0, 4) + "Sizeh").addClass("active");

      positionAndSizeIsActive = true;
    }
  });

  // Show a box with the face origin box (should load face image)
  inputObjects.btnShowFaceOrigin.on("click", function() {
    if(selPokemonId != null) {
      selPokemon["faceOrigin"].x = inputObjects.faceOriginx.val();
      selPokemon["faceOrigin"].y = inputObjects.faceOriginy.val();
      showSizeAndPosition(selPokemon.faceOrigin.x * visualScale, selPokemon.faceOrigin.y * visualScale, selPokemon.faceSize.w * visualScale, selPokemon.faceSize.h * visualScale);
    }
  });

  // Show a box with the head origin box (should load body image)
  inputObjects.btnShowHeadOrigin.on("click", function() {
    if(selPokemonId != null) {
      selPokemon["headOrigin"].x = inputObjects.headOriginx.val();
      selPokemon["headOrigin"].y = inputObjects.headOriginy.val();
      showSizeAndPosition(selPokemon.headOrigin.x * visualScale, selPokemon.headOrigin.y * visualScale, selPokemon.headSize.w * visualScale, selPokemon.headSize.h * visualScale);
    }
  });

  // Check the position of the head and face to make sure they match
  inputObjects.btnLoadFuse.on("click", function() {
    if(selPokemonId != null) {
      positionAndSizeIsActive = false;
      eyedropperIsActive = false;

      inputObjects.inputColor.removeClass("active");
      inputObjects.inputPositionAndSize.removeClass("active");

      selPokemon["faceSize"].w = inputObjects.faceSizew.val();
      selPokemon["faceSize"].h = inputObjects.faceSizeh.val();
      selPokemon["headSize"].w = inputObjects.headSizew.val();
      selPokemon["headSize"].h = inputObjects.headSizeh.val();

      selPokemon["faceOrigin"].x = inputObjects.faceOriginx.val();
      selPokemon["faceOrigin"].y = inputObjects.faceOriginy.val();
      selPokemon["headOrigin"].x = inputObjects.headOriginx.val();
      selPokemon["headOrigin"].y = inputObjects.headOriginy.val();

      loadImages("images/Body_" + padId(selPokemonId, 3) + ".png", "images/Face_" + padId(selPokemonId, 3) + ".png");
    }
  });
});

//TODO Make image inspector and use backstop to check
//TODO Investigate head size classes (small , medium instead of pixel size);
//TODO Change color only if both colors have matching "external" tags for an external area
//http://jsoneditoronline.org/
