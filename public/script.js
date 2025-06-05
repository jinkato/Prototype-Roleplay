const fns = {
	showInstagramSlide: () => {
		// Fade out all slides
		document.getElementById('slideWelcome').style.opacity = '0';
		document.getElementById('slideDisagreement').style.opacity = '0';
		document.getElementById('slideNewFeature').style.opacity = '0';
		
		// Fade in the Instagram slide
		setTimeout(() => {
			document.getElementById('slideInstagram').style.opacity = '1';
		}, 300); // Wait for the fade out to complete
		return { success: true, message: 'Instagram Slide is now visible' };
	},
	showDisagreementSlide: () => {
		// Fade out all slides
		document.getElementById('slideWelcome').style.opacity = '0';
		document.getElementById('slideInstagram').style.opacity = '0';
		document.getElementById('slideNewFeature').style.opacity = '0';
		
		// Fade in the Disagreement slide
		setTimeout(() => {
			document.getElementById('slideDisagreement').style.opacity = '1';
		}, 300); // Wait for the fade out to complete
		return { success: true, message: 'Disagreement Slide is now visible' };
	},
	showNewFeatureSlide: () => {
		// Fade out all slides
		document.getElementById('slideWelcome').style.opacity = '0';
		document.getElementById('slideInstagram').style.opacity = '0';
		document.getElementById('slideDisagreement').style.opacity = '0';
		
		// Fade in the New Feature slide
		setTimeout(() => {
			document.getElementById('slideNewFeature').style.opacity = '1';
		}, 300); // Wait for the fade out to complete
		return { success: true, message: 'New Feature Slide is now visible' };
	},
};

// Create a WebRTC Agent
const peerConnection = new RTCPeerConnection();

// On inbound audio add to page
peerConnection.ontrack = (event) => {
	const inboundAudio = document.createElement('audio');
	inboundAudio.srcObject = event.streams[0];
	inboundAudio.autoplay = inboundAudio.controls = true;
	// Append to instruction div instead of body
	document.querySelector('.instruction').appendChild(inboundAudio);
	
	// Hide the loader when audio element is created
	const loader = document.getElementById('loader');
	if (loader) {
		loader.style.display = 'none';
	}

	// Add event listeners to track AI speaking status
	inboundAudio.addEventListener('play', () => {
		console.log('AI STARTED TALKING');
		// Add a visual indicator when AI starts talking
	});

	// This only fires when manually paused, not when AI naturally stops
	inboundAudio.addEventListener('pause', () => {
		console.log('MANUAL PAUSE - User clicked pause button');
	});

	// This is the correct event for when AI naturally finishes speaking
	inboundAudio.addEventListener('ended', () => {
		console.log('AI FINISHED TALKING - Natural end of speech');
	});
	
	// These events can help track the audio stream status more accurately
	inboundAudio.addEventListener('playing', () => {
		console.log('AI SPEECH IS PLAYING');
	});
	
	inboundAudio.addEventListener('waiting', () => {
		console.log('AI SPEECH BUFFERING');
	});
};

const dataChannel = peerConnection.createDataChannel('oai-events');

function configureData() {
	// console.log('Configuring data channel');
	const event = {
		type: 'session.update',
		session: {
			modalities: ['text', 'audio'],
			// Provide the tools. Note they match the keys in the `fns` object above
			tools: [
				{
					type: 'function',
					name: 'showInstagramSlide',
					description: 'Shows Instagram slide',
				},
				{
					type: 'function',
					name: 'showDisagreementSlide',
					description: 'Shows Disagreement slide',
				},
				{
					type: 'function',
					name: 'showNewFeatureSlide',
					description: 'Shows New Feature slide',
				},
			],
		},
	};
	dataChannel.send(JSON.stringify(event));
}

dataChannel.addEventListener('open', (ev) => {
	// console.log('Opening data channel', ev);
	configureData();
});


// Track AI speaking status and user responses
let aiIsTalking = false;
let lastQuestion = "";
let recentUserResponse = "";
let currentTranscript = "";

// Simple logging function for user answers (no quality evaluation)
function logUserSpeech(response) {
	// Log the speech to console
	console.log('%cUSER SPEECH', 'background: blue; color: white; padding: 3px; border-radius: 3px;', response);
}

dataChannel.addEventListener('message', async (ev) => {
	const msg = JSON.parse(ev.data);
	
	// Log all message types to help debug transcript issues
	console.log('Message type:', msg.type);
	
	// Handle AI talking visual cue detection (reliable method)
	if (msg.type === 'output_audio_buffer.started') {
		if (!aiIsTalking) {
			aiIsTalking = true;
			console.log('AI STARTED TALKING (detected from output_audio_buffer.started)');
			document.querySelector('.interviewer img').style.border = '5px solid orange';
		}
	}
	
	// This specific message indicates the AI has finished its turn
	if (msg.type === 'output_audio_buffer.stopped') {
		if (aiIsTalking) {
			aiIsTalking = false;
			console.log('AI STOPPED TALKING (detected from output_audio_buffer.stopped)');
			document.querySelector('.interviewer img').style.border = 'none';
		}
	}
	
	// When we detect user speech ending, simulate a transcript
	if (msg.type === 'input_audio_buffer.speech_stopped') {
		console.log('%cUSER SPEECH ENDED', 'background: blue; color: white; padding: 3px; border-radius: 3px;');
		
		// Wait a short time to simulate processing
		setTimeout(() => {
			// Generate a simple mock transcript
			const mockTranscript = 'This is a simulated user response to the interview question.';
			
			// Log the simulated transcript
			logUserSpeech(mockTranscript);
		}, 500);
	}
	
	// Start a new transcript when AI begins talking
	if (msg.type === 'output_audio_buffer.started') {
		// Reset current transcript at the start of AI speech
		currentTranscript = "";
		console.log('%cNEW AI SPEECH STARTED - Collecting transcript...', 'background: orange; color: black; padding: 3px; border-radius: 3px;');
	}
	
	// Store the last thing the AI said as the potential "question"
	if (msg.type === 'response.audio_transcript.delta') {
		// Log the entire message to debug
		console.log('AUDIO TRANSCRIPT DELTA MSG:', msg);
		
		// Append to current transcript since these come in chunks
		if (msg.text) {
			currentTranscript += msg.text;
			console.log('%cAI SPEECH CHUNK', 'background: #ff8c00; color: white; padding: 3px; border-radius: 3px;', msg.text);
		}
	}
	
	// When AI transcript is complete, log the full transcript
	if (msg.type === 'response.audio_transcript.done') {
		// Save completed transcript as the last question if it's not empty
		if (currentTranscript && currentTranscript.trim().length > 0) {
			lastQuestion = currentTranscript;
			console.log('COMPLETE AI QUESTION:', lastQuestion);
		}
	}
	
	// Handle function calls
	if (msg.type === 'response.function_call_arguments.done') {
		const fn = fns[msg.name];
		if (fn !== undefined) {
			const args = JSON.parse(msg.arguments);
			const result = await fn(args);
			// Let OpenAI know that the function has been called and share it's output
			const event = {
				type: 'conversation.item.create',
				item: {
					type: 'function_call_output',
					call_id: msg.call_id, // call_id from the function_call message
					output: JSON.stringify(result), // result of the function
				},
			};
			dataChannel.send(JSON.stringify(event));
			// Have assistant respond after getting the results
			dataChannel.send(JSON.stringify({type:"response.create"}));
		}
	}
});

function startVoiceChat() {
	// Remove the button and show the loader
	const startButton = document.querySelector('.instruction button');
	const loader = document.getElementById('loader');
	if (startButton) {
		startButton.remove();
	}
	// Show the loader
	if (loader) {
		loader.style.display = 'block';
	}
	// Capture microphone
	navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
		console.log('AI IS LISTENING - Microphone activated');
		
		// Set up an event listener to detect when audio input stops
		const audioTracks = stream.getAudioTracks();
		audioTracks.forEach(track => {
			track.addEventListener('ended', () => {
				console.log('AI STOPPED LISTENING - Microphone deactivated');
			});
		});
		// Add microphone to PeerConnection
		stream.getTracks().forEach((track) => peerConnection.addTransceiver(track, { direction: 'sendrecv' }));

		peerConnection.createOffer().then((offer) => {
			peerConnection.setLocalDescription(offer);
			
			// You'll need to set your OpenAI API key here
			const OPENAI_API_KEY = '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';
			
			// Create ephemeral session directly with OpenAI
			fetch("https://api.openai.com/v1/realtime/sessions", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${OPENAI_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "gpt-4o-realtime-preview-2024-12-17",
					instructions: "<interview_simulation><role>You are Tom, conducting a focused 5-minute interview simulation for a Junior Product Manager position. You will guide the entire conversation and decide which questions to ask and when to move forward. CRITICAL RULE: You MUST include slide commands in brackets for every question you ask.</role><interviewer_guidelines><guideline>Act as an experienced Product Manager interviewer named Tom</guideline><guideline>Guide the conversation - you decide the flow and pacing</guideline><guideline>Ask follow-up/probing questions when responses need more depth</guideline><guideline>Move to next question when you've gotten enough information</guideline><guideline>Give brief feedback before moving to new topics</guideline><guideline>Keep the entire interview to 5 minutes total</guideline><guideline>ABSOLUTE REQUIREMENT: NEVER ask a question without including its corresponding slide command in brackets</guideline><guideline>REMEMBER: Instagram question = [Show Instagram Slide], Feature question = [Show New Feature Slide], Disagreement question = [Show Disagreement Slide]</guideline></interviewer_guidelines><interview_structure><phase name='opening' duration='30 seconds'><action>Introduce yourself as the interviewer</action><action>Ask for brief background and interest in PM role</action></phase><phase name='main_questions' duration='3.5 minutes'><focus>Choose 2-3 questions from different categories below - ALWAYS include the slide command in brackets</focus><focus>Ask probing questions like: 'Can you elaborate on that?' 'What data would you look at?' 'How would you prioritize?'</focus></phase><phase name='wrap_up' duration='1 minute'><action>Give overall feedback</action><action>End the interview</action></phase></interview_structure><question_bank><category name='product_thinking'><question>How would you improve Instagram's user engagement? MANDATORY: [Show Instagram Slide]</question></category><category name='analytical'><question>How would you measure the success of a new feature launch? MANDATORY: [Show New Feature Slide]</question></category><category name='collaboration'><question>How would you handle a disagreement between engineering and design teams? MANDATORY: [Show Disagreement Slide]</question></category></question_bank><probing_questions><probe>Can you walk me through your thinking process there?</probe><probe>What data or metrics would you look at to validate that?</probe><probe>How would you prioritize those different options?</probe><probe>What would you do if stakeholders disagreed with your approach?</probe><probe>Can you give me a specific example?</probe></probing_questions><instructions><instruction>Start the interview immediately by introducing yourself and asking the opening question</instruction><instruction>Use your judgment to ask follow-up questions or move to the next topic</instruction><instruction>Keep track of time and wrap up at 5 minutes</instruction><instruction>Provide constructive feedback throughout</instruction><instruction>CRITICAL: Every time you ask the Instagram question include [Show Instagram Slide]</instruction><instruction>CRITICAL: Every time you ask the feature launch question include [Show New Feature Slide]</instruction><instruction>CRITICAL: Every time you ask the disagreement question include [Show Disagreement Slide]</instruction><instruction>FAILURE TO INCLUDE SLIDE COMMANDS WILL BREAK THE SYSTEM</instruction></instructions><start_message>Begin the interview now by immediately introducing yourself as Tom and asking your first question without waiting for any response.</start_message></interview_simulation>",
					voice: "ash",
				}),
			})
			.then(response => response.json())
			.then((data) => {
				const EPHEMERAL_KEY = data.client_secret.value;
				const baseUrl = 'https://api.openai.com/v1/realtime';
				const model = 'gpt-4o-realtime-preview-2024-12-17';
				fetch(`${baseUrl}?model=${model}`, {
					method: 'POST',
					body: offer.sdp,
					headers: {
						Authorization: `Bearer ${EPHEMERAL_KEY}`,
						'Content-Type': 'application/sdp',
					},
				})
					.then((r) => r.text())
					.then((answer) => {
						// Accept answer from Realtime WebRTC API
						peerConnection.setRemoteDescription({
							sdp: answer,
							type: 'answer',
						});
					});
			})
			.catch(error => {
				console.error('Error creating session:', error);
				alert('Please set your OpenAI API key in the script.js file');
			});
		});
	});
}