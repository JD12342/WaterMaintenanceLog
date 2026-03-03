import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// CSRF Token setup
const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Sanctum Token setup for API calls
const sanctumToken = localStorage.getItem('sanctum_token');
if (sanctumToken) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${sanctumToken}`;
}