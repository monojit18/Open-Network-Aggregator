async function createMessage(searchText, filters) {
  console.log('Initial searchText:', searchText);
  console.log('Received filters:', JSON.stringify(filters, null, 2));

  let updatedSearchText = searchText;

  const getFilterValue = filterValue => {
    if (typeof filterValue === 'object' && filterValue !== null) {
      return (
        filterValue.value || filterValue.label || JSON.stringify(filterValue)
      );
    }
    return filterValue;
  };

  const filterOrder = [
    'Course Level',
    'Course Duration',
    'Subject Area',
    'Course Provider',
    'Course Type',
    'Gender',
    'Academic Eligibility',
    'Social Eligibility',
    'Location',
    'Industry',
    'Employment Type',
  ];

  const filterParts = [];

  filterOrder.forEach(filterType => {
    if (filters[filterType] && filters[filterType].length > 0) {
      const values = filters[filterType].map(getFilterValue);
      switch (filterType) {
        case 'Course Level':
          filterParts.push(`${values.join(', ')} level`);
          break;
        case 'Course Duration':
          filterParts.push(`${values.join(', ')} duration`);
          break;
        case 'Subject Area':
          // Remove the count from the subject area
          const cleanedValues = values.map(v => v.replace(/\s*\(\d+\)$/, ''));
          filterParts.push(`in ${cleanedValues.join(', ')}`);
          break;
        case 'Course Provider':
          filterParts.push(`by ${values.join(', ')}`);
          break;
        case 'Course Type':
          filterParts.push(`${values.join(', ')} courses`);
          break;
        case 'Gender':
          filterParts.push(values[0]);
          break;
        case 'Academic Eligibility':
          filterParts.push(`for ${values.join(', ')}`);
          break;
        case 'Social Eligibility':
          filterParts.push(`for ${values.join(', ')} category`);
          break;
        case 'Location':
          filterParts.push(`in ${values.join(', ')}`);
          break;
        case 'Industry':
          filterParts.push(
            `in ${values.map(v => v.replace(/_/g, ' ')).join(', ')} industry`,
          );
          break;
        case 'Employment Type':
          filterParts.push(
            `for ${values
              .map(v => v.replace(/_/g, ' '))
              .join(', ')} employment`,
          );
          break;
      }
    }
  });

  if (filterParts.length > 0) {
    updatedSearchText += ' ' + filterParts.join(' ');
  }

  console.log('Updated searchText:', updatedSearchText);
  return updatedSearchText;
}

export {createMessage};
