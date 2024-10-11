// get course material details using course Id (only after enrolled)

// get details of a course using course Id

import {getToken} from '../../storage';
const BASE_URL = 'http://4.186.25.108:4001/api/v1/onest/backend/course';

const getUserCourseDetails = async courseId => {
  try {
    const token = await getToken('token');
    if (!token) {
      throw new Error('Token not found');
    }

    const url = `${BASE_URL}/get_my_course/${courseId}`;
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
    return data;
  } catch (error) {
    console.error('API error:', error.message);
    throw error;
  }
};

export default getUserCourseDetails;
