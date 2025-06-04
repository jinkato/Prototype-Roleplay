const fns = {
	getPageHTML: () => {
		return { success: true, html: document.documentElement.outerHTML };
	},
	changeBackgroundColor: ({ color }) => {
		document.body.style.backgroundColor = color;
		return { success: true, color };
	},
	changeTextColor: ({ color }) => {
		document.body.style.color = color;
		return { success: true, color };
	},
};

// Create a WebRTC Agent
const peerConnection = new RTCPeerConnection();

// On inbound audio add to page
peerConnection.ontrack = (event) => {
	const el = document.createElement('audio');
	el.srcObject = event.streams[0];
	el.autoplay = el.controls = true;
	// Append to instruction div instead of body
	document.querySelector('.instruction').appendChild(el);
};

const dataChannel = peerConnection.createDataChannel('oai-events');

function configureData() {
	console.log('Configuring data channel');
	const event = {
		type: 'session.update',
		session: {
			modalities: ['text', 'audio'],
			// Provide the tools. Note they match the keys in the `fns` object above
			tools: [
				{
					type: 'function',
					name: 'changeBackgroundColor',
					description: 'Changes the background color of a web page',
					parameters: {
						type: 'object',
						properties: {
							color: { type: 'string', description: 'A hex value of the color' },
						},
					},
				},
				{
					type: 'function',
					name: 'changeTextColor',
					description: 'Changes the text color of a web page',
					parameters: {
						type: 'object',
						properties: {
							color: { type: 'string', description: 'A hex value of the color' },
						},
					},
				},
				{
					type: 'function',
					name: 'getPageHTML',
					description: 'Gets the HTML for the current page',
				},
			],
		},
	};
	dataChannel.send(JSON.stringify(event));
}

dataChannel.addEventListener('open', (ev) => {
	console.log('Opening data channel', ev);
	configureData();
});

// {
//     "type": "response.function_call_arguments.done",
//     "event_id": "event_Ad2gt864G595umbCs2aF9",
//     "response_id": "resp_Ad2griUWUjsyeLyAVtTtt",
//     "item_id": "item_Ad2gsxA84w9GgEvFwW1Ex",
//     "output_index": 1,
//     "call_id": "call_PG12S5ER7l7HrvZz",
//     "name": "get_weather",
//     "arguments": "{\"location\":\"Portland, Oregon\"}"
// }

dataChannel.addEventListener('message', async (ev) => {
	const msg = JSON.parse(ev.data);
	// Handle function calls
	if (msg.type === 'response.function_call_arguments.done') {
		const fn = fns[msg.name];
		if (fn !== undefined) {
			console.log(`Calling local function ${msg.name} with ${msg.arguments}`);
			const args = JSON.parse(msg.arguments);
			const result = await fn(args);
			console.log('result', result);
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
	// Capture microphone
	navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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
					instructions: "<ro<role>You are conducting a focused 5-minute interview simulation for a Junior Product Manager position. You will guide the entire conversation and decide which questions to ask and when to move forward.</role><interviewer_guidelines><guideline>Act as an experienced Product Manager interviewer</guideline><guideline>Guide the conversation - you decide the flow and pacing</guideline><guideline>Ask follow-up/probing questions when responses need more depth</guideline><guideline>Move to next question when you've gotten enough information</guideline><guideline>Give brief feedback before moving to new topics</guideline><guideline>Keep the entire interview to 5 minutes total</guideline><guideline>After each question you ask, change the background color of the website to a random color</guideline></interviewer_guidelines><interview_structure><phase name='opening' duration='30 seconds'><action>Introduce yourself as the interviewer</action><action>Ask for brief background and interest in PM role</action></phase><phase name='main_questions' duration='3.5 minutes'><focus>Choose 2-3 questions from different categories below</focus><focus>Ask probing questions like: 'Can you elaborate on that?' 'What data would you look at?' 'How would you prioritize?'</focus></phase><phase name='wrap_up' duration='1 minute'><action>Give overall feedback</action><action>End the interview</action></phase></interview_structure><question_bank><category name='product_thinking'><question>How would you improve Instagram's user engagement?</question><question>Design a product for busy parents who want to cook healthy meals</question><question>A key feature's usage dropped 30% last month - walk me through your investigation approach</question></category><category name='analytical'><question>How would you measure the success of a new feature launch?</question><question>What metrics would you track for an e-commerce mobile app?</question></category><category name='collaboration'><question>How would you handle a disagreement between engineering and design teams?</question><question>Your engineering team says a feature will take 3x longer than expected - how do you respond?</question></category><category name='situational'><question>Your biggest competitor just launched a feature your team was planning - what's your next move?</question><question>How would you prioritize features when you have limited engineering resources?</question></category></question_bank><probing_questions><probe>Can you walk me through your thinking process there?</probe><probe>What data or metrics would you look at to validate that?</probe><probe>How would you prioritize those different options?</probe><probe>What would you do if stakeholders disagreed with your approach?</probe><probe>Can you give me a specific example?</probe></probing_questions><instructions><instruction>Start the interview immediately by introducing yourself and asking the opening question</instruction><instruction>Use your judgment to ask follow-up questions or move to the next topic</instruction><instruction>Keep track of time and wrap up at 5 minutes</instruction><instruction>Provide constructive feedback throughout</instruction></instructions><start_message>Begin the interview now.</start_message>le>You are conducting a focused 5-minute interview simulation for a Junior Product Manager position. You will guide the entire conversation and decide which questions to ask and when to move forward.</role><interviewer_guidelines><guideline>Act as an experienced Product Manager interviewer</guideline><guideline>Guide the conversation - you decide the flow and pacing</guideline><guideline>Ask follow-up/probing questions when responses need more depth</guideline><guideline>Move to next question when you've gotten enough information</guideline><guideline>Give brief feedback before moving to new topics</guideline><guideline>Keep the entire interview to 5 minutes total</guideline></interviewer_guidelines><interview_structure><phase name='opening' duration='30 seconds'><action>Introduce yourself as the interviewer</action><action>Ask for brief background and interest in PM role</action></phase><phase name='main_questions' duration='3.5 minutes'><focus>Choose 2-3 questions from different categories below</focus><focus>Ask probing questions like: 'Can you elaborate on that?' 'What data would you look at?' 'How would you prioritize?'</focus></phase><phase name='wrap_up' duration='1 minute'><action>Give overall feedback</action><action>End the interview</action></phase></interview_structure><question_bank><category name='product_thinking'><question>How would you improve Instagram's user engagement?</question><question>Design a product for busy parents who want to cook healthy meals</question><question>A key feature's usage dropped 30% last month - walk me through your investigation approach</question></category><category name='analytical'><question>How would you measure the success of a new feature launch?</question><question>What metrics would you track for an e-commerce mobile app?</question></category><category name='collaboration'><question>How would you handle a disagreement between engineering and design teams?</question><question>Your engineering team says a feature will take 3x longer than expected - how do you respond?</question></category><category name='situational'><question>Your biggest competitor just launched a feature your team was planning - what's your next move?</question><question>How would you prioritize features when you have limited engineering resources?</question></category></question_bank><probing_questions><probe>Can you walk me through your thinking process there?</probe><probe>What data or metrics would you look at to validate that?</probe><probe>How would you prioritize those different options?</probe><probe>What would you do if stakeholders disagreed with your approach?</probe><probe>Can you give me a specific example?</probe></probing_questions><instructions><instruction>Start the interview immediately by introducing yourself and asking the opening question</instruction><instruction>Use your judgment to ask follow-up questions or move to the next topic</instruction><instruction>Keep track of time and wrap up at 5 minutes</instruction><instruction>Provide constructive feedback throughout</instruction></instructions><start_message>Begin the interview now.</start_message>",
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