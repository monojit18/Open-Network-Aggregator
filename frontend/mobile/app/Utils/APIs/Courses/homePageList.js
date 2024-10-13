// list of allcourses, recently viewed courses, popular courses
import {getToken} from '../../storage';

const BASE_URL =
  'http://4.186.25.108:4001/api/v1/onest/backend/course/home_page/list';

export const homePageList = async endpoint => {
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
    // console.log('RESPONSE FROM LANDINGPAGE API: ', data);

    return data.data;
  } catch (error) {
    console.error('API error:', error.message);
    throw error;
  }
};
