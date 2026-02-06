const API_URL = 'http://localhost:5000/api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // getToken: () =>{
  //   return localStorage.getItem('token');
  // },

  // getCurrentUser: () => {
  //   const user = localStorage.getItem('user');
  //   return user ? JSON.parse(user) : null;
  // },

  // isAuthenticated: () => {
  //   return !!localStorage.getItem('token');
  // }
};

export default authService;
