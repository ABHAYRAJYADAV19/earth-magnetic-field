function toggleInfoBox() {
    const infoBox = document.getElementById('magnetic-info');
    infoBox.classList.toggle('active');
}

function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Show selected tab content and activate button
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);

    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.classList.toggle('fa-moon');
        themeIcon.classList.toggle('fa-sun');
    }
}