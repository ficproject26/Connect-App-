export const authService = {
  login: async (email, password, role) => {
    return { success: true, user: { email, role } };
  },
  logout: async () => {
    return { success: true };
  }
};
