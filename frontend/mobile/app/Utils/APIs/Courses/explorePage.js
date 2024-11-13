// Infinite list of all available courses.

import {getToken} from '../../storage';
const BASE_URL =
  'http://4.186.25.108:4001/api/v1/onest/backend/course/cache_course/list?per_page=-1';

const fetchApiData = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Token not found');
    }

    const url = `${BASE_URL}`;

    const response = await fetch(url, {
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
    console.error('API error:', error.message);
    throw error;
  }
};

export const getAllCourses = async () => {
  return fetchApiData();
};
