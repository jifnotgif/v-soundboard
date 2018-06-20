//NOTE: one change to make: start out with one channel only. add option to add or remove channels


// window.addEventListener('load', init, false);

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var audioSources = document.querySelectorAll(".audio-in");


var initGainInput = document.querySelectorAll(".gain");

var hiEQ = document.querySelectorAll(".high-gain");
var loEQ = document.querySelectorAll(".low-gain");
var hi_midFreq = document.querySelectorAll(".hm-freq-gain");
var hi_midBoost = document.querySelectorAll(".hm-boost-gain");
var lo_midFreq = document.querySelectorAll(".lm-freq-gain");
var lo_midBoost = document.querySelectorAll(".lm-boost-gain");


var panInput = document.querySelectorAll(".pan");
var muteInput = document.querySelectorAll(".mute");
var soloInput = document.querySelectorAll(".solo");

var busGroups = document.querySelectorAll("fieldset");

var busPanIn = document.querySelectorAll(".pan-bus");
var busLeftVolumeIn = document.querySelectorAll(".left-bus-volume");
var busRightVolumeIn = document.querySelectorAll(".right-bus-volume");

var channelVolumeInput = document.querySelectorAll(".channel-volume");

var masterVolumeIn = document.querySelector("#master-volume");

var fileUploadOptions = document.querySelectorAll(".filein");

var newChannelBtn = document.querySelector(".fa-plus");
var removeChannelBtns = document.querySelectorAll(".fa-minus-square");

var channels = [], sources = [], busses = [], uploadedFiles = [];


busses[0] = createNewBus();
busses[1] = createNewBus();

var masterChannel = audioCtx.createGain();
var maxChannels = 5;
var busCounter =0;
// Add initial channels
var numChannels = 1; // start with 1 channel
addChannel(0);
channels[0].channelHTMLNode.initListeners();
initializeAudioInputListeners();
setChannelControlListeners();

delegateEvent(document, "click", "#addbtn", function(){
	var htmlData = {
		busName: busCounter++
	}
	var chTemplate = document.getElementById("channel-template").innerHTML;
	if (numChannels === maxChannels - 1) {
		document.getElementById("addbtn").remove();
	}

	var html = Mustache.render(chTemplate, htmlData);
	// breh there has to be a better way...
	// var htmlElement = document.createElement('div');
	// htmlElement.innerHTML = html;
	// also... eventlisteners are destroyed upon creating new nodes
	// document.getElementById("test").appendChild(htmlElement);
	document.getElementById("empty").outerHTML = html;

	addChannel(numChannels++);

	/********************************* */
	//clone previous channels and replace original channels with clones to remove all event listeners	
	// 	var channelNodes = document.querySelectorAll(".channel");
	// for (var i = 0; i < channelNodes.length; i++){
	// 		var channelClone = channelNodes[i].cloneNode(true);
	// 		channelNodes[i].parentNode.replaceChild(channelClone, channelNodes[i]);
	// 		console.log("cloned");
	// 	}
	//
	

	initializeAudioInputListeners();
	setChannelControlListeners();

})
removeChannelBtns.forEach(function (btn) {
	delegateEvent(document, "click", ".fa-minus-square", function () {
		closestByClass(this, "channel").remove();
		numChannels--;
		// if DOM can't locate add button (max channels reached and removed)
		if (numChannels === maxChannels - 1 && document.getElementById("addbtn") === null) {
			document.getElementById("add").innerHTML = "<i id=\"addbtn\" class=\"fas fa-plus\"></i>";
		}
	})		
})

function initializeAudioInputListeners() {
	// fileUploadOptions.forEach(function (el, j) {
	// 	delegateEvent(document, "change", ".filein", function (event) {
	// 		var file = fileUploadOptions[j].files[0];
	// 		uploadedFiles[j] = file;
	// 		var r = new FileReader();
	// 		r.readAsArrayBuffer(uploadedFiles[j]);
	// 		r.onload = function (e) {
	// 			sources[j] = audioCtx.createBufferSource();
	// 			loadSound(e.target.result, j);
	// 			sources[j].start(audioCtx.currentTime);
	// 		};
	// 	});


	// 	// el.addEventListener("change", function () {
	// 	// 	var file = fileUploadOptions[j].files[0];
	// 	// 	uploadedFiles[j] = file;
	// 	// 	var r = new FileReader();
	// 	// 	r.readAsArrayBuffer(uploadedFiles[j]);
	// 	// 	r.onload = function (e) {
	// 	// 		sources[j] = audioCtx.createBufferSource();
	// 	// 		loadSound(e.target.result, j);
	// 	// 		sources[j].start(audioCtx.currentTime);
	// 	// 	};
	// 	// });
	// });

	// audioSources.forEach(function (element, index) {
	// 	delegateEvent(document, "change", ".audio-in", function () {
	// 		console.log(sources);
	// 		if (sources[index]) {
	// 			sources[index].stop();
	// 		}

	// 		if (element.value === "new_file") {
	// 			var fileUploadOption = document.querySelectorAll(".filein")[index];
	// 			fileUploadOption.click();
	// 			this.value = "none";
	// 		}
	// 		else {
	// 			requestPresetAudio(index);
	// 		}
	// 	});
		// element.addEventListener("change", function () {
		// 	if (sources[index]) sources[index].stop();

		// 	if (element.value === "new_file") {
		// 		var fileUploadOption = document.querySelectorAll(".filein")[index];
		// 		fileUploadOption.click();
		// 		this.value = "none";
		// 	}
		// 	else {
		// 		requestPresetAudio(index);
		// 	}
		// });
	// });
}

function resetChannelInputSettings(index) {
	channelVolumeInput[index].value = -50;
	channels[index].channelFader.gain.setValueAtTime(0, audioCtx.currentTime);
	

	initGainInput[index].value = 0;
	channels[index].preAmp.gain.value = dBFSToGain(initGainInput[index].value);
	
	hiEQ[index].value = 0;
	channels[index].hiEQControl.gain.value = hiEQ[index].value;
	loEQ[index].value = 0;
	channels[index].loEQControl.gain.value = loEQ[index].value;

	hi_midFreq[index].value = 6775;
	channels[index].hi_midEQControl.frequency.value = hi_midFreq[index].value;
	hi_midBoost[index].value = 0;
	channels[index].hi_midEQControl.gain.value = hi_midBoost[index].value;
	lo_midFreq[index].value = 1070;
	channels[index].lo_midEQControl.frequency.value = lo_midFreq[index].value;
	lo_midBoost[index].value = 0;
	channels[index].lo_midEQControl.gain.value = lo_midBoost[index].value;

	panInput[index].value = 0;
	channels[index].panNode.pan.value = panInput[index].value;

	if (muteInput[index].classList.contains("active")) {
		channels[index].mute = false;
		muteInput[index].classList.remove("active");
	}
}

function loadSound(arraybuffer, i) {
	audioCtx.decodeAudioData(arraybuffer, function (buffer) {
		sources[i].buffer = buffer;
		sources[i].loop = true;
		sources[i].connect(channels[i].preAmp);
		channels[i].preAmp.connect(channels[i].hiEQControl);
		channels[i].hiEQControl.connect(channels[i].hi_midEQControl);
		channels[i].hi_midEQControl.connect(channels[i].loEQControl);
		channels[i].loEQControl.connect(channels[i].lo_midEQControl);


		channels[i].lo_midEQControl.connect(channels[i].panNode);
		channels[i].panNode.connect(channels[i].channelFader);

		channels[i].channelFader.connect(masterChannel);
		masterChannel.connect(audioCtx.destination);

		channels[i].channelFader.connect(channels[i].splitter);
		channels[i].splitter.connect(channels[i].clipAnalyser, 0, 0);
		channels[i].splitter.connect(channels[i].clipAnalyser2, 1, 0);
		channels[i].javascriptNode.connect(channels[i].splitter);

		resetChannelInputSettings(i);
	}, function (e) { console.log("Error with decoding audio data" + e.err); });

}

function addChannel(index) {
	var newChannel = new Object();
	setChannelProperties(newChannel, index);
	channels[index] = newChannel;

	newChannel.channelHTMLNode = new Object();
	newChannel.channelHTMLNode.audioSource = document.querySelectorAll(".audio-in")[index];


	newChannel.channelHTMLNode.initGainInput = document.querySelectorAll(".gain")[index];

	newChannel.channelHTMLNode.hiEQ = document.querySelectorAll(".high-gain")[index];
	newChannel.channelHTMLNode.loEQ = document.querySelectorAll(".low-gain")[index];
	newChannel.channelHTMLNode.hi_midFreq = document.querySelectorAll(".hm-freq-gain")[index];
	newChannel.channelHTMLNode.hi_midBoost = document.querySelectorAll(".hm-boost-gain")[index];
	newChannel.channelHTMLNode.lo_midFreq = document.querySelectorAll(".lm-freq-gain")[index];
	newChannel.channelHTMLNode.lo_midBoost = document.querySelectorAll(".lm-boost-gain")[index];


	newChannel.channelHTMLNode.panInput = document.querySelectorAll(".pan")[index];
	newChannel.channelHTMLNode.muteInput = document.querySelectorAll(".mute")[index];
	newChannel.channelHTMLNode.soloInput = document.querySelectorAll(".solo")[index];

	newChannel.channelHTMLNode.busGroups = document.querySelectorAll("fieldset")[index];

	newChannel.channelHTMLNode.channelVolumeInput = document.querySelectorAll(".channel-volume")[index];


	newChannel.channelHTMLNode.fileUploadOption = document.querySelectorAll(".filein")[index];

	newChannel.channelHTMLNode.initListeners = function() {
		this.audioSource.addEventListener("change", function(){
			if (this.value === "new_file") {
				newChannel.channelHTMLNode.fileUploadOption.click();
				this.value = "none";
			}
			else {
				requestPresetAudio(index);
			}
		});

		this.fileUploadOption.addEventListener("change",function(){
				var file = this.files[0];
				var r = new FileReader();
				r.readAsArrayBuffer(file);
				r.onload = function (e) {
					sources[index] = audioCtx.createBufferSource();
					loadSound(e.target.result, index);
					sources[index].start(audioCtx.currentTime);
				};
		});

		this.panInput.addEventListener("input", function(){
			newChannel.panNode.pan.setValueAtTime(this.value, audioCtx.currentTime);
		});

		this.muteInput.addEventListener("click", function(){
			if (this.classList.contains("active")) {
				newChannel.channelFader.gain.setValueAtTime(dBFSToGain(newChannel.channelHTMLNode.channelVolumeInput.value), audioCtx.currentTime);
				newChannel.mute = false;
				this.classList.remove("active");
			}
			else {
				newChannel.channelFader.gain.setValueAtTime(0, audioCtx.currentTime);
				newChannel.mute = true;
				this.classList.add("active");
			}
		});

		//fix
		this.soloInput.addEventListener("click", function(){
			if (this.classList.contains("active")) {
				for (var j = 0; j < numChannels; j++) {
					channels[j].channelFader.gain.setValueAtTime(dBFSToGain(channelVolumeInput[j].value), audioCtx.currentTime);
					channels[j].mute = false;
				}
				this.classList.remove("active");
			}
			else {
				for (var j = 0; j < numChannels; j++) {
					channels[j].channelFader.gain.setValueAtTime(0, audioCtx.currentTime);
					channels[j].mute = true;
					soloInput[j].classList.remove("active");
				}
				newChannel.channelFader.gain.setValueAtTime(dBFSToGain(newChannel.channelHTMLNode.channelVolumeInput.value), audioCtx.currentTime);
				newChannel.mute = false;
				this.classList.add("active");
			}
		});

		this.channelVolumeInput.addEventListener("input", function(){
			if (newChannel.mute === false) newChannel.channelFader.gain.setValueAtTime(dBFSToGain(newChannel.channelHTMLNode.channelVolumeInput.value), audioCtx.currentTime);
		});

		this.initGainInput.addEventListener("input",function(){
			newChannel.preAmp.gain.value = dBFSToGain(this.value);
		});

		this.hiEQ.addEventListener("input",function(){
			newChannel.hiEQControl.gain.value = this.value;
		});
		this.loEQ.addEventListener("input", function () {
			newChannel.loEQControl.gain.value = this.value;
		});
		this.hi_midFreq.addEventListener("input",function(){
			newChannel.hi_midEQControl.frequency.value = this.value;
		});
		this.hi_midBoost.addEventListener("input",function(){
			newChannel.hi_midEQControl.gain.value = this.value;
		});
		this.lo_midFreq.addEventListener("input", function () {
			newChannel.lo_midEQControl.frequency.value = this.value;
		});
		this.lo_midBoost.addEventListener("input", function () {
			newChannel.lo_midEQControl.gain.value = this.value;
		});
	};



}

function setChannelProperties(channel, i) {
	channel.panNode = audioCtx.createStereoPanner();
	channel.preAmp = audioCtx.createGain();
	channel.channelFader = audioCtx.createGain();
	channel.mute = false;
	channel.channelFader.gain.value = 0;
	channel.clipAnalyser = audioCtx.createAnalyser();
	channel.clipAnalyser.fftSize = 1024;
	channel.clipAnalyser2 = audioCtx.createAnalyser();
	channel.clipAnalyser2.fftSize = 1024;

	channel.splitter = audioCtx.createChannelSplitter(2);

	channel.loEQControl = audioCtx.createBiquadFilter();
	channel.loEQControl.type = "lowshelf";
	channel.loEQControl.frequency.value = 80;
	channel.hiEQControl = audioCtx.createBiquadFilter();
	channel.hiEQControl.type = "highshelf";
	channel.hiEQControl.frequency.value = 12000;

	channel.hi_midEQControl = audioCtx.createBiquadFilter();
	channel.hi_midEQControl.type = "peaking";
	channel.lo_midEQControl = audioCtx.createBiquadFilter();
	channel.lo_midEQControl.type = "peaking";

	channel.meter;
	channel.canvas = document.querySelectorAll(".meter")[i].getContext("2d");

	channel.gradient = channel.canvas.createLinearGradient(0, 0, 0, 130);
	channel.gradient.addColorStop(1, '#00ff00');
	channel.gradient.addColorStop(0.4, '#ffff00');
	channel.gradient.addColorStop(0.05, '#ff0000');

	channel.javascriptNode = audioCtx.createScriptProcessor(2048, 1, 1);
	channel.javascriptNode.onaudioprocess = function () {
		// get the average for the first channel
		channel.array = new Uint8Array(channel.clipAnalyser.frequencyBinCount);
		channel.clipAnalyser.getByteFrequencyData(channel.array);
		var average = channel.getAverageVolume(channel.array);

		// get the average for the second channel
		channel.array2 = new Uint8Array(channel.clipAnalyser2.frequencyBinCount);
		channel.clipAnalyser2.getByteFrequencyData(channel.array2);
		var average2 = channel.getAverageVolume(channel.array2);

		//here's the volume
		// clear the current state
		channel.canvas.clearRect(0, 0, 60, 130);

		// set the fill style
		channel.canvas.fillStyle = channel.gradient;

		// create the meters
		if (average < 130) {
			channel.canvas.fillRect(0, 130 - average, 25, 130);
		}
		else {
			channel.canvas.fillRect(0, 0, 25, 130);
		}
		if (average2 < 130) {
			channel.canvas.fillRect(30, 130 - average2, 25, 130);
		}
		else {
			channel.canvas.fillRect(30, 0, 25, 130);
		}
	}
	channel.getAverageVolume = getAverageVolume;


	channel.array;
	channel.array2;
}

function requestPresetAudio(i) {
	sources[i] = audioCtx.createBufferSource();

	var request = new XMLHttpRequest();
	request.open('GET', audioSources[i].options[audioSources[i].selectedIndex].value, true);

	request.responseType = 'arraybuffer';


	request.onload = function () {
		var audioData = request.response;

		loadSound(audioData, i);


	}

	request.send();
	sources[i].start(audioCtx.currentTime);
}

function dBFSToGain(dbfs) {
	return Math.pow(10, dbfs / 20);
}

function getAverageVolume(array) {
	var values = 0;
	var average;

	var length = array.length;

	// get all the frequency amplitudes
	for (var i = 0; i < length; i++) {
		values += Math.abs(array[i]);
	}

	average = values / length;
	return average;
}

function setChannelControlListeners() {

	// panInput.forEach(function (input, i) {
	// 	delegateEvent(document, "input", ".pan", function () {
	// 		channels[i].panNode.pan.setValueAtTime(input.value, audioCtx.currentTime);
	// 	});	
	// 	// input.addEventListener("input", function () {
	// 	// 	channels[i].panNode.pan.setValueAtTime(input.value, audioCtx.currentTime);
	// 	// });
	// });

	// muteInput.forEach(function (input, i) {
	// 	delegateEvent(document, "click", ".mute", function () {
	// 		if (input.classList.contains("active")) {
	// 			channels[i].channelFader.gain.setValueAtTime(dBFSToGain(channelVolumeInput[i].value), audioCtx.currentTime);
	// 			channels[i].mute = false;
	// 			input.classList.remove("active");
	// 		}
	// 		else {
	// 			channels[i].channelFader.gain.setValueAtTime(0, audioCtx.currentTime);
	// 			channels[i].mute = true;
	// 			input.classList.add("active");
	// 		}
	// 	});	
	// 	input.addEventListener("click", function () {
	// 		if (input.classList.contains("active")) {
	// 			channels[i].channelFader.gain.setValueAtTime(dBFSToGain(channelVolumeInput[i].value), audioCtx.currentTime);
	// 			channels[i].mute = false;
	// 			input.classList.remove("active");
	// 		}
	// 		else {
	// 			channels[i].channelFader.gain.setValueAtTime(0, audioCtx.currentTime);
	// 			channels[i].mute = true;
	// 			input.classList.add("active");
	// 		}
	// 	});
	// });


	// soloInput.forEach(function (input, i) {
	// 	delegateEvent(document, "click", ".solo", function () {
	// 		if (input.classList.contains("active")) {
	// 			for (var j = 0; j < numChannels; j++) {
	// 				channels[j].channelFader.gain.setValueAtTime(dBFSToGain(channelVolumeInput[j].value), audioCtx.currentTime);
	// 				channels[j].mute = false;
	// 				soloInput[j].classList.remove("active");
	// 			}
	// 		}
	// 		else {
	// 			for (var j = 0; j < numChannels; j++) {
	// 				channels[j].channelFader.gain.setValueAtTime(0, audioCtx.currentTime);
	// 				channels[j].mute = true;
	// 				soloInput[j].classList.remove("active");
	// 			}
	// 			channels[i].channelFader.gain.setValueAtTime(dBFSToGain(channelVolumeInput[i].value), audioCtx.currentTime);
	// 			channels[i].mute = false;
	// 			soloInput[i].classList.add("active");
	// 		}
	// 	});
		// input.addEventListener("click", function () {
		// 	if (input.classList.contains("active")) {
		// 		for (var j = 0; j < index; j++) {
		// 			channels[j].channelFader.gain.setValueAtTime(dBFSToGain(channelVolumeInput[j].value), audioCtx.currentTime);
		// 			channels[j].mute = false;
		// 		}
		// 		soloInput[i].classList.remove("active");
		// 	}
		// 	else {
		// 		for(var j=0; j<index; j++){
		// 			channels[j].channelFader.gain.setValueAtTime(0, audioCtx.currentTime);
		// 			channels[j].mute = true;
		// 			soloInput[j].classList.remove("active");
		// 		}
		// 		channels[i].channelFader.gain.setValueAtTime(dBFSToGain(channelVolumeInput[i].value), audioCtx.currentTime);
		// 		channels[i].mute = false;
		// 		soloInput[i].classList.add("active");
		// 	}
		// });
	// });
	
	// channelVolumeInput.forEach(function (input, i) {
	// 	delegateEvent(document, "input", ".channel-volume", function () {
	// 		if (channels[i].mute === false) channels[i].channelFader.gain.setValueAtTime(dBFSToGain(channelVolumeInput[i].value), audioCtx.currentTime);
	// 	});	
	// 	// input.addEventListener("input", function () {
	// 	// 	if (channels[i].mute === false) channels[i].channelFader.gain.setValueAtTime(dBFSToGain(channelVolumeInput[i].value), audioCtx.currentTime);
	// 	// });
	// });

	// initGainInput.forEach(function (input, i) {
	// 	delegateEvent(document, "input", ".gain", function () {
	// 		channels[i].preAmp.gain.value = dBFSToGain(initGainInput[i].value);
	// 	});

	// 	// input.addEventListener("input", function () {
	// 	// 	channels[i].preAmp.gain.value = dBFSToGain(initGainInput[i].value);
	// 	// })
	// });

	// hiEQ.forEach(function (input, i) {
	// 	delegateEvent(document, "input", ".high-gain", function () {
	// 		channels[i].hiEQControl.gain.value = hiEQ[i].value;
	// 	});
	// 	// input.addEventListener("input", function () {
	// 	// 	channels[i].hiEQControl.gain.value = hiEQ[i].value;
	// 	// })
	// });

	// loEQ.forEach(function (input, i) {
	// 	delegateEvent(document, "input", ".low-gain", function () {
	// 		channels[i].loEQControl.gain.value = loEQ[i].value;
	// 	});
	// 	// input.addEventListener("input", function () {
	// 	// 	channels[i].loEQControl.gain.value = loEQ[i].value;
	// 	// })
	// });

	// hi_midFreq.forEach(function (input, i) {
	// 	delegateEvent(document, "input", ".hm-freq-gain", function () {
	// 		channels[i].hi_midEQControl.frequency.value = hi_midFreq[i].value;
	// 	});
	// 	// input.addEventListener("input", function () {
	// 	// 	channels[i].hi_midEQControl.frequency.value = hi_midFreq[i].value;
	// 	// })
	// });

	// hi_midBoost.forEach(function (input, i) {
	// 	delegateEvent(document, "input", ".hm-boost-gain", function () {
	// 		channels[i].hi_midEQControl.gain.value = hi_midBoost[i].value;
	// 	});
	// 	// input.addEventListener("input", function () {
	// 	// 	channels[i].hi_midEQControl.gain.value = hi_midBoost[i].value;
	// 	// })
	// });

	// lo_midFreq.forEach(function (input, i) {
	// 	delegateEvent(document, "input", ".lm-freq-gain", function () {
	// 		channels[i].lo_midEQControl.frequency.value = lo_midFreq[i].value;
	// 	});
	// 	// input.addEventListener("input", function () {
	// 	// 	channels[i].lo_midEQControl.frequency.value = lo_midFreq[i].value;
	// 	// })
	// });

	// lo_midBoost.forEach(function (input, i) {
	// 	delegateEvent(document, "input", ".lm-boost-gain", function () {
	// 		channels[i].lo_midEQControl.gain.value = lo_midBoost[i].value;
	// 	});
	// 	// input.addEventListener("input", function () {
	// 	// 	channels[i].lo_midEQControl.gain.value = lo_midBoost[i].value;
	// 	// })
	// });

	masterVolumeIn.addEventListener("input", function () {
		masterChannel.gain.value = dBFSToGain(masterVolumeIn.value);
	});

	busGroups.forEach(function (input, index) {
		for (var i = 0; i < input.elements.length; i++) {

			delegateEvent(document, "click", ".busOption", function () {
				resetChanneltoBusConnection(index);
				if (this.value === "1-2 send") {
					busses[1].merger.disconnect();

					channels[index].splitter.connect(busses[0].leftGain, 0, 0);
					channels[index].splitter.connect(busses[0].rightGain, 1, 0);
					setBusToMain(0);
				}
				else if (this.value === "3-4 send") {
					busses[0].merger.disconnect();

					channels[index].splitter.connect(busses[1].leftGain, 0, 0);
					channels[index].splitter.connect(busses[1].rightGain, 1, 0);

					setBusToMain(1);
				}
				else {
					channels[index].channelFader.connect(masterChannel);
				}
			});

			// input.elements[i].addEventListener("click", function () {
			// 	resetChanneltoBusConnection(index);
			// 	if (this.value === "1-2 send") {
			// 		busses[1].merger.disconnect();

			// 		channels[index].splitter.connect(busses[0].leftGain, 0, 0);
			// 		channels[index].splitter.connect(busses[0].rightGain, 1, 0);
			// 		setBusToMain(0);
			// 	}
			// 	else if (this.value === "3-4 send") {
			// 		busses[0].merger.disconnect();

			// 		channels[index].splitter.connect(busses[1].leftGain, 0, 0);
			// 		channels[index].splitter.connect(busses[1].rightGain, 1, 0);

			// 		setBusToMain(1);
			// 	}
			// 	else {
			// 		channels[index].channelFader.connect(masterChannel);
			// 	}
			// });
		}
	});

	// if busses are dynamically added/removed, add event listeners through delegateEvent()
	busPanIn.forEach(function (input, i) {
		input.addEventListener("input", function () {
			busses[i].busPan.pan.setValueAtTime(input.value, audioCtx.currentTime);
		});
	});

	busLeftVolumeIn.forEach(function (input, i) {
		input.addEventListener("input", function () {
			busses[i].leftGain.gain.value = dBFSToGain(busLeftVolumeIn[i].value);
		});
	});
	busRightVolumeIn.forEach(function (input, i) {
		input.addEventListener("input", function () {
			busses[i].rightGain.gain.value = dBFSToGain(busRightVolumeIn[i].value);
		});
	});
}

/*
*	Helper functions
*
*/
function resetChanneltoBusConnection(i) {
	channels[i].channelFader.disconnect();
	channels[i].splitter.disconnect();
	channels[i].channelFader.connect(channels[i].splitter);
	channels[i].splitter.connect(channels[i].clipAnalyser, 0, 0);
	channels[i].splitter.connect(channels[i].clipAnalyser2, 1, 0);

}
function setBusToMain(i) {
	busses[i].leftGain.connect(busses[i].merger, 0, 0);
	busses[i].rightGain.connect(busses[i].merger, 0, 1);
	busses[i].merger.connect(busses[i].busPan);
	busses[i].busPan.connect(masterChannel);
}

function createNewBus() {
	var bus = new Object();
	bus.busPan = audioCtx.createStereoPanner();
	bus.leftGain = audioCtx.createGain();
	bus.rightGain = audioCtx.createGain();
	bus.merger = audioCtx.createChannelMerger(2);
	return bus;
}

/**
 * Get the closest element of a given element by class
 *
 * Take an element (the first param), and traverse the DOM upward from it
 * until it hits the element with a given class name (second parameter).
 * This mimics jQuery's `.closest()`.
 *
 * @param  {element} el    The element to start from
 * @param  {string}  clazz The class name
 * @return {element}       The closest element
 */
function closestByClass(el, clazz) {
	// Traverse the DOM up with a while loop
	while (el.className != clazz) {
		// Increment the loop to the parent node
		el = el.parentNode;
		if (!el) {
			return null;
		}
	}
	// At this point, the while loop has stopped and `el` represents the element that has
	// the class you specified in the second parameter of the function `clazz`

	// Then return the matched element
	return el;
}

function delegateEvent(el, evt, sel, handler) {
	el.addEventListener(evt, function (event) {
		var t = event.target;
		while (t && t !== this) {
			if (t.matches(sel)) {
				handler.call(t, event);
			}
			t = t.parentNode;
		}
	});
}