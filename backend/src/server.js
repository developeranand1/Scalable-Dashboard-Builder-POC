const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { DashboardModel } = require('./models/Dashboard');
const { DashboardConfigSchema } = require('./schemas/widgetData');
const {
  CategoricalModel,
  TemporalModel,
  HierarchicalModel,
  RelationalModel
} = require('./models/ChartData');
const mongoose = require('mongoose');
const {
  generateCategoricalData,
  generateTemporalData,
  generateHierarchicalData,
  generateRelationalData
} = require('./services/mockDataGenerator');
const {
  CategoricalDataSchema,
  TemporalDataSchema,
  HierarchicalNodeSchema,
  RelationalDataSchema
} = require('./schemas/widgetData');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simulation of network latency (useful for testing loaders in frontend)
app.use((req, res, next) => {
  const latency = req.headers['x-simulate-latency'] 
    ? parseInt(req.headers['x-simulate-latency'], 10) 
    : 0;
  
  if (latency > 0) {
    setTimeout(next, latency);
  } else {
    next();
  }
});

// Default pre-configured layout to serve when DB is empty
const DEFAULT_DASHBOARD_ID = 'default';
const defaultDashboardLayout = {
  id: DEFAULT_DASHBOARD_ID,
  name: 'Default Monitoring System',
  widgets: [
    {
      id: 'widget-categorical-sales',
      type: 'categorical',
      title: 'Quarterly Sales by Segment',
      x: 0, y: 0, w: 6, h: 3,
      options: { source: 'sales' }
    },
    {
      id: 'widget-temporal-traffic',
      type: 'temporal',
      title: 'Network Traffic Over Time',
      x: 6, y: 0, w: 6, h: 3,
      options: { period: '30d', trend: 'seasonal' }
    },
    {
      id: 'widget-hierarchical-budget',
      type: 'hierarchical',
      title: 'Global Budget Tree Allocation',
      x: 0, y: 3, w: 6, h: 3,
      options: { source: 'organization' }
    },
    {
      id: 'widget-relational-campaigns',
      type: 'relational',
      title: 'Ad Spend vs Customer Acquisition',
      x: 6, y: 3, w: 6, h: 3,
      options: { source: 'marketing' }
    }
  ]
};

// Connect to MongoDB Atlas
connectDB();

/**
 * Helper to generate and validate data based on type
 * Queries MongoDB if connected, otherwise falls back to runtime generation
 */
async function getAndValidateWidgetData(type, queryParams) {
  let rawData;
  const isDbConnected = mongoose.connection.readyState === 1;

  switch (type) {
    case 'categorical': {
      const source = queryParams.source || 'sales';
      if (isDbConnected) {
        try {
          rawData = await CategoricalModel.find({ source }).select('key value -_id').lean();
        } catch (dbErr) {
          console.warn('MongoDB query failed, falling back to mock generation:', dbErr);
        }
      }
      
      // Fallback
      if (!rawData || rawData.length === 0) {
        rawData = generateCategoricalData(source);
      }
      
      // Validate schema
      const parseResult = CategoricalDataSchema.safeParse(rawData);
      if (!parseResult.success) {
        throw new Error(`Data validation failed for categorical data: ${parseResult.error.message}`);
      }
      return parseResult.data;
    }
    
    case 'temporal': {
      const period = queryParams.period || '30d';
      const trend = queryParams.trend || 'upward';
      let source = `traffic-${trend}`;
      if (period === '24h') {
        source = `traffic-${trend}-24h`;
      }

      if (isDbConnected) {
        try {
          const dbItems = await TemporalModel.find({ source }).sort({ timestamp: 1 }).lean();
          if (dbItems && dbItems.length > 0) {
            rawData = dbItems.map(item => ({
              timestamp: item.timestamp.toISOString(),
              value: item.value,
              label: item.label
            }));
          }
        } catch (dbErr) {
          console.warn('MongoDB query failed, falling back to mock generation:', dbErr);
        }
      }
      
      // Fallback
      if (!rawData || rawData.length === 0) {
        rawData = generateTemporalData(period, trend);
      }
      
      // Validate schema
      const parseResult = TemporalDataSchema.safeParse(rawData);
      if (!parseResult.success) {
        throw new Error(`Data validation failed for temporal data: ${parseResult.error.message}`);
      }
      return parseResult.data;
    }
    
    case 'hierarchical': {
      const source = queryParams.source || 'organization';
      if (isDbConnected) {
        try {
          const dbItem = await HierarchicalModel.findOne({ source }).lean();
          if (dbItem) {
            rawData = {
              name: dbItem.name,
              value: dbItem.value,
              children: dbItem.children
            };
          }
        } catch (dbErr) {
          console.warn('MongoDB query failed, falling back to mock generation:', dbErr);
        }
      }
      
      // Fallback
      if (!rawData) {
        rawData = generateHierarchicalData(source);
      }
      
      // Validate schema
      const parseResult = HierarchicalNodeSchema.safeParse(rawData);
      if (!parseResult.success) {
        throw new Error(`Data validation failed for hierarchical data: ${parseResult.error.message}`);
      }
      return parseResult.data;
    }
    
    case 'relational': {
      const source = queryParams.source || 'marketing';
      if (isDbConnected) {
        try {
          rawData = await RelationalModel.find({ source }).select('x y z label -_id').lean();
        } catch (dbErr) {
          console.warn('MongoDB query failed, falling back to mock generation:', dbErr);
        }
      }
      
      // Fallback
      if (!rawData || rawData.length === 0) {
        rawData = generateRelationalData(source);
      }
      
      // Validate schema
      const parseResult = RelationalDataSchema.safeParse(rawData);
      if (!parseResult.success) {
        throw new Error(`Data validation failed for relational data: ${parseResult.error.message}`);
      }
      return parseResult.data;
    }
    
    default:
      throw new Error(`Unknown widget type requested: ${type}`);
  }
}

// Single Widget Data Endpoint
app.get('/api/widgets/data/:type', async (req, res) => {
  const { type } = req.params;
  try {
    const validatedData = await getAndValidateWidgetData(type, req.query);
    res.json({
      status: 'success',
      type,
      data: validatedData
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message || 'Error processing request'
    });
  }
});

// Concurrent Batch Fetching Endpoint
app.post('/api/widgets/batch-data', async (req, res) => {
  const { requests } = req.body; // Array of { id, type, queryParams }
  
  if (!Array.isArray(requests)) {
    return res.status(400).json({
      status: 'error',
      message: 'Payload must contain a "requests" array.'
    });
  }

  // Resolve requests concurrently using Promise.all
  const promises = requests.map(async (item) => {
    try {
      const data = await getAndValidateWidgetData(item.type, item.queryParams || {});
      return {
        id: item.id,
        success: true,
        data
      };
    } catch (err) {
      return {
        id: item.id,
        success: false,
        error: err.message || 'Failed fetching widget data'
      };
    }
  });

  const results = await Promise.all(promises);
  
  // Transform back to structured map: { [widgetId]: { success, data, error } }
  const batchResponse = results.reduce((acc, result) => {
    acc[result.id] = result.success 
      ? { success: true, data: result.data } 
      : { success: false, error: result.error };
    return acc;
  }, {});

  res.json({
    status: 'success',
    widgets: batchResponse
  });
});

// Get Dashboard Configuration
app.get('/api/dashboard/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const dashboard = await DashboardModel.findOne({ id });
    if (!dashboard) {
      // If it's the default request, return our mock default
      if (id === DEFAULT_DASHBOARD_ID) {
        return res.json(defaultDashboardLayout);
      }
      return res.status(404).json({
        status: 'error',
        message: `Dashboard layout with ID "${id}" not found.`
      });
    }
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve dashboard layout configuration.'
    });
  }
});

// Save/Update Dashboard Configuration
app.post('/api/dashboard/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Validate request schema with Zod
    const parsedBody = DashboardConfigSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid dashboard layout schema.',
        details: parsedBody.error.format()
      });
    }

    const { name, widgets } = parsedBody.data;

    const updatedDashboard = await DashboardModel.findOneAndUpdate(
      { id },
      { id, name, widgets },
      { new: true, upsert: true }
    );

    res.json({
      status: 'success',
      message: 'Dashboard layout saved successfully.',
      data: updatedDashboard
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to save dashboard layout configuration.',
      details: err.message
    });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Express dashboard service running on port ${PORT}`);
  });
}

module.exports = app;
