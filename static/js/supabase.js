let supabaseClient = null;

if (window.ENV && window.ENV.SUPABASE_URL && window.ENV.SUPABASE_KEY) {
    supabaseClient = window.supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_KEY);
    window.supabaseClient = supabaseClient;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            setupLoggedInNav();
        }
    } else {
        const user = localStorage.getItem('user');
        if(user) {
            setupLoggedInNav();
        }
    }
});

function setupLoggedInNav() {
    const authNav = document.getElementById('nav-auth');
    const dashNav = document.getElementById('nav-dashboard');
    const connNav = document.getElementById('nav-connect');
    const logoutNav = document.getElementById('nav-logout');
    if(authNav) authNav.style.display = 'none';
    if(dashNav) dashNav.style.display = 'inline-block';
    if(connNav) connNav.style.display = 'inline-block';
    if(logoutNav) logoutNav.style.display = 'inline-block';
}

async function logoutUser() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    localStorage.removeItem('user');
    window.location.href = '/';
}
