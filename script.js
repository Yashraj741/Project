// Background Remover Functionality
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const uploadSpinner = document.getElementById('uploadSpinner');
const removeSpinner = document.getElementById('removeSpinner');
const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
const resetBtn = document.getElementById('resetBtn');
const outputSection = document.getElementById('output');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');

// API key for Remove.bg
const API_KEY = "1eVmq61BtNLvCkaPqCgwEpTn";

// Show file preview only in the upload box
fileInput.addEventListener('change', function () {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Clear any previous preview in the result section
            filePreview.innerHTML = '';
            // Show file preview in the upload box
            filePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="max-width: 100%; border-radius: 10px;">`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle background removal
removeBackgroundBtn.addEventListener('click', async function () {
    const file = fileInput.files[0];
    if (!file) {
        alert("Please upload an image first!");
        return;
    }

    removeSpinner.style.display = 'block';

    const formData = new FormData();
    formData.append('image_file', file);

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to remove background. Please try again.");
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Clear any preview before showing the processed image
        filePreview.innerHTML = ''; // Remove the preview from the upload section

        // Display the processed image in the result section
        resultImage.src = imageUrl;
        outputSection.style.display = 'block';
        removeSpinner.style.display = 'none';

        // Enable the download button
        downloadBtn.addEventListener('click', function () {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'background-removed-image.png';
            link.click();
        });
    } catch (error) {
        alert(`Error: ${error.message}`);
        removeSpinner.style.display = 'none';
    }
});

// Reset the application
resetBtn.addEventListener('click', function () {
    fileInput.value = "";
    filePreview.innerHTML = ""; // Clear the preview in the upload box
    outputSection.style.display = 'none'; // Hide the result section
    removeSpinner.style.display = 'none';
});

// JPG to PDF Converter Functionality
const form = document.getElementById('uploadForm');
const pdfFileInput = document.getElementById('imageUpload');
const pdfPreviewDiv = document.getElementById('preview');
const pdfStatusDiv = document.getElementById('status');
const pdfDownloadBtn = document.createElement('button');

form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submit

    pdfStatusDiv.textContent = "Processing...";
    const file = pdfFileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            pdfPreviewDiv.innerHTML = '';
            pdfPreviewDiv.appendChild(img);
            img.onload = function () {
                try {
                    const doc = new jspdf.jsPDF();
                    const imgWidth = doc.internal.pageSize.getWidth();
                    const imgHeight = img.naturalHeight * imgWidth / img.naturalWidth;
                    doc.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);
                    const pdfOutput = doc.output('blob');

                    pdfDownloadBtn.textContent = 'Download PDF';
                    pdfDownloadBtn.onclick = function () {
                        const url = window.URL.createObjectURL(pdfOutput);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'converted.pdf');
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                    }

                    pdfStatusDiv.textContent = 'Conversion complete.';
                    if (!pdfDownloadBtn.parentNode) {
                        pdfStatusDiv.appendChild(pdfDownloadBtn);
                    }

                } catch (error) {
                    console.error("Error generating PDF:", error);
                    pdfStatusDiv.textContent = "Error generating PDF: " + error.message;
                }
            }
        };
        reader.readAsDataURL(file);
    } else {
        pdfStatusDiv.textContent = "Please select a file.";
    }
});