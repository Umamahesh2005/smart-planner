document.addEventListener('DOMContentLoaded', () => {
    const plannerForm = document.getElementById('plannerForm');
    if(plannerForm) {
        plannerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Gather data
            const dest = document.getElementById('destination').value;
            const amount = document.getElementById('budget').value;
            const source = document.getElementById('source').value;
            const days = window.calculatedDays || 3;
            // hidden inputs
            const people = document.getElementById('people').value;
            const prefs = document.getElementById('preferences').value + ` (Traveling from ${source})`;
            
            // Show loaders
            // Because plannerForm might be embedded, we might hide the whole component
            const plannerFormContainer = document.getElementById('planner-form-section') || plannerForm;
            plannerFormContainer.style.display = 'none';
            document.getElementById('loadingState').style.display = 'flex';
            
            try {
                // Fetch AI Plan first
                const currentLang = localStorage.getItem('eureka_lang') || 'en';
                const aiRes = await fetch('/api/plan_trip', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        destination: dest,
                        source: source,
                        budget: amount,
                        days: days,
                        people: people,
                        preferences: prefs,
                        language: currentLang === 'kn' ? 'Kannada' : 'English'
                    })
                });
                
                const planData = await aiRes.json();
                
                if(planData.error) {
                    throw new Error(planData.error);
                }
                
                localStorage.setItem('tripResults', JSON.stringify(planData));
                
                // Fetch weather implicitly
                try {
                    const weatherRes = await fetch(`/api/weather?city=${encodeURIComponent(dest)}`);
                    const weatherData = await weatherRes.json();
                    if(!weatherData.error) {
                        localStorage.setItem('weatherResults', JSON.stringify(weatherData));
                    }
                } catch(e) {
                    console.error("Weather failed, continuing...", e);
                }
                
                // Redirect to results
                window.location.href = '/results';
                
            } catch(error) {
                alert("Failed to generate plan: " + error.message);
                plannerForm.style.display = 'block';
                document.getElementById('loadingState').style.display = 'none';
            }
        });
    }
});
