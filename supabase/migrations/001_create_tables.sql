-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'researcher' CHECK (role IN ('admin', 'researcher', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name VARCHAR(255) NOT NULL,
  description TEXT,
  operator_id UUID REFERENCES users(id),
  operator_name VARCHAR(100),
  device_address VARCHAR(50),
  device_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create experiment_data table
CREATE TABLE IF NOT EXISTS experiment_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  sequence_number INTEGER,
  timestamp TIMESTAMPTZ NOT NULL,
  voltage DECIMAL(10, 5),
  current DECIMAL(10, 5),
  power DECIMAL(10, 5),
  resistance DECIMAL(10, 5),
  temperature DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create overview_metrics table
CREATE TABLE IF NOT EXISTS overview_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE DEFAULT CURRENT_DATE UNIQUE,
  total_experiments INTEGER DEFAULT 0,
  total_data_points INTEGER DEFAULT 0,
  avg_voltage DECIMAL(10, 5),
  avg_current DECIMAL(10, 5),
  avg_power DECIMAL(10, 5),
  max_voltage DECIMAL(10, 5),
  max_current DECIMAL(10, 5),
  max_power DECIMAL(10, 5),
  min_voltage DECIMAL(10, 5),
  min_current DECIMAL(10, 5),
  min_power DECIMAL(10, 5),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES experiments(id),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  threshold_value DECIMAL(10, 5),
  actual_value DECIMAL(10, 5),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX idx_experiment_data_experiment_id ON experiment_data(experiment_id);
CREATE INDEX idx_experiment_data_timestamp ON experiment_data(timestamp);
CREATE INDEX idx_experiments_created_at ON experiments(created_at);
CREATE INDEX idx_alerts_experiment_id ON alerts(experiment_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- Create function to automatically calculate power and resistance
CREATE OR REPLACE FUNCTION calculate_power_resistance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate power if voltage and current are present
  IF NEW.voltage IS NOT NULL AND NEW.current IS NOT NULL THEN
    NEW.power = NEW.voltage * NEW.current;
  END IF;
  
  -- Calculate resistance if voltage and current are present and current > 0
  IF NEW.voltage IS NOT NULL AND NEW.current IS NOT NULL AND NEW.current > 0 THEN
    NEW.resistance = NEW.voltage / NEW.current;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate power and resistance
CREATE TRIGGER trigger_calculate_power_resistance
BEFORE INSERT OR UPDATE ON experiment_data
FOR EACH ROW
EXECUTE FUNCTION calculate_power_resistance();

-- Create function to update overview metrics
CREATE OR REPLACE FUNCTION update_overview_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert today's metrics
  INSERT INTO overview_metrics (
    metric_date,
    total_experiments,
    total_data_points,
    avg_voltage,
    avg_current,
    avg_power,
    max_voltage,
    max_current,
    max_power,
    min_voltage,
    min_current,
    min_power,
    updated_at
  )
  SELECT
    CURRENT_DATE,
    COUNT(DISTINCT e.id),
    COUNT(ed.id),
    AVG(ed.voltage),
    AVG(ed.current),
    AVG(ed.power),
    MAX(ed.voltage),
    MAX(ed.current),
    MAX(ed.power),
    MIN(ed.voltage),
    MIN(ed.current),
    MIN(ed.power),
    NOW()
  FROM experiments e
  LEFT JOIN experiment_data ed ON e.id = ed.experiment_id
  WHERE DATE(COALESCE(ed.created_at, e.created_at)) = CURRENT_DATE
  ON CONFLICT (metric_date)
  DO UPDATE SET
    total_experiments = EXCLUDED.total_experiments,
    total_data_points = EXCLUDED.total_data_points,
    avg_voltage = EXCLUDED.avg_voltage,
    avg_current = EXCLUDED.avg_current,
    avg_power = EXCLUDED.avg_power,
    max_voltage = EXCLUDED.max_voltage,
    max_current = EXCLUDED.max_current,
    max_power = EXCLUDED.max_power,
    min_voltage = EXCLUDED.min_voltage,
    min_current = EXCLUDED.min_current,
    min_power = EXCLUDED.min_power,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update metrics after data changes
CREATE TRIGGER trigger_update_metrics
AFTER INSERT OR UPDATE OR DELETE ON experiment_data
FOR EACH STATEMENT
EXECUTE FUNCTION update_overview_metrics();

-- Create function to check for anomalies and create alerts
CREATE OR REPLACE FUNCTION check_anomalies()
RETURNS TRIGGER AS $$
DECLARE
  voltage_threshold DECIMAL := 30.0;  -- Example threshold
  current_threshold DECIMAL := 2.0;   -- Example threshold
  power_threshold DECIMAL := 50.0;    -- Example threshold
BEGIN
  -- Check voltage anomaly
  IF NEW.voltage IS NOT NULL AND NEW.voltage > voltage_threshold THEN
    INSERT INTO alerts (
      experiment_id,
      alert_type,
      severity,
      message,
      threshold_value,
      actual_value
    ) VALUES (
      NEW.experiment_id,
      'voltage_high',
      'high',
      'Voltage exceeded threshold',
      voltage_threshold,
      NEW.voltage
    );
  END IF;
  
  -- Check current anomaly
  IF NEW.current IS NOT NULL AND NEW.current > current_threshold THEN
    INSERT INTO alerts (
      experiment_id,
      alert_type,
      severity,
      message,
      threshold_value,
      actual_value
    ) VALUES (
      NEW.experiment_id,
      'current_high',
      'high',
      'Current exceeded threshold',
      current_threshold,
      NEW.current
    );
  END IF;
  
  -- Check power anomaly
  IF NEW.power IS NOT NULL AND NEW.power > power_threshold THEN
    INSERT INTO alerts (
      experiment_id,
      alert_type,
      severity,
      message,
      threshold_value,
      actual_value
    ) VALUES (
      NEW.experiment_id,
      'power_high',
      'critical',
      'Power exceeded threshold',
      power_threshold,
      NEW.power
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check anomalies
CREATE TRIGGER trigger_check_anomalies
AFTER INSERT ON experiment_data
FOR EACH ROW
EXECUTE FUNCTION check_anomalies();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overview_metrics_updated_at BEFORE UPDATE ON overview_metrics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can see all users (for collaboration)
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can view experiments
CREATE POLICY "Anyone can view experiments" ON experiments
  FOR SELECT USING (true);

-- Only authenticated users can create experiments
CREATE POLICY "Authenticated users can create experiments" ON experiments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only experiment owners and admins can update experiments
CREATE POLICY "Owners and admins can update experiments" ON experiments
  FOR UPDATE USING (
    auth.uid() = operator_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can delete experiments
CREATE POLICY "Only admins can delete experiments" ON experiments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Similar policies for experiment_data
CREATE POLICY "Anyone can view experiment data" ON experiment_data
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert experiment data" ON experiment_data
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners and admins can update experiment data" ON experiment_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM experiments e 
      WHERE e.id = experiment_data.experiment_id 
      AND (e.operator_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Only admins can delete experiment data" ON experiment_data
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Policies for alerts
CREATE POLICY "Anyone can view alerts" ON alerts
  FOR SELECT USING (true);

CREATE POLICY "System can create alerts" ON alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts" ON alerts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;