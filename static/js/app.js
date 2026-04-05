// Main UI interactions

document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'white';
                navLinks.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                navLinks.style.padding = '1rem 0';
                navLinks.style.zIndex = '100';
            }
        });
    }
});

function showLoader(elementId) {
    const el = document.getElementById(elementId);
    if(el) el.style.display = 'flex';
}

function hideLoader(elementId) {
    const el = document.getElementById(elementId);
    if(el) el.style.display = 'none';
}
