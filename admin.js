document.addEventListener('DOMContentLoaded', function() {
    const sendBtn = document.getElementById('sendBtn');
    const targetInput = document.getElementById('target');
    const bugTypeSelect = document.getElementById('bug-type');
    const statusDiv = document.getElementById('status');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');
    const advancedOptions = document.getElementById('advanced-options');
    const iterationsInput = document.getElementById('iterations');
    const durationInput = document.getElementById('duration');
    const countInput = document.getElementById('count');

    // Toggle advanced options based on bug type
    bugTypeSelect.addEventListener('change', function() {
        const bugType = this.value;
        advancedOptions.style.display = 'none';
        iterationsInput.style.display = 'none';
        durationInput.style.display = 'none';
        countInput.style.display = 'none';

        if (bugType === 'crash-infinity') {
            advancedOptions.style.display = 'block';
            iterationsInput.style.display = 'block';
        } else if (bugType === 'blank-freeze') {
            advancedOptions.style.display = 'block';
            durationInput.style.display = 'block';
        } else if (bugType === 'lag-flood') {
            advancedOptions.style.display = 'block';
            countInput.style.display = 'block';
        }
    });

    sendBtn.addEventListener('click', async function() {
        const target = targetInput.value.trim();
        const bugType = bugTypeSelect.value;

        if (!target) {
            showStatus('Please enter target number!', 'error');
            return;
        }

        // Validate target format (basic validation)
        if (!isValidPhone(target)) {
            showStatus('Please enter a valid phone number!', 'error');
            return;
        }

        // Prepare payload based on bug type
        const payload = { target };
        
        // Add advanced options
        if (bugType === 'crash-infinity' && iterationsInput.value) {
            payload.iterations = parseInt(iterationsInput.value);
        } else if (bugType === 'blank-freeze' && durationInput.value) {
            payload.duration = parseInt(durationInput.value);
        } else if (bugType === 'lag-flood' && countInput.value) {
            payload.count = parseInt(countInput.value);
        }

        // Determine endpoint
        let endpoint = '';
        switch(bugType) {
            case 'crash-infinity':
                endpoint = '/api/crash-infinity';
                break;
            case 'blank-freeze':
                endpoint = '/api/blank-freeze';
                break;
            case 'lag-flood':
                endpoint = '/api/lag-flood';
                break;
            case 'single-crash':
                endpoint = '/api/crash';
                break;
            default:
                endpoint = '/api/crash';
        }

        // Disable UI during request
        setLoadingState(true);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                showStatus(`✅ ${result.message}`, 'success');
                
                // Success animation
                sendBtn.classList.add('success');
                setTimeout(() => {
                    sendBtn.classList.remove('success');
                }, 2000);
                
                // Log details to console
                console.log('Attack successful:', result);
            } else {
                showStatus(`❌ ${result.message}`, 'error');
                console.error('Attack failed:', result);
            }

        } catch (error) {
            console.error('Network error:', error);
            showStatus('❌ Network error! Check console for details.', 'error');
        } finally {
            setLoadingState(false);
        }
    });

    // Support Enter key to send
    targetInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    // Utility functions
    function setLoadingState(loading) {
        sendBtn.disabled = loading;
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            sendBtn.classList.add('sending');
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            sendBtn.classList.remove('sending');
        }
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }

    function isValidPhone(phone) {
        // Basic phone validation - adjust as needed
        const phoneRegex = /^[0-9+]{10,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Initialize advanced options
    bugTypeSelect.dispatchEvent(new Event('change'));
});