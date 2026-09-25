package db

import (
	"AuthinGo/models"
	"database/sql"
	"fmt"
	"time"
)

type RoleRepository interface {
	GetRoleById(id int64) (*models.Role, error)
	GetRoleByName(name string) (*models.Role, error)
	GetAllRoles() ([] *models.Role, error)
	CreateRole(name string, description string) (*models.Role, error)
	DeleteRoleById(id int64) error
	UpdateRoleBy(id int64, name string, description string) (*models.Role, error)
}

type RoleRepositoryImpl struct {
	db *sql.DB
}

func NewRoleRepository(_db *sql.DB) RoleRepository {
	return &RoleRepositoryImpl{
		db: _db,
	}
}

func (r *RoleRepositoryImpl) GetRoleById(id int64) (*models.Role, error) {
	query := `select id, name, description, created_at, updated_at from roles where id = $1`

	row := r.db.QueryRow(query, id)

	role := &models.Role{}

	if err := row.Scan(&role.Id, &role.Name, &role.Description, &role.CreatedAt, &role.UpdatedAt); err != nil {
		return nil, err
	}

	return role, nil
}

func (r *RoleRepositoryImpl) GetRoleByName(name string) (*models.Role, error) {
	query := `select id, name, description, created_at, updated_at from roles where name = $1`

	row := r.db.QueryRow(query, name)

	role := &models.Role{}

	if err := row.Scan(&role.Id, &role.Name, &role.Description, &role.CreatedAt, &role.UpdatedAt); err != nil {
		return nil, err
	}

	return role, nil
}

func (r *RoleRepositoryImpl) GetAllRoles() ([] *models.Role, error) {
	query := `select * from roles`

	rows, err := r.db.Query(query)

	if err != nil {
		fmt.Println("Error in querying values from the db")
		return nil, err
	}
	defer rows.Close()

	var roles []*models.Role

	for rows.Next() {
		var r models.Role
		err := rows.Scan(&r.Id, &r.Name, &r.Description, &r.CreatedAt, &r.UpdatedAt)

		if err != nil {
			fmt.Println("Error in printing data", err)
			return nil, err
		}

		roles = append(roles, &r)
	}

	err = rows.Err()

	if err != nil {
		fmt.Println("Error in printing the values")
		return nil, err
	}

	return roles, nil
}

func (r *RoleRepositoryImpl) CreateRole(name string, description string) (*models.Role, error) {
	query := `insert into roles (name, description) values ($1, $2) RETURNING id`

	var id int64
	err := r.db.QueryRow(query, name, description).Scan(&id)

	if err != nil {
		return nil, err
	}

	return &models.Role{
		Id:			id,
		Name: 		name,
		Description: description,
		CreatedAt: 	time.Now(),
		UpdatedAt: 	time.Now(),
	}, nil
}

func (r *RoleRepositoryImpl) DeleteRoleById(id int64) (error) {
	query := `delete from roles where id = $1`

	result, err := r.db.Exec(query, id)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return  nil
}

func (r *RoleRepositoryImpl) UpdateRoleBy(id int64, name string, description string) (*models.Role, error) {
	query := `update roles set name = $1, description = $2, updated_at = NOW() where id = $3`

	_, err := r.db.Exec(query, name, description, id)

	if err != nil {
		return nil, err
	}

	return &models.Role{
		Id: 			id,
		Name: 			name,
		Description:   	description,
		CreatedAt:     	time.Now(),
		UpdatedAt:     	time.Now(),
	}, nil
}