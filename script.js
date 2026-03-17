document.addEventListener('DOMContentLoaded', () => {
    const fetchBtn = document.getElementById('fetch-btn');
    const loadingEl = document.getElementById('loading');
    const container = document.getElementById('apod-container');
    const imageEl = document.getElementById('apod-image');
    const titleEl = document.getElementById('apod-title');
    const creditEl = document.getElementById('apod-credit');
    const descEl = document.getElementById('apod-description');
    const errorEl = document.getElementById('error-message');

    fetchBtn.addEventListener('click', async () => {
        // Hide previous content and errors, show loading
        container.classList.add('hidden');
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
        loadingEl.classList.remove('hidden');

        try {
            const response = await fetch('/api/apod');
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            const data = await response.json();

            // Console log the source
            console.log(`Data source: ${data.source}`);

            // Update DOM
            imageEl.src = data.url;
            imageEl.alt = data.title;
            titleEl.textContent = data.title;
            creditEl.textContent = data.credit;
            descEl.textContent = data.explanation;

            // Hide loading, show container
            loadingEl.classList.add('hidden');
            container.classList.remove('hidden');
        } catch (error) {
            console.error('Fetch error:', error);
            loadingEl.classList.add('hidden');
            errorEl.textContent = 'Failed to load APOD. Please try again later.';
            errorEl.classList.remove('hidden');
        }
    });
});