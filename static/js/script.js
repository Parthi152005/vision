// Common UI interactions
document.addEventListener('DOMContentLoaded', () => {

    // Helper syntax for buttons
    const setLoading = (btn, isLoading, originalText, loadingText) => {
        if (isLoading) {
            btn.disabled = true;
            const icon = btn.querySelector('i');
            btn.dataset.originalIcon = icon.className;
            icon.className = 'fa-solid fa-spinner fa-spin spinner';
            btn.querySelector('span').textContent = loadingText || 'Processing...';
        } else {
            btn.disabled = false;
            btn.querySelector('i').className = btn.dataset.originalIcon;
            btn.querySelector('span').textContent = originalText;
        }
    };

    // Crop Recommendation Logic (Image Upload based)
    const cropForm = document.getElementById('crop-form');
    if (cropForm) {
        const uploadZone = document.getElementById('crop-upload-zone');
        const fileInput = document.getElementById('crop-file-input');
        const imagePreviewContainer = document.getElementById('crop-image-preview-container');
        const imagePreview = document.getElementById('crop-image-preview');
        const removeImageBtn = document.getElementById('crop-remove-image');
        const submitBtn = document.getElementById('crop-submit-btn');
        const uploadContent = uploadZone.querySelector('.upload-content');

        // Drag and drop events for crop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => uploadZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('dragover'), false);
        });

        uploadZone.addEventListener('drop', (e) => handleCropFiles(e.dataTransfer.files));

        uploadZone.addEventListener('click', (e) => {
            if (e.target !== removeImageBtn && e.target !== removeImageBtn.querySelector('i')) {
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', function() { handleCropFiles(this.files); });

        function handleCropFiles(files) {
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagePreview.src = e.target.result;
                        uploadContent.classList.add('hidden');
                        imagePreviewContainer.classList.remove('hidden');
                        submitBtn.disabled = false;
                        
                        if(fileInput.files.length === 0) {
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            fileInput.files = dataTransfer.files;
                        }
                    }
                    reader.readAsDataURL(file);
                }
            }
        }

        removeImageBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            fileInput.value = '';
            imagePreview.src = '#';
            imagePreviewContainer.classList.add('hidden');
            uploadContent.classList.remove('hidden');
            submitBtn.disabled = true;
            document.getElementById('crop-result').classList.remove('show');
            setTimeout(() => document.getElementById('crop-result').classList.add('hidden'), 500);
        });

        cropForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultBox = document.getElementById('crop-result');
            const resultTypeName = document.getElementById('soil-type-name');
            const resultRecommendations = document.getElementById('crop-recommendations');
            const resultSuggestion = document.getElementById('farming-suggestion');
            
            setLoading(submitBtn, true, 'Analyze Soil', 'Scanning via AI...');
            resultBox.classList.remove('show');
            setTimeout(() => resultBox.classList.add('hidden'), 500);
            
            const formData = new FormData(cropForm);
            
            try {
                const response = await fetch('/api/predict_crop', { method: 'POST', body: formData });
                const result = await response.json();
                
                setTimeout(() => {
                    setLoading(submitBtn, false, 'Analyze Soil');
                    if (result.error) {
                        resultTypeName.textContent = 'Error: ' + result.error;
                        resultTypeName.className = 'highlight-text';
                        resultTypeName.style.color = 'var(--primary-red)';
                        resultRecommendations.textContent = '';
                        resultSuggestion.textContent = 'Please try again.';
                    } else {
                        resultTypeName.textContent = result.soil_type;
                        resultTypeName.style.color = '';
                        resultRecommendations.textContent = result.recommended_crops;
                        resultSuggestion.textContent = result.suggestion;
                    }
                    resultBox.classList.remove('hidden');
                    setTimeout(() => resultBox.classList.add('show'), 50);
                }, 1000); 
            } catch (error) {
                setLoading(submitBtn, false, 'Analyze Soil');
                resultTypeName.textContent = 'Network Error';
                resultTypeName.style.color = 'var(--primary-red)';
                resultRecommendations.textContent = '';
                resultSuggestion.textContent = 'Could not connect to the analysis engine.';
                resultBox.classList.remove('hidden');
                setTimeout(() => resultBox.classList.add('show'), 50);
            }
        });
    }

    // Fertilizer Calculator Logic
    const fertilizerForm = document.getElementById('fertilizer-form');
    if (fertilizerForm) {
        fertilizerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('fert-submit-btn');
            const resultBox = document.getElementById('fert-result');
            const resultName = document.getElementById('fert-name');
            
            setLoading(btn, true, 'Calculate Fertilizer', 'Calculating...');
            resultBox.classList.remove('show');
            setTimeout(() => resultBox.classList.add('hidden'), 500);
            
            const formData = new FormData(fertilizerForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/api/predict_fertilizer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                setTimeout(() => {
                    setLoading(btn, false, 'Calculate Fertilizer');
                    if (result.error) {
                        resultName.textContent = 'Error: ' + result.error;
                        resultName.style.color = 'var(--primary-red)';
                    } else {
                        resultName.textContent = result.prediction;
                        resultName.style.color = 'var(--primary-blue)';
                    }
                    resultBox.classList.remove('hidden');
                    setTimeout(() => resultBox.classList.add('show'), 50);
                }, 1000);
                
            } catch (error) {
                setLoading(btn, false, 'Calculate Fertilizer');
                resultName.textContent = 'Network Error';
                resultBox.classList.remove('hidden');
                setTimeout(() => resultBox.classList.add('show'), 50);
            }
        });
    }

    // Disease Detection Logic
    const diseaseForm = document.getElementById('disease-form');
    if (diseaseForm) {
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');
        const imagePreviewContainer = document.getElementById('image-preview-container');
        const imagePreview = document.getElementById('image-preview');
        const removeImageBtn = document.getElementById('remove-image');
        const submitBtn = document.getElementById('disease-submit-btn');
        const uploadContent = uploadZone.querySelector('.upload-content');

        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => uploadZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('dragover'), false);
        });

        uploadZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        });

        uploadZone.addEventListener('click', (e) => {
            if (e.target !== removeImageBtn && e.target !== removeImageBtn.querySelector('i')) {
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        function handleFiles(files) {
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagePreview.src = e.target.result;
                        uploadContent.classList.add('hidden');
                        imagePreviewContainer.classList.remove('hidden');
                        submitBtn.disabled = false;
                        
                        // assign the file to the input if it came from drop
                        if(fileInput.files.length === 0) {
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            fileInput.files = dataTransfer.files;
                        }
                    }
                    reader.readAsDataURL(file);
                }
            }
        }

        removeImageBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Stop form click
            e.stopPropagation();
            fileInput.value = '';
            imagePreview.src = '#';
            imagePreviewContainer.classList.add('hidden');
            uploadContent.classList.remove('hidden');
            submitBtn.disabled = true;
            
            document.getElementById('disease-result').classList.remove('show');
            setTimeout(() => document.getElementById('disease-result').classList.add('hidden'), 500);
        });

        // Submit form
        diseaseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const resultBox = document.getElementById('disease-result');
            const resultName = document.getElementById('disease-name');
            const resultTreatment = document.getElementById('treatment-advice');
            
            setLoading(submitBtn, true, 'Analyze Leaf Image', 'Scanning via AI...');
            resultBox.classList.remove('show');
            setTimeout(() => resultBox.classList.add('hidden'), 500);
            
            const formData = new FormData(diseaseForm);
            
            try {
                const response = await fetch('/api/predict_disease', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                setTimeout(() => {
                    setLoading(submitBtn, false, 'Analyze Leaf Image');
                    if (result.error) {
                        resultName.textContent = 'Error: ' + result.error;
                        resultName.className = 'highlight-text-red';
                        resultTreatment.textContent = 'Please try again with a different image.';
                    } else {
                        resultName.textContent = result.name;
                        resultName.className = result.name === 'Healthy Plant' ? 'highlight-text' : 'highlight-text-red';
                        resultTreatment.textContent = result.treatment;
                    }
                    resultBox.classList.remove('hidden');
                    setTimeout(() => resultBox.classList.add('show'), 50);
                }, 1500); // Artificial delay to simulate heavy processing
                
            } catch (error) {
                setLoading(submitBtn, false, 'Analyze Leaf Image');
                resultName.textContent = 'Network Error';
                resultTreatment.textContent = 'Could not connect to the analysis engine.';
                resultBox.classList.remove('hidden');
                setTimeout(() => resultBox.classList.add('show'), 50);
            }
        });
    }

});
