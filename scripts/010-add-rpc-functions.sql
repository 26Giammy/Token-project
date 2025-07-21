-- Create RPC function to add points with transaction
CREATE OR REPLACE FUNCTION add_points(
  user_id_param UUID,
  points_to_add INTEGER,
  description_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points INTEGER;
  new_points INTEGER;
  transaction_id UUID;
BEGIN
  -- Get current points
  SELECT points INTO current_points
  FROM profiles
  WHERE id = user_id_param;
  
  IF current_points IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Calculate new points
  new_points := current_points + points_to_add;
  
  -- Insert transaction record
  INSERT INTO point_transactions (user_id, type, amount, description)
  VALUES (user_id_param, 'add', points_to_add, description_param)
  RETURNING id INTO transaction_id;
  
  -- Update user points
  UPDATE profiles
  SET points = new_points
  WHERE id = user_id_param;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'new_points', new_points,
    'transaction_id', transaction_id
  );
END;
$$;

-- Create RPC function to deduct points with transaction
CREATE OR REPLACE FUNCTION deduct_points(
  user_id_param UUID,
  points_to_deduct INTEGER,
  description_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points INTEGER;
  new_points INTEGER;
  transaction_id UUID;
BEGIN
  -- Get current points
  SELECT points INTO current_points
  FROM profiles
  WHERE id = user_id_param;
  
  IF current_points IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  IF current_points < points_to_deduct THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
  
  -- Calculate new points
  new_points := current_points - points_to_deduct;
  
  -- Insert transaction record
  INSERT INTO point_transactions (user_id, type, amount, description)
  VALUES (user_id_param, 'deduct', points_to_deduct, description_param)
  RETURNING id INTO transaction_id;
  
  -- Update user points
  UPDATE profiles
  SET points = new_points
  WHERE id = user_id_param;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'new_points', new_points,
    'transaction_id', transaction_id
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_points(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_points(UUID, INTEGER, TEXT) TO authenticated;
