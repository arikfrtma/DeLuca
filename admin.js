document.addEventListener('DOMContentLoaded', function() {
    const sendBtn = document.getElementById('sendBtn');
    const targetInput = document.getElementById('target');
    const bugTypeSelect = document.getElementById('bug-type');
    const statusDiv = document.getElementById('status');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');

    sendBtn.addEventListener('click', async function() {
        const target = targetInput.value.trim();
        const bugType = bugTypeSelect.value;

        if (!target) {
            showStatus('❌ Masukkan nomor target!', 'error');
            return;
        }

        // Validasi nomor Indonesia
        const cleanTarget = target.replace(/[^0-9]/g, '');
        let formattedTarget = cleanTarget;
        
        if (cleanTarget.startsWith('0')) {
            formattedTarget = '62' + cleanTarget.substring(1);
        } else if (!cleanTarget.startsWith('62')) {
            formattedTarget = '62' + cleanTarget;
        }

        if (formattedTarget.length < 10 || formattedTarget.length > 15) {
            showStatus('❌ Nomor tidak valid!', 'error');
            return;
        }

        setLoadingState(true);

        try {
            const response = await fetch('/.netlify/functions/whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    target: formattedTarget,
                    bugType: bugType
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                showStatus(`✅ ${data.message}`, 'success');
                console.log('Success:', data);
                
                // Animasi sukses
                sendBtn.style.background = 'linear-gradient(45deg, #00b09b, #96c93d)';
                setTimeout(() => {
                    sendBtn.style.background = '';
                }, 2000);
                
            } else {
                showStatus(`❌ ${data.message}`, 'error');
                console.error('Error:', data);
            }

        } catch (error) {
            console.error('Network error:', error);
            showStatus('❌ Gagal mengirim! Cek console.', 'error');
        } finally {
            setLoadingState(false);
        }
    });

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
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Support Enter key
    targetInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    // Contoh nomor placeholder
    targetInput.placeholder = "Contoh: 628123456789 atau 08123456789";
});