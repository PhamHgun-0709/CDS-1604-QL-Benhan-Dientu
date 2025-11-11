export function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('username', user.username);
  localStorage.setItem('role', user.role);
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
}

export function getRole() { 
  return localStorage.getItem('role'); 
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getUsername() {
  return localStorage.getItem('username');
}

export function isLoggedIn() {
  return !!localStorage.getItem('token');
}
