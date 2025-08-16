-- Add cancellation request fields to orders table
ALTER TABLE orders 
ADD COLUMN cancellation_requested_at timestamp,
ADD COLUMN cancellation_request_reason text,
ADD COLUMN cancellation_approved_by integer REFERENCES users(id),
ADD COLUMN cancellation_approved_at timestamp,
ADD COLUMN cancellation_rejected_at timestamp,
ADD COLUMN cancellation_rejection_reason text;