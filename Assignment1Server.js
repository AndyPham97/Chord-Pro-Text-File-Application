//Server Code
var http = require('http');
var fs = require('fs');
var url = require('url');

var counter = 1000;

var ROOT_DIR = 'html';

var MIME_TYPES = {
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/plain'
};

var peacefulEasyFeeling = [];
var sisterGoldenHair = [];
var brownEyedGirl = [];

//Storing the original songs that were first changed to strings
var original = {
  "Peaceful Easy Feeling" : "",
               "Sister Golden Hair" : "",
               "Brown Eyed Girl" : ""
};

//Refers to the titles of the songs easier when wanting to read in the song files
var titles = ["Peaceful Easy Feeling", "Sister Golden Hair", "Brown Eyed Girl"];

//For storing in chords and lyrics after being modified through the convertSongs function
var songs = {"Peaceful Easy Feeling" : peacefulEasyFeeling,
             "Sister Golden Hair" : sisterGoldenHair,
             "Brown Eyed Girl" : brownEyedGirl
			 };

//Function for displaying chords above lyrics
function convertSongs(lyrics, nameOfSong) {
  var chords = [];
  var s = "";
  var e = "";

 for(var i = 0; i < lyrics.length; i++) {
   if (lyrics[i] == '\n')
     lyrics = lyrics.replace(lyrics[i], " ");
  else if (lyrics[i] == '[') {
    s = lyrics.indexOf('[');
    e = lyrics.indexOf(']');

    chords.push(lyrics.slice(s+1,e)); //Stores in the sliced out chords
    lyrics = lyrics.replace(lyrics.slice(s,e+1), "1"); //This marks where the chords are placed above

    s = "";
    e = "";
  }
 }

  lyrics = lyrics.split(" ");

  var h = 80; //Spacing for y-coordinate
  var w = 35; //Spacing for x-coordinate
  var chordW = 1 //Spacing for 2 or more chords on the same lyric
  var count = 0; //Counter for chord
  var word = "";


  for(i = 0; i < lyrics.length; i++) {
    word = lyrics[i];
      if (word.includes('1')) {
        chordW = 1;
        for(var j = 0; j < word.length; j++) {
          if (word[j] == '1') {
            songs[nameOfSong].push({word: chords[count], x: w + (chordW*80), y: h-40, type: "chord"}); //Stores in chord that is positioned above lyric accordingly
            word = word.replace(word[j],""); //Replaces the 1's with no spaces
            chordW++;
            count++; //To mark what chord we are using next in the chords array when it spots the next 1
          }
        }
        songs[nameOfSong].push({word: word, x:w, y: h, type: "lyric"}); //Stores in newly modified word with no 1's
      }

      else {
        songs[nameOfSong].push({word: word, x:w, y: h, type: "lyric"}); //Stores in every other lyric
      }

      if (w >= 800) { //If width of line reaches 800 or higher, make new line
        w = 35;
        h += 80;
      }
      w += 25*(word.length); //Spaces out every lyric
  }
}



var get_mime = function(filename) {
    var ext, type;
    for (ext in MIME_TYPES) {
        type = MIME_TYPES[ext];
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return type;
        }
    }
    return MIME_TYPES["txt"];
};

http.createServer(function (request,response){
var songsPath = "songs/"; //Directory for where songs are

fs.readFile(songsPath + titles[0] + ".txt", function(err, data) {
  if (err) throw err;

  var song = "";

  song = data.toString();
  song = song.replace("Peaceful Easy Feeling  -Jack Tempchin", "");
  original[titles[0]] = song;
  });

  fs.readFile(songsPath + titles[1] + ".txt", function(err, data) {
  if (err) throw err;

  var song = "";

  song = data.toString();
  song = song.replace("Sister Golden Hair -America\nverse1:", "");
  original[titles[1]] = song;
});

  fs.readFile(songsPath + titles[2] + ".txt", function(err, data) {
  if (err) throw err;

  var song = "";

  song = data.toString();
  song = song.replace("BROWN EYED GIRL         VAN MORRISON", "");
  original[titles[2]] = song;
});


     var urlObj = url.parse(request.url, true, false);
     console.log('\n============================');
	 console.log("PATHNAME: " + urlObj.pathname);
     console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
     console.log("METHOD: " + request.method);

     var receivedData = '';

     //attached event handlers to collect the message data
     request.on('data', function(chunk) {
        receivedData += chunk;
     });


	 //event handler for the end of the message
     request.on('end', function(){
        console.log('received data: ', receivedData);
        console.log('type: ', typeof receivedData);


		//if it is a POST request then echo back the data.
		if(request.method == "POST") {
		   var dataObj = JSON.parse(receivedData);

           console.log('received data object: ', dataObj);
           console.log('type: ', typeof dataObj);

		   console.log("USER REQUEST: " + dataObj.text );
       var returnObj = {};

       for(var k in songs) {
         if (k == dataObj.text) { //If user requests equals the stored songs, convert the song and store them in the returnObj
           convertSongs(original[k], k);
          returnObj.wordArray = songs[k];
        }
       }

		   //object to return to client
          response.writeHead(200, {"Content-Type": MIME_TYPES["txt"]});  //does not work with application/json MIME
           response.end(JSON.stringify(returnObj)); //send just the JSON object
      }
    });

     if(request.method == "GET"){
	 //handle GET requests as static file requests
	 var filePath = ROOT_DIR + urlObj.pathname;
	 if(urlObj.pathname === '/') filePath = ROOT_DIR + '/assignment1.html';

     fs.readFile(filePath, function(err,data){
       if(err){
		  //report error to console
          console.log('ERROR: ' + JSON.stringify(err));
		  //respond with not found 404 to client
          response.writeHead(404);
          response.end(JSON.stringify(err));
          return;
         }
         response.writeHead(200, {"Content-Type": get_mime(filePath)});
         response.end(data);
       });
	 }


 }).listen(3000);

console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');
