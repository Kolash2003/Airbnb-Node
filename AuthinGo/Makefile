MIGRATIONS_FOLDER=db/migrations
DB_URL=postgresql://neondb_owner:npg_bkYdznLh9Ze3@ep-noisy-fire-b5ucv3db-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require

# Create a new migration -> make migrate-create name="create_users_table"
migrate-create:
	goose -dir $(MIGRATIONS_FOLDER) create $(name) sql

migrate-up: # -> make migrate-up
	goose -dir $(MIGRATIONS_FOLDER) postgres "$(DB_URL)" up

migrate-down: # -> make migrate-down
	goose -dir $(MIGRATIONS_FOLDER) postgres "$(DB_URL)" down

# Rollback all migrations and reset database # make migrate-reset
migrate-reset:
	goose -dir $(MIGRATIONS_FOLDER) postgres "$(DB_URL)" reset

# Show current migration status # make migrate-status
migrate-status:
	goose -dir $(MIGRATIONS_FOLDER) postgres "$(DB_URL)" status

# Redo last migration (Down then Up) # make migrate-redo
migrate-redo:
	goose -dir $(MIGRATIONS_FOLDER) postgres "$(DB_URL)" redo

# Run specific migration version # make migrate-version version=20200101120000
migrate-to:
	goose -dir $(MIGRATIONS_FOLDER) postgres "$(DB_URL)" up-to $(version)

# Rollback to a specific migration version # make migrate-down-to version=20200101120000
migrate-down-to:
	goose -dir $(MIGRATIONS_FOLDER) postgres "$(DB_URL)" down-to $(version)

# Force a specific migration version # make migrate-force version=20200101120000
migrate-force:
	goose -dir $(MIGRATIONS_FOLDER) postgres "$(DB_URL)" force $(version)

# Print Goose help # make migrate-help
migrate-help:
	goose -h