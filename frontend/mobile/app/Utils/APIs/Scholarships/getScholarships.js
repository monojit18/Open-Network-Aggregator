// List of all scholarships
import {getToken} from '../../storage';

const BASE_URL =
  'http://4.186.25.108:4001/api/v1/onest/backend/course/landing_page/scholarship';

export const getScholarships = async () => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('Token not found');
    }

    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching scholarship data:', error.message);
    throw error;
  }
};
