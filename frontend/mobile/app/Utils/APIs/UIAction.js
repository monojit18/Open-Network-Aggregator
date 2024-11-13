const apiUrl = '';

export const performTextAction = async (text) => {
  console.log("text:", text)
  const requestBody = {
    text: text,
    language: 'hi-IN',
    prompt: 'Context: Convert the following sentence into a UI shopping action...',
    desc: 'Example: {"action": "add", "items": [{"product": "this", "quantity": 1}]}, ...',
  };

  const requestBodyJson = JSON.stringify(requestBody);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBodyJson,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Return the parsed JSON response
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }


};

var i = 1;
var j = 1;

export const performScrollAction = (scrollViewRef, direction) => {
    if (!scrollViewRef || !scrollViewRef.current) {
      console.error('ScrollView ref is not valid.');
      return;
    }
  
    const scrollView = scrollViewRef.current;
  
    if (direction === 'down' || direction === 'Down') {
      scrollView.measure((fx, fy, width, height, px, py) => {
        const screenHeight = height;
        const scrollPosition = py + i * screenHeight;
  
        scrollView.scrollTo({ y: scrollPosition, animated: true });
        i += 1;
      });
    } else if (direction === 'up' || direction === 'Up') {
        scrollView.measure((fx, fy, width, height, px, py) => {
            const screenHeight = height;
            const scrollPosition = Math.max(0, py - (j - 1) * screenHeight);
      
            scrollView.scrollTo({ y: scrollPosition, animated: true });
            j += 1;
            i -= 1;
        });
    }
};

export const navigateToCourseDetailsByIndex = (navigation, courses, index) => {
    if (index >= 0 && index < courses.length) {
      const courseId = courses[index].course_id;
      console.log(courseId)
      navigation.navigate('CourseDetail', { courseId });
    } else {
      console.warn(`Invalid index ${index} provided. ${courses.length}`);
    }
};