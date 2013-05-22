window.addEventListener('load', load, false); //Add event on page load.
var json = {};
json.files = [];
var container, dropbox, fileInput;
	
function load() {
	//create references to DOM elements
	dropbox = document.getElementById('dropbox');
	fileInput = document.getElementById('fileInput');
	container = document.getElementById('container');
	
	if(!Modernizr.draganddrop){
		printMsg("Sorry, your browser doesn't support Drag and Drop.");
	}
	if(typeof window.FileReader === 'undefined') {
		printMsg("Sorry, your browser doesn't support FileReader");
		fileInput.setAttribute('disabled', 'disabled');
	}

	//Change on #uploadBtn
	fileInput.addEventListener('change', 
		function(evt){
			var files = this.files;
			handleFiles(files);
		}, false
	);

	//Release on dragging area
	dropbox.addEventListener('drop', 
		function(evt){
			evt.stopPropagation();
			evt.preventDefault();
			var files = evt.dataTransfer.files;
			handleFiles(files);
		}, false
	);	
	
	//During dragging
	dropbox.addEventListener('dragenter', 
		function(evt){
			evt.stopPropagation();
			evt.preventDefault();
			this.classList.add('enter');
		}, false
	);
	
	//While cursor is in dragging area
	dropbox.addEventListener('dragover', 
		function(evt){
			evt.stopPropagation();
			evt.preventDefault();
			this.classList.add('enter');
		}, false
	);
		
	dropbox.addEventListener('dragleave', 
		function(evt){
			this.classList.remove('enter');
		}, false
	);

	dropbox.addEventListener('mouseleave', 
		function(evt){
			this.classList.remove('enter');
		}, false
	);
}

function handleFiles(files){
	disableUploadBtn();
	var regex = /image\/jpeg/;

	//Refers to the last ul element, or create a new ul element
	var ul = container.getElementsByTagName('ul')[0] ? container.getElementsByTagName('ul')[0] : document.createElement('ul');
	
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		
		//excludes directory from selection
		if(!file.type) { 
			continue; 
		}
			
		var li = document.createElement('li');
		li.classList.add('file-item'); //add css class to the current li
		var tn = ''; //li content
		
		if (!file.type.match(regex)) {
			tn = '<span class="filename">' + file.name + '</span>';
			tn += '<br />MimeType: ' + file.type;
			tn += '<br />This file type is not allowed';
			li.classList.add('not-allowed');
			
		} else if (file.size > 1048000) {
			tn = '<span class="filename">' + file.name + ' ' + file.size + '</span>';
			tn += '<br />MimeType: ' + file.type;
			tn += '<br />File size exceeding 1Mb';
			li.classList.add('not-allowed-size');
			
		} else {
    		var myfile = {};
    		myfile.name = file.name;
    		myfile.type = file.type;
    		myfile.size = file.size;
    		
			var reader = new FileReader();
			reader.onload = (function(tmp){
				return function(e){ tmp.file = e.target.result; };
			})(myfile);
			reader.readAsDataURL(file);
			
			console.log(myfile);
			
			tn = '<span class="filename">' + file.name + ' - ' + file.size + '</span>';
			tn += '<br />MimeType: ' + file.type;
			li.classList.add('allowed');
			json.files.push(myfile);

		}
		li.innerHTML = tn;
		ul.appendChild(li);
	}

	//append new ul to #container
	container.appendChild(ul);
	document.getElementById('fileInput').value = '';
	console.log(json.files.length);
	if(json.files.length > 0){
		enableUploadBtn(json.files.length);
	}
}

function enableUploadBtn(n){
	var uploadBtn = document.getElementById('uploadBtn');
	uploadBtn.setAttribute('value', 'upload ' + n + ' files');
	if(uploadBtn.hasAttribute('disabled')){
		uploadBtn.removeAttribute('disabled');
		uploadBtn.addEventListener('click', uploadFiles, false);
	}
}

function disableUploadBtn(){
	var uploadBtn = document.getElementById('uploadBtn');
	if(!uploadBtn.hasAttribute('disabled')){
		uploadBtn.removeEventListener('click', uploadFiles, false);
		uploadBtn.setAttribute('value', 'no files selected');
		uploadBtn.setAttribute('disabled', 'disabled');
	}
}

function uploadFiles(){
	if(json.files.length > 0){
		var xhr = new XMLHttpRequest();
		var jsonStr = JSON.stringify(json.files);
		var msgbox = dropbox.getElementsByTagName('p')[0];
		var bar = document.getElementById('bar');

		xhr.open("POST", 'uploader.php', true);
		xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
		xhr.onreadystatechange = (function(req){
			return function (evt) {
				if (req.readyState == 4) {
					if(req.status == 200){
						//console.log(req.responseText);

						msgbox.innerHTML = 'Upload complete';
						bar.value = '100';
						json.files.length = 0;
						disableUploadBtn();
						
						setTimeout(function(){
							bar.value = '0';
							msgbox.innerHTML = 'Drop your files here';
							//remove child nodes from container
							while( container.hasChildNodes() ){
								container.removeChild(container.lastChild);
							}
						}, 2000);
						
					}else{
						console.log("Error " + req.status + " loading page");
					}
				};
			};
		})(xhr);
		//non funziona in opera
		xhr.upload.addEventListener("progress", function(e) {
  			if (e.lengthComputable) {
  				msgbox.innerHTML = 'Upload in progress...';
    			var percent = Math.round((e.loaded * 100) / e.total);
				bar.value = percent;
    		}
		}, false);
		//console.log(json);
		xhr.send(jsonStr);
	}
}

function printMsg(msg){
	var p = document.createElement('p');
	var t = document.createTextNode(msg);
	p.appendChild(t);
	p.classList.add('alert');
	document.getElementById('container').appendChild(p);
}