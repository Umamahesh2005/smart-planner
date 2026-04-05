document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const recordingStatus = document.getElementById('recordingStatus');
    
    let messageHistory = [];
    
    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.style.padding = '1rem';
        div.style.borderRadius = '12px';
        div.style.maxWidth = '80%';
        div.style.marginBottom = '1rem';
        div.style.boxShadow = 'var(--card-shadow)';
        
        if(role === 'user') {
            div.style.alignSelf = 'flex-end';
            div.style.backgroundColor = 'var(--primary-color)';
            div.style.color = 'white';
        } else {
            div.style.alignSelf = 'flex-start';
            div.style.backgroundColor = 'var(--white)';
            div.style.color = 'var(--text-color)';
        }
        
        div.innerHTML = `<p style="margin: 0;">${text}</p>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    async function sendMessage() {
        const text = chatInput.value.trim();
        if(!text) return;
        
        appendMessage('user', text);
        chatInput.value = '';
        messageHistory.push({ role: 'user', content: text });
        
        // Disable input
        chatInput.disabled = true;
        sendBtn.disabled = true;
        
        // Loading indicator
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.id = loadingId;
        loadingDiv.style.alignSelf = 'flex-start';
        loadingDiv.innerText = 'Eureka is thinking...';
        loadingDiv.style.color = 'var(--text-light)';
        loadingDiv.style.fontStyle = 'italic';
        chatBox.appendChild(loadingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messageHistory })
            });
            
            const data = await res.json();
            document.getElementById(loadingId).remove();
            
            if(data.error) {
                appendMessage('assistant', 'Sorry, I encountered an error: ' + data.error);
            } else {
                appendMessage('assistant', data.reply);
                messageHistory.push({ role: 'assistant', content: data.reply });
            }
        } catch(e) {
            document.getElementById(loadingId).remove();
            appendMessage('assistant', 'Sorry, an error occurred.');
        }
        
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') sendMessage();
    });
    
    // Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            recordingStatus.style.display = 'block';
            micBtn.style.color = 'red';
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            sendMessage();
        };
        
        recognition.onerror = (e) => {
            recordingStatus.style.display = 'none';
            micBtn.style.color = '';
            alert('Microphone error: ' + e.error);
        };
        
        recognition.onend = () => {
            recordingStatus.style.display = 'none';
            micBtn.style.color = '';
        };
        
        micBtn.addEventListener('click', () => {
            recognition.start();
        });
    } else {
        micBtn.style.display = 'none'; // hide if not supported
    }
});
