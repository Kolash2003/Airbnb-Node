-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TRIGGER role_permissions_updated_at
    BEFORE UPDATE ON role_permissions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- INSERT INTO role_permissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions; -- Assuming role_id 1 is 'admin', admin has all permissions

-- INSERT INTO role_permissions (role_id, permission_id)
-- SELECT 2, id FROM permissions where name IN ('user:read');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS role_permissions_updated_at ON role_permissions;
DROP TABLE IF EXISTS role_permissions;
-- +goose StatementEnd