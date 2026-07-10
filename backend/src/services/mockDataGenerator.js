/**
 * Generates mock data for Categorical visualizations (e.g. Bar, Pie charts).
 * Formatted as simple Key-Value pairs.
 */
function generateCategoricalData(sourceType = 'sales') {
  switch (sourceType) {
    case 'browsers':
      return [
        { key: 'Chrome', value: 58.4 },
        { key: 'Safari', value: 18.2 },
        { key: 'Edge', value: 8.5 },
        { key: 'Firefox', value: 6.1 },
        { key: 'Opera', value: 3.4 },
        { key: 'Others', value: 5.4 }
      ];
    case 'regions':
      return [
        { key: 'North America', value: 420000 },
        { key: 'Europe', value: 310000 },
        { key: 'Asia Pacific', value: 580000 },
        { key: 'Latin America', value: 125000 },
        { key: 'Middle East & Africa', value: 95000 }
      ];
    case 'sales':
    default:
      return [
        { key: 'Electronics', value: 84000 },
        { key: 'Clothing', value: 62000 },
        { key: 'Home & Kitchen', value: 48000 },
        { key: 'Books & Media', value: 29000 },
        { key: 'Sports & Outdoors', value: 35000 }
      ];
  }
}

/**
 * Generates mock data for Temporal visualizations (e.g. Line, Area charts).
 * Generates ISO-8601 timestamps and mock metrics with trend fluctuations.
 */
function generateTemporalData(period = '30d', trend = 'upward') {
  const data = [];
  const now = new Date();
  
  const pointsCount = period === '24h' ? 24 : 30;
  const timeStepMs = period === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  let baseVal = 100;
  for (let i = pointsCount - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * timeStepMs);
    const index = pointsCount - 1 - i;
    
    let trendFactor = 0;
    if (trend === 'upward') {
      trendFactor = index * 2.5;
    } else if (trend === 'downward') {
      trendFactor = -index * 1.5;
    } else if (trend === 'seasonal') {
      trendFactor = Math.sin(index / 3) * 15;
    }

    const randomNoise = Math.random() * 8 - 4;
    const value = Math.round(Math.max(10, baseVal + trendFactor + randomNoise));
    
    data.push({
      timestamp: time.toISOString(),
      value,
      label: period === '24h' 
        ? `${time.getHours()}:00` 
        : `${time.getMonth() + 1}/${time.getDate()}`
    });
  }

  return data;
}

/**
 * Generates mock data for Hierarchical visualizations (e.g. Treemap).
 * Returns a nested tree structure.
 */
function generateHierarchicalData(schemaType = 'organization') {
  if (schemaType === 'disk') {
    return {
      name: 'Root Drive',
      children: [
        {
          name: 'System',
          children: [
            { name: 'OS Files', value: 45 },
            { name: 'Recovery', value: 12 },
            { name: 'Logs', value: 5 }
          ]
        },
        {
          name: 'Users',
          children: [
            {
              name: 'Alice',
              children: [
                { name: 'Documents', value: 30 },
                { name: 'Downloads', value: 85 },
                { name: 'Pictures', value: 42 }
              ]
            },
            {
              name: 'Bob',
              children: [
                { name: 'Projects', value: 110 },
                { name: 'Music', value: 25 }
              ]
            }
          ]
        },
        {
          name: 'Applications',
          children: [
            { name: 'IDE', value: 8 },
            { name: 'Browsers', value: 4 },
            { name: 'Docker', value: 18 }
          ]
        }
      ]
    };
  }

  // Default: Corporate Budget Allocation
  return {
    name: 'Total Budget ($1M)',
    children: [
      {
        name: 'Product & Engineering',
        children: [
          { name: 'R&D Development', value: 280000 },
          { name: 'Cloud Infrastructure', value: 120000 },
          { name: 'QA & Testing Tools', value: 45000 },
          { name: 'Product Management', value: 65000 }
        ]
      },
      {
        name: 'Sales & Marketing',
        children: [
          { name: 'Digital Advertising', value: 180000 },
          { name: 'Event Sponsorships', value: 70000 },
          { name: 'Sales Commissions', value: 95000 },
          { name: 'Branding & Creatives', value: 35000 }
        ]
      },
      {
        name: 'Operations & HR',
        children: [
          { name: 'Office Spaces', value: 50000 },
          { name: 'Recruiting Platforms', value: 30000 },
          { name: 'Employee Benefits', value: 30000 }
        ]
      }
    ]
  };
}

/**
 * Generates mock data for Relational visualizations (e.g. Scatter plot).
 * Returns coordinate coordinates (x, y, and optional size z).
 */
function generateRelationalData(sourceType = 'marketing') {
  if (sourceType === 'fitness') {
    return Array.from({ length: 40 }).map((_, i) => {
      const duration = Math.round(15 + Math.random() * 75);
      const calories = Math.round(duration * (6 + Math.random() * 4) + (Math.random() * 50 - 25));
      const heartRate = Math.round(110 + Math.random() * 60);
      return {
        x: duration,
        y: calories,
        z: heartRate,
        label: `User ${i + 1}`
      };
    });
  }

  return [
    { x: 12.5, y: 2.4, z: 15, label: 'Campaign Alpha' },
    { x: 18.0, y: 3.1, z: 22, label: 'Campaign Beta' },
    { x: 8.2, y: 1.8, z: 9, label: 'Campaign Gamma' },
    { x: 25.0, y: 4.2, z: 45, label: 'Campaign Delta' },
    { x: 5.0, y: 1.1, z: 4, label: 'Campaign Epsilon' },
    { x: 15.5, y: 2.9, z: 28, label: 'Campaign Zeta' },
    { x: 22.1, y: 3.8, z: 38, label: 'Campaign Eta' },
    { x: 30.0, y: 4.9, z: 62, label: 'Campaign Theta' },
    { x: 10.4, y: 2.1, z: 12, label: 'Campaign Iota' },
    { x: 14.2, y: 2.6, z: 18, label: 'Campaign Kappa' },
    { x: 19.8, y: 3.5, z: 31, label: 'Campaign Lambda' },
    { x: 27.5, y: 4.5, z: 54, label: 'Campaign Mu' }
  ];
}

module.exports = {
  generateCategoricalData,
  generateTemporalData,
  generateHierarchicalData,
  generateRelationalData
};
