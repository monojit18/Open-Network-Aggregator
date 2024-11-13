// list of my enrolled courses(status: In-Progress), payments (payment_status:PAID), certification(is_certificate_available:true)

import {getToken} from '../../storage';

const BASE_URL =
  'http://4.186.25.108:4001/api/v1/onest/backend/course/order/list';

const getUserCourses = async params => {
  try {
    const token = await getToken();
    // console.log(token);
    if (!token) {
      throw new Error('Token not found');
    }

    const queryParams = new URLSearchParams(params).toString();
    const url = `${BASE_URL}?${queryParams}`;
    // console.log('url: ', url);
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
    console.log(data);
    return data.data;
  } catch (error) {
    console.error('API error:', error.message);
    throw error;
  }
};

export const getUserCertifications = async () => {
  const params = {
    is_certificate_available: 'true',
  };
  return getUserCourses(params);
};

export const getUserPayments = async () => {
  const params = {
    payment_status: 'PAID',
  };
  return getUserCourses(params);
};

export const getInProgressCourses = async () => {
  const params = {
    status: 'IN-PROGRESS',
  };
  return getUserCourses(params);
};
