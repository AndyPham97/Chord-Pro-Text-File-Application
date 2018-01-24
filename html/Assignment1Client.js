//Client Code
var words = [];
var wordBeingMoved;
var deltaX, deltaY; //location where mouse is pressed
var canvas = document.getElementById('canvas1'); //our drawing canvas


function getWordAtLocation(aCanvasX, aCanvasY){

    var ctx = canvas.getContext('2d');
	  for(var i=0; i<words.length; i++){
		 if((words[i].x <= aCanvasX && aCanvasX <= words[i].x + ctx.measureText(words[i].word).width) &&
		    (words[i].y >= aCanvasY && aCanvasY >= words[i].y - parseInt(ctx.font))) {
        return words[i];
      }
	  }
	  return null;
}


var drawCanvas = function(){

    var context = canvas.getContext('2d');

    context.fillStyle = 'white';
    context.fillRect(0,0,canvas.width,canvas.height); //erase canvas

    context.font = '25pt Arial';

    for(var i=0; i<words.length; i++){
			var data = words[i];
      if (data.type == "chord") {
        context.fillStyle = 'chartreuse';
        context.strokeStyle = 'green';
			  context.fillText(data.word, data.x, data.y);
        context.strokeText(data.word, data.x, data.y);
      }
      else {
        context.fillStyle = 'cornflowerblue';
        context.strokeStyle = 'blue';
			  context.fillText(data.word, data.x, data.y);
        context.strokeText(data.word, data.x, data.y);
          }
	}
}

function handleMouseDown(e){

	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
    var canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
    var canvasY = e.pageY - rect.top;
	console.log("mouse down:" + canvasX + ", " + canvasY);

  wordBeingMoved = getWordAtLocation(canvasX, canvasY);

	if(wordBeingMoved != null ){
	   deltaX = wordBeingMoved.x - canvasX;
	   deltaY = wordBeingMoved.y - canvasY;

	$("#canvas1").mousemove(handleMouseMove);
	$("#canvas1").mouseup(handleMouseUp);

	}

    // Stop propagation of the event and stop any default
    //  browser action

    e.stopPropagation();
    e.preventDefault();

	drawCanvas();
	}

function handleMouseMove(e){

	console.log("mouse move");

	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
    var canvasX = e.pageX - rect.left;
    var canvasY = e.pageY - rect.top;

    wordBeingMoved.x = canvasX + deltaX;
    wordBeingMoved.y = canvasY + deltaY;

	e.stopPropagation();

	drawCanvas();
	}

  function handleMouseUp(e){
  	console.log("mouse up");

  	e.stopPropagation();

      $("#canvas1").off("mousemove", handleMouseMove); //remove mouse move handler
      $("#canvas1").off("mouseup", handleMouseUp); //remove mouse up handler

  	drawCanvas(); //redraw the canvas
  }

  var ENTER = 13;


function handleKeyUp(e) {
	if(e.which == ENTER){
	   handleOpenButton(); //treat ENTER key like you would a submit
	   $('#userTextField').val(''); //clear the user text field
	}

	e.stopPropagation();
    e.preventDefault();
}


function handleOpenButton () {

    var userText = $('#userTextField').val(); //get text from user text input field
	if(userText && userText != ''){
	   //user text was not empty
	   var userRequestObj = {text: userText}; //make object to send to server
       var userRequestJSON = JSON.stringify(userRequestObj); //make json string
	   $('#userTextField').val(''); //clear the user text field

	   //Prepare a POST message for the server and a call back function
	   //to catch the server repsonse.
       //alert ("You typed: " + userText);
	   $.post("userText", userRequestJSON, function(data, status){
			console.log("data: " + data);
			console.log("typeof: " + typeof data);
			var responseObj = JSON.parse(data);

      if(responseObj.wordArray) words = responseObj.wordArray;
			});
	}
}

function handleSubmitButton() {

}

$(document).ready(function(){

	//add mouse down listener to our canvas object
	$("#canvas1").mousedown(handleMouseDown);

	//add key handler for the document as a whole, not separate elements.
	$(document).keyup(handleKeyUp);

	drawCanvas();
});
