const BASE_URL = "http://10.0.2.2:7123/api/auth";

// Kayıt ol
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Kayıt sırasında hata oluştu." };
  }
};

// Giriş yap
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Giriş sırasında hata oluştu." };
  }
};
