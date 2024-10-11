// src/utils/api/auth.js
import setToken from '../../storage';

const BASE_URL = 'http://4.186.25.108:4001/api/v1/onest/backend/auth';

export const login = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login: email }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Error logging in: ${error.message}`);
  }
};

export const verifyOTP = async (id, otp) => {
  try {
    if (otp != 777777) {
      throw new Error('Incorrect otp');
    }
    const response = await fetch(`${BASE_URL}/verify_otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, otp }),
    });

    if (!response.ok) {
      throw new Error('OTP verification failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Error verifying OTP: ${error.message}`);
  }
};
