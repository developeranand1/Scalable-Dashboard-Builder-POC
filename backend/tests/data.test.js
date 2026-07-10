const request = require('supertest');
const app = require('../src/server');
const {
  generateCategoricalData,
  generateTemporalData,
  generateHierarchicalData,
  generateRelationalData
} = require('../src/services/mockDataGenerator');
const {
  CategoricalDataSchema,
  TemporalDataSchema,
  HierarchicalNodeSchema,
  RelationalDataSchema
} = require('../src/schemas/widgetData');

describe('Data Generator Validation tests', () => {
  test('generateCategoricalData generates structures matching Categorical Schema', () => {
    const data = generateCategoricalData('sales');
    const result = CategoricalDataSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('key');
      expect(result.data[0]).toHaveProperty('value');
    }
  });

  test('generateTemporalData generates structures matching Temporal Schema (ISO-8601 validation)', () => {
    const data = generateTemporalData('30d', 'seasonal');
    const result = TemporalDataSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBe(30);
      // Verify ISO-8601 timestamp string
      expect(new Date(result.data[0].timestamp).toISOString()).toBe(result.data[0].timestamp);
    }
  });

  test('generateHierarchicalData generates valid nested tree structures', () => {
    const data = generateHierarchicalData('organization');
    const result = HierarchicalNodeSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty('name');
      expect(result.data.children.length).toBeGreaterThan(0);
    }
  });

  test('generateRelationalData generates valid 2D/3D scatter points', () => {
    const data = generateRelationalData('marketing');
    const result = RelationalDataSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('x');
      expect(result.data[0]).toHaveProperty('y');
    }
  });
});

describe('Express REST API Endpoints tests', () => {
  test('GET /api/widgets/data/categorical - Success', async () => {
    const res = await request(app)
      .get('/api/widgets/data/categorical')
      .query({ source: 'sales' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/widgets/data/invalid_type - Failure', async () => {
    const res = await request(app).get('/api/widgets/data/unknown-type');
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
  });

  test('POST /api/widgets/batch-data - Success concurrently fetches data', async () => {
    const payload = {
      requests: [
        { id: 'w1', type: 'categorical', queryParams: { source: 'browsers' } },
        { id: 'w2', type: 'temporal', queryParams: { period: '24h' } }
      ]
    };
    const res = await request(app)
      .post('/api/widgets/batch-data')
      .send(payload);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.widgets.w1.success).toBe(true);
    expect(res.body.widgets.w2.success).toBe(true);
    expect(Array.isArray(res.body.widgets.w1.data)).toBe(true);
    expect(Array.isArray(res.body.widgets.w2.data)).toBe(true);
  });
});
