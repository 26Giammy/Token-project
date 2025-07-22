-- Function to add points to a user
CREATE OR REPLACE FUNCTION add_points(
  user_id_param UUID,
  points_to_add INTEGER,
  description_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user points
  UPDATE profiles 
  SET points = points + points_to_add 
  WHERE id = user_id_param;
  
  -- Insert transaction record
  INSERT INTO point_transactions (user_id, type, amount, description)
  VALUES (user_id_param, 'add', points_to_add, description_param);
END;
$$;

-- Function to deduct points from a user
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
  new_points INTEGER;
  transaction_id UUID;
BEGIN
  -- Update user points and get new total
  UPDATE profiles 
  SET points = points - points_to_deduct 
  WHERE id = user_id_param
  RETURNING points INTO new_points;
  
  -- Insert transaction record and get ID
  INSERT INTO point_transactions (user_id, type, amount, description)
  VALUES (user_id_param, 'deduct', points_to_deduct, description_param)
  RETURNING id INTO transaction_id;
  
  -- Return both values as JSON
  RETURN json_build_object(
    'new_points', new_points,
    'transaction_id', transaction_id
  );
END;
$$;
