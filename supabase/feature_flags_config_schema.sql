-- Feature Flags and App Configuration Schema

-- Create feature flags table
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  user_percentage INTEGER,
  allowed_plans TEXT[],
  created_by UUID REFERENCES admin_users(id),
  last_updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create app configuration table
CREATE TABLE app_configuration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  created_by UUID REFERENCES admin_users(id),
  last_updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create app announcements table
CREATE TABLE app_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  target_plans TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES admin_users(id),
  last_updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create configuration history table
CREATE TABLE configuration_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_type TEXT NOT NULL,
  config_id UUID NOT NULL,
  previous_value JSONB,
  new_value JSONB NOT NULL,
  changed_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX feature_flags_enabled_idx ON feature_flags(enabled);
CREATE INDEX app_announcements_active_idx ON app_announcements(is_active);
CREATE INDEX app_announcements_dates_idx ON app_announcements(start_date, end_date);
CREATE INDEX configuration_history_config_id_idx ON configuration_history(config_id);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY feature_flags_admin_select ON feature_flags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY app_configuration_admin_select ON app_configuration
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY app_announcements_admin_select ON app_announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY configuration_history_admin_select ON configuration_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Create function to toggle feature flag
CREATE OR REPLACE FUNCTION toggle_feature_flag(
  flag_name TEXT,
  enabled BOOLEAN,
  admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  flag_id UUID;
  old_value JSONB;
  new_value JSONB;
BEGIN
  -- Get flag ID and current value
  SELECT id, to_jsonb(t) INTO flag_id, old_value
  FROM feature_flags t
  WHERE name = flag_name;
  
  -- Update flag
  UPDATE feature_flags
  SET 
    enabled = toggle_feature_flag.enabled,
    last_updated_by = admin_id,
    updated_at = NOW()
  WHERE name = flag_name
  RETURNING to_jsonb(feature_flags) INTO new_value;
  
  -- Log change to history
  INSERT INTO configuration_history (
    config_type,
    config_id,
    previous_value,
    new_value,
    changed_by
  )
  VALUES (
    'feature_flag',
    flag_id,
    old_value,
    new_value,
    admin_id
  );
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'toggle_feature_flag',
    'feature_flag',
    flag_id::TEXT,
    jsonb_build_object('name', flag_name, 'enabled', enabled)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create feature flag
CREATE OR REPLACE FUNCTION create_feature_flag(
  name TEXT,
  description TEXT,
  enabled BOOLEAN,
  user_percentage INTEGER DEFAULT NULL,
  allowed_plans TEXT[] DEFAULT NULL,
  admin_id UUID
) RETURNS UUID AS $$
DECLARE
  flag_id UUID;
  new_value JSONB;
BEGIN
  -- Create flag
  INSERT INTO feature_flags (
    name,
    description,
    enabled,
    user_percentage,
    allowed_plans,
    created_by,
    last_updated_by
  )
  VALUES (
    name,
    description,
    enabled,
    user_percentage,
    allowed_plans,
    admin_id,
    admin_id
  )
  RETURNING id, to_jsonb(feature_flags) INTO flag_id, new_value;
  
  -- Log change to history
  INSERT INTO configuration_history (
    config_type,
    config_id,
    previous_value,
    new_value,
    changed_by
  )
  VALUES (
    'feature_flag',
    flag_id,
    NULL,
    new_value,
    admin_id
  );
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'create_feature_flag',
    'feature_flag',
    flag_id::TEXT,
    jsonb_build_object('name', name, 'enabled', enabled)
  );
  
  RETURN flag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update app configuration
CREATE OR REPLACE FUNCTION update_app_configuration(
  config_key TEXT,
  config_value JSONB,
  admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  config_id UUID;
  old_value JSONB;
  new_value JSONB;
BEGIN
  -- Get config ID and current value
  SELECT id, to_jsonb(t) INTO config_id, old_value
  FROM app_configuration t
  WHERE config_key = update_app_configuration.config_key;
  
  IF config_id IS NULL THEN
    -- Create new config
    INSERT INTO app_configuration (
      config_key,
      config_value,
      created_by,
      last_updated_by
    )
    VALUES (
      config_key,
      config_value,
      admin_id,
      admin_id
    )
    RETURNING id, to_jsonb(app_configuration) INTO config_id, new_value;
    
    -- Log change to history
    INSERT INTO configuration_history (
      config_type,
      config_id,
      previous_value,
      new_value,
      changed_by
    )
    VALUES (
      'app_configuration',
      config_id,
      NULL,
      new_value,
      admin_id
    );
  ELSE
    -- Update existing config
    UPDATE app_configuration
    SET 
      config_value = update_app_configuration.config_value,
      last_updated_by = admin_id,
      updated_at = NOW()
    WHERE config_key = update_app_configuration.config_key
    RETURNING to_jsonb(app_configuration) INTO new_value;
    
    -- Log change to history
    INSERT INTO configuration_history (
      config_type,
      config_id,
      previous_value,
      new_value,
      changed_by
    )
    VALUES (
      'app_configuration',
      config_id,
      old_value,
      new_value,
      admin_id
    );
  END IF;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'update_app_configuration',
    'app_configuration',
    config_id::TEXT,
    jsonb_build_object('key', config_key)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create announcement
CREATE OR REPLACE FUNCTION create_announcement(
  title TEXT,
  content TEXT,
  type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_plans TEXT[] DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  admin_id UUID
) RETURNS UUID AS $$
DECLARE
  announcement_id UUID;
BEGIN
  -- Create announcement
  INSERT INTO app_announcements (
    title,
    content,
    type,
    start_date,
    end_date,
    target_plans,
    is_active,
    created_by,
    last_updated_by
  )
  VALUES (
    title,
    content,
    type,
    start_date,
    end_date,
    target_plans,
    is_active,
    admin_id,
    admin_id
  )
  RETURNING id INTO announcement_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'create_announcement',
    'announcement',
    announcement_id::TEXT,
    jsonb_build_object('title', title, 'active', is_active)
  );
  
  RETURN announcement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update announcement
CREATE OR REPLACE FUNCTION update_announcement(
  announcement_id UUID,
  title TEXT,
  content TEXT,
  type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_plans TEXT[] DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  old_value JSONB;
  new_value JSONB;
BEGIN
  -- Get current value
  SELECT to_jsonb(t) INTO old_value
  FROM app_announcements t
  WHERE id = announcement_id;
  
  -- Update announcement
  UPDATE app_announcements
  SET 
    title = update_announcement.title,
    content = update_announcement.content,
    type = update_announcement.type,
    start_date = update_announcement.start_date,
    end_date = update_announcement.end_date,
    target_plans = update_announcement.target_plans,
    is_active = update_announcement.is_active,
    last_updated_by = admin_id,
    updated_at = NOW()
  WHERE id = announcement_id
  RETURNING to_jsonb(app_announcements) INTO new_value;
  
  -- Log change to history
  INSERT INTO configuration_history (
    config_type,
    config_id,
    previous_value,
    new_value,
    changed_by
  )
  VALUES (
    'announcement',
    announcement_id,
    old_value,
    new_value,
    admin_id
  );
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'update_announcement',
    'announcement',
    announcement_id::TEXT,
    jsonb_build_object('title', title, 'active', is_active)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default app configuration
INSERT INTO app_configuration (config_key, config_value, description)
VALUES 
  ('max_uploads_per_month', '{"free": 5, "basic": 20, "premium": 50, "ltd_solo": 30, "ltd_pro": 100}', 'Maximum document uploads per month by plan'),
  ('alert_limits', '{"low_balance": 100, "high_spending": 500}', 'Alert thresholds for user notifications'),
  ('ai_limits', '{"free": 10, "basic": 50, "premium": 100, "ltd_solo": 75, "ltd_pro": 200}', 'AI query limits per month by plan'),
  ('system_maintenance', '{"scheduled": false, "start_time": null, "end_time": null, "message": ""}', 'System maintenance schedule');

-- Create admin views for feature flags
CREATE OR REPLACE VIEW admin_feature_flags AS
SELECT 
  f.id,
  f.name,
  f.description,
  f.enabled,
  f.user_percentage,
  f.allowed_plans,
  a.full_name as last_updated_by_name,
  f.updated_at
FROM feature_flags f
LEFT JOIN admin_users a ON f.last_updated_by = a.id
ORDER BY f.name;

-- Create view for active announcements
CREATE OR REPLACE VIEW admin_active_announcements AS
SELECT 
  a.id,
  a.title,
  a.content,
  a.type,
  a.start_date,
  a.end_date,
  a.target_plans,
  a.is_active,
  ad.full_name as created_by_name,
  a.created_at
FROM app_announcements a
LEFT JOIN admin_users ad ON a.created_by = ad.id
WHERE a.is_active = TRUE
AND a.start_date <= NOW()
AND a.end_date >= NOW()
ORDER BY a.start_date DESC;